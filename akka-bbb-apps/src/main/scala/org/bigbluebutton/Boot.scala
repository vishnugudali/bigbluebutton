package org.bigbluebutton

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.event.Logging
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.stream.ActorMaterializer
import org.bigbluebutton.common2.redis.{MessageSender, RedisConfig, RedisPublisher}
import org.bigbluebutton.core._
import org.bigbluebutton.core.bus._
import org.bigbluebutton.core.pubsub.senders.ReceivedJsonMsgHandlerActor
import org.bigbluebutton.core2.AnalyticsActor
import org.bigbluebutton.core2.FromAkkaAppsMsgSenderActor
import org.bigbluebutton.endpoint.redis.{AppsRedisSubscriberActor, ExportAnnotationsActor, GraphqlConnectionsActor, LearningDashboardActor, RedisRecorderActor}
import org.bigbluebutton.common2.bus.IncomingJsonMessageBus
import org.bigbluebutton.service.{HealthzService, MeetingInfoActor, MeetingInfoService}

object Boot extends App with SystemConfiguration {

  implicit val system = ActorSystem("bigbluebutton-apps-system")
  implicit val materializer: ActorMaterializer = ActorMaterializer()
  implicit val executor = system.dispatcher

  val logger = Logging(system, getClass)

  val eventBus = new InMsgBusGW(new IncomingEventBusImp())

  val outBus2 = new OutEventBus2
  val recordingEventBus = new RecordingEventBus

  val outGW = new OutMessageGatewayImp(outBus2)

  val redisPass = if (redisPassword != "") Some(redisPassword) else None
  val redisConfig = RedisConfig(redisHost, redisPort, redisPass, redisExpireKey)

  val redisPublisher = new RedisPublisher(
    system,
    "BbbAppsAkkaPub",
    redisConfig
  )

  val msgSender = new MessageSender(redisPublisher)
  val bbbMsgBus = new BbbMsgRouterEventBus

  val healthzService = HealthzService(system)

  val meetingInfoActorRef = system.actorOf(MeetingInfoActor.props())

  outBus2.subscribe(meetingInfoActorRef, outBbbMsgMsgChannel)
  bbbMsgBus.subscribe(meetingInfoActorRef, analyticsChannel)

  val meetingInfoService = MeetingInfoService(system, meetingInfoActorRef)

  val apiService = new ApiService(healthzService, meetingInfoService)

  val redisRecorderActor = system.actorOf(
    RedisRecorderActor.props(system, redisConfig, healthzService),
    "redisRecorderActor"
  )

  val exportAnnotationsActor = system.actorOf(
    ExportAnnotationsActor.props(system, redisConfig, healthzService),
    "exportAnnotationsActor"
  )

  val learningDashboardActor = system.actorOf(
    LearningDashboardActor.props(system, outGW),
    "LearningDashboardActor"
  )

  val graphqlConnectionsActor = system.actorOf(
    GraphqlConnectionsActor.props(system, eventBus, outGW),
    "GraphqlConnectionsActor"
  )

  ClientSettings.loadClientSettingsFromFile()
  recordingEventBus.subscribe(redisRecorderActor, outMessageChannel)
  val incomingJsonMessageBus = new IncomingJsonMessageBus

  val fromAkkaAppsMsgSenderActorRef = system.actorOf(FromAkkaAppsMsgSenderActor.props(msgSender))

  val analyticsActorRef = system.actorOf(AnalyticsActor.props(analyticsIncludeChat))
  outBus2.subscribe(fromAkkaAppsMsgSenderActorRef, outBbbMsgMsgChannel)
  outBus2.subscribe(redisRecorderActor, recordServiceMessageChannel)
  outBus2.subscribe(exportAnnotationsActor, outBbbMsgMsgChannel)

  outBus2.subscribe(analyticsActorRef, outBbbMsgMsgChannel)
  bbbMsgBus.subscribe(analyticsActorRef, analyticsChannel)

  outBus2.subscribe(learningDashboardActor, outBbbMsgMsgChannel)
  bbbMsgBus.subscribe(learningDashboardActor, analyticsChannel)

  eventBus.subscribe(graphqlConnectionsActor, meetingManagerChannel)
  bbbMsgBus.subscribe(graphqlConnectionsActor, analyticsChannel)

  val bbbActor = system.actorOf(BigBlueButtonActor.props(system, eventBus, bbbMsgBus, outGW, healthzService), "bigbluebutton-actor")
  eventBus.subscribe(bbbActor, meetingManagerChannel)

  val redisMessageHandlerActor = system.actorOf(ReceivedJsonMsgHandlerActor.props(bbbMsgBus, incomingJsonMessageBus))
  incomingJsonMessageBus.subscribe(redisMessageHandlerActor, toAkkaAppsJsonChannel)

  val channelsToSubscribe = Seq(
    toAkkaAppsRedisChannel, fromVoiceConfRedisChannel, fromSfuRedisChannel,
  )

  val redisSubscriberActor = system.actorOf(
    AppsRedisSubscriberActor.props(
      system,
      incomingJsonMessageBus,
      redisConfig,
      channelsToSubscribe,
      Nil,
      toAkkaAppsJsonChannel
    ),
    "redis-subscriber"
  )

  val bindingFuture = Http().bindAndHandle(apiService.routes, httpHost, httpPort)
}
