/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  UserListItemAdditionalInformationType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-item-additional-information/enums';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { User } from '/imports/ui/Types/user';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Auth from '/imports/ui/services/auth';
import { LockSettings } from '/imports/ui/Types/meeting';
import { uniqueId } from '/imports/utils/string-utils';
import normalizeEmojiName from './service';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { isReactionsEnabled } from '/imports/ui/services/features';

const messages = defineMessages({
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  mobile: {
    id: 'app.userList.mobile',
    description: 'Text for identifying mobile user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  sharingWebcam: {
    id: 'app.userList.sharingWebcam',
    description: 'Text for identifying who is sharing webcam',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
});

// @ts-ignore - temporary, while meteor exists in the project
const LABEL = window.meetingClientSettings.public.user.label;

const { isChrome, isFirefox, isEdge } = browserInfo;

interface EmojiProps {
  emoji: { id: string; native: string; };
  native: string;
  size: number;
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': EmojiProps;
    }
  }
}

interface UserListItemProps {
  user: User;
  lockSettings: LockSettings;
}

const renderUserListItemIconsFromPlugin = (
  userItemsFromPlugin: PluginSdk.UserListItemAdditionalInformationInterface[],
) => userItemsFromPlugin.filter(
  (item) => item.type === UserListItemAdditionalInformationType.ICON,
).map((item: PluginSdk.UserListItemAdditionalInformationInterface) => {
  const itemToRender = item as PluginSdk.UserListItemIcon;
  return (
    <Styled.IconRightContainer
      key={item.id}
    >
      <Icon iconName={itemToRender.icon} />
    </Styled.IconRightContainer>
  );
});

const Emoji: React.FC<EmojiProps> = ({ emoji, native, size }) => (
  <em-emoji emoji={emoji} native={native} size={size} />
);

