import LoginPage from '../../../pages/login.page';
import DashboardPage from '../../../pages/dashboard.page';

describe('Login Feature', { tags: ['@auth', '@login'] }, () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  before(() => {
    cy.customLog('🚀 Starting test suite', 'info');
  });

  beforeEach(() => {
    // Ensure clean storage and visit the login page fresh.
    cy.clearAllStorage();
    loginPage.visit();
  });

  context('Successful Login', { tags: '@positive' }, () => {
    it('should login with valid credentials', () => {
      const user = Cypress.env('users')?.standard;

      // Use UI flow
      loginPage
        .login(user.email, user.password)
        .waitForLoginComplete()
        .verifySuccessfulLogin();

      // The dashboard page should implement verifyDashboardLoaded()
      // The page object should handle specifics (selectors, API waits, etc.)
      dashboardPage.verifyDashboardLoaded();
    });

    it("should login as admin", { tags: '@admin' }, () => {
      const admin = Cypress.env('users')?.admin;

      loginPage
        .login(admin.email, admin.password)
        .waitForLoginComplete()
        .verifySuccessfulLogin();
    });
  });

  afterEach(function () {
    // Screenshot on failure and friendly logs.
    if (this.currentTest.state === 'failed') {
      cy.screenshot(this.currentTest.fullTitle());
      cy.customLog(`Test failed: ${this.currentTest.title}`, 'error');
    } else if (this.currentTest.state === 'passed') {
      cy.customLog(`Test passed: ${this.currentTest.title}`, 'success');
    }
  });
});
