// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to wait for game to load
Cypress.Commands.add('waitForGameLoad', (gameSlug) => {
  cy.get('[data-testid="game-canvas"]', { timeout: 10000 }).should('be.visible');
  cy.wait(2000); // Allow game initialization
});

// Custom command to start a game
Cypress.Commands.add('startGame', (gameSlug) => {
  cy.visit(`/game/${gameSlug}`);
  cy.waitForGameLoad(gameSlug);
  cy.get('[data-testid="play-button"]').click();
  cy.wait(1000); // Allow game to start
});

// Custom command to simulate keyboard input
Cypress.Commands.add('gameKeyPress', (key, duration = 100) => {
  cy.get('body').type(`{${key}}`);
  cy.wait(duration);
});

// Custom command to simulate mobile touch controls
Cypress.Commands.add('mobileControl', (action, duration = 100) => {
  cy.get(`[data-testid="mobile-${action}"]`).trigger('touchstart');
  cy.wait(duration);
  cy.get(`[data-testid="mobile-${action}"]`).trigger('touchend');
});

// Custom command to check game state
Cypress.Commands.add('checkGameState', (expectedState) => {
  cy.get('[data-testid="game-state"]').should('contain', expectedState);
});

// Custom command to verify score
Cypress.Commands.add('verifyScore', (expectedScore) => {
  cy.get('[data-testid="score-display"]').should('contain', expectedScore.toString());
});

// Custom command to authenticate user for testing
Cypress.Commands.add('loginTestUser', () => {
  cy.visit('/auth');
  cy.get('input[name="email"]').type('test@billygoat.arcade');
  cy.get('input[name="password"]').type('testpassword123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/home');
});

// Custom command to test rapid input
Cypress.Commands.add('rapidKeyPresses', (key, count = 20) => {
  for (let i = 0; i < count; i++) {
    cy.get('body').type(`{${key}}`, { delay: 10 });
  }
});

// Custom command to check for errors
Cypress.Commands.add('checkForErrors', () => {
  cy.window().then((win) => {
    expect(win.console.error).to.not.have.been.called;
  });
});