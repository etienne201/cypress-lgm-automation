# Configuration des Identifiants

## ⚠️ Sécurité

**IMPORTANT** : Le fichier `cypress.env.json` contient des identifiants sensibles et est déjà dans `.gitignore` pour éviter qu'il ne soit commité dans le dépôt Git.

## Structure des Identifiants

Les identifiants sont stockés dans `cypress.env.json` avec la structure suivante :

```json
{
  "users": {
    "admin": {
      "email": "lgm",
      "password": "tech@env25",
      "role": "admin",
      "username": "lgm"
    },
    "standard": {
      "email": "severin+robot@lagrowthmachine.com",
      "password": "Sarah&02",
      "role": "user",
      "firstLogin": true
    }
  }
}
```

## Types de Connexion

### 1. Connexion Admin (Username)
- **Username** : `lgm`
- **Password** : `tech@env25`
- **URL** : `https://test.lagrowthmachine.xyz/`
- **Note** : Utilise un nom d'utilisateur au lieu d'un email

### 2. Connexion Standard (Email)
- **Email** : `severin+robot@lagrowthmachine.com`
- **Password** : `Sarah&02`
- **URL** : `https://test.lagrowthmachine.xyz/login`
- **Note** : Première connexion avec popup de connexion

## Gestion du Popup de Première Connexion

Lors de la première connexion, un popup peut apparaître sur la page d'accueil (`/`) demandant :
- **Nom d'utilisateur** : `lgm`
- **Mot de passe** : `tech@env25`

La méthode `handleFirstLoginPopup()` dans `login.page.js` gère automatiquement ce popup.

## Utilisation dans les Tests

```javascript
// Connexion avec utilisateur standard
const user = Cypress.env('users').standard;
loginPage.login(user.email, user.password);

// Connexion avec admin
const admin = Cypress.env('users').admin;
loginPage.login(admin.username, admin.password);
// ou
loginPage.login(admin.email, admin.password); // email = username dans ce cas
```

## Création du Fichier cypress.env.json

1. Copiez la structure depuis ce document
2. Remplissez avec vos identifiants réels
3. Vérifiez que le fichier est dans `.gitignore`
4. Ne commitez JAMAIS ce fichier dans Git

## Variables d'Environnement Alternatives

Vous pouvez aussi utiliser des variables d'environnement système :

```bash
export CYPRESS_BASE_URL=https://test.lagrowthmachine.xyz
export CYPRESS_API_URL=https://test.lagrowthmachine.xyz/api
```

Ces variables seront automatiquement chargées par Cypress si définies.





