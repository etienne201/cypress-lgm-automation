
import './commands';
import './api-commands';

import '@shelex/cypress-allure-plugin';
import '@cypress/grep';
import 'cypress-real-events/support';

// ----------------------------------------------
// Global Hooks
// ----------------------------------------------

before(() => {
  cy.log('🚀 Démarrage de la suite de tests');

  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.clearAllCookies();
});

beforeEach(() => {
  cy.viewport(1920, 1080);

  // ------------------------------------------------
  // 🧠 MOCK STRIPE (DO NOT BLOCK IT)
  // ------------------------------------------------
  cy.on('window:before:load', (win) => {
    // Fake Stripe object to prevent crashes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (win as any).Stripe = () => ({
      elements: () => ({
        create: () => ({
          mount: () => {},
          destroy: () => {},
        }),
      }),
      redirectToCheckout: () => Promise.resolve({}),
      confirmCardPayment: () => Promise.resolve({}),
    });
  });

  // ------------------------------------------------
  // 🔇 BLOCK NON-CRITICAL THIRD PARTIES
  // ------------------------------------------------
  cy.intercept('https://api.segment.io/**', { statusCode: 200, body: {} });
  cy.intercept('https://analytics.lagrowthmachine.com/**', {
    statusCode: 200,
    body: {},
  });

  cy.intercept('https://dev.visualwebsiteoptimizer.com/**', {
    statusCode: 200,
    body: '',
  });

  cy.intercept('https://api-iam.intercom.io/**', {
    statusCode: 200,
    body: {},
  });

  // ------------------------------------------------
  // 📡 LOG REAL API ERRORS ONLY
  // ------------------------------------------------
  cy.intercept('**/api/**', (req) => {
    req.on('response', (res) => {
      if (res.statusCode >= 400) {
        console.error(
          `❌ API Error → ${req.method} ${req.url} | ${res.statusCode}`
        );
      }
    });
  });
});

afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    const testName = this.currentTest.title;
    const suiteName = this.currentTest.parent?.title || 'Unknown Suite';

    cy.screenshot(`${suiteName} - ${testName}`, {
      capture: 'fullPage',
      overwrite: true,
    });

    cy.log(`❌ Test échoué: ${testName}`);

    if (
      Cypress.env('ENABLE_SLACK_NOTIFICATIONS') &&
      Cypress.env('SLACK_WEBHOOK_URL')
    ) {
      const message = `
❌ Test Failed
Env: ${Cypress.env('environment')}
Suite: ${suiteName}
Test: ${testName}
Browser: ${Cypress.browser.name}
URL: ${Cypress.config('baseUrl')}
      `;

      cy.task('sendSlackNotification', {
        text: message,
        webhook: Cypress.env('SLACK_WEBHOOK_URL'),
      });
    }
  }
});

after(() => {
  cy.log('✅ Suite de tests terminée');

  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.clearAllCookies();
});

// ----------------------------------------------
// 🧯 GLOBAL ERROR SHIELD (CRITICAL PART)
// ----------------------------------------------

Cypress.on('uncaught:exception', (err) => {
  const msg = err.message?.toLowerCase() || '';

  // Ignore known non-critical frontend crashes
  if (
    msg.includes('stripe') ||
    msg.includes('analytics') ||
    msg.includes('segment') ||
    msg.includes('intercom') ||
    msg.includes('vwo') ||
    msg.includes('undefined')
  ) {
    return false;
  }

  return true;
});

// ----------------------------------------------
// ⏱ Timeouts
// ----------------------------------------------

Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 15000);
Cypress.config('responseTimeout', 15000);

// ----------------------------------------------
// 🛠 Helpers
// ----------------------------------------------

Cypress.Commands.add('waitForPageLoad', () => {
  return cy.window().its('document.readyState').should('eq', 'complete');
});

// ----------------------------------------------
// 📝 Log with timestamp
// ----------------------------------------------

Cypress.Commands.overwrite('log', (originalFn, message: string, ...args) => {
  const timestamp = new Date().toISOString();
  return originalFn(`[${timestamp}] ${message}`, ...args);
});
