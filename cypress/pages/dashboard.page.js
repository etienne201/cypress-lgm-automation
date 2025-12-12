import BasePage from './base.page';

/**
 * Page Object du tableau de bord.
 */
class DashboardPage extends BasePage {
  constructor() {
    super();
    this.selectors = {
      container: '[data-test-id="dashboard-container"], main',
      userMenu: '[data-test-id="user-menu"], [data-test-id="profile-menu"]',
      headerTitle: '[data-test-id="dashboard-title"], h1',
      loader: '[data-test-id="loading-spinner"]'
    };
  }

  verifyDashboardLoaded() {
    this.waitForPageLoad();
    cy.get(this.selectors.loader).should('not.exist');
    cy.get(this.selectors.container, { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/dashboard');
    return this;
  }

  openUserMenu() {
    cy.get(this.selectors.userMenu).click({ force: true });
    return this;
  }
}

export default DashboardPage;
