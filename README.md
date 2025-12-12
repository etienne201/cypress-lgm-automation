# 🚀 Cypress Automation Framework - La Growth Machine

Framework d'automatisation de tests E2E professionnelle utilisant Cypress, le pattern Page Object Model (POM), et des intégrations CI/CD avancées.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Structure du Projet](#structure-du-projet)
- [Configuration](#configuration)
- [Exécution des Tests](#exécution-des-tests)
- [Page Object Model](#page-object-model)
- [Tests API](#tests-api)
- [CI/CD](#cicd)
- [Allure Reports](#allure-reports)
- [Bonnes Pratiques](#bonnes-pratiques)

## 🔧 Prérequis

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (ou yarn/npm)
- **Git**: Pour le versioning
- **Navigateur**: Chrome, Firefox ou Edge

## 📦 Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd cypress-lgm-automation
```

### 2. Installer les dépendances

```bash
# Avec pnpm (recommandé)
pnpm install

# Ou avec yarn
yarn install

# Ou avec npm
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos credentials
nano .env
```

### 4. Configurer cypress.env.json

```bash
# Copier et éditer le fichier de configuration
cp cypress.env.example.json cypress.env.json
nano cypress.env.json
```

⚠️ **IMPORTANT**: Ne jamais commit `cypress.env.json` ou `.env` avec des credentials réels!

## 📁 Structure du Projet

```
cypress-lgm-automation/
├── .github/
│   └── workflows/
│       └── cypress-tests.yml       # Configuration GitHub Actions
├── cypress/
│   ├── e2e/
│   │   ├── api/                    # Tests API
│   │   │   ├── auth.api.cy.js
│   │   │   └── campaigns.api.cy.js
│   │   └── frontend/               # Tests Frontend
│   │       ├── auth/
│   │       │   └── login.cy.js
│   │       └── campaigns/
│   │           └── campaign-creation.cy.js
│   ├── fixtures/                   # Données de test
│   │   ├── users.json
│   │   └── campaigns.json
│   ├── pages/                      # Page Objects (POM)
│   │   ├── base.page.js
│   │   ├── login.page.js
│   │   ├── dashboard.page.js
│   │   └── campaign.page.js
│   ├── support/                    # Commandes et configurations
│   │   ├── commands.js             # Commandes personnalisées
│   │   ├── e2e.js                  # Configuration globale
│   │   └── api-commands.js         # Commandes API
│   ├── screenshots/                # Screenshots auto
│   └── videos/                     # Vidéos auto
├── allure-results/                 # Résultats Allure
├── allure-report/                  # Rapports Allure
├── .env.example                    # Template variables env
├── .gitignore
├── cypress.config.js               # Config Cypress
├── cypress.env.json                # Config secrets (git-ignored)
├── package.json
└── README.md
```

## ⚙️ Configuration

### Cypress Configuration

Le fichier `cypress.config.js` contient:
- Configuration des timeouts
- Configuration des navigateurs
- Intégration Allure
- Configuration Slack
- Paramètres de retry

### Variables d'Environnement

#### Dans `.env`:
```bash
CYPRESS_BASE_URL=https://test.lagrowthmachine.xyz
CYPRESS_API_URL=https://test.lagrowthmachine.xyz/api
SLACK_WEBHOOK_URL=your_webhook_url
```

#### Dans `cypress.env.json`:
```json
{
  "baseUrl": "https://test.lagrowthmachine.xyz",
  "apiUrl": "https://test.lagrowthmachine.xyz/api",
  "users": {
    "admin": {
      "email": "admin@example.com",
      "password": "SecurePassword123!"
    }
  }
}
```

## 🏃‍♂️ Exécution des Tests

### Tests Interactifs (Cypress UI)

```bash
# Ouvrir l'interface Cypress
pnpm cypress:open
```

### Tests en Mode Headless

```bash
# Tous les tests
pnpm cypress:run

# Tests par navigateur
pnpm cypress:run:chrome
pnpm cypress:run:firefox
pnpm cypress:run:edge

# Tests par type
pnpm test:api          # Tests API uniquement
pnpm test:frontend     # Tests Frontend uniquement

# Tests par tags
pnpm test:smoke        # Tests smoke (@smoke)
pnpm test:regression   # Tests regression (@regression)
```

### Tests avec Allure Reports

```bash
# Exécuter tests et générer rapport
pnpm test:all

# Générer rapport Allure
pnpm allure:generate

# Ouvrir rapport Allure
pnpm allure:open

# Nettoyer les résultats
pnpm allure:clear
```

## 🏗️ Page Object Model

### Création d'un Page Object

```javascript
import BasePage from './base.page';

class MyPage extends BasePage {
  constructor() {
    super();
    this.url = '/my-page';
    
    this.selectors = {
      myButton: 'my-button-test-id',
      myInput: 'my-input-test-id'
    };
  }
  
  visitPage() {
    this.visit(this.url);
    return this;
  }
  
  clickMyButton() {
    this.click(this.selectors.myButton);
    return this;
  }
}

export default MyPage;
```

### Utilisation dans un Test

```javascript
import MyPage from '../../pages/myPage.page';

describe('My Feature', () => {
  const myPage = new MyPage();
  
  it('should perform action', () => {
    myPage
      .visitPage()
      .clickMyButton()
      .verifyUrl('/expected-url');
  });
});
```

### Principes POM

1. **Encapsulation**: Toute la logique UI dans les Page Objects
2. **Réutilisabilité**: Méthodes réutilisables entre tests
3. **Maintenabilité**: Un seul endroit à modifier si l'UI change
4. **Lisibilité**: Tests plus clairs et expressifs
5. **Data-Test-ID**: Utilisation systématique des attributs `data-test-id`

## 🔌 Tests API

### Commandes API Disponibles

```javascript
// GET request
cy.apiGet('/endpoint');

// POST request
cy.apiPost('/endpoint', { data: 'value' });

// PUT request
cy.apiPut('/endpoint', { data: 'value' });

// DELETE request
cy.apiDelete('/endpoint');

// Login API
cy.apiLogin('email@example.com', 'password');

// Créer une campagne
cy.apiCreateCampaign({ name: 'Test Campaign' });
```

### Exemple de Test API

```javascript
describe('API Tests', () => {
  it('should get user profile', () => {
    cy.apiLogin('user@example.com', 'password');
    
    cy.apiGet('/auth/profile').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('email');
    });
  });
});
```

## 🔄 CI/CD

### GitHub Actions

Le workflow `.github/workflows/cypress-tests.yml` exécute:

1. **Install**: Installation des dépendances
2. **Smoke Tests**: Tests rapides critiques
3. **API Tests**: Tests d'intégration API
4. **Frontend Tests**: Tests E2E complets (parallèles)
5. **Allure Report**: Génération et publication des rapports
6. **Notify**: Notifications Slack

### Déclencheurs

- **Push** sur `main`, `develop`, `staging`
- **Pull Request** vers `main`, `develop`
- **Schedule**: Tous les jours à 2h (UTC)
- **Manuel**: Via l'interface GitHub Actions

### Configuration des Secrets GitHub

Ajouter dans Settings > Secrets and variables > Actions:

```
CYPRESS_ADMIN_EMAIL
CYPRESS_ADMIN_PASSWORD
CYPRESS_USER_EMAIL
CYPRESS_USER_PASSWORD
SLACK_WEBHOOK_URL
GITHUB_TOKEN (automatique)
```

## 📊 Allure Reports

### Génération Locale

```bash
# Après avoir exécuté des tests
pnpm allure:generate

# Ouvrir le rapport
pnpm allure:open
```

### Accès aux Rapports

- **Local**: `http://localhost:port` (après `allure:open`)
- **GitHub Pages**: `https://your-username.github.io/your-repo`

### Features Allure

- ✅ Historique des exécutions
- ✅ Tendances des tests
- ✅ Screenshots des échecs
- ✅ Logs détaillés
- ✅ Catégorisation par tags
- ✅ Graphiques et métriques

## 🔔 Notifications Slack

### Configuration

1. Créer un Webhook Slack:
   - Aller dans Slack App Directory
   - Chercher "Incoming Webhooks"
   - Ajouter à votre workspace
   - Copier l'URL du webhook

2. Configurer:
   ```bash
   # Dans .env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   
   # Dans GitHub Secrets
   SLACK_WEBHOOK_URL=<votre-webhook>
   ```

### Format des Notifications

Les notifications incluent:
- ✅ Statut global (Success/Failure/Partial)
- 📊 Résultats par job (Smoke/API/Frontend)
- 🔗 Lien vers les détails dans GitHub Actions
- 👤 Auteur du déclenchement
- 🌿 Branche concernée

## 📝 Bonnes Pratiques

### 1. Utilisation des Data-Test-ID

```html
<!-- HTML -->
<button data-test-id="login-button">Login</button>

<!-- Cypress -->
cy.getByTestId('login-button').click();
```

### 2. Organisation des Tests

```javascript
describe('Feature Name', { tags: ['@smoke', '@feature'] }, () => {
  context('Scenario Group', () => {
    it('should do something specific', () => {
      // Test code
    });
  });
});
```

### 3. Naming Conventions

- **Files**: `feature-name.cy.js`
- **Test IDs**: `kebab-case` (ex: `login-button`)
- **Page Objects**: `PascalCase` (ex: `LoginPage`)
- **Methods**: `camelCase` (ex: `clickLoginButton`)

### 4. Gestion des Attentes

```javascript
// ❌ Mauvais
cy.wait(5000);

// ✅ Bon
cy.waitForTestId('element-id');
cy.waitForLoader();
```

### 5. Assertions Claires

```javascript
// ❌ Peu clair
cy.get('button').should('exist');

// ✅ Clair et spécifique
cy.getByTestId('login-button')
  .should('be.visible')
  .and('be.enabled')
  .and('contain', 'Login');
```

### 6. Nettoyage

```javascript
afterEach(() => {
  // Nettoyer les données de test
  cy.cleanupTestCampaigns();
  cy.cleanupTestContacts();
});
```

### 7. Gestion des Erreurs

```javascript
// Toujours gérer les erreurs API
cy.apiPost('/endpoint', data).then((response) => {
  if (response.status === 200) {
    // Success path
  } else {
    // Error handling
    cy.log(`Error: ${response.body.error}`);
  }
});
```

## 🐛 Debugging

### Mode Debug

```bash
# Ouvrir en mode headed pour voir le navigateur
pnpm test:headed

# Avec Chrome DevTools
pnpm cypress:open
# Puis F12 dans Cypress
```

### Logs Personnalisés

```javascript
cy.customLog('Mon message de debug', 'info');
cy.task('log', 'Message dans la console Node');
cy.task('table', arrayOfObjects);
```

### Screenshots

```javascript
// Auto sur échec (configuré)
// Ou manuel:
cy.takeScreenshot('nom-descriptif');
```

## 🔒 Sécurité

### ⚠️ CRITICAL: Ne JAMAIS commiter

- `cypress.env.json` avec credentials réels
- `.env` avec secrets
- Tokens ou API keys
- Mots de passe en dur dans le code

### ✅ Bonnes Pratiques

1. Utiliser des variables d'environnement
2. Utiliser GitHub Secrets pour CI/CD
3. Créer des comptes de test dédiés
4. Rotationner les credentials régulièrement
5. Limiter les permissions des comptes de test

## 📞 Support & Contribution

### Rapporter un Bug

1. Vérifier si le bug existe déjà
2. Créer une issue avec:
   - Description détaillée
   - Steps to reproduce
   - Screenshots/Videos
   - Logs d'erreur

### Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📚 Ressources

- [Documentation Cypress](https://docs.cypress.io)
- [Allure Report](https://docs.qameta.io/allure/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails

---

**Créé avec ❤️ pour l'équipe QA**