const UserListItem: React.FC<UserListItemProps> = ({ user, lockSettings }) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let userItemsFromPlugin = [] as PluginSdk.UserListItemAdditionalInformationInterface[];
  if (pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation) {
    userItemsFromPlugin = pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation.filter((item) => {
      const userListItem = item as PluginSdk.UserListItemAdditionalInformationInterface;
      return userListItem.userId === user.userId;
    }) as PluginSdk.UserListItemAdditionalInformationInterface[];
  }

  const intl = useIntl();
  const voiceUser = user.voice;
  const subs = [];

  if (user.isModerator && LABEL.moderator) {
    subs.push(intl.formatMessage(messages.moderator));
  }
  if (user.guest && LABEL.guest) {
    subs.push(intl.formatMessage(messages.guest));
  }
  if (user.mobile && LABEL.mobile) {
    subs.push(intl.formatMessage(messages.mobile));
  }
  if (user.locked && lockSettings?.hasActiveLockSetting && !user.isModerator) {
    subs.push(
      <span key={uniqueId('lock-')}>
        <Icon iconName="lock" />
        &nbsp;
        {intl.formatMessage(messages.locked)}
      </span>,
    );
  }
  if (user.lastBreakoutRoom?.currentlyInRoom) {
    subs.push(
      <span key={uniqueId('breakout-')}>
        <Icon iconName="rooms" />
        &nbsp;
        {user.lastBreakoutRoom?.shortName
          ? intl.formatMessage(messages.breakoutRoom, { 0: user.lastBreakoutRoom?.sequence })
          : user.lastBreakoutRoom?.shortName}
      </span>,
    );
  }
  if (user.cameras.length > 0 && LABEL.sharingWebcam) {
    subs.push(
      <span key={uniqueId('breakout-')}>
        {user.pinned === true
          ? <Icon iconName="pin-video_on" />
          : <Icon iconName="video" />}
        &nbsp;
        {intl.formatMessage(messages.sharingWebcam)}
      </span>,
    );
  }
  userItemsFromPlugin.filter(
    (item) => item.type === UserListItemAdditionalInformationType.LABEL,
  ).forEach((item) => {
    const itemToRender = item as PluginSdk.UserListItemLabel;
    subs.push(
      <span key={itemToRender.id}>
        { itemToRender.icon
          && <Icon iconName={itemToRender.icon} /> }
        {itemToRender.label}
      </span>,
    );
  });

  const reactionsEnabled = isReactionsEnabled();

  const userAvatarFiltered = (user.raiseHand === true || user.away === true || (user.reaction && user.reaction.reactionEmoji !== 'none')) ? '' : user.avatar;

  const emojiIcons = [
    {
      id: 'hand',
      native: '✋',
    },
    {
      id: 'clock7',
      native: '⏰',
    },
  ];

  const getIconUser = () => {
    const emojiSize = convertRemToPixels(1.3);

    if (user.isDialIn) {
      return <Icon iconName="volume_level_2" />;
    }
    if (user.raiseHand === true) {
      return reactionsEnabled
        ? <Emoji key={emojiIcons[0].id} emoji={emojiIcons[0]} native={emojiIcons[0].native} size={emojiSize} />
        : <Icon iconName={normalizeEmojiName('raiseHand')} />;
    }
    if (user.away === true) {
      return reactionsEnabled
        ? <Emoji key="away" emoji={emojiIcons[1]} native={emojiIcons[1].native} size={emojiSize} />
        : <Icon iconName={normalizeEmojiName('away')} />;
    }
    if (user.emoji !== 'none' && user.emoji !== 'notAway') {
      return <Icon iconName={normalizeEmojiName(user.emoji)} />;
    }
    if (user.reaction && user.reaction.reactionEmoji !== 'none') {
      return user.reaction.reactionEmoji;
    }
    if (user.name && userAvatarFiltered.length === 0) {
      return user.name.toLowerCase().slice(0, 2);
    }
    return '';
  };

  const avatarContent = user.lastBreakoutRoom?.currentlyInRoom && userAvatarFiltered.length === 0
    ? user.lastBreakoutRoom?.sequence
    : getIconUser();

  const hasWhiteboardAccess = user?.presPagesWritable?.some((page) => page.isCurrentPage);

  function addSeparator(elements: (string | JSX.Element)[]) {
    const modifiedElements: (string | JSX.Element)[] = [];

    elements.forEach((element, index) => {
      modifiedElements.push(element);
      if (index !== elements.length - 1) {
        modifiedElements.push(<span key={uniqueId('separator-')}> | </span>);
      }
    });
    return modifiedElements;
  }

  return (
    <Styled.UserItemContents tabIndex={-1} data-test={(user.userId === Auth.userID) ? 'userListItemCurrent' : 'userListItem'}>
      <Styled.Avatar
        data-test={user.isModerator ? 'moderatorAvatar' : 'viewerAvatar'}
        data-test-presenter={user.presenter ? '' : undefined}
        data-test-avatar="userAvatar"
        moderator={user.isModerator}
        presenter={user.presenter}
        talking={voiceUser?.talking}
        muted={voiceUser?.muted}
        listenOnly={voiceUser?.listenOnly}
        voice={voiceUser?.joined}
        noVoice={!voiceUser?.joined}
        color={user.color}
        whiteboardAccess={hasWhiteboardAccess}
        animations
        emoji={user.emoji !== 'none'}
        avatar={userAvatarFiltered}
        isChrome={isChrome}
        isFirefox={isFirefox}
        isEdge={isEdge}
      >
        {avatarContent}
      </Styled.Avatar>
      <Styled.UserNameContainer>
        <Styled.UserName>
          <TooltipContainer title={user.name}>
            <span>{user.name}</span>
          </TooltipContainer>
          &nbsp;
          {(user.userId === Auth.userID) ? `(${intl.formatMessage(messages.you)})` : ''}
        </Styled.UserName>
        <Styled.UserNameSub data-test={user.mobile ? 'mobileUser' : undefined}>
          {subs.length ? addSeparator(subs) : null}
        </Styled.UserNameSub>
      </Styled.UserNameContainer>
      {renderUserListItemIconsFromPlugin(userItemsFromPlugin)}
    </Styled.UserItemContents>
  );
};

export default UserListItem;
