import LoginPage from '../../../pages/login.page';
import DashboardPage from '../../../pages/dashboard.page';

describe('Login Feature (UI)', { tags: ['@auth', '@login', '@ui'] }, () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  before(() => {
    cy.customLog('🚀 Starting Login UI Test Suite', 'info');
  });

  beforeEach(() => {
    // Ensure a clean state before each test
    cy.clearAllStorage();

    // Open login page
    loginPage.visit();
  });

  context('Positive Scenarios', { tags: '@positive' }, () => {
    /**
     * TC01
     * Login with valid credentials
     * Expected result: user is redirected to dashboard
     */
    it('TC01 – Login with valid standard user', () => {
      const user = Cypress.env('users')?.standard;

      expect(user, 'Standard user must exist in cypress.env.json').to.exist;

      loginPage
        .login(user.email, user.password)
        .waitForLoginComplete()
        .verifySuccessfulLogin();

      dashboardPage.verifyDashboardLoaded();
    });

    /**
     * TC10
     * Verify session persistence after page reload
     */
    it('TC10 – Session persists after page reload', () => {
      const user = Cypress.env('users').standard;

      loginPage.login(user.email, user.password);
      dashboardPage.verifyDashboardLoaded();

      cy.reload();
      dashboardPage.verifyDashboardLoaded();
    });
  });

  context('Negative Scenarios', { tags: '@negative' }, () => {
    /**
     * TC02
     * Login with invalid email
     */
    it('TC02 – Invalid email shows error message', () => {
      loginPage
        .login('wrong@email.com', 'invalidPassword')
        .verifyLoginError();
    });

    /**
     * TC03
     * Login with invalid password
     */
    it('TC03 – Invalid password shows error message', () => {
      const user = Cypress.env('users').standard;

      loginPage
        .login(user.email, 'wrongPassword')
        .verifyLoginError();
    });

    /**
     * TC04
     * Submit with empty email
     */
    it('TC04 – Empty email validation error', () => {
      loginPage
        .login('', 'somePassword')
        .verifyFieldValidation('email');
    });

    /**
     * TC05
     * Submit with empty password
     */
    it('TC05 – Empty password validation error', () => {
      loginPage
        .login('test@email.com', '')
        .verifyFieldValidation('password');
    });

    /**
     * TC06
     * Submit with both fields empty
     */
    it('TC06 – Both fields empty disables submit', () => {
      loginPage.verifySubmitDisabled();
    });

    /**
     * TC07
     * Invalid email format
     */
    it('TC07 – Invalid email format shows validation error', () => {
      loginPage
        .login('invalid-email', 'password')
        .verifyFieldValidation('email');
    });
  });

  context('UX & Security', { tags: '@ux' }, () => {
    /**
     * TC08
     * Loader should be visible during login request
     */
    it('TC08 – Loader is displayed during authentication', () => {
      const user = Cypress.env('users').standard;

      loginPage.login(user.email, user.password);
      loginPage.verifyLoadingState();
    });

    /**
     * TC09
     * Prevent multiple submissions
     */
    it('TC09 – Login button disabled while submitting', () => {
      const user = Cypress.env('users').standard;

      loginPage.login(user.email, user.password);
      loginPage.verifySubmitDisabled();
    });

    /**
     * TC11
     * Direct dashboard access without login
     */
    it('TC11 – Unauthorized dashboard access redirects to login', () => {
      cy.clearAllStorage();
      cy.visit('/campaigns?CS=all', { failOnStatusCode: false });

      loginPage.verifyLoginPageVisible();
    });

    /**
     * TC12
     * Logout invalidates session
     */
    it('TC12 – Logout redirects to login and blocks dashboard', () => {
      const user = Cypress.env('users').standard;

      loginPage.login(user.email, user.password);
      dashboardPage.verifyDashboardLoaded();

      dashboardPage.logout();

      cy.visit('/campaigns?CS=all', { failOnStatusCode: false });
      loginPage.verifyLoginPageVisible();
    });
  });

  after(() => {
    cy.customLog('✅ Login UI Test Suite completed', 'success');
  });
});
