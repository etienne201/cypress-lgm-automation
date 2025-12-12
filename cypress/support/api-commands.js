/**
 * Commandes API personnalisées pour les tests backend
 */

const API_URL = Cypress.env('apiUrl');

// ===========================
// COMMANDES API GÉNÉRIQUES
// ===========================

/**
 * Effectuer une requête API avec authentification
 * @param {string} method - Méthode HTTP
 * @param {string} endpoint - Endpoint API
 * @param {object} body - Corps de la requête
 * @param {object} headers - Headers personnalisés
 */
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  return cy.getAuthToken().then((token) => {
    const options = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...headers
      },
      failOnStatusCode: false
    };

    if (body) {
      options.body = body;
    }

    return cy.request(options).then((response) => {
      cy.log(`📡 ${method} ${endpoint} - Status: ${response.status}`);
      return response;
    });
  });
});

/**
 * GET request
 */
Cypress.Commands.add('apiGet', (endpoint, headers = {}) => {
  return cy.apiRequest('GET', endpoint, null, headers);
});

/**
 * POST request
 */
Cypress.Commands.add('apiPost', (endpoint, body, headers = {}) => {
  return cy.apiRequest('POST', endpoint, body, headers);
});

/**
 * PUT request
 */
Cypress.Commands.add('apiPut', (endpoint, body, headers = {}) => {
  return cy.apiRequest('PUT', endpoint, body, headers);
});

/**
 * PATCH request
 */
Cypress.Commands.add('apiPatch', (endpoint, body, headers = {}) => {
  return cy.apiRequest('PATCH', endpoint, body, headers);
});

/**
 * DELETE request
 */
Cypress.Commands.add('apiDelete', (endpoint, headers = {}) => {
  return cy.apiRequest('DELETE', endpoint, null, headers);
});

// ===========================
// COMMANDES D'AUTHENTIFICATION API
// ===========================

/**
 * Login via API et sauvegarder le token
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 */
Cypress.Commands.add('apiLogin', (email, password) => {
  return cy.apiPost('/auth/login', {
    email,
    password
  }).then((response) => {
    expect(response.status).to.eq(200);
    const token = response.body.token || response.body.access_token;
    cy.setAuthToken(token);
    return response;
  });
});

/**
 * Récupérer le profil utilisateur via API
 */
