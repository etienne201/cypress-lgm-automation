import LoginPage from '../../../pages/login.page';
import DashboardPage from '../../../pages/dashboard.page';

describe('Login Feature', { tags: ['@auth', '@login'] }, () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  before(() => {
    cy.customLog('🚀 Starting Login Test Suite', 'info');
  });

  beforeEach(() => {
    // Clear local/session storage to avoid cache/login persistence
    cy.clearAllStorage();

    // Open login page
    loginPage.visit();
  });

  context('Successful Login', { tags: '@positive' }, () => {
    it('should login with valid standard user', () => {
      const user = Cypress.env('users')?.standard;

      expect(user, 'Standard user must exist in cypress.env.json').to.exist;

      loginPage
        .login(user.email, user.password)
        .waitForLoginComplete()
        .verifySuccessfulLogin();

      dashboardPage.verifyDashboardLoaded();
    });

    // it('should login as admin', { tags: '@admin' }, () => {
    //   const admin = Cypress.env('users')?.admin;

    //   expect(admin, 'Admin user must exist in cypress.env.json').to.exist;

    //   loginPage
    //     .login(admin.email, admin.password)
    //     .waitForLoginComplete()
    //     .verifySuccessfulLogin();

    //   dashboardPage.verifyDashboardLoaded();
    // });
  });

  // context('Failed Login', { tags: '@negative' }, () => {
  //   it('should show an error with invalid credentials', () => {
  //     loginPage
  //       .login('invalid@test.com', 'wrongpassword')
  //       .waitForLoginComplete()
  //       .verifyLoginError('Invalid credentials'); // adapte si ton message diffère
  //   });
  // });

  // afterEach(function () {
  //   const status = this.currentTest.state;

  //   if (status === 'failed') {
  //     cy.customLog(`❌ Test failed: ${this.currentTest.title}`, 'error');
  //     cy.screenshot(this.currentTest.fullTitle());
  //   } else {
  //     cy.customLog(`✅ Test passed: ${this.currentTest.title}`, 'success');
  //   }
  // });
});
