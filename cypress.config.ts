import { defineConfig } from 'cypress';
import allureWriter from '@shelex/cypress-allure-plugin/writer';
import { IncomingWebhook } from '@slack/webhook';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Allure plugin
      allureWriter(on, config);

      // Tasks
      on('task', {
        log(message) {
          // Keep tasks synchronous (return null). Avoid returning Promises here.
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
        sendSlackNotification({ text, webhook }) {
          const slackWebhook = new IncomingWebhook(webhook || config.env.SLACK_WEBHOOK_URL);
          // Return a Promise to Node — Cypress allows task to return a Promise (this runs in Node).
          return slackWebhook
            .send({ text })
            .then(() => null)
            .catch((error) => {
              console.warn('Slack notification failed', error);
              return null;
            });
        },
      });

      // Merge env from process (allow overrides)
      config.env.baseUrl = process.env.CYPRESS_BASE_URL || config.env.baseUrl;
      config.env.apiUrl = process.env.CYPRESS_API_URL || config.env.apiUrl;

      // Add dashboardUrl from environment or use provided explicit URL
      config.env.dashboardUrl =
        process.env.CYPRESS_DASHBOARD_URL || config.env.dashboardUrl || '/campaigns?CS=all';

      // Optional cookie domain for setCookie usage
      config.env.cookieDomain = process.env.CYPRESS_COOKIE_DOMAIN || config.env.cookieDomain || '.lagrowthmachine.xyz';

      return config;
    },

    baseUrl: 'https://test.lagrowthmachine.xyz',
    env: {
      apiUrl: 'https://test.lagrowthmachine.xyz/api',
      dashboardUrl: '/campaigns?CS=all', // fallback default (your provided URL)
      SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL || '',
      ENABLE_SLACK_NOTIFICATIONS: true,
      grepFilterSpecs: true,
      grepOmitFiltered: true,
      environment: process.env.NODE_ENV || 'test',
    },

    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 120000,

    viewportWidth: 1920,
    viewportHeight: 1080,

    retries: {
      runMode: 2,
      openMode: 0,
    },

    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],

    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    testIsolation: true,
    chromeWebSecurity: false,
    experimentalRunAllSpecs: true,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 10,

    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json',
    },

    watchForFileChanges: true,
    userAgent: 'Cypress-E2E-Tests',
  },

  projectId: 'your-project-id',
});
