import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import RegexWebUrl from '/imports/utils/regex-weburl';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import cnxAvalonUtils from '/imports/utils/cnxAvalonUtils';
import cnxCCValidation from '/imports/utils/cnxCCValidation';

const HTML_SAFE_MAP = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const parseMessage = (message) => {
  let parsedMessage = message || '';
  parsedMessage = parsedMessage.trim();

  // Replace <br/> with \n\r
  parsedMessage = parsedMessage.replace(/<br\s*[\\/]?>/gi, '\n\r');

  // Sanitize. See: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
  parsedMessage = parsedMessage.replace(/[<>'"]/g, (c) => HTML_SAFE_MAP[c]);

  // Replace flash links to flash valid ones
  parsedMessage = parsedMessage.replace(RegexWebUrl, "<a href='event:$&'><u>$&</u></a>");
  //CNX-CC Masking 
  parsedMessage = cnxCCValidation.maskCreditCard(parsedMessage);
    //CNX-Avalon masking
  parsedMessage = cnxAvalonUtils.avalonMask(parsedMessage);

  return parsedMessage;
};

export default function sendGroupChatMsg(chatId, message) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendGroupChatMessageMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(chatId, String);
    check(message, Object);
    const parsedMessage = parseMessage(message.message);
    message.message = parsedMessage;

    const payload = {
      msg: message,
      chatId,
    };

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method sendGroupChatMsg ${err.stack}`);
  }
}