import { defineConfig } from 'cypress';
import allureWriter from '@shelex/cypress-allure-plugin/writer';
import { IncomingWebhook } from '@slack/webhook';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // ----------------------------
      // Allure plugin
      // ----------------------------
      allureWriter(on, config);

      // ----------------------------
      // Tasks (Slack, logging)
      // ----------------------------
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
        sendSlackNotification({ text, webhook }) {
          const slackWebhook = new IncomingWebhook(webhook || config.env.SLACK_WEBHOOK_URL);
          return slackWebhook
            .send({ text })
            .then(() => null)
            .catch((error) => {
              console.warn('Slack notification failed', error);
              return null;
            });
        },
      });

      // ----------------------------
      // Merge env from process (allow overrides)
      // ----------------------------
      config.env.baseUrl = process.env.CYPRESS_BASE_URL || config.env.baseUrl;
      config.env.apiUrl = process.env.CYPRESS_API_URL || config.env.apiUrl;
      config.env.dashboardUrl =
        process.env.CYPRESS_DASHBOARD_URL || config.env.dashboardUrl || '/campaigns?CS=all';
      config.env.cookieDomain =
        process.env.CYPRESS_COOKIE_DOMAIN || config.env.cookieDomain || '.lagrowthmachine.xyz';

      // ----------------------------
      // Safe user definition
      // ----------------------------
      config.env.users = config.env.users || {
        standard: {
          username: process.env.STANDARD_USER || 'standard@example.com',
          password: process.env.STANDARD_PASSWORD || 'Password123',
        },
      };

      return config;
    },

    // ----------------------------
    // Base settings
    // ----------------------------
    baseUrl: 'https://test.lagrowthmachine.xyz',
    env: {
      apiUrl: 'https://test.lagrowthmachine.xyz/api',
      dashboardUrl: '/campaigns?CS=all',
      SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
      ENABLE_SLACK_NOTIFICATIONS: true,
      grepFilterSpecs: true,
      grepOmitFiltered: true,
      environment: process.env.NODE_ENV || 'test',
    },

    // ----------------------------
    // Timeouts & retries
    // ----------------------------
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 180000, // augmenté pour pages lentes
    retries: {
      runMode: 2, // retry tests lents en CI
      openMode: 0,
    },

    // ----------------------------
    // Viewport & browser
    // ----------------------------
    viewportWidth: 1920,
    viewportHeight: 1080,
    chromeWebSecurity: false,

    // ----------------------------
    // Memory & experimental features
    // ----------------------------
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 20,

    // ----------------------------
    // Videos & Screenshots
    // ----------------------------
    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    // ----------------------------
    // Specs & support
    // ----------------------------
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    testIsolation: true,

    // ----------------------------
    // Reporter
    // ----------------------------
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json',
    },

    // ----------------------------
    // Misc
    // ----------------------------
    watchForFileChanges: true,
    userAgent: 'Cypress-E2E-Tests',
  },

  projectId: 'your-project-id',
});
