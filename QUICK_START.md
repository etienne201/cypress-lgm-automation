# 🚀 Guide de Démarrage Rapide

## ⚡ Installation Express (5 minutes)

### 1. Prérequis
```bash
# Vérifier les versions
node --version  # >= 18.0.0
pnpm --version  # >= 8.0.0
```

### 2. Installation
```bash
# Cloner et installer
git clone <repository-url>
cd cypress-lgm-automation
pnpm install

# Configuration
cp .env.example .env
cp cypress.env.example.json cypress.env.json

# Éditer avec vos credentials
nano cypress.env.json
```

### 3. Premier Test
```bash
# Ouvrir Cypress
pnpm cypress:open

# Ou exécuter en headless
pnpm cypress:run
```

## 📋 Commandes Essentielles

### Tests Locaux
```bash
# Interface interactive
pnpm cypress:open

# Tous les tests headless
pnpm cypress:run

# Tests par navigateur
pnpm cypress:run:chrome
pnpm cypress:run:firefox
pnpm cypress:run:edge

# Tests par type
pnpm test:api          # API uniquement
pnpm test:frontend     # Frontend uniquement
pnpm test:smoke        # Tests rapides critiques
pnpm test:regression   # Suite complète
```

### Rapports Allure
```bash
# Générer et ouvrir le rapport
pnpm allure:report

# Nettoyer les résultats
pnpm allure:clear

# Exécuter tout + rapport
pnpm test:all
```

## 📝 Créer Votre Premier Test

### 1. Créer un Page Object
```javascript
// cypress/pages/myFeature.page.js
import BasePage from './base.page';

class MyFeaturePage extends BasePage {
  constructor() {
    super();
    this.url = '/my-feature';
    this.selectors = {
      myButton: 'my-button-test-id'
    };
  }
  
  visitPage() {
    this.visit(this.url);
    return this;
  }
  
  clickButton() {
    this.click(this.selectors.myButton);
    return this;
  }
}

export default MyFeaturePage;
```

### 2. Créer le Test
```javascript
// cypress/e2e/frontend/myFeature/myTest.cy.js
import MyFeaturePage from '../../../pages/myFeature.page';

describe('My Feature', { tags: ['@smoke'] }, () => {
  const myPage = new MyFeaturePage();
  
  beforeEach(() => {
    cy.loginAsAdmin();
  });
  
  it('should do something', () => {
    myPage
      .visitPage()
      .clickButton()
      .verifyUrl('/expected-url');
  });
});
```

### 3. Exécuter
```bash
pnpm cypress:run --spec "cypress/e2e/frontend/myFeature/myTest.cy.js"
```

## 🔑 Commandes Cypress Personnalisées

### Authentification
```javascript
// Login complet
cy.login('email@example.com', 'password');

// Login rapide
cy.loginAsAdmin();
cy.loginAsUser();

// Logout
cy.logout();
```

### Sélecteurs
```javascript
// Par data-test-id
cy.getByTestId('element-id');
cy.clickByTestId('button-id');
cy.typeByTestId('input-id', 'text');

// Attendre
cy.waitForTestId('element-id');
cy.waitForLoader();
```

### Formulaires
```javascript
// Remplir formulaire
cy.fillForm({
  'email-input': 'test@example.com',
  'password-input': 'password123'
});

// Soumettre
cy.submitForm('submit-button-id');
```

### API
```javascript
// Requests
cy.apiGet('/endpoint');
cy.apiPost('/endpoint', { data: 'value' });
cy.apiPut('/endpoint', { data: 'value' });
cy.apiDelete('/endpoint');

// Auth API
cy.apiLogin('email@example.com', 'password');
cy.apiGetUserProfile();
cy.apiLogout();

// Campagnes
cy.apiCreateCampaign({ name: 'Test' });
cy.apiGetCampaigns();
cy.apiDeleteCampaign('campaign-id');
```

### Vérifications
```javascript
// Toast/Notifications
cy.verifyToast('Success message', 'success');
cy.verifyToast('Error message', 'error');

// Tableau
cy.verifyTableRowCount('table-id', 5);
cy.clickTableRow('table-id', 0);
```

### Debug
```javascript
// Logs personnalisés
cy.customLog('Mon message', 'info');
cy.customLog('Succès!', 'success');
cy.customLog('Attention', 'warning');
cy.customLog('Erreur', 'error');

// Screenshots
cy.takeScreenshot('nom-descriptif');

// Performance
cy.measurePageLoad();
```

## 🎯 Tests par Tags

```bash
# Smoke tests (rapides)
pnpm test:smoke

# Tests de régression (complets)
pnpm test:regression

# Filtrer par tag personnalisé
pnpm cypress:run --env grepTags="@auth,@campaigns"

# Exclure un tag
pnpm cypress:run --env grepTags="@smoke --@skip"
```

