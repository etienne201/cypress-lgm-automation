// cypress/pages/login.page.js
import BasePage from './base.page';

/**
 * Page Object for Login Page.
 * - All actions use Cypress commands and never mix native Promises.
 * - Methods return `this` for chainability.
 */

class LoginPage extends BasePage {
  constructor() {
    super();
    this.path = '/login';

    this.selectors = {
      emailInput: 'input[type="email"], input[name="email"]',
      passwordInput: 'input[type="password"], input[name="password"]',
      loginButton: 'button[type="submit"]',
      rememberMe: 'input[type="checkbox"][name*="remember"]',
      errorMessage: '[role="alert"], .error-message, .alert-danger',
      forgotPasswordLink: 'a[href*="forgot"]',
      signupLink: 'a[href*="signup"]',
      loader: '.spinner, .loading, [data-testid="loader"]',
    };
  }

  /**
   * Visit login page with optional HTTP Basic Auth from env.
   * No promises returned; rely on Cypress commands only.
   */
  visit() {
    const httpAuth = Cypress.env('httpAuth') || {};
    const base = Cypress.config('baseUrl') || '';

    cy.visit(this.path, {
      failOnStatusCode: false,
      timeout: 60000,
      auth: {
        username: httpAuth.username,
        password: httpAuth.password,
      },
    });

    // Wait for the page to be loaded deterministically
    this.waitForPageLoad();
    this.verifyLoginFormIsVisible();
    cy.customLog(`Visited ${base}${this.path}`, 'success');

    return this;
  }

  waitForPageLoad() {
    // Ensure document readyState is complete and window exists
    cy.document({ timeout: 15000 }).should('have.property', 'readyState', 'complete');
    cy.window({ timeout: 15000 }).should('exist');
    return this;
  }

  login(email, password, remember = false) {
    this.fillEmail(email);
    this.fillPassword(password);

    if (remember) {
      this.checkRememberMe();
    }

    this.submit();
    return this;
  }

  fillEmail(email) {
    cy.get(this.selectors.emailInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(email, { delay: 5 });

    return this;
  }

  fillPassword(password) {
    cy.get(this.selectors.passwordInput, { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(password, { log: false, delay: 5 });

    return this;
  }

  checkRememberMe() {
    cy.get(this.selectors.rememberMe).then(($el) => {
      if ($el.length) {
        cy.get(this.selectors.rememberMe).check({ force: true });
      }
    });

    return this;
  }

  submit() {
    cy.get(this.selectors.loginButton).should('be.enabled').click();
    return this;
  }

  submitWithEnter() {
    cy.get(this.selectors.passwordInput).type('{enter}');
    return this;
  }

  waitForLoginComplete(timeout = 20000) {
    // Wait for loader to disappear if present
    cy.get('body').then(($body) => {
      if ($body.find(this.selectors.loader).length > 0) {
        cy.get(this.selectors.loader, { timeout }).should('not.exist');
      }
    });

    // Wait for redirect to the dashboard/campaigns (use environment-provided dashboardUrl or fallback)
    const dashboardUrl = Cypress.env('dashboardUrl') || '/dashboard';
    // Check that url includes the path (avoid exact full-match due to query params)
    cy.url({ timeout }).should('include', dashboardUrl.replace(/^https?:\/\/[^/]+/, ''));
    cy.customLog('Login complete and redirected', 'success');

    return this;
  }

  verifyLoginFormIsVisible() {
    cy.get(this.selectors.emailInput, { timeout: 15000 }).should('be.visible');
    cy.get(this.selectors.passwordInput).should('be.visible');
    cy.get(this.selectors.loginButton).should('be.visible');
    return this;
  }

  verifySuccessfulLogin(expectedPath = Cypress.env('dashboardUrl') || '/dashboard') {
    cy.url({ timeout: 15000 }).should('include', expectedPath.replace(/^https?:\/\/[^/]+/, ''));
    cy.customLog('Successful login verified', 'success');
    return this;
  }

  verifyErrorMessage(message) {
    cy.get(this.selectors.errorMessage).should('be.visible').and('contain.text', message);
    return this;
  }

  goToForgotPassword() {
    cy.get(this.selectors.forgotPasswordLink).click();
    return this;
  }

  goToSignup() {
    cy.get(this.selectors.signupLink).click();
    return this;
  }

  clearAllFields() {
    cy.get(this.selectors.emailInput).clear();
    cy.get(this.selectors.passwordInput).clear();
    return this;
  }

  // Login via API bypassing UI — uses cy.session (no returned native Promise)
  loginViaApi(email = null, password = null) {
    const users = Cypress.env('users') || {};
    const standard = users.standard || {};
    const credentials = {
      email: email || standard.email,
      password: password || standard.password,
      termsAccepted: true,
    };

    const httpAuth = Cypress.env('httpAuth') || {};
    const apiUrl = Cypress.env('apiUrl') || Cypress.config('baseUrl');

    cy.session(
      ['api-login', credentials.email],
      () => {
        cy.customLog(`API login: ${credentials.email}`, 'info');

        cy.request({
          method: 'POST',
          url: `${apiUrl}/usersv1/login`,
          body: credentials,
          failOnStatusCode: false,
          auth: {
            username: httpAuth.username,
            password: httpAuth.password,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);

          const csrfToken = response.headers['lgm-csrf-token'];
          const setCookie = response.headers['set-cookie'];

          if (csrfToken) {
            cy.setCookie('lgm-csrf-token', csrfToken);
            cy.window().then((win) => {
              try {
                win.localStorage.setItem('auth_token', csrfToken);
              } catch (e) {
                cy.log('⚠️ Could not set auth token in localStorage');
              }
            });
          }

          if (setCookie && Array.isArray(setCookie)) {
            const sessionMatch = setCookie[0]?.match(/lgm-connect-sid=([^;]+)/);
            if (sessionMatch) {
              // try to set cookie for main domain
              cy.setCookie('lgm-connect-sid', sessionMatch[1], {
                domain: Cypress.env('cookieDomain') || undefined,
              });
            }
          }

          cy.customLog('API login success', 'success');
        });
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.getCookie('lgm-connect-sid').should('exist');
        },
      }
    );

    return this;
  }
}

export default LoginPage;
