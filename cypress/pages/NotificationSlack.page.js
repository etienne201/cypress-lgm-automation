// cypress/pages/NotificationSlack.page.js
import BasePage from './base.page';
import LoginPage from './login.page';

class NotificationSlackPage extends BasePage {
  constructor() {
    super();
    this.path = '/settings/notifications/slack'; // Page Slack notifications

    this.selectors = {
      avatarButton:     '[style="--avatar-size: 40px; --avatar-br: 50%; --img-br: 50%; --avatar-bc: transparent;"] > .h-full',

      userMenu:'.top > :nth-child(4)',
      Slacknavigate: '.flex-wrap > :nth-child(2)',
      settingsItem: '.user_menu > .top > :nth-child(4)',
      notificationsItem: ':nth-child(5) > .text',
      statusConnected: '[data-testid="slack-status"]',
      loader: '[data-testid="loader"], .spinner, .loading',
      slackContainer: '.bg-white > .text-\\[18px\\]',
      CreaterNotification: '.justify-between > .btn',
      triggerPlaceholder: 'Select trigger',
      channelPlaceholder: 'Select channels',
      identityPlaceholder: 'Select identity',

    };
  }

  /**
   * Visit Slack notification page safely
   * Log in via UI if user not already authenticated
   */
  /**
   * Navigate to Slack notifications via UI menu
   * (required before accessing Slack page)
   */
  selectFromReactSelect({ placeholderText, optionLabel }) {
    // 1️⃣ Ouvrir le dropdown via le placeholder
    cy.contains('[id$="-placeholder"]', placeholderText, { timeout: 20000 })
      .closest('div.css-1huvecd')
      .should('exist')
      .click({ force: true });

    // 2️⃣ Attendre que l'option cible existe
    cy.get('body', { timeout: 20000 })
      .contains('[role="option"]', optionLabel)
      .should('exist')
      .click({ force: true });
  }

  s /**
  * =========================
  * CAS SPÉCIFIQUE : TRIGGER
  * =========================
  * (lazy-loaded → options métier peuvent arriver après ouverture)
  */
 selectTrigger(optionLabel) {
   this.selectFromReactSelect({
     placeholderText: this.selectors.triggerPlaceholder,
     optionLabel,
   });
 }

 /**
  * =========================
  * CAS SPÉCIFIQUE : CHANNEL
  * =========================
  */
 selectChannel(channelName) {
   this.selectFromReactSelect({
     placeholderText: this.selectors.channelPlaceholder,
     optionLabel: channelName,
   });
 }

 /**
  * =========================
  * CAS SPÉCIFIQUE : IDENTITY
  * =========================
  */
 selectIdentity(identityName) {
   this.selectFromReactSelect({
     placeholderText: this.selectors.identityPlaceholder,
     optionLabel: identityName,
   });
 }

  
  openFromUserMenu() {
    cy.customLog('Open user menu', 'info');

    cy.get(this.selectors.avatarButton, { timeout: 20000 })
      .should('be.visible')
      .click();

    cy.get(this.selectors.userMenu)
      .should('be.visible');
 
    cy.get(this.selectors.settingsItem)
      .should('be.visible')
      .click();

    cy.get(this.selectors.notificationsItem)
      .should('be.visible')
      .click();
      cy.get(this.selectors.Slacknavigate)
      .should('be.visible')
      .click();
    // Open "Create notification"
    cy.get(this.selectors.CreaterNotification, { timeout: 20000 })
    .should('be.visible')
    .click();
    this.wait(12000);

    // Trigger (lazy)
    this.selectTrigger('New lead reply');

    // Channel
    this.selectChannel('#all-qaautomation-test');

    // Identity
    this.selectIdentity('Robot Auto Testing');

    
    this.waitForLoader();
    this.verifySlackPageIsVisible();

    cy.customLog('Slack notification page opened via UI', 'success');
    return this;
  }
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
    //cy.get(this.selectors.pageTitle, { timeout: 20000 }).should('exist').and('be.visible');
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
