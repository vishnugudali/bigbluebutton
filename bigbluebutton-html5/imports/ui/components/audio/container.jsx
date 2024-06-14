import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { injectIntl, defineMessages } from 'react-intl';
import { range } from '/imports/utils/array-utils';
import AppService from '/imports/ui/components/app/service';
import { notify } from '/imports/ui/services/notification';
import getFromUserSettings from '/imports/ui/services/users-settings';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import {
  joinMicrophone,
  joinListenOnly,
  didUserSelectedMicrophone,
  didUserSelectedListenOnly,
} from '/imports/ui/components/audio/audio-modal/service';

import Service from './service';
import AudioModalContainer from './audio-modal/container';
import Settings from '/imports/ui/services/settings';
import useToggleVoice from './audio-graphql/hooks/useToggleVoice';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const APP_CONFIG = window.meetingClientSettings.public.app;
const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;

const intlMessages = defineMessages({
  joinedAudio: {
    id: 'app.audioManager.joinedAudio',
    description: 'Joined audio toast message',
  },
  joinedEcho: {
    id: 'app.audioManager.joinedEcho',
    description: 'Joined echo test toast message',
  },
  leftAudio: {
    id: 'app.audioManager.leftAudio',
    description: 'Left audio toast message',
  },
  reconnectingAudio: {
    id: 'app.audioManager.reconnectingAudio',
    description: 'Reconnecting audio toast message',
  },
  genericError: {
    id: 'app.audioManager.genericError',
    description: 'Generic error message',
  },
  connectionError: {
    id: 'app.audioManager.connectionError',
    description: 'Connection error message',
  },
  requestTimeout: {
    id: 'app.audioManager.requestTimeout',
    description: 'Request timeout error message',
  },
  invalidTarget: {
    id: 'app.audioManager.invalidTarget',
    description: 'Invalid target error message',
  },
  mediaError: {
    id: 'app.audioManager.mediaError',
    description: 'Media error message',
  },
  BrowserNotSupported: {
    id: 'app.audioNotification.audioFailedError1003',
    description: 'browser not supported error message',
  },
  reconectingAsListener: {
    id: 'app.audioNotificaion.reconnectingAsListenOnly',
    description: 'ice negotiation error message',
  },
});

const AudioContainer = (props) => {
  const {
    isAudioModalOpen,
    setAudioModalIsOpen,
    setVideoPreviewModalIsOpen,
    isVideoPreviewModalOpen,
    hasBreakoutRooms,
    userSelectedMicrophone,
    userSelectedListenOnly,
    meetingIsBreakout,
    init,
    intl,
    userLocks,
    microphoneConstraints,
  } = props;

  const prevProps = usePreviousValue(props);
  const toggleVoice = useToggleVoice();
  const { hasBreakoutRooms: hadBreakoutRooms } = prevProps || {};
  const userIsReturningFromBreakoutRoom = hadBreakoutRooms && !hasBreakoutRooms;

  const joinAudio = () => {
    if (Service.isConnected()) return;

    if (userSelectedMicrophone) {
      joinMicrophone(true);
      return;
    }

    if (userSelectedListenOnly) joinListenOnly();
  };

  useEffect(() => {
    init(toggleVoice).then(() => {
      if (meetingIsBreakout && !Service.isUsingAudio()) {
        joinAudio();
      }
    });
  }, []);

  useEffect(() => {
    if (userIsReturningFromBreakoutRoom) {
      joinAudio();
    }
  }, [userIsReturningFromBreakoutRoom]);

  if (Service.isConnected() && !Service.isListenOnly()) {
    Service.updateAudioConstraints(microphoneConstraints);

    if (userLocks.userMic && !Service.isMuted()) {
      Service.toggleMuteMicrophone(toggleVoice);
      notify(intl.formatMessage(intlMessages.reconectingAsListener), 'info', 'volume_level_2');
    }
  }

  return (
    <>
      {isAudioModalOpen ? (
        <AudioModalContainer
          {...{
            priority: 'low',
            setIsOpen: setAudioModalIsOpen,
            isOpen: isAudioModalOpen,
          }}
        />
      ) : null}
      {isVideoPreviewModalOpen ? (
        <VideoPreviewContainer
          {...{
            callbackToClose: () => {
              setVideoPreviewModalIsOpen(false);
            },
            priority: 'low',
            setIsOpen: setVideoPreviewModalIsOpen,
            isOpen: isVideoPreviewModalOpen,
          }}
        />
      ) : null}
    </>
  );
};

