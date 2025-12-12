/// <reference types="cypress" />

// Les déclarations de types pour les commandes personnalisées sont maintenant
// dans commands.ts via "declare global". Ce fichier est conservé pour
// compatibilité mais les types principaux sont définis dans commands.ts
//
// Note: Les commandes API (api-commands.js) utilisent JavaScript,
// donc leurs types ne sont pas déclarés ici.

declare namespace Cypress {
  interface Chainable {
    /**
     * Attend que le document soit complètement chargé.
     * Défini dans e2e.ts
     */
    waitForPageLoad(): Chainable<void>;
  }
}
