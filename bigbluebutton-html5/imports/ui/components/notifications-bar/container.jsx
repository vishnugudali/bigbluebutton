import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useEffect } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import { isEmpty } from 'radash';
import MeetingRemainingTime from '/imports/ui/components/common/remaining-time/meeting-duration/component';
import Styled from './styles';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { ACTIONS } from '../layout/enums';

import NotificationsBar from './component';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

// permanently failed to connect; e.g., the client and server support different versions of DDP
const STATUS_FAILED = 'failed';

// failed to connect and waiting to try to reconnect
const STATUS_WAITING = 'waiting';

const intlMessages = defineMessages({
  failedMessage: {
    id: 'app.failedMessage',
    description: 'Notification for connecting to server problems',
  },
  connectingMessage: {
    id: 'app.connectingMessage',
    description: 'Notification message for when client is connecting to server',
  },
  waitingMessage: {
    id: 'app.waitingMessage',
    description: 'Notification message for disconnection with reconnection counter',
  },
  retryNow: {
    id: 'app.retryNow',
    description: 'Retry now text for reconnection counter',
  },
  calculatingBreakoutTimeRemaining: {
    id: 'app.calculatingBreakoutTimeRemaining',
    description: 'Message that tells that the remaining time is being calculated',
  },
  alertMeetingEndsUnderMinutes: {
    id: 'app.meeting.alertMeetingEndsUnderMinutes',
    description: 'Alert that tells that the meeting ends under x minutes',
  },
  alertBreakoutEndsUnderMinutes: {
    id: 'app.meeting.alertBreakoutEndsUnderMinutes',
    description: 'Alert that tells that the breakout ends under x minutes',
  },
});

const NotificationsBarContainer = (props) => {
  const { message, color } = props;

  const notificationsBar = layoutSelectInput((i) => i.notificationsBar);
  const layoutContextDispatch = layoutDispatch();

  const { hasNotification } = notificationsBar;

  useEffect(() => {
    const localHasNotification = !!message;

    if (localHasNotification !== hasNotification) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_NOTIFICATIONS_BAR,
        value: localHasNotification,
      });
    }
  }, [message, hasNotification]);

  if (isEmpty(message)) {
    return null;
  }

  return (
    <NotificationsBar color={color}>
      {message}
    </NotificationsBar>
  );
};

let retrySeconds = 0;
const retrySecondsDep = new Tracker.Dependency();
let retryInterval = null;

const getRetrySeconds = () => {
  retrySecondsDep.depend();
  return retrySeconds;
};

const setRetrySeconds = (sec = 0) => {
  if (sec !== retrySeconds) {
    retrySeconds = sec;
    retrySecondsDep.changed();
  }
};

const startCounter = (sec, set, get, interval) => {
  clearInterval(interval);
  set(sec);
  return setInterval(() => {
    set(get() - 1);
  }, 1000);
};

const reconnect = () => {
  Meteor.reconnect();
};

export default injectIntl(withTracker(({ intl }) => {
  const { status, connected, retryTime } = Meteor.status();
  const data = {};

  if (!connected) {
    data.color = 'primary';
    switch (status) {
      case STATUS_FAILED: {
        data.color = 'danger';
        data.message = intl.formatMessage(intlMessages.failedMessage);
        break;
      }
      case STATUS_CONNECTING: {
        data.message = intl.formatMessage(intlMessages.connectingMessage);
        break;
      }
      case STATUS_WAITING: {
        const sec = Math.round((retryTime - (new Date()).getTime()) / 1000);
        retryInterval = startCounter(sec, setRetrySeconds, getRetrySeconds, retryInterval);
        data.message = (
          <>
            {intl.formatMessage(intlMessages.waitingMessage, { 0: getRetrySeconds() })}
            <Styled.RetryButton type="button" onClick={reconnect}>
              {intl.formatMessage(intlMessages.retryNow)}
            </Styled.RetryButton>
          </>
        );
        break;
      }
      default:
        break;
    }

    return data;
  }

  const meetingId = Auth.meetingID;

  const Meeting = Meetings.findOne({ meetingId },
    { fields: { isBreakout: 1, componentsFlags: 1 } });

  if (Meeting.isBreakout) {
    data.message = (
      <MeetingRemainingTime />
    );
  }

  if (Meeting) {
    const { isBreakout, componentsFlags } = Meeting;

    if (componentsFlags.showRemainingTime && !isBreakout) {
      data.message = (
        <MeetingRemainingTime />
      );
    }
  }

  data.alert = true;
  data.color = 'primary';
  return data;
})(NotificationsBarContainer));
