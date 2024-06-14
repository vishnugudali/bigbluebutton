import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import VideoService from '/imports/ui/components/video-provider/video-provider-graphql/service';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import { SET_CAMERA_PINNED } from '/imports/ui/core/graphql/mutations/userMutations';
import { StreamUser, VideoItem } from '../../../types';

const intlMessages = defineMessages({
  unpinLabel: {
    id: 'app.videoDock.webcamUnpinLabel',
  },
  unpinLabelDisabled: {
    id: 'app.videoDock.webcamUnpinLabelDisabled',
  },
});

interface PinAreaProps {
  user: Partial<StreamUser>;
  stream: VideoItem | undefined;
  amIModerator: boolean;
}

const PinArea: React.FC<PinAreaProps> = (props) => {
  const intl = useIntl();

  const { stream, user, amIModerator } = props;
  const pinned = stream?.type === 'stream' && stream?.pin;
  const userId = user?.userId;
  const shouldRenderPinButton = pinned && userId;
  const videoPinActionAvailable = VideoService.isVideoPinEnabledForCurrentUser(amIModerator);

  const [setCameraPinned] = useMutation(SET_CAMERA_PINNED);

  if (!shouldRenderPinButton) return <Styled.PinButtonWrapper />;

  return (
    <Styled.PinButtonWrapper>
      <Styled.PinButton
        color="default"
        icon={!pinned ? 'pin-video_on' : 'pin-video_off'}
        size="sm"
        onClick={() => {
          setCameraPinned({
            variables: {
              userId,
              pinned: false,
            },
          });
        }}
        label={videoPinActionAvailable
          ? intl.formatMessage(intlMessages.unpinLabel)
          : intl.formatMessage(intlMessages.unpinLabelDisabled)}
        hideLabel
        disabled={!videoPinActionAvailable}
        data-test="pinVideoButton"
      />
    </Styled.PinButtonWrapper>
  );
};

export default PinArea;
