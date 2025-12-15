import BasePage from './base.page';

/**
 * DashboardPage
 *
 * Page Object representing the main dashboard after authentication.
 * Responsibilities:
 * - Validate that the dashboard is fully loaded and usable
 * - Provide safe actions for user-related operations (menu, logout)
 *
 * Design principles:
 * - Anti-flaky assertions (URL + loader + real content)
 * - Stable selectors (avoid Tailwind / dynamic classes)
 * - Chainable methods for readable test flows
 */
class DashboardPage extends BasePage {
  constructor() {
    super();

    /**
     * Centralized selectors for the Dashboard page.
     * Prefer data-testid / data-test-id to avoid UI refactors breaking tests.
     */
    this.selectors = {
      // Global loading indicator (can vary depending on state)
      loader: '[data-testid="loader"], .loading',

      // Dashboard main title
      // Intentionally generic selector, validated via text content
      dashboardTitle: 'span',

      // User menu and logout controls
      userMenu: '[data-test-id="user-menu"]',
      logoutButton: '[data-test-id="logout-button"]'
    };
  }

  /**
   * Verifies that the dashboard is fully loaded and ready for interaction.
   *
   * Strategy (anti-flaky):
   * 1. Assert correct route and query parameters
   * 2. Wait for any global loader to disappear (if present)
   * 3. Confirm real UI content is rendered (not just visibility)
   *
   * This method should be used as the main post-login assertion.
   */
  verifyDashboardLoaded() {
    // 1️⃣ Ensure correct route is loaded (automatic retry by Cypress)
    cy.location('pathname', { timeout: 30000 })
      .should('eq', '/campaigns');

    cy.location('search')
      .should('include', 'CS=all');

    // 2️⃣ Handle optional loader (prevents flaky failures)
    cy.get('body').then(($body) => {
      if ($body.find(this.selectors.loader).length) {
        cy.get(this.selectors.loader, { timeout: 20000 })
          .should('not.exist');
      }
    });

    // 3️⃣ Validate real dashboard content is rendered
    cy.contains(this.selectors.dashboardTitle, 'Active Campaigns', {
      timeout: 30000
    }).should('exist');

    return this;
  }

  /**
   * Opens the user menu in the dashboard header.
   * Used as a prerequisite for user actions such as logout.
   */
  openUserMenu() {
    cy.get(this.selectors.userMenu)
      .should('exist')
      .click();

    return this;
  }

  /**
   * Logs out the currently authenticated user.
   * Expected behavior:
   * - Session is invalidated server-side
   * - User is redirected to the login page
   */
  logout() {
    this.openUserMenu();

    cy.get(this.selectors.logoutButton)
      .should('exist')
      .click();

    return this;
  }
}

export default DashboardPage;