## 🔧 Configuration GitHub Actions

### Setup Initial
1. Aller dans Settings > Secrets and variables > Actions
2. Ajouter les secrets:
```
CYPRESS_ADMIN_EMAIL
CYPRESS_ADMIN_PASSWORD
CYPRESS_USER_EMAIL
CYPRESS_USER_PASSWORD
SLACK_WEBHOOK_URL
```

### Déclencher Manuellement
1. Actions tab > Cypress E2E Tests
2. Run workflow
3. Choisir environment, browser, tags
4. Run

### Voir les Résultats
- Résultats: Dans l'onglet Actions
- Rapports Allure: `https://your-username.github.io/your-repo`
- Notifications: Channel Slack configuré

## 📊 Structure des Données de Test

### Utiliser les Fixtures
```javascript
// Dans un test
cy.fixture('users').then((users) => {
  const user = users.validUsers[0];
  cy.login(user.email, user.password);
});

cy.fixture('campaigns').then((campaigns) => {
  const campaign = campaigns.sampleCampaigns[0];
  cy.apiCreateCampaign(campaign);
});
```

### Générer des Données
```javascript
// Email aléatoire
const email = cy.generateTestData().email;

// Données complètes
const userData = cy.generateTestData();
// { email, password, firstName, lastName, company }
```

## 🐛 Debugging

### Mode Interactif
```bash
# Ouvrir avec UI
pnpm cypress:open

# Dans Cypress:
# - Cliquer sur un test
# - Ouvrir DevTools (F12)
# - Utiliser le time-travel
```

### Mode Headed
```bash
# Voir le navigateur en action
pnpm test:headed
```

### Logs et Screenshots
```javascript
// Dans un test
cy.pause();  // Pause le test
cy.debug();  // Debug dans console

// Auto-screenshots sur échec (configuré par défaut)
```

## ⚠️ Bonnes Pratiques

### ✅ À FAIRE
- Utiliser `data-test-id` pour tous les sélecteurs
- Nettoyer les données de test après chaque test
- Utiliser des Page Objects
- Écrire des tests atomiques et indépendants
- Utiliser les fixtures pour les données
- Ajouter des tags aux tests
- Documenter les tests complexes

### ❌ À ÉVITER
- `cy.wait(5000)` → Utiliser `cy.waitForTestId()`
- Hardcoder les credentials
- Tests dépendants les uns des autres
- Sélecteurs CSS fragiles → Utiliser data-test-id
- Commiter `cypress.env.json` avec secrets
- Tests trop longs (> 2min)
- Ignorer les échecs intermittents

## 🔒 Sécurité

### Variables Sensibles
```bash
# .env (gitignored)
CYPRESS_BASE_URL=...
SLACK_WEBHOOK_URL=...

# cypress.env.json (gitignored)
{
  "users": {
    "admin": {
      "email": "admin@example.com",
      "password": "SecurePassword123!"
    }
  }
}

# GitHub Secrets (pour CI/CD)
CYPRESS_ADMIN_EMAIL
CYPRESS_ADMIN_PASSWORD
```

### ⚠️ NE JAMAIS
- Commiter de vrais credentials
- Partager cypress.env.json
- Hardcoder des mots de passe
- Utiliser des comptes de production

## 📞 Aide et Support

### Documentation
- [Cypress Docs](https://docs.cypress.io)
- [Allure Reports](https://docs.qameta.io/allure/)
- README.md du projet

### Problèmes Courants

**Cypress ne démarre pas**
```bash
# Réinstaller Cypress
pnpm cypress install
pnpm cypress verify
```

**Tests lents**
```bash
# Vérifier les wait() inutiles
# Utiliser les commandes optimisées
# Exécuter en parallèle
```

**Échecs intermittents**
```bash
# Augmenter les timeouts
# Vérifier les conditions de race
# Ajouter des retries
```

## 🎓 Prochaines Étapes

1. ✅ Configurer l'environnement
2. ✅ Exécuter les tests existants
3. 📝 Créer vos premiers tests
4. 🔄 Configurer CI/CD
5. 📊 Activer Allure Reports
6. 🔔 Configurer Slack
7. 🚀 Automatiser tout!

## 📚 Ressources

- **Documentation complète**: README.md
- **Structure POM**: `/cypress/pages/`
- **Exemples de tests**: `/cypress/e2e/`
- **Commandes custom**: `/cypress/support/commands.js`
- **Helpers**: `/cypress/support/helpers.js`

---

**Besoin d'aide?** Créez une issue sur GitHub ou contactez l'équipe QA! 🚀