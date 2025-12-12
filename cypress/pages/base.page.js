/**
 * Base Page Object - Classe parente pour tous les Page Objects
 * Contient les méthodes communes à toutes les pages
 */

class BasePage {
  constructor() {
    this.pageLoadTimeout = 30000;
  }

  /**
   * Visiter une URL
   * @param {string} url - URL relative ou absolue
   */
  visit(url) {
    cy.visit(url);
    this.waitForPageLoad();
    return this;
  }

  /**
   * Attendre le chargement complet de la page
   */
  waitForPageLoad() {
    cy.window().its('document.readyState').should('eq', 'complete');
    return this;
  }

  /**
   * Récupérer un élément par data-test-id
   * @param {string} testId - L'attribut data-test-id
   */
  getElement(testId) {
    return cy.getByTestId(testId);
  }

  /**
   * Cliquer sur un élément par data-test-id
   * @param {string} testId - L'attribut data-test-id
   */
  click(testId) {
    cy.clickByTestId(testId);
    return this;
  }

  /**
   * Taper du texte dans un élément
   * @param {string} testId - L'attribut data-test-id
   * @param {string} text - Texte à taper
   */
  type(testId, text) {
    cy.typeByTestId(testId, text);
    return this;
  }

  /**
   * Attendre qu'un élément soit visible
   * @param {string} testId - L'attribut data-test-id
   * @param {number} timeout - Timeout personnalisé
   */
  waitForElement(testId, timeout = this.pageLoadTimeout) {
    cy.waitForTestId(testId, timeout);
    return this;
  }

  /**
   * Vérifier qu'un élément est visible
   * @param {string} testId - L'attribut data-test-id
   */
  shouldBeVisible(testId) {
    this.getElement(testId).should('be.visible');
    return this;
  }

  /**
   * Vérifier qu'un élément n'est pas visible
   * @param {string} testId - L'attribut data-test-id
   */
  shouldNotBeVisible(testId) {
    this.getElement(testId).should('not.exist');
    return this;
  }

  /**
   * Vérifier qu'un élément contient du texte
   * @param {string} testId - L'attribut data-test-id
   * @param {string} text - Texte attendu
   */
  shouldContainText(testId, text) {
    this.getElement(testId).should('contain', text);
    return this;
  }

  /**
   * Vérifier l'URL courante
   * @param {string} expectedUrl - URL attendue
   */
  verifyUrl(expectedUrl) {
    cy.url().should('include', expectedUrl);
    return this;
  }

  /**
   * Vérifier le titre de la page
   * @param {string} expectedTitle - Titre attendu
   */
  verifyTitle(expectedTitle) {
    cy.title().should('include', expectedTitle);
    return this;
  }

  /**
   * Attendre qu'un loader disparaisse
   * @param {string} loaderTestId - Test ID du loader
   */
  waitForLoader(loaderTestId = 'loading-spinner') {
    cy.waitForLoader(loaderTestId);
    return this;
  }

  /**
   * Vérifier qu'un toast apparaît
   * @param {string} message - Message attendu
   * @param {string} type - Type de toast (success, error, warning, info)
   */
  verifyToast(message, type = 'success') {
    cy.verifyToast(message, type);
    return this;
  }

  /**
   * Prendre un screenshot de la page
   * @param {string} name - Nom du screenshot
   */
  takeScreenshot(name) {
    cy.takeScreenshot(`${this.constructor.name}-${name}`);
    return this;
  }

  /**
   * Scroll vers un élément
   * @param {string} testId - L'attribut data-test-id
   */
  scrollToElement(testId) {
    this.getElement(testId).scrollIntoView();
    return this;
  }

  /**
   * Vérifier qu'un élément est activé
   * @param {string} testId - L'attribut data-test-id
   */
  shouldBeEnabled(testId) {
    this.getElement(testId).should('be.enabled');
    return this;
  }

  /**
   * Vérifier qu'un élément est désactivé
   * @param {string} testId - L'attribut data-test-id
   */
  shouldBeDisabled(testId) {
    this.getElement(testId).should('be.disabled');
    return this;
  }

  /**
   * Sélectionner une option dans un select
   * @param {string} testId - L'attribut data-test-id du select
   * @param {string} value - Valeur à sélectionner
   */
  select(testId, value) {
    this.getElement(testId).select(value);
    return this;
  }

  /**
   * Cocher une checkbox
   * @param {string} testId - L'attribut data-test-id
   */
  check(testId) {
    this.getElement(testId).check();
    return this;
  }

  /**
   * Décocher une checkbox
   * @param {string} testId - L'attribut data-test-id
   */
  uncheck(testId) {
    this.getElement(testId).uncheck();
    return this;
  }

  /**
   * Vérifier qu'une checkbox est cochée
   * @param {string} testId - L'attribut data-test-id
   */
  shouldBeChecked(testId) {
    this.getElement(testId).should('be.checked');
    return this;
  }

  /**
   * Attendre un délai spécifique
   * @param {number} ms - Millisecondes
   */
  wait(ms) {
    cy.wait(ms);
    return this;
  }

  /**
   * Recharger la page
   */
  reload() {
    cy.reload();
    this.waitForPageLoad();
    return this;
  }

  /**
   * Retourner à la page précédente
   */
  goBack() {
    cy.go('back');
    this.waitForPageLoad();
    return this;
  }

  /**
   * Obtenir le texte d'un élément
   * @param {string} testId - L'attribut data-test-id
   * @returns {Cypress.Chainable<string>}
   */
  getText(testId) {
    return this.getElement(testId).invoke('text');
  }

  /**
   * Obtenir la valeur d'un input
   * @param {string} testId - L'attribut data-test-id
   * @returns {Cypress.Chainable<string>}
   */
  getValue(testId) {
    return this.getElement(testId).invoke('val');
  }

  /**
   * Vérifier qu'un élément a une classe CSS spécifique
   * @param {string} testId - L'attribut data-test-id
   * @param {string} className - Nom de la classe
   */
  shouldHaveClass(testId, className) {
    this.getElement(testId).should('have.class', className);
    return this;
  }

  /**
   * Cliquer en forçant (pour les éléments cachés)
   * @param {string} testId - L'attribut data-test-id
   */
  forceClick(testId) {
    this.getElement(testId).click({ force: true });
    return this;
  }

  /**
   * Double-cliquer sur un élément
   * @param {string} testId - L'attribut data-test-id
   */
  doubleClick(testId) {
    this.getElement(testId).dblclick();
    return this;
  }

  /**
   * Clic droit sur un élément
   * @param {string} testId - L'attribut data-test-id
   */
  rightClick(testId) {
    this.getElement(testId).rightclick();
    return this;
  }

  /**
   * Hover sur un élément
   * @param {string} testId - L'attribut data-test-id
   */
  hover(testId) {
    this.getElement(testId).trigger('mouseover');
    return this;
  }

  /**
   * Vérifier le nombre d'éléments
   * @param {string} testId - L'attribut data-test-id
   * @param {number} count - Nombre attendu
   */
  shouldHaveCount(testId, count) {
    cy.get(`[data-test-id="${testId}"]`).should('have.length', count);
    return this;
  }
}

export default BasePage;