// ----------------------------------------------
// Global Support File (E2E)
// Clean, consolidated, no duplicates
// ----------------------------------------------

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

  // Log API errors globally
  cy.intercept('**/*', (req) => {
    req.on('response', (res) => {
      if (res.statusCode >= 400) {
        console.log(`❌ API Error: ${req.method} ${req.url} - Status: ${res.statusCode}`);
      }
    });
  });
});

afterEach(function () {
  if (this.currentTest?.state === 'failed') {
    const testName = this.currentTest.title;
    const suiteName = this.currentTest.parent?.title || 'Unknown Suite';

    cy.screenshot(`${suiteName} - ${testName}`, { capture: 'fullPage', overwrite: true });
    cy.log(`❌ Test échoué: ${testName}`);

    // Slack notification
    if (Cypress.env('ENABLE_SLACK_NOTIFICATIONS') && Cypress.env('SLACK_WEBHOOK_URL')) {
      const message = `
❌ Test Failed in ${Cypress.env('environment')}
Suite: ${suiteName}
Test: ${testName}
Browser: ${Cypress.browser.name}
URL: ${Cypress.config('baseUrl')}
      `;
      cy.task('sendSlackNotification', { text: message, webhook: Cypress.env('SLACK_WEBHOOK_URL') });
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
// Exception Handling - Third Party Scripts
// ----------------------------------------------

Cypress.on('uncaught:exception', (err: Error) => {
  const msg = err.message.toLowerCase();

  const externalErrors = [
    'recaptcha',
    'stripe',
    'intercom',
    'webflow',
    'analytics',
    'segment',
    'resizeobserver',
    'undefined'
  ];

  if (externalErrors.some(keyword => msg.includes(keyword))) {
    return false; // ignore
  }

  return undefined; // let Cypress fail normally
});

// ----------------------------------------------
// Timeouts
// ----------------------------------------------

Cypress.config('defaultCommandTimeout', Cypress.env('defaultCommandTimeout') || 10000);
Cypress.config('requestTimeout', Cypress.env('requestTimeout') || 15000);
Cypress.config('responseTimeout', Cypress.env('responseTimeout') || 15000);

// ----------------------------------------------
// Helpers
// ----------------------------------------------

Cypress.Commands.add('waitForPageLoad', () => {
  return cy.window().its('document.readyState').should('eq', 'complete');
});

// Add timestamp to logs
Cypress.Commands.overwrite('log', (originalFn, message, ...args) => {
  const timestamp = new Date().toISOString();
  return originalFn(`[${timestamp}] ${message}`, ...args);
});
