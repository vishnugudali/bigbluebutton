package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class PresPageWritersDbModel(
        pageId:         String,
        meetingId:      String,
        userId:         String,
        changedModeOn:  Long,
)

class PresPageWritersDbTableDef(tag: Tag) extends Table[PresPageWritersDbModel](tag, None, "pres_page_writers") {
  override def * = (
    pageId, meetingId, userId, changedModeOn) <> (PresPageWritersDbModel.tupled, PresPageWritersDbModel.unapply)
  val pageId = column[String]("pageId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val changedModeOn = column[Long]("changedModeOn")
}

object PresPageWritersDAO {

  def updateMultiuser(meetingId: String, whiteboard: Whiteboard) = {

    val deleteQuery = TableQuery[PresPageWritersDbTableDef]
      .filter(_.pageId === whiteboard.id)
    
    if(whiteboard.multiUser.length > 0) {
      deleteQuery.filter(_.meetingId === meetingId)
      deleteQuery.filterNot(_.userId inSet whiteboard.multiUser)
    }

    DatabaseConnection.db.run(deleteQuery.delete).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"Users deleted from pres_page_writers ${whiteboard.id}")
      case Failure(e) => DatabaseConnection.logger.error(s"Error deleting users from pres_page_writers: $e")
    }

    for {
      userId <- whiteboard.multiUser
    } yield {
      DatabaseConnection.db.run(
        TableQuery[PresPageWritersDbTableDef].insertOrUpdate(
          PresPageWritersDbModel(
            pageId = whiteboard.id,
            meetingId = meetingId,
            userId = userId,
            changedModeOn = whiteboard.changedModeOn
          )
        )
      ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on pres_page_writers table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting pres_page_writers: $e")
      }
    }
  }

}
