import React from 'react';
import { useMutation } from '@apollo/client';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/video-provider-graphql/service';
import ScreenShareService from '/imports/ui/components/screenshare/service';
import logger from '/imports/startup/client/logger';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import {
  useSharedDevices, useHasVideoStream, useHasCapReached, useIsUserLocked, useStreams,
  useExitVideo,
  useStopVideo,
} from '/imports/ui/components/video-provider/video-provider-graphql/hooks';

const VideoPreviewContainer = (props) => {
  const {
    buildStartSharingCameraAsContent,
    buildStopSharing,
    hasCapReached,
    ...rest
  } = props;
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const { streams } = useStreams();
  const exitVideo = useExitVideo();
  const stopVideo = useStopVideo();
  const startSharingCameraAsContent = buildStartSharingCameraAsContent(stopExternalVideoShare);
  const stopSharing = buildStopSharing(streams, exitVideo, stopVideo);
  const sharedDevices = useSharedDevices();
  const hasVideoStream = useHasVideoStream();
  const camCapReached = useHasCapReached();
  const isCamLocked = useIsUserLocked();

  return (
    <VideoPreview
      {...{
        startSharingCameraAsContent,
        stopSharing,
        sharedDevices,
        hasVideoStream,
        camCapReached,
        isCamLocked,
        ...rest,
      }}
    />
  );
};

export default withTracker(({ setIsOpen, callbackToClose }) => ({
  startSharing: (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    VideoService.joinVideo(deviceId);
  },
  buildStartSharingCameraAsContent: (stopExternalVideoShare) => (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    const handleFailure = (error) => {
      const {
        errorCode = SCREENSHARING_ERRORS.UNKNOWN_ERROR.errorCode,
        errorMessage = error.message,
      } = error;

      logger.error({
        logCode: 'camera_as_content_failed',
        extraInfo: { errorCode, errorMessage },
      }, `Sharing camera as content failed: ${errorMessage} (code=${errorCode})`);

      ScreenShareService.screenshareHasEnded();
    };
    ScreenShareService.shareScreen(
      stopExternalVideoShare,
      true, handleFailure, { stream: Service.getStream(deviceId)._mediaStream },
    );
    ScreenShareService.setCameraAsContentDeviceId(deviceId);
  },
  buildStopSharing: (streams, exitVideo, stopVideo) => (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    if (deviceId) {
      const streamId = VideoService.getMyStreamId(deviceId, streams);
      if (streamId) stopVideo(streamId);
    } else {
      exitVideo();
    }
  },
  stopSharingCameraAsContent: () => {
    callbackToClose();
    setIsOpen(false);
    ScreenShareService.screenshareHasEnded();
  },
  cameraAsContentDeviceId: ScreenShareService.getCameraAsContentDeviceId(),
  closeModal: () => {
    callbackToClose();
    setIsOpen(false);
  },
  webcamDeviceId: Service.webcamDeviceId(),
}))(VideoPreviewContainer);
