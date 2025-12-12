// cypress/pages/login.page.js
import BasePage from './base.page';

class LoginPage extends BasePage {
  constructor() {
    super();
    this.path = '/login';


    this.selectors = {
      emailInput: 'input.basic_input:not([type])',
      passwordInput: 'input.basic_input[type="password"]',
      loginButton: 'div.btn:contains("Login")',
      errorMessage: '[role="alert"], .error-message, .alert-danger',
      forgotPasswordLink: 'a[href*="forgot"]',
      signupLink: 'a[href*="signup"]',
      loader: '.spinner, .loading, [data-testid="loader"]',
    };
  }

  // Visit the login page safely
  visit() {
    const httpAuth = Cypress.env('httpAuth') || {};
    const fullUrl = `${Cypress.config('baseUrl')}${this.path}`;

    cy.visit(fullUrl, {
      failOnStatusCode: false,
      timeout: 60000,
      auth: {
        username: httpAuth.username,
        password: httpAuth.password
      }
    });

    this.waitForLoader();
    this.verifyLoginFormIsVisible();

    return this;
  }

  // Wait until loader disappears
  waitForLoader(timeout = 20000) {
    cy.get('body').then(($body) => {
      if ($body.find(this.selectors.loader).length > 0) {
        cy.get(this.selectors.loader, { timeout }).should('not.exist');
      }
    });
    return this;
  }

  // Login via UI
  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    cy.get(this.selectors.loginButton).click();
    cy.wait(1000);
    return this;
  }

  fillEmail(email) {
    cy.get(this.selectors.emailInput, { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .clear()
      .type(email);
    return this;
  }

  fillPassword(password) {
    cy.get(this.selectors.passwordInput, { timeout: 20000 })
      .should('exist')
      .and('be.visible')
      .clear()
      .type(password, { log: false });
    return this;
  }

  submit() {
    cy.get(this.selectors.loginButton, { timeout: 20000 })
      .should('exist')
      .and('be.enabled')
      .click();
    return this;
  }

  waitForLoginComplete(timeout = 20000) {
    this.waitForLoader(timeout);

    const dashboardUrl = Cypress.env('dashboardUrl') || '/campaigns?CS=all';
    cy.url({ timeout }).should('include', dashboardUrl);

    return this;
  }

  verifyLoginFormIsVisible() {
    cy.get(this.selectors.emailInput, { timeout: 20000 })
      .should('exist')
      .and('be.visible');

    cy.get(this.selectors.passwordInput)
      .should('exist')
      .and('be.visible');

    cy.get(this.selectors.loginButton)
      .should('exist')
      .and('be.visible');

    return this;
  }

  verifySuccessfulLogin(expectedPath = Cypress.env('dashboardUrl') || '/campaigns?CS=all') {
    cy.url({ timeout: 15000 }).should('include', expectedPath);
    return this;
  }

  verifyErrorMessage(message) {
    cy.get(this.selectors.errorMessage, { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', message);
    return this;
  }
}

export default LoginPage;
