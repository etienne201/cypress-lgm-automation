/**
 * @tags @ui @notifications @slack @stable
 */

import NotificationSlackPage from '../../../pages/NotificationSlack.page';
import DashboardPage from '../../../pages/dashboard.page';

describe('Slack Notifications Settings', () => {
  const slackPage = new NotificationSlackPage();
  const dashboardPage = new DashboardPage();
  const user = Cypress.env('users')?.standard;

  before(() => {
    cy.customLog('🚀 Starting Slack Notifications Test Suite', 'info');
    expect(user, 'Standard user must exist in cypress.env.json').to.exist;
  });

  beforeEach(() => {
    // Clear storage to avoid cache/session issues
    cy.clearAllStorage();

    // Login before accessing settings
    cy.loginUI(user.email, user.password);

    // Ensure dashboard is loaded
    dashboardPage.verifyDashboardLoaded();
  });

  context('UI Elements Verification', () => {
    it('should open Slack Notification page', () => {
      slackPage.visit();
      cy.url().should('include', '/settings/notifications/slack');

      // Verify key UI elements
      slackPage.verifySlackPageIsVisible();
    });

    it('should display Slack connection status', () => {
      slackPage.visit();

      cy.get('body').then(($body) => {
        if ($body.find(slackPage.selectors.statusConnected).length) {
          slackPage.verifySlackIsConnected();
        } else {
          cy.log('Slack is not connected yet');
        }
      });
    });
  });

  // context('Actions', () => {
  //   it('should connect Slack if not connected', () => {
  //     slackPage.visit();

  //     cy.get('body').then(($body) => {
  //       if ($body.find(slackPage.selectors.connectButton).length) {
  //         slackPage.connectSlack();
  //         slackPage.verifySlackIsConnected();
  //       } else {
  //         cy.log('Slack is already connected');
  //       }
  //     });
  //   });

  //   it('should disconnect Slack if connected', () => {
  //     slackPage.visit();

  //     cy.get('body').then(($body) => {
  //       if ($body.find(slackPage.selectors.disconnectButton).length) {
  //         slackPage.disconnectSlack();
  //         cy.get(slackPage.selectors.statusConnected, { timeout: 10000 })
  //           .should('not.exist');
  //       } else {
  //         cy.log('Slack is already disconnected');
  //       }
  //     });
  //   });
  // });

  // context('Performance & Stability', () => {
  //   it('should load Slack page within 5 seconds', () => {
  //     const start = Date.now();
  //     slackPage.visit();
  //     const duration = Date.now() - start;
  //     expect(duration).to.be.lessThan(5000);
  //   });
  // });
});
