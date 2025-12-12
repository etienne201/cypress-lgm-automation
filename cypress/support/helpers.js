/**
 * Fonctions utilitaires et helpers pour les tests Cypress
 */

/**
 * Générer un email aléatoire
 * @param {string} domain - Domaine de l'email
 * @returns {string}
 */
export const generateRandomEmail = (domain = 'example.com') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test.${timestamp}.${random}@${domain}`;
};

/**
 * Générer un mot de passe sécurisé
 * @param {number} length - Longueur du mot de passe
 * @returns {string}
 */
export const generateSecurePassword = (length = 12) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Générer un nom de campagne unique
 * @param {string} prefix - Préfixe du nom
 * @returns {string}
 */
export const generateCampaignName = (prefix = 'Test Campaign') => {
  return `${prefix} ${Date.now()}`;
};

/**
 * Formater une date au format ISO
 * @param {Date} date - Date à formater
 * @returns {string}
 */
export const formatDateISO = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Ajouter des jours à une date
 * @param {Date} date - Date de base
 * @param {number} days - Nombre de jours à ajouter
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Attendre une condition avec timeout
 * @param {Function} condition - Fonction qui retourne un booléen
 * @param {number} timeout - Timeout en ms
 * @param {number} interval - Intervalle de vérification en ms
 * @returns {Promise<boolean>}
 */
export const waitForCondition = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
};

/**
 * Générer des données de test aléatoires
 * @returns {object}
 */
export const generateTestUser = () => {
  return {
    email: generateRandomEmail(),
    password: generateSecurePassword(),
    firstName: `Test${Math.floor(Math.random() * 1000)}`,
    lastName: `User${Math.floor(Math.random() * 1000)}`,
    company: `Company${Math.floor(Math.random() * 1000)}`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    createdAt: new Date().toISOString()
  };
};

/**
 * Générer des données de campagne de test
 * @param {object} overrides - Données à override
 * @returns {object}
 */
export const generateTestCampaign = (overrides = {}) => {
  return {
    name: generateCampaignName(),
    description: 'Automated test campaign',
    type: 'email',
    status: 'draft',
    targetAudience: 'test-audience',
    schedule: {
      startDate: addDays(new Date(), 1).toISOString(),
      endDate: addDays(new Date(), 7).toISOString()
    },
    ...overrides
  };
};

/**
 * Nettoyer une chaîne de caractères
 * @param {string} str - Chaîne à nettoyer
 * @returns {string}
 */
export const cleanString = (str) => {
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Vérifier si un élément est visible dans le viewport
 * @param {HTMLElement} element - Élément DOM
 * @returns {boolean}
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Attendre que tous les XHR soient terminés
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<void>}
 */
export const waitForXHR = (timeout = 5000) => {
  return cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      let xhrCount = 0;
      const startTime = Date.now();
      
      const originalOpen = win.XMLHttpRequest.prototype.open;
      const originalSend = win.XMLHttpRequest.prototype.send;
      
      win.XMLHttpRequest.prototype.open = function(...args) {
        xhrCount++;
        this.addEventListener('loadend', () => {
          xhrCount--;
          if (xhrCount === 0) {
            resolve();
          }
        });
        return originalOpen.apply(this, args);
      };
      
      // Timeout fallback
      setTimeout(() => {
        win.XMLHttpRequest.prototype.open = originalOpen;
        win.XMLHttpRequest.prototype.send = originalSend;
        resolve();
      }, timeout);
      
      // Si pas de XHR en cours, résoudre immédiatement
      if (xhrCount === 0) {
        resolve();
      }
    });
  });
};

/**
 * Créer un delay/pause
 * @param {number} ms - Millisecondes
 * @returns {Promise<void>}
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Générer un nombre aléatoire dans un intervalle
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Sélectionner un élément aléatoire dans un tableau
 * @param {Array} array - Tableau
 * @returns {any}
 */
export const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Formater un nombre en devise
 * @param {number} amount - Montant
 * @param {string} currency - Code devise
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Formater un pourcentage
 * @param {number} value - Valeur
 * @param {number} decimals - Nombre de décimales
 * @returns {string}
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Convertir un objet en query string
 * @param {object} params - Paramètres
 * @returns {string}
 */
export const toQueryString = (params) => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Deep clone d'un objet
 * @param {object} obj - Objet à cloner
 * @returns {object}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Vérifier si deux objets sont égaux
 * @param {object} obj1 - Premier objet
 * @param {object} obj2 - Deuxième objet
 * @returns {boolean}
 */
export const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Retry une fonction jusqu'à ce qu'elle réussisse
 * @param {Function} fn - Fonction à retry
 * @param {number} maxRetries - Nombre max de tentatives
 * @param {number} delay - Délai entre les tentatives
 * @returns {Promise<any>}
 */
export const retry = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

/**
 * Logger personnalisé avec timestamp
 * @param {string} message - Message à logger
 * @param {string} level - Niveau de log
 */
export const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🐛'
  };
  
  console.log(`${emoji[level]} [${timestamp}] ${message}`);
};

/**
 * Vérifier la validité d'un email
 * @param {string} email - Email à vérifier
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Vérifier la force d'un mot de passe
 * @param {string} password - Mot de passe
 * @returns {object}
 */
export const checkPasswordStrength = (password) => {
  const result = {
    score: 0,
    feedback: []
  };
  
  if (password.length >= 8) result.score++;
  else result.feedback.push('At least 8 characters');
  
  if (/[a-z]/.test(password)) result.score++;
  else result.feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) result.score++;
  else result.feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) result.score++;
  else result.feedback.push('Add numbers');
  
  if (/[^a-zA-Z\d]/.test(password)) result.score++;
  else result.feedback.push('Add special characters');
  
  result.strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][result.score];
  
  return result;
};

/**
 * Générer un UUID v4
 * @returns {string}
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Truncate un texte
 * @param {string} text - Texte
 * @param {number} maxLength - Longueur max
 * @param {string} suffix - Suffixe
 * @returns {string}
 */
export const truncate = (text, maxLength = 50, suffix = '...') => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export default {
  generateRandomEmail,
  generateSecurePassword,
  generateCampaignName,
  formatDateISO,
  addDays,
  waitForCondition,
  generateTestUser,
  generateTestCampaign,
  cleanString,
  isInViewport,
  waitForXHR,
  delay,
  randomInt,
  randomElement,
  formatCurrency,
  formatPercentage,
  toQueryString,
  deepClone,
  deepEqual,
  retry,
  log,
  isValidEmail,
  checkPasswordStrength,
  generateUUID,
  truncate
};