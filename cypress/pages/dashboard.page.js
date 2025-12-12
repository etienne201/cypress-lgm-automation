import BasePage from './base.page';

class DashboardPage extends BasePage {
  constructor() {
    super();

    this.selectors = {
      // dashboardHeader: '[data-test-id="dashboard-header"], h1, .dashboard-title',
      // userMenu: '[data-test-id="user-menu"]',
      // logoutButton: '[data-test-id="logout-button"]',
      // loader: '[data-testid="loader"], .loading'
    };
  }

  /**
   * Vérifie que le dashboard est chargé
   */
  verifyDashboardLoaded() {
    cy.get(this.selectors.loader, { timeout: 20000 }).should('not.exist');

    cy.get(this.selectors.dashboardHeader, { timeout: 10000 })
      .should('be.visible');

    cy.url().should('include', '/campaigns?CS=all');
    return this;
  }

  /**
   * Ouvre le menu utilisateur
   */
  openUserMenu() {
    cy.get(this.selectors.userMenu).should('be.visible').click();
    return this;
  }

  /**
   * Déconnexion
   */
  logout() {
    this.openUserMenu();
    cy.get(this.selectors.logoutButton).click();
    return this;
  }
}

export default DashboardPage;
