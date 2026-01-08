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

    it('should create Slack Notification', () => {
      slackPage.CreateNotificationSlack_create();
    });
    it('should test Slack Notification', () => {
      slackPage.CreateNotificationSlack_test();
    });
    it('should delete Slack Notification', () => {
      slackPage.deleteNotificationSlack();
    });
    it('should edit Slack Notification', () => {
      slackPage.editNotificationSlack();
    });
});
