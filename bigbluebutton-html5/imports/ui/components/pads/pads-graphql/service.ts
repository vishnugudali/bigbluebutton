import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const PADS_CONFIG = window.meetingClientSettings.public.pads;

const getLang = (): string => {
  // @ts-ignore While Meteor in the project
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getParams = () => {
  const config = {
    lang: getLang(),
    rtl: document.documentElement.getAttribute('dir') === 'rtl',
  };

  const params = Object.keys(config)
    .map((key) => `${key}=${encodeURIComponent(config[key as keyof typeof config])}`)
    .join('&');
  return params;
};

const buildPadURL = (padId: string, sessionIds: Array<string>) => {
  const params = getParams();
  const sessionIdsStr = sessionIds.join(',');
  const url = Auth.authenticateURL(
    `${PADS_CONFIG.url}/auth_session?padName=${padId}&sessionID=${sessionIdsStr}&${params}`,
  );
  return url;
};

export default {
  buildPadURL,
  getParams,
};
