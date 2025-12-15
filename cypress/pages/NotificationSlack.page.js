// cypress/pages/NotificationSlack.page.js
import BasePage from './base.page';
import LoginPage from './login.page';

class NotificationSlackPage extends BasePage {
  constructor() {
    super();
    this.path = '/settings/notifications/slack'; // Page Slack notifications

    // ⚡ QA-friendly selectors
    this.selectors = {
      pageTitle: '[data-testid="slack-page-title"]', // unique title element
      slackContainer: '[data-testid="slack-settings"]', // container for Slack settings
      connectButton: '[data-testid="connect-slack-btn"]',
      disconnectButton: '[data-testid="disconnect-slack-btn"]',
      statusConnected: '[data-testid="slack-status"]', // shows "Connected" or "Actif"
      loader: '[data-testid="loader"], .spinner, .loading'
    };
  }

  /**
   * Visit Slack notification page safely
   * Log in via UI if user not already authenticated
   */
  visit() {
    const fullUrl = Cypress.config('baseUrl') + this.path;

    // Check if user is logged in (example: cookie check)
    cy.getCookie('lgm-connect-sid').then((cookie) => {
      if (!cookie) {
        // Perform UI login
        const users = Cypress.env('users') || {};
        const standardUser = users.standard || {};
        if (!standardUser.email || !standardUser.password) {
          throw new Error('Standard user must exist in cypress.env.json');
        }

        const loginPage = new LoginPage();
        loginPage.visit().login(standardUser.email, standardUser.password).waitForLoginComplete();
      }
    });

    cy.visit(fullUrl, { failOnStatusCode: false, timeout: 60000 });
    this.waitForLoader();
    this.verifySlackPageIsVisible();

    cy.log('✅ Slack page loaded successfully');
    return this;
  }

  /**
   * Wait until loader disappears
   */
  waitForLoader(timeout = 20000) {
    cy.get('body').then(($body) => {
      if ($body.find(this.selectors.loader).length > 0) {
        cy.get(this.selectors.loader, { timeout }).should('not.exist');
        cy.log('✅ Loader disappeared');
      }
    });
    return this;
  }

  /**
   * Verify main Slack container is visible
   */
  verifySlackPageIsVisible() {
    cy.get(this.selectors.pageTitle, { timeout: 20000 }).should('exist').and('be.visible');
    cy.get(this.selectors.slackContainer).should('exist').and('be.visible');
    cy.log('✅ Slack container is visible');
    return this;
  }

  /**
   * Verify Slack is connected
   */
  verifySlackIsConnected() {
    this.verifySlackPageIsVisible();
    cy.get(this.selectors.statusConnected, { timeout: 20000 })
      .should('exist')
      .and('contain.text', 'Connected');
    cy.log('✅ Slack is connected');
    return this;
  }

  /**
   * Connect Slack
   */
  connectSlack() {
    cy.get(this.selectors.connectButton, { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .click();

    this.waitForLoader();
    this.verifySlackIsConnected();
    cy.log('✅ Slack connected via button');
    return this;
  }

  /**
   * Disconnect Slack
   */
  disconnectSlack() {
    cy.get(this.selectors.disconnectButton, { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .click();

    this.waitForLoader();

    // Verify disconnected state (no "Connected" text)
    cy.get(this.selectors.statusConnected).should('not.exist');
    cy.log('✅ Slack disconnected via button');
    return this;
  }
}

export default NotificationSlackPage;