let didMountAutoJoin = false;

const webRtcError = range(1001, 1011)
  .reduce((acc, value) => ({
    ...acc,
    [value]: { id: `app.audioNotification.audioFailedError${value}` },
  }), {});

const messages = {
  info: {
    JOINED_AUDIO: intlMessages.joinedAudio,
    JOINED_ECHO: intlMessages.joinedEcho,
    LEFT_AUDIO: intlMessages.leftAudio,
    RECONNECTING_AUDIO: intlMessages.reconnectingAudio,
  },
  error: {
    GENERIC_ERROR: intlMessages.genericError,
    CONNECTION_ERROR: intlMessages.connectionError,
    REQUEST_TIMEOUT: intlMessages.requestTimeout,
    INVALID_TARGET: intlMessages.invalidTarget,
    MEDIA_ERROR: intlMessages.mediaError,
    WEBRTC_NOT_SUPPORTED: intlMessages.BrowserNotSupported,
    ...webRtcError,
  },
};

export default lockContextContainer(injectIntl(withTracker(({
  intl, userLocks, isAudioModalOpen, setAudioModalIsOpen, setVideoPreviewModalIsOpen,
  speechLocale,
}) => {
  const { microphoneConstraints } = Settings.application;
  const autoJoin = getFromUserSettings('bbb_auto_join_audio', APP_CONFIG.autoJoin);
  const enableVideo = getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
  const autoShareWebcam = getFromUserSettings('bbb_auto_share_webcam', KURENTO_CONFIG.autoShareWebcam);
  const { userWebcam } = userLocks;

  const userSelectedMicrophone = didUserSelectedMicrophone();
  const userSelectedListenOnly = didUserSelectedListenOnly();
  const meetingIsBreakout = AppService.meetingIsBreakout();
  const hasBreakoutRooms = AppService.getBreakoutRooms().length > 0;
  const openAudioModal = () => setAudioModalIsOpen(true);

  const openVideoPreviewModal = () => {
    if (userWebcam) return;
    setVideoPreviewModalIsOpen(true);
  };

  return {
    hasBreakoutRooms,
    meetingIsBreakout,
    userSelectedMicrophone,
    userSelectedListenOnly,
    isAudioModalOpen,
    setAudioModalIsOpen,
    microphoneConstraints,
    init: async (toggleVoice) => {
      await Service.init(messages, intl, toggleVoice, speechLocale);
      if ((!autoJoin || didMountAutoJoin)) {
        if (enableVideo && autoShareWebcam) {
          openVideoPreviewModal();
        }
        return Promise.resolve(false);
      }
      Session.set('audioModalIsOpen', true);
      if (enableVideo && autoShareWebcam) {
        openAudioModal();
        openVideoPreviewModal();
        didMountAutoJoin = true;
      } else if (!(
        userSelectedMicrophone
        && userSelectedListenOnly
        && meetingIsBreakout)) {
        openAudioModal();
        didMountAutoJoin = true;
      }
      return Promise.resolve(true);
    },
  };
})(AudioContainer)));

AudioContainer.defaultProps = {
  microphoneConstraints: undefined,
};

AudioContainer.propTypes = {
  hasBreakoutRooms: PropTypes.bool.isRequired,
  meetingIsBreakout: PropTypes.bool.isRequired,
  userSelectedListenOnly: PropTypes.bool.isRequired,
  userSelectedMicrophone: PropTypes.bool.isRequired,
  isAudioModalOpen: PropTypes.bool.isRequired,
  setAudioModalIsOpen: PropTypes.func.isRequired,
  setVideoPreviewModalIsOpen: PropTypes.func.isRequired,
  init: PropTypes.func.isRequired,
  isVideoPreviewModalOpen: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  userLocks: PropTypes.shape({
    userMic: PropTypes.bool.isRequired,
  }).isRequired,
  microphoneConstraints: PropTypes.shape({}),
};
