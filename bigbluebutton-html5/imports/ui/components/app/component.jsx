import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from '/imports/utils/throttle';
import { defineMessages, injectIntl } from 'react-intl';
import ReactModal from 'react-modal';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import PollingContainer from '/imports/ui/components/polling/container';
import logger from '/imports/startup/client/logger';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import ToastContainer from '/imports/ui/components/common/toast/container';
import PadsSessionsContainer from '/imports/ui/components/pads/pads-graphql/sessions/component';
import WakeLockContainer from '../wake-lock/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import RaiseHandNotifier from '/imports/ui/components/raisehand-notifier/container';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/video-provider-graphql/many-users-notify/container';
import AudioCaptionsSpeechContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/speech/component';
import UploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import ScreenReaderAlertContainer from '../screenreader-alert/container';
import ScreenReaderAlertAdapter from '../screenreader-alert/adapter';
import WebcamContainer from '../webcam/container';
import PresentationContainer from '../presentation/container';
import ScreenshareContainer from '../screenshare/container';
import ExternalVideoPlayerContainer from '../external-video-player/external-video-player-graphql/component';
import GenericComponentContainer from '../generic-component-content/container';
import EmojiRainContainer from '../emoji-rain/container';
import Styled from './styles';
import { DEVICE_TYPE, ACTIONS, SMALL_VIEWPORT_BREAKPOINT, PANELS } from '../layout/enums';
import {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
} from '../layout/utils';
import LayoutEngine from '../layout/layout-manager/layoutEngine';
import NavBarContainer from '../nav-bar/container';
import SidebarNavigationContainer from '../sidebar-navigation/container';
import SidebarContentContainer from '../sidebar-content/container';
import PluginsEngineManager from '../plugins-engine/manager';
import Settings from '/imports/ui/services/settings';
import { registerTitleView } from '/imports/utils/dom-utils';
import Notifications from '../notifications/component';
import GlobalStyles from '/imports/ui/stylesheets/styled-components/globalStyles';
import ActionsBarContainer from '../actions-bar/container';
import PushLayoutEngine from '../layout/push-layout/pushLayoutEngine';
import AudioService from '/imports/ui/components/audio/service';
import NotesContainer from '/imports/ui/components/notes/component';
import DEFAULT_VALUES from '../layout/defaultValues';
import AppService from '/imports/ui/components/app/service';
import TimeSync from './app-graphql/time-sync/component';
import PresentationUploaderToastContainer from '/imports/ui/components/presentation/presentation-toast/presentation-uploader-toast/container';
import BreakoutJoinConfirmationContainerGraphQL from '../breakout-join-confirmation/breakout-join-confirmation-graphql/component';
import FloatingWindowContainer from '/imports/ui/components/floating-window/container';
import ChatAlertContainerGraphql from '../chat/chat-graphql/alert/component';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';
const APP_CONFIG = window.meetingClientSettings.public.app;
const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
const LAYOUT_CONFIG = window.meetingClientSettings.public.layout;
const CONFIRMATION_ON_LEAVE = window.meetingClientSettings.public.app.askForConfirmationOnLeave;

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
  clearedEmoji: {
    id: 'app.toast.clearedEmoji.label',
    description: 'message for cleared emoji status',
  },
  clearedReaction: {
    id: 'app.toast.clearedReactions.label',
    description: 'message for cleared reactions',
  },
  setEmoji: {
    id: 'app.toast.setEmoji.label',
    description: 'message when a user emoji has been set',
  },
  raisedHand: {
    id: 'app.toast.setEmoji.raiseHand',
    description: 'toast message for raised hand notification',
  },
  loweredHand: {
    id: 'app.toast.setEmoji.lowerHand',
    description: 'toast message for lowered hand notification',
  },
  away: {
    id: 'app.toast.setEmoji.away',
    description: 'toast message for set away notification',
  },
  notAway: {
    id: 'app.toast.setEmoji.notAway',
    description: 'toast message for remove away notification',
  },
  meetingMuteOn: {
    id: 'app.toast.meetingMuteOn.label',
    description: 'message used when meeting has been muted',
  },
  meetingMuteOff: {
    id: 'app.toast.meetingMuteOff.label',
    description: 'message used when meeting has been unmuted',
  },
  pollPublishedLabel: {
    id: 'app.whiteboard.annotations.poll',
    description: 'message displayed when a poll is published',
  },
  defaultViewLabel: {
    id: 'app.title.defaultViewLabel',
    description: 'view name appended to document title',
  },
  promotedLabel: {
    id: 'app.toast.promotedLabel',
    description: 'notification message when promoted',
  },
  demotedLabel: {
    id: 'app.toast.demotedLabel',
    description: 'notification message when demoted',
  },
});

const propTypes = {
  darkTheme: PropTypes.bool.isRequired,
};

