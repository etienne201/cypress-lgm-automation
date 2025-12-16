// cypress/support/commands.ts
import LoginPage from '../pages/login.page';
import "cypress-real-events/support";


/**
 * Custom logging with emoji and timestamp
 */
Cypress.Commands.add(
  'customLog',
  (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const emoji: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formattedMessage = `[${timestamp}] ${emoji[level]} ${message}`;
    cy.log(formattedMessage);
    cy.task('log', formattedMessage, { log: false });
  }
);

/**
 * Clear cookies, localStorage, and sessionStorage
 */
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    try {
      win.sessionStorage.clear();
    } catch {
      cy.log('⚠️ sessionStorage.clear() failed or not accessible');
    }
  });
});

/**
 * Visit URL with optional HTTP Auth
 */
Cypress.Commands.add('visitWithAuth', (url: string, options: Partial<Cypress.VisitOptions> = {}) => {
  const httpAuth = Cypress.env('httpAuth') || {};
  const username = httpAuth.username || 'lgm';
  const password = httpAuth.password || 'tech@env25';

  cy.visit(url, {
    failOnStatusCode: false,
    timeout: 60000,
    auth: { username, password },
    ...options,
  });
  cy.url({ timeout: 10000 }).should('include', url);
  cy.customLog(`Navigation: ${url}`, 'success');
});

/**
 * Login via API and set session cookies
 */
Cypress.Commands.add('loginViaApi', (email?: string, password?: string) => {
  const users = Cypress.env('users') || {};
  const standardUser = users.standard || {};
  const httpAuth = Cypress.env('httpAuth') || {};
  const apiUrl = Cypress.env('apiUrl') || Cypress.config('baseUrl');

  const credentials = {
    email: email || standardUser.email,
    password: password || standardUser.password,
    termsAccepted: true,
  };

  cy.session(['api-login', credentials.email], () => {
    cy.customLog(`Login via API: ${credentials.email}`, 'info');
    cy.request({
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: credentials,
      failOnStatusCode: false,
      auth: { username: httpAuth.username, password: httpAuth.password },
    }).then((res) => {
      expect(res.status).to.eq(200);

      const csrfToken = res.headers['lgm-csrf-token'];
      const setCookieHeader = res.headers['set-cookie'];

      if (csrfToken) {
        cy.setCookie('lgm-csrf-token', csrfToken);
      }

      if (setCookieHeader && Array.isArray(setCookieHeader)) {
        const sessionMatch = (setCookieHeader[0] || '').match(/lgm-connect-sid=([^;]+)/);
        if (sessionMatch?.[1]) {
          cy.setCookie('lgm-connect-sid', sessionMatch[1]);
        }
      }

      cy.customLog('Login via API successful', 'success');
    });
  }, {
    cacheAcrossSpecs: true,
    validate() {
      cy.getCookie('lgm-connect-sid', { timeout: 10000 }).should('exist');
    },
  });
});

/**
 * Login via UI using Page Object Model
 */
Cypress.Commands.add('loginUI', (email: string, password: string) => {
  const loginPage = new LoginPage();
  loginPage.visit();
  loginPage.login(email, password).waitForLoginComplete();
  cy.customLog(`Login via UI: ${email}`, 'success');
});

/**
 * TypeScript augmentation for custom commands
 */
declare global {
  namespace Cypress {
    interface Chainable {
      customLog(message: string, level?: 'info' | 'success' | 'warning' | 'error'): Chainable<void>;
      clearAllStorage(): Chainable<void>;
      visitWithAuth(url: string, options?: Partial<Cypress.VisitOptions>): Chainable<void>;
      loginViaApi(email?: string, password?: string): Chainable<void>;
      loginUI(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