Cypress.Commands.add('apiGetUserProfile', () => {
  return cy.apiGet('/auth/profile').then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Logout via API
 */
Cypress.Commands.add('apiLogout', () => {
  return cy.apiPost('/auth/logout').then((response) => {
    cy.clearAllStorage();
    return response;
  });
});

// ===========================
// COMMANDES CAMPAGNES
// ===========================

/**
 * Créer une campagne via API
 * @param {object} campaignData - Données de la campagne
 */
Cypress.Commands.add('apiCreateCampaign', (campaignData) => {
  const defaultData = {
    name: `Test Campaign ${Date.now()}`,
    description: 'Campaign created via API',
    status: 'draft'
  };

  return cy.apiPost('/campaigns', {
    ...defaultData,
    ...campaignData
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
    return response.body;
  });
});

/**
 * Récupérer toutes les campagnes
 */
Cypress.Commands.add('apiGetCampaigns', (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const endpoint = params ? `/campaigns?${params}` : '/campaigns';
  
  return cy.apiGet(endpoint).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Récupérer une campagne par ID
 * @param {string} campaignId - ID de la campagne
 */
Cypress.Commands.add('apiGetCampaign', (campaignId) => {
  return cy.apiGet(`/campaigns/${campaignId}`).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Mettre à jour une campagne
 * @param {string} campaignId - ID de la campagne
 * @param {object} updateData - Données à mettre à jour
 */
Cypress.Commands.add('apiUpdateCampaign', (campaignId, updateData) => {
  return cy.apiPut(`/campaigns/${campaignId}`, updateData).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Supprimer une campagne
 * @param {string} campaignId - ID de la campagne
 */
Cypress.Commands.add('apiDeleteCampaign', (campaignId) => {
  return cy.apiDelete(`/campaigns/${campaignId}`).then((response) => {
    expect(response.status).to.be.oneOf([200, 204]);
    return response;
  });
});

/**
 * Lancer une campagne
 * @param {string} campaignId - ID de la campagne
 */
Cypress.Commands.add('apiLaunchCampaign', (campaignId) => {
  return cy.apiPost(`/campaigns/${campaignId}/launch`).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

// ===========================
// COMMANDES CONTACTS
// ===========================

/**
 * Créer un contact via API
 * @param {object} contactData - Données du contact
 */
Cypress.Commands.add('apiCreateContact', (contactData) => {
  const defaultData = {
    email: `contact${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'Contact'
  };

  return cy.apiPost('/contacts', {
    ...defaultData,
    ...contactData
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
    return response.body;
  });
});

/**
 * Récupérer tous les contacts
 */
Cypress.Commands.add('apiGetContacts', (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const endpoint = params ? `/contacts?${params}` : '/contacts';
  
  return cy.apiGet(endpoint).then((response) => {
    expect(response.status).to.eq(200);
    return response.body;
  });
});

/**
 * Supprimer un contact
 * @param {string} contactId - ID du contact
 */
Cypress.Commands.add('apiDeleteContact', (contactId) => {
  return cy.apiDelete(`/contacts/${contactId}`).then((response) => {
    expect(response.status).to.be.oneOf([200, 204]);
    return response;
  });
});

// ===========================
// COMMANDES DE VÉRIFICATION API
// ===========================

/**
 * Vérifier la structure d'une réponse API
 * @param {object} response - Réponse API
 * @param {object} schema - Schéma attendu
 */
Cypress.Commands.add('verifyApiSchema', (response, schema) => {
  expect(response.status).to.be.oneOf([200, 201]);
  
  Object.keys(schema).forEach(key => {
    expect(response.body).to.have.property(key);
    
    if (schema[key] !== null) {
      expect(response.body[key]).to.be.a(schema[key]);
    }
  });
});

/**
 * Vérifier les headers d'une réponse API
 * @param {object} response - Réponse API
 * @param {object} expectedHeaders - Headers attendus
 */
Cypress.Commands.add('verifyApiHeaders', (response, expectedHeaders) => {
  Object.entries(expectedHeaders).forEach(([header, value]) => {
    expect(response.headers).to.have.property(header.toLowerCase());
    if (value !== null) {
      expect(response.headers[header.toLowerCase()]).to.include(value);
    }
  });
});

/**
 * Vérifier le temps de réponse d'une API
 * @param {object} response - Réponse API
 * @param {number} maxDuration - Durée maximale en ms
 */
Cypress.Commands.add('verifyApiResponseTime', (response, maxDuration = 2000) => {
  expect(response.duration).to.be.lessThan(maxDuration);
  cy.log(`⏱️ API Response time: ${response.duration}ms`);
});

// ===========================
// COMMANDES DE NETTOYAGE
// ===========================

/**
 * Nettoyer toutes les campagnes de test
 */
Cypress.Commands.add('cleanupTestCampaigns', () => {
  return cy.apiGetCampaigns().then((campaigns) => {
    const testCampaigns = campaigns.filter(c => 
      c.name.includes('Test Campaign') || c.name.includes('test-')
    );
    
    testCampaigns.forEach(campaign => {
      cy.apiDeleteCampaign(campaign.id);
    });
    
    cy.log(`🧹 Cleaned up ${testCampaigns.length} test campaigns`);
  });
});

/**
 * Nettoyer tous les contacts de test
 */
Cypress.Commands.add('cleanupTestContacts', () => {
  return cy.apiGetContacts().then((contacts) => {
    const testContacts = contacts.filter(c => 
      c.email.includes('test') || c.email.includes('contact')
    );
    
    testContacts.forEach(contact => {
      cy.apiDeleteContact(contact.id);
    });
    
    cy.log(`🧹 Cleaned up ${testContacts.length} test contacts`);
  });
});

// ===========================
// COMMANDES D'INTERCEPTION
// ===========================

/**
 * Intercepter et mocker une requête API
 * @param {string} method - Méthode HTTP
 * @param {string} endpoint - Endpoint à intercepter
 * @param {object} mockResponse - Réponse mockée
 * @param {string} alias - Alias pour cy.wait()
 */
Cypress.Commands.add('mockApiCall', (method, endpoint, mockResponse, alias) => {
  cy.intercept(method, `${API_URL}${endpoint}`, mockResponse).as(alias);
});

/**
 * Attendre une requête API spécifique
 * @param {string} alias - Alias de l'interception
 * @param {number} timeout - Timeout personnalisé
 */
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  return cy.wait(`@${alias}`, { timeout });
});