const defaultProps = {
  actionsbar: null,
};

const isLayeredView = window.matchMedia(`(max-width: ${SMALL_VIEWPORT_BREAKPOINT}px)`);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableResize: !window.matchMedia(MOBILE_MEDIA).matches,
      isAudioModalOpen: false,
      isVideoPreviewModalOpen: false,
      presentationFitToWidth: false,
    };

    this.timeOffsetInterval = null;

    this.setPresentationFitToWidth = this.setPresentationFitToWidth.bind(this);
    this.handleWindowResize = throttle(this.handleWindowResize).bind(this);
    this.shouldAriaHide = this.shouldAriaHide.bind(this);
    this.setAudioModalIsOpen = this.setAudioModalIsOpen.bind(this);

    this.setVideoPreviewModalIsOpen = this.setVideoPreviewModalIsOpen.bind(this);

    this.throttledDeviceType = throttle(() => this.setDeviceType(),
      50, { trailing: true, leading: true }).bind(this);
  }

  componentDidMount() {
    const {
      intl,
      layoutContextDispatch,
      isRTL,
      setMobileUser,
      toggleVoice,
    } = this.props;
    const { browserName } = browserInfo;
    const { osName } = deviceInfo;

    registerTitleView(intl.formatMessage(intlMessages.defaultViewLabel));

    layoutContextDispatch({
      type: ACTIONS.SET_IS_RTL,
      value: isRTL,
    });

    ReactModal.setAppElement('#app');

    const fontSize = isMobile() ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;
    document.getElementsByTagName('html')[0].style.fontSize = fontSize;

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(fontSize.slice(0, -2), 10),
    });

    const body = document.getElementsByTagName('body')[0];

    if (browserName) {
      body.classList.add(`browser-${browserName.split(' ').pop()
        .toLowerCase()}`);
    }

    body.classList.add(`os-${osName.split(' ').shift().toLowerCase()}`);

    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize, false);
    window.addEventListener('localeChanged', () => {
      layoutContextDispatch({
        type: ACTIONS.SET_IS_RTL,
        value: Settings.application.isRTL,
      });
    });
    window.ondragover = (e) => { e.preventDefault(); };
    window.ondrop = (e) => { e.preventDefault(); };

    if (CONFIRMATION_ON_LEAVE) {
      window.onbeforeunload = (event) => {
        AudioService.muteMicrophone(toggleVoice);
        event.stopImmediatePropagation();
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = '';
      };
    }

    if (deviceInfo.isMobile) setMobileUser(true);

    logger.info({ logCode: 'app_component_componentdidmount' }, 'Client loaded successfully');
  }

  componentDidUpdate(prevProps) {
    const {
      notify,
      currentUserEmoji,
      currentUserAway,
      currentUserRaiseHand,
      intl,
      deviceType,
      selectedLayout,
      sidebarContentIsOpen,
      layoutContextDispatch,
      numCameras,
      presentationIsOpen,
      hideActionsBar,
      hideNavBar,
    } = this.props;

    this.renderDarkMode();

    if (prevProps.currentUserEmoji.status !== currentUserEmoji.status
        && currentUserEmoji.status !== 'raiseHand'
        && currentUserEmoji.status !== 'away'
    ) {
      const formattedEmojiStatus = intl.formatMessage({ id: `app.actionsBar.emojiMenu.${currentUserEmoji.status}Label` })
        || currentUserEmoji.status;

      if (currentUserEmoji.status === 'none') {
        notify(
          intl.formatMessage(intlMessages.clearedEmoji),
          'info',
          'clear_status',
        );
      } else {
        notify(
          intl.formatMessage(intlMessages.setEmoji, ({ 0: formattedEmojiStatus })),
          'info',
          'user',
        );
      }
    }

    if (prevProps.currentUserAway !== currentUserAway) {
      if (currentUserAway === true) {
        notify(intl.formatMessage(intlMessages.away), 'info', 'user');
      } else {
        notify(intl.formatMessage(intlMessages.notAway), 'info', 'clear_status');
      }
    }

    if (prevProps.currentUserRaiseHand !== currentUserRaiseHand) {
      if (currentUserRaiseHand === true) {
        notify(intl.formatMessage(intlMessages.raisedHand), 'info', 'user');
      } else {
        notify(intl.formatMessage(intlMessages.loweredHand), 'info', 'clear_status');
      }
    }

    if (deviceType === null || prevProps.deviceType !== deviceType) this.throttledDeviceType();

    if (
      selectedLayout !== prevProps.selectedLayout
      && selectedLayout?.toLowerCase?.()?.includes?.('focus')
      && !sidebarContentIsOpen
      && deviceType !== DEVICE_TYPE.MOBILE
      && numCameras > 0
      && presentationIsOpen
    ) {
      setTimeout(() => {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: true,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: DEFAULT_VALUES.idChatOpen,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.CHAT,
        });
      }, 0);
    }

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_ACTIONBAR,
      value: !hideActionsBar,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_HAS_NAVBAR,
      value: !hideNavBar,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize, false);
    window.onbeforeunload = null;

    if (this.timeOffsetInterval) {
      clearInterval(this.timeOffsetInterval);
    }
  }

  setPresentationFitToWidth(presentationFitToWidth) {
    this.setState({ presentationFitToWidth });
  }

  handleWindowResize() {
    const { enableResize } = this.state;
    const shouldEnableResize = !window.matchMedia(MOBILE_MEDIA).matches;
    if (enableResize === shouldEnableResize) return;

    this.setState({ enableResize: shouldEnableResize });
    this.throttledDeviceType();
  }

  setDeviceType() {
    const { deviceType, layoutContextDispatch } = this.props;
    let newDeviceType = null;
    if (isMobile()) newDeviceType = DEVICE_TYPE.MOBILE;
    if (isTablet()) newDeviceType = DEVICE_TYPE.TABLET;
    if (isTabletPortrait()) newDeviceType = DEVICE_TYPE.TABLET_PORTRAIT;
    if (isTabletLandscape()) newDeviceType = DEVICE_TYPE.TABLET_LANDSCAPE;
    if (isDesktop()) newDeviceType = DEVICE_TYPE.DESKTOP;

    if (newDeviceType !== deviceType) {
      layoutContextDispatch({
        type: ACTIONS.SET_DEVICE_TYPE,
        value: newDeviceType,
      });
    }
  }

  shouldAriaHide() {
    const { sidebarNavigationIsOpen, sidebarContentIsOpen, isPhone } = this.props;
    return sidebarNavigationIsOpen
      && sidebarContentIsOpen
      && (isPhone || isLayeredView.matches);
  }

  renderAudioCaptions() {
    const {
      audioCaptions,
      captionsStyle,
    } = this.props;

    if (!audioCaptions) return null;

    return (
      <Styled.CaptionsWrapper
        role="region"
        style={
          {
            position: 'absolute',
            left: captionsStyle.left,
            right: captionsStyle.right,
            maxWidth: captionsStyle.maxWidth,
          }
        }
      >
        {audioCaptions}
      </Styled.CaptionsWrapper>
    );
  }

  renderActionsBar() {
    const {
      intl,
      actionsBarStyle,
      hideActionsBar,
      setPushLayout,
      setMeetingLayout,
      presentationIsOpen,
      selectedLayout,
    } = this.props;

    const { showPushLayoutButton } = LAYOUT_CONFIG;

    if (hideActionsBar) return null;

    return (
      <Styled.ActionsBar
        id="ActionsBar"
        role="region"
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
        aria-hidden={this.shouldAriaHide()}
        style={
          {
            position: 'absolute',
            top: actionsBarStyle.top,
            left: actionsBarStyle.left,
            height: actionsBarStyle.height,
            width: actionsBarStyle.width,
            padding: actionsBarStyle.padding,
          }
        }
      >
        <ActionsBarContainer
          setPushLayout={setPushLayout}
          setMeetingLayout={setMeetingLayout}
          showPushLayout={showPushLayoutButton && selectedLayout === 'custom'}
          presentationIsOpen={presentationIsOpen}
          setPresentationFitToWidth={this.setPresentationFitToWidth}
        />
      </Styled.ActionsBar>
    );
  }

  renderActivityCheck() {
    const { inactivityWarningDisplay, inactivityWarningTimeoutSecs } = this.props;

    return (inactivityWarningDisplay ? (
      <ActivityCheckContainer
        inactivityCheck={inactivityWarningDisplay}
        responseDelay={inactivityWarningTimeoutSecs}
      />
    ) : null);
  }

  renderDarkMode() {
    const { darkTheme } = this.props;

    AppService.setDarkTheme(darkTheme);
  }

  mountPushLayoutEngine() {
    const {
      cameraWidth,
      cameraHeight,
      cameraIsResizing,
      cameraPosition,
      focusedCamera,
      horizontalPosition,
      isMeetingLayoutResizing,
      isPresenter,
      isModerator,
      layoutContextDispatch,
      meetingLayout,
      meetingLayoutCameraPosition,
      meetingLayoutFocusedCamera,
      meetingLayoutVideoRate,
      meetingPresentationIsOpen,
      meetingLayoutUpdatedAt,
      presentationIsOpen,
      presentationVideoRate,
      pushLayout,
      pushLayoutMeeting,
      selectedLayout,
      setMeetingLayout,
      setPushLayout,
      shouldShowScreenshare,
      shouldShowExternalVideo,
      enforceLayout,
      setLocalSettings,
    } = this.props;

    return (
      <PushLayoutEngine
        {...{
          cameraWidth,
          cameraHeight,
          cameraIsResizing,
          cameraPosition,
          focusedCamera,
          horizontalPosition,
          isMeetingLayoutResizing,
          isPresenter,
          isModerator,
          layoutContextDispatch,
          meetingLayout,
          meetingLayoutCameraPosition,
          meetingLayoutFocusedCamera,
          meetingLayoutVideoRate,
          meetingPresentationIsOpen,
          meetingLayoutUpdatedAt,
          presentationIsOpen,
          presentationVideoRate,
          pushLayout,
          pushLayoutMeeting,
          selectedLayout,
          setMeetingLayout,
          setPushLayout,
          shouldShowScreenshare,
          shouldShowExternalVideo: !!shouldShowExternalVideo,
          enforceLayout,
          setLocalSettings,
        }}
      />
    );
  }

  setAudioModalIsOpen(value) {
    this.setState({isAudioModalOpen: value});
  }

  setVideoPreviewModalIsOpen(value) {
    this.setState({isVideoPreviewModalOpen: value});
  }

