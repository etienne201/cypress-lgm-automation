/**
 * @tags @api @auth @login @stable
 *
 * Authentication API test suite for LGM.
 * Scope:
 * - Validate login success and error scenarios
 * - Ensure security headers and tokens are exposed correctly
 * - Verify user payload integrity and permissions
 * - Validate basic security protections (SQL injection, bad inputs)
 * - Ensure session creation and acceptable performance
 */

describe('LGM – Authentication API', () => {
  // Base API URL loaded from Cypress environment configuration
  const apiUrl = Cypress.env('apiUrl');

  // Standard test user (credentials are stored in cypress.env.json)
  const user = Cypress.env('users').standard;

  // Will store the successful login response for reuse across test cases
  let loginResponse;

  /**
   * TC01
   * Valid login with correct credentials
   * Expected result:
   * - HTTP 200
   * - Response contains a "user" object
   */
  it('TC01 – Login OK (200)', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: {
        email: user.email,
        password: user.password,
        termsAccepted: true // Business requirement for login payload
      }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('user');

      // Store response for subsequent validation tests
      loginResponse = res;
    });
  });

  /**
   * TC02
   * Validate the structure of the user object returned by the login API
   * Ensures backward compatibility for consumers of this endpoint
   */
  it('TC02 – Réponse login contient les infos user essentielles', () => {
    expect(loginResponse.body.user).to.include.keys(
      'id',
      'email',
      'firstname',
      'lastname',
      'plan',
      'permissions'
    );
  });

  /**
   * TC03
   * Validate that the CSRF token is returned in response headers
   * This token is required for subsequent authenticated requests
   */
  it('TC03 – CSRF token présent dans les headers', () => {
    expect(loginResponse.headers).to.have.property('lgm-csrf-token');
  });

  /**
   * TC04
   * Verify presence of critical HTTP security headers
   * These headers help protect against clickjacking and MIME sniffing
   */
  it('TC04 – Headers de sécurité présents', () => {
    const headers = loginResponse.headers;

    expect(headers).to.have.property('x-frame-options');
    expect(headers).to.have.property('x-content-type-options');
    expect(headers).to.have.property('strict-transport-security');
  });

  /**
   * TC05
   * Login attempt with an invalid email
   * Expected result: Unauthorized (401)
   */
  it('TC05 – Email invalide → 401', () => {
    cy.request({
      failOnStatusCode: false, // We expect a controlled failure
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: {
        email: 'wrong@email.com',
        password: 'bad',
        termsAccepted: true
      }
    }).its('status').should('eq', 401);
  });

  /**
   * TC06
   * Login attempt with missing password
   * Expected result: Bad Request (400)
   */
  it('TC06 – Password manquant → 400', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: {
        email: user.email
      }
    }).its('status').should('eq', 400);
  });

  /**
   * TC07
   * Login attempt with missing email
   * Expected result: Bad Request (400)
   */
  it('TC07 – Email manquant → 400', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: {
        password: user.password
      }
    }).its('status').should('eq', 400);
  });

  /**
   * TC08
   * Validate the subscription plan of the authenticated user
   * Ensures correct entitlement is assigned
   */
  it('TC08 – Plan utilisateur = ULTIMATE', () => {
    expect(loginResponse.body.user.plan).to.eq('ULTIMATE');
  });

  /**
   * TC09
   * Ensure that permissions are returned and not empty
   * This is critical for RBAC and feature access
   */
  it('TC09 – Permissions non vides', () => {
    expect(loginResponse.body.user.permissions.length).to.be.greaterThan(10);
  });

  /**
   * TC10
   * SQL Injection attempt on login endpoint
   * Expected result: request is rejected with Bad Request (400)
   */
  it('TC10 – SQL Injection bloquée (400)', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: {
        email: "admin'--",
        password: "' OR 1=1",
        termsAccepted: true
      }
    }).its('status').should('eq', 400);
  });

  /**
   * TC15
   * Verify that a successful login creates a valid session cookie
   * Cookie existence confirms server-side session creation
   */
  it('TC15 – Un login crée une nouvelle session valide', () => {
    cy.loginViaApi();
    cy.getCookie('lgm-connect-sid', { timeout: 10000 }).should('exist');
  });

  /**
   * TC16
   * Performance check for login endpoint
   * Ensures authentication response time stays under acceptable threshold
   */
  it('TC16 – Temps de réponse login < 2s', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/usersv1/login`,
      body: {
        email: user.email,
        password: user.password,
        termsAccepted: true
      }
    }).then(res => {
      expect(res.duration).to.be.lessThan(2000);
    });
  });
});
