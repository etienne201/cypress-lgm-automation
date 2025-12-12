/**
 * Tests API pour l'authentification
 * @tags @api @auth @smoke
 */

describe('Authentication API', { tags: ['@api', '@auth', '@smoke'] }, () => {
  const API_URL = Cypress.env('apiUrl');
  let authToken;

  context('Login API Tests', () => {
    it('should login successfully with valid credentials', () => {
      // Arrange
      const user = Cypress.env('users').standard;
      
      // Act
      cy.apiPost('/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('email', user.email);
        
        // Vérifier le schéma de la réponse
        cy.verifyApiSchema(response, {
          token: 'string',
          user: 'object',
          expiresIn: 'number'
        });
        
        // Vérifier les headers
        cy.verifyApiHeaders(response, {
          'content-type': 'application/json'
        });
        
        // Vérifier le temps de réponse
        cy.verifyApiResponseTime(response, 2000);
        
        // Sauvegarder le token pour les tests suivants
        authToken = response.body.token;
        cy.setAuthToken(authToken);
      });
    });

    it('should return 401 with invalid credentials', () => {
      // Act
      cy.apiPost('/auth/login', {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('Invalid credentials');
      });
    });

    it('should return 400 with missing email', () => {
      // Act
      cy.apiPost('/auth/login', {
        password: 'password123'
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('Email is required');
      });
    });

    it('should return 400 with missing password', () => {
      // Act
      cy.apiPost('/auth/login', {
        email: 'test@example.com'
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.include('Password is required');
      });
    });

    it('should return 400 with invalid email format', () => {
      // Act
      cy.apiPost('/auth/login', {
        email: 'notanemail',
        password: 'password123'
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('valid email');
      });
    });
  });

  context('Token Validation Tests', () => {
    beforeEach(() => {
      // Login avant chaque test
      const user = Cypress.env('users').standard;
      cy.apiLogin(user.email, user.password);
    });

    it('should retrieve user profile with valid token', () => {
      // Act
      cy.apiGetUserProfile().then((userProfile) => {
        // Assert
        expect(userProfile).to.have.property('email');
        expect(userProfile).to.have.property('id');
        expect(userProfile).to.have.property('role');
        
        cy.customLog('User profile retrieved successfully', 'success');
      });
    });

    it('should return 401 with invalid token', () => {
      // Arrange - Définir un token invalide
      cy.setAuthToken('invalid-token-xyz');
      
      // Act
      cy.apiGet('/auth/profile').then((response) => {
        // Assert
        expect(response.status).to.eq(401);
        expect(response.body.error).to.include('Invalid token');
      });
    });

    it('should return 401 with expired token', () => {
      // Arrange - Simuler un token expiré
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      cy.setAuthToken(expiredToken);
      
      // Act
      cy.apiGet('/auth/profile').then((response) => {
        // Assert
        expect(response.status).to.eq(401);
        expect(response.body.error).to.include('expired');
      });
    });
  });

  context('Logout API Tests', () => {
    beforeEach(() => {
      const user = Cypress.env('users').standard;
      cy.apiLogin(user.email, user.password);
    });

    it('should logout successfully', () => {
      // Act
      cy.apiLogout().then((response) => {
        // Assert
        expect(response.status).to.be.oneOf([200, 204]);
        
        // Vérifier que le token est supprimé
        cy.window().then((win) => {
          expect(win.localStorage.getItem('token')).to.be.null;
        });
      });
    });

    it('should not access protected routes after logout', () => {
      // Act
      cy.apiLogout();
      
      // Assert
      cy.apiGet('/auth/profile').then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  context('Token Refresh Tests', () => {
    it('should refresh token successfully', () => {
      // Arrange
      const user = Cypress.env('users').standard;
      cy.apiLogin(user.email, user.password);
      
      // Act
      cy.apiPost('/auth/refresh').then((response) => {
        // Assert
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body.token).to.be.a('string');
        
        cy.customLog('Token refreshed successfully', 'success');
      });
    });
  });

  context('Password Reset API Tests', () => {
    it('should send password reset email', () => {
      // Arrange
      const user = Cypress.env('users').standard;
      
      // Act
      cy.apiPost('/auth/forgot-password', {
        email: user.email
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.include('reset email sent');
      });
    });

    it('should return error for non-existent email', () => {
      // Act
      cy.apiPost('/auth/forgot-password', {
        email: 'nonexistent@example.com'
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(404);
        expect(response.body.error).to.include('not found');
      });
    });
  });

  context('Registration API Tests', () => {
    it('should register new user successfully', () => {
      // Arrange
      const newUser = cy.generateTestData();
      
      // Act
      cy.apiPost('/auth/register', {
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        company: newUser.company
      }).then((response) => {
        // Assert
        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        
        cy.customLog(`New user registered: ${newUser.email}`, 'success');
      });
    });

    it('should return error for duplicate email', () => {
      // Arrange
      const user = Cypress.env('users').standard;
      
      // Act
      cy.apiPost('/auth/register', {
        email: user.email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(409);
        expect(response.body.error).to.include('already exists');
      });
    });

    it('should validate password strength', () => {
      // Arrange
      const newUser = cy.generateTestData();
      
      // Act
      cy.apiPost('/auth/register', {
        email: newUser.email,
        password: 'weak',
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('password');
      });
    });
  });

  context('API Security Tests', () => {
    it('should include security headers in responses', () => {
      // Act
      cy.apiPost('/auth/login', {
        email: Cypress.env('users').standard.email,
        password: Cypress.env('users').standard.password
      }).then((response) => {
        // Assert - Vérifier les headers de sécurité
        expect(response.headers).to.have.property('x-content-type-options');
        expect(response.headers).to.have.property('x-frame-options');
        expect(response.headers).to.have.property('strict-transport-security');
      });
    });

    it('should handle SQL injection attempts', () => {
      // Act
      cy.apiPost('/auth/login', {
        email: "admin'--",
        password: "' OR '1'='1"
      }).then((response) => {
        // Assert
        expect(response.status).to.eq(401);
      });
    });

    it('should rate limit excessive requests', () => {
      // Arrange
      const requests = [];
      
      // Act - Faire plusieurs requêtes rapides
      for (let i = 0; i < 10; i++) {
        requests.push(
          cy.apiPost('/auth/login', {
            email: 'test@example.com',
            password: 'password'
          })
        );
      }
      
      // Assert - Au moins une requête devrait être rate-limitée
      Cypress.Promise.all(requests).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  afterEach(function() {
    if (this.currentTest.state === 'passed') {
      cy.customLog(`✅ API Test passed: ${this.currentTest.title}`, 'success');
    }
  });
});