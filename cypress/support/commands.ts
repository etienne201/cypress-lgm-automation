/// <reference types="cypress" />
/**
 * Global custom Cypress commands.
 * - All commands avoid returning native Promises (use Cypress commands instead).
 * - Comments are in English (best practices).
 */

Cypress.Commands.add(
  'customLog',
  (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    // Friendly emoji map for quick visual logs.
    const emoji: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formattedMessage = `[${timestamp}] ${emoji[level]} ${message}`;

    // cy.log for test runner UI
    cy.log(formattedMessage);

    // Task log for Node console and external integrations (task is defined in cypress.config.js).
    // Do NOT return the task result. Returning would create a Promise that conflicts with Cypress commands.
    // If you need to wait on the task result, use cy.task(...).then(...) — but avoid returning it directly from command.
    cy.task('log', formattedMessage, { log: false });
  }
);

Cypress.Commands.add('clearAllStorage', () => {
  // Clear cookies & local storage & session storage in a Cypress-friendly way.
  cy.clearCookies();
  cy.clearLocalStorage();

  // Some apps restrict sessionStorage access in certain contexts. Guard with try/catch inside cy.window().
  cy.window().then((win) => {
    try {
      if (win.sessionStorage) {
        win.sessionStorage.clear();
      }
    } catch (err) {
      cy.log('⚠️ sessionStorage.clear() failed or not accessible');
      // do not throw — this is non-critical
    }
  });
});

Cypress.Commands.add('visitWithAuth', (url: string, options: Partial<Cypress.VisitOptions> = {}) => {
  // Read credentials from env (fallbacks provided).
  const httpAuth = Cypress.env('httpAuth') || {};
  const users = Cypress.env('users') || {};
  const adminUser = users.admin || {};

  const username = httpAuth.username || adminUser.username || 'lgm';
  const password = httpAuth.password || adminUser.password || 'tech@env25';

  // Use cy.visit directly with auth. Do not wrap in Promise.
  cy.visit(url, {
    failOnStatusCode: false,
    timeout: 60000,
    auth: {
      username,
      password,
    },
    ...options,
  });

  // Ensure URL includes the requested path (gives a deterministic check).
  cy.url({ timeout: 10000 }).should('include', url);
  cy.customLog(`Navigation: ${url}`, 'success');
});

Cypress.Commands.add('setAuthToken', (token: string) => {
  if (!token) {
    cy.customLog('Attempted to set an empty token', 'warning');
    return;
  }

  // Save token in localStorage and cookie (non-httpOnly for test context).
  cy.window().then((win) => {
    try {
      win.localStorage.setItem('auth_token', token);
      win.localStorage.setItem('lgm_token', token);
    } catch (err) {
      cy.log('⚠️ Could not write token to localStorage');
    }
  });

  // setCookie is a Cypress command — no promise return.
  cy.setCookie('auth_token', token, { httpOnly: false, secure: false });
  cy.customLog('Auth token set', 'success');
});

Cypress.Commands.add('loginViaApi', (email?: string, password?: string) => {
  // Do not return a native Promise. Use cy.session which manages caching and isolation.
  const users = Cypress.env('users') || {};
  const standardUser = users.standard || {};
  const httpAuth = Cypress.env('httpAuth') || {};
  const apiUrl = Cypress.env('apiUrl') || Cypress.config('baseUrl');

  const credentials = {
    email: email || standardUser.email,
    password: password || standardUser.password,
    termsAccepted: true,
  };

  // Use cy.session to cache the login for the spec / across specs (cacheAcrossSpecs true configured where used).
  cy.session(
    ['api-login', credentials.email],
    () => {
      cy.customLog(`Login via API: ${credentials.email}`, 'info');

      cy.request({
        method: 'POST',
        url: `${apiUrl}/usersv1/login`,
        body: credentials,
        failOnStatusCode: false,
        auth: {
          username: httpAuth.username,
          password: httpAuth.password,
        },
      }).then((response) => {
        // Basic sanity checks for API login
        expect(response.status).to.eq(200);

        // Capture CSRF token or session cookie if present
        const csrfToken = response.headers['lgm-csrf-token'];
        const setCookieHeader = response.headers['set-cookie'];

        if (csrfToken) {
          cy.setAuthToken(csrfToken);
          cy.setCookie('lgm-csrf-token', csrfToken);
        }

        if (setCookieHeader && Array.isArray(setCookieHeader)) {
          // Try to parse session cookie like lgm-connect-sid
          const sessionMatch = (setCookieHeader[0] || '').match(/lgm-connect-sid=([^;]+)/);
          if (sessionMatch && sessionMatch[1]) {
            // Respect domain if provided in config, otherwise leave default
            const domain = Cypress.env('cookieDomain') || undefined;
            cy.setCookie('lgm-connect-sid', sessionMatch[1], domain ? { domain } : {});
          }
        }

        cy.customLog('Login via API successful', 'success');
      });
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        // Basic validation: ensure the session cookie exists.
        cy.getCookie('lgm-connect-sid', { timeout: 10000 }).should('exist');
      },
    }
  );
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
      setAuthToken(token: string): Chainable<void>;
      loginViaApi(email?: string, password?: string): Chainable<void>;
    }
  }
}

export {};
