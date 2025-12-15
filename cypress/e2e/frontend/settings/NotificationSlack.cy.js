import LoginPage from '../../../pages/login.page';
import DashboardPage from '../../../pages/dashboard.page';
import NotificationSlackPage from '../../../pages/NotificationSlack.page';

describe('Slack Notifications Settings', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();
  const slackPage = new NotificationSlackPage();

  beforeEach(() => {
    cy.clearAllStorage();

    const user = Cypress.env('users').standard;
    expect(user).to.exist;

    loginPage
      .visit()
      .login(user.email, user.password)
      .waitForLoginComplete();

    dashboardPage.verifyDashboardLoaded();
  });

  it('should open Slack Notification page via UI menu', () => {
    slackPage.openFromUserMenu();
  });

  // it('should connect Slack successfully', () => {
  //   slackPage
  //     .openFromUserMenu()
  //     .connectSlack();
  // });
});
