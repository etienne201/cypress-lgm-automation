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
  

  after(() => {
    cy.customLog('✅ Login UI Test Suite completed', 'success');
  });
})
});