setRandomUserSelectModalIsOpen(value) {
    const {setMountRandomUserModal} = this.props;
    this.setState({isRandomUserSelectModalOpen: value});
    setMountRandomUserModal(false);
  }

  render() {
    const {
      customStyle,
      customStyleUrl,
      audioAlertEnabled,
      pushAlertEnabled,
      shouldShowPresentation,
      shouldShowScreenshare,
      isSharedNotesPinned,
      isPresenter,
      selectedLayout,
      presentationIsOpen,
      darkTheme,
      intl,
      genericComponentId,
      speechLocale,
    } = this.props;

    const {
      isAudioModalOpen,
      isVideoPreviewModalOpen,
      presentationFitToWidth,
    } = this.state;
    return (
      <>
        <ScreenReaderAlertAdapter />
        <PluginsEngineManager />
        <FloatingWindowContainer />
        <TimeSync />
        <Notifications />
        {this.mountPushLayoutEngine()}
        {selectedLayout ? <LayoutEngine layoutType={selectedLayout} /> : null}
        <GlobalStyles />
        <Styled.Layout
          id="layout"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {this.renderActivityCheck()}
          <ScreenReaderAlertContainer />
          <BannerBarContainer />
          <NotificationsBarContainer />
          <SidebarNavigationContainer />
          <SidebarContentContainer isSharedNotesPinned={isSharedNotesPinned} />
          <NavBarContainer main="new" />
          <WebcamContainer isLayoutSwapped={!presentationIsOpen} layoutType={selectedLayout} />
          <ExternalVideoPlayerContainer />
          <GenericComponentContainer
            genericComponentId={genericComponentId}
          />
          {
          shouldShowPresentation
            ? (
              <PresentationContainer
                setPresentationFitToWidth={this.setPresentationFitToWidth}
                fitToWidth={presentationFitToWidth}
                darkTheme={darkTheme}
                presentationIsOpen={presentationIsOpen}
                layoutType={selectedLayout}
              />
            )
            : null
            }
          {
          shouldShowScreenshare
            ? (
              <ScreenshareContainer
                isLayoutSwapped={!presentationIsOpen}
                isPresenter={isPresenter}
              />
            )
            : null
          }
          {isSharedNotesPinned
            ? (
              <NotesContainer
                area="media"
              />
            ) : null}
          <AudioCaptionsSpeechContainer />
          {this.renderAudioCaptions()}
          <PresentationUploaderToastContainer intl={intl} />
          <UploaderContainer />
          <BreakoutJoinConfirmationContainerGraphQL />
          <AudioContainer {...{
            isAudioModalOpen,
            setAudioModalIsOpen: this.setAudioModalIsOpen,
            isVideoPreviewModalOpen,
            setVideoPreviewModalIsOpen: this.setVideoPreviewModalIsOpen,
            speechLocale,
          }}
          />
          <ToastContainer rtl />
          {(audioAlertEnabled || pushAlertEnabled)
            && (
              <ChatAlertContainerGraphql
                audioAlertEnabled={audioAlertEnabled}
                pushAlertEnabled={pushAlertEnabled}
              />
            )}
          <RaiseHandNotifier />
          <ManyWebcamsNotifier />
          <PollingContainer />
          <PadsSessionsContainer />
          <WakeLockContainer />
          {this.renderActionsBar()}
          <EmojiRainContainer />
          {customStyleUrl ? <link rel="stylesheet" type="text/css" href={customStyleUrl} /> : null}
          {customStyle ? <link rel="stylesheet" type="text/css" href={`data:text/css;charset=UTF-8,${encodeURIComponent(customStyle)}`} /> : null}
        </Styled.Layout>
      </>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default injectIntl(App);
