import BasePage from './base.page';
import LoginPage from './login.page';

class NotificationSlackPage extends BasePage {
  constructor() {
    super();
    this.path = '/settings/notifications/slack';

    this.placeholders = {
      trigger: 'Select trigger',
      channel: 'Select channels',
      identity: 'Select identity',
    };

    this.selectors = {
      avatarButton:
        '[style="--avatar-size: 40px; --avatar-br: 50%; --img-br: 50%; --avatar-bc: transparent;"] > .h-full',
      userMenu: '.top > :nth-child(4)',
      intergretAPi: ':nth-child(6) > .text',
      Slacknavigate: '.flex-wrap > :nth-child(2)',
      settingsItem: '.user_menu > .top > :nth-child(4)',
      notificationsItem: ':nth-child(5) > .text',
      statusConnected: '[data-testid="slack-status"]',
      loader: '[data-testid="loader"], .spinner, .loading',
      slackContainer: '.bg-white > .text-\\[18px\\]',
      CreaterNotification: '.justify-between > .btn',
      close: '.top-\\[32px\\] > .btn',
      bouton: '.gap-\\[12px\\] > .flex > .primary > span'
    };
  }

  // =========================
  // GENERIC REACT-SELECT
  // =========================
  selectFromReactSelect({ placeholderText, optionLabel }) {
    cy.log(`Searching for Select: ${placeholderText}`);

    // Locate the container matching the placeholder text
    cy.contains(
      '.react-select__control, .css-17gvuhw-container',
      placeholderText
    ).as('currentContainer');

    // Open the select input
    cy.get('@currentContainer').within(() => {
      cy.get('input[role="combobox"]').click({ force: true });
    });

    // Wait for the listbox to appear and not show Loading
    cy.get('[role="listbox"]', { timeout: 15000 })
      .should('be.visible')
      .should('not.contain', 'Loading');

    // Select the desired option
    cy.get('[role="listbox"]')
      .contains('[role="option"]', optionLabel)
      .scrollIntoView()
      .click({ force: true });

    // ⚠️ IMPORTANT
    // ❌ Do not use should('not.exist') here (React-Select safe)
  }

  // =========================
  // CHANNEL (FINAL SOLUTION)
  // =========================
  closeChannelSelectSafely(channelValue = '#all-qaautomation-test') {
    cy.log(`🔒 Clean exit from Channel: ${channelValue}`);
  
    const CHANNEL_SELECT = ':nth-child(2) > .css-17gvuhw-container';
  
    // ✅ Do not click the option again (already selected)
    // 👉 Only release the focus
    cy.get(CHANNEL_SELECT)
      .find('input[role="combobox"]')
      .blur({ force: true });
  
    // Non-blocking assertion (React-Select safe)
    cy.get('body').then(($body) => {
      const listbox = $body.find('[role="listbox"]');
      if (listbox.length) {
        cy.wrap(listbox).should('not.be.visible');
      }
    });
  
    cy.log('✅ Channel validated, focus released → Identity');
  }

  closeidentifySelectSafely(identityValue = 'Robot Auto Testing') {
    cy.log(`🔒 Clean exit from Identity field: ${identityValue}`);
    const IDENTITY_SELECT = ':nth-child(3) > .css-17gvuhw-container';

    // Release focus
    cy.get(IDENTITY_SELECT)
      .find('input[role="combobox"]')
      .blur({ force: true });

    // Non-blocking assertion for listbox visibility
    cy.get('body').then(($body) => {
      const listbox = $body.find('[role="listbox"]');
      if (listbox.length) {
        cy.wrap(listbox).should('not.be.visible');
      }
    });

    cy.log('✅ Identity validated, focus released');
  }

  // =========================
  // BUSINESS METHODS
  // =========================
  selectTrigger(label) {
    this.selectFromReactSelect({
      placeholderText: this.placeholders.trigger,
      optionLabel: label,
    });
  }

  selectChannel(channel) {
    this.selectFromReactSelect({
      placeholderText: this.placeholders.channel,
      optionLabel: channel,
    });

    // ✅ Applied solution ONLY here
    this.closeChannelSelectSafely(channel);
  }

  selectIdentity(identity) {
    cy.log(`🎯 Selecting identity: ${identity}`);
    const IDENTITY_SELECT = ':nth-child(3) > .css-17gvuhw-container';

    // Open the select input
    cy.get(IDENTITY_SELECT)
      .find('input[role="combobox"]')
      .click({ force: true });

    // Wait for the listbox
    cy.get('[role="listbox"]', { timeout: 15000 })
      .should('be.visible')
      .should('not.contain', 'Loading');

    // Select the option
    cy.get('[role="listbox"]')
      .contains('[role="option"]', identity)
      .scrollIntoView()
      .click({ force: true });

    // Clean exit
    this.closeidentifySelectSafely(identity);
  }

  // =========================
  // NAVIGATION & FLOW
  // =========================
  openFromUserMenu() {
    cy.customLog('Open user menu', 'info');

    cy.get(this.selectors.avatarButton, { timeout: 20000 })
      .should('be.visible')
      .click();

    cy.get(this.selectors.userMenu).should('be.visible');

    cy.get(this.selectors.settingsItem).should('be.visible').click();
    cy.get(this.selectors.notificationsItem).should('be.visible').click();
    cy.get(this.selectors.intergretAPi).should('be.visible').click();
    cy.get(this.selectors.Slacknavigate).should('be.visible').click();

    cy.get(this.selectors.CreaterNotification, { timeout: 20000 })
      .should('be.visible')
      .click();

    cy.get(this.selectors.close).should('be.visible').click();

    cy.wait(12000);

    cy.get(this.selectors.CreaterNotification, { timeout: 20000 })
      .should('be.visible')
      .click();

    cy.wait(12000);

    // =========================
    // FORM FILL (STABLE)
    // =========================
    this.selectTrigger('New lead reply');
    this.selectChannel('#all-qaautomation-test');
    this.selectIdentity('Robot Auto Testing');
    cy.wait(10000)
    cy.get(this.selectors.bouton).click();

    this.waitForLoader();
    this.verifySlackPageIsVisible();

    cy.customLog('Slack notification page opened via UI', 'success');
    return this;
  }

  visit() {
    const fullUrl = Cypress.config('baseUrl') + this.path;

    cy.getCookie('lgm-connect-sid').then((cookie) => {
      if (!cookie) {
        const users = Cypress.env('users') || {};
        const standardUser = users.standard || {};
        if (!standardUser.email || !standardUser.password) {
          throw new Error('Standard user must exist in cypress.env.json');
        }

        const loginPage = new LoginPage();
        loginPage
          .visit()
          .login(standardUser.email, standardUser.password)
          .waitForLoginComplete();
      }
    });

    cy.visit(fullUrl, { failOnStatusCode: false, timeout: 60000 });
    this.waitForLoader();
    this.verifySlackPageIsVisible();

    cy.log('✅ Slack page loaded successfully');
    return this;
  }

  waitForLoader(timeout = 20000) {
    cy.get('body').then(($body) => {
      if ($body.find(this.selectors.loader).length > 0) {
        cy.get(this.selectors.loader, { timeout }).should('not.exist');
      }
    });
    return this;
  }

  verifySlackPageIsVisible() {
    cy.get(this.selectors.slackContainer).should('exist').and('be.visible');
    return this;
  }
}

export default NotificationSlackPage;
