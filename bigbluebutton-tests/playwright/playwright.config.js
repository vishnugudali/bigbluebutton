require('dotenv').config();
const { chromiumConfig, firefoxConfig, webkitConfig } = require('./core/browsersConfig');
const { ELEMENT_WAIT_TIME } = require('./core/constants');

const CI = process.env.CI === 'true';

const config = {
  workers: CI ? 1 : 2,
  timeout: 3 * 60 * 1000,
  reporter: CI
    ? [['blob'], ['github']]
    : [['list'], ['html', { open: 'never' }],
  ],
  forbidOnly: CI,
  fullyParallel: CI,
  use: {
    headless: true,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    chromiumConfig,
    firefoxConfig,
    webkitConfig,
  ],
  expect: {
    timeout: ELEMENT_WAIT_TIME,
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
};

if (CI) config.retries = 1;

module.exports = config;
