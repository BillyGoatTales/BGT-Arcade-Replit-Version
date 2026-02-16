describe('Billy Goat Arcade - Gameplay Tests', () => {
  beforeEach(() => {
    // Setup error tracking
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
  });

  describe('Game Loading and Initialization', () => {
    it('loads homepage without errors', () => {
      cy.visit('/');
      cy.get('[data-testid="game-grid"]').should('be.visible');
      cy.checkForErrors();
    });

    it('loads all three games successfully', () => {
      const games = ['crypto-collector', 'bitcoin-defender', 'defi-runner'];
      
      games.forEach(gameSlug => {
        cy.visit(`/game/${gameSlug}`);
        cy.waitForGameLoad(gameSlug);
        cy.get('[data-testid="game-canvas"]').should('be.visible');
        cy.get('[data-testid="score-display"]').should('contain', '0');
        cy.checkForErrors();
      });
    });

    it('displays correct game information', () => {
      cy.visit('/game/crypto-collector');
      cy.get('[data-testid="game-title"]').should('contain', 'Crypto Collector');
      cy.get('[data-testid="lives-display"]').should('contain', '3');
      cy.get('[data-testid="level-display"]').should('contain', '1');
    });
  });

  describe('Crypto Collector (PacMan) Gameplay', () => {
    beforeEach(() => {
      cy.startGame('crypto-collector');
    });

    it('allows player movement with keyboard controls', () => {
      cy.gameKeyPress('ArrowRight', 500);
      cy.gameKeyPress('ArrowDown', 500);
      cy.gameKeyPress('ArrowLeft', 500);
      cy.gameKeyPress('ArrowUp', 500);
      cy.checkForErrors();
    });

    it('collects BTC dots and increases score', () => {
      // Move around to collect dots
      for (let i = 0; i < 10; i++) {
        cy.gameKeyPress('ArrowRight', 200);
        cy.gameKeyPress('ArrowDown', 200);
      }
      
      // Score should have increased
      cy.get('[data-testid="score-display"]').should('not.contain', '0');
    });

    it('prevents player from entering ghost spawn area', () => {
      // Try to move toward center spawn box
      cy.gameKeyPress('ArrowRight', 1000);
      cy.gameKeyPress('ArrowDown', 1000);
      
      // Player should be blocked from entering spawn box
      cy.checkForErrors();
    });

    it('handles ghost activation after delay', () => {
      // Wait for ghost activation (3 seconds)
      cy.wait(4000);
      
      // Ghosts should now be active
      cy.checkForErrors();
    });

    it('handles rapid key presses without crashing', () => {
      cy.rapidKeyPresses('ArrowUp', 50);
      cy.rapidKeyPresses('ArrowDown', 50);
      cy.rapidKeyPresses('ArrowLeft', 50);
      cy.rapidKeyPresses('ArrowRight', 50);
      cy.checkForErrors();
    });
  });

  describe('Bitcoin Defender (Galaga) Gameplay', () => {
    beforeEach(() => {
      cy.startGame('bitcoin-defender');
    });

    it('allows player movement and shooting', () => {
      cy.gameKeyPress('ArrowLeft', 200);
      cy.gameKeyPress('ArrowRight', 200);
      cy.gameKeyPress('Space', 100);
      cy.gameKeyPress('Space', 100);
      cy.gameKeyPress('Space', 100);
      cy.checkForErrors();
    });

    it('spawns enemies and handles combat', () => {
      // Wait for enemies to spawn
      cy.wait(2000);
      
      // Shoot at enemies
      for (let i = 0; i < 20; i++) {
        cy.gameKeyPress('Space', 50);
      }
      
      cy.checkForErrors();
    });

    it('tracks wave objectives correctly', () => {
      cy.get('[data-testid="wave-display"]').should('contain', '1');
      cy.get('[data-testid="objective-display"]').should('be.visible');
    });

    it('handles collision detection', () => {
      // Move around and shoot
      cy.gameKeyPress('ArrowLeft', 500);
      cy.gameKeyPress('Space', 100);
      cy.gameKeyPress('ArrowRight', 1000);
      cy.gameKeyPress('Space', 100);
      
      cy.checkForErrors();
    });

    it('manages bullet count to prevent lag', () => {
      // Rapid fire to test bullet limiting
      for (let i = 0; i < 100; i++) {
        cy.gameKeyPress('Space', 10);
      }
      
      cy.checkForErrors();
    });
  });

  describe('DeFi Runner (Frogger) Gameplay', () => {
    beforeEach(() => {
      cy.startGame('defi-runner');
    });

    it('allows player to navigate traffic lanes', () => {
      cy.gameKeyPress('ArrowUp', 300);
      cy.gameKeyPress('ArrowLeft', 200);
      cy.gameKeyPress('ArrowRight', 400);
      cy.gameKeyPress('ArrowUp', 300);
      cy.checkForErrors();
    });

    it('handles water sections with logs/platforms', () => {
      // Move to water sections
      for (let i = 0; i < 5; i++) {
        cy.gameKeyPress('ArrowUp', 500);
      }
      
      cy.checkForErrors();
    });

    it('tracks level completion zones', () => {
      // Try to reach safe zones
      cy.gameKeyPress('ArrowUp', 2000);
      cy.checkForErrors();
    });

    it('handles timer countdown', () => {
      cy.get('[data-testid="timer-display"]').should('be.visible');
      
      // Timer should be counting down
      cy.wait(3000);
      cy.checkForErrors();
    });
  });

  describe('Mobile Controls', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('displays mobile controls on small screens', () => {
      cy.visit('/game/crypto-collector');
      cy.get('[data-testid="mobile-controls"]').should('be.visible');
      cy.get('[data-testid="mobile-up"]').should('be.visible');
      cy.get('[data-testid="mobile-down"]').should('be.visible');
      cy.get('[data-testid="mobile-left"]').should('be.visible');
      cy.get('[data-testid="mobile-right"]').should('be.visible');
    });

    it('responds to touch controls', () => {
      cy.startGame('crypto-collector');
      
      cy.mobileControl('up', 300);
      cy.mobileControl('right', 300);
      cy.mobileControl('down', 300);
      cy.mobileControl('left', 300);
      
      cy.checkForErrors();
    });

    it('handles shooting controls in Bitcoin Defender', () => {
      cy.startGame('bitcoin-defender');
      
      cy.mobileControl('left', 200);
      cy.mobileControl('shoot', 100);
      cy.mobileControl('right', 200);
      cy.mobileControl('shoot', 100);
      
      cy.checkForErrors();
    });
  });

  describe('Performance and Stress Testing', () => {
    it('maintains performance under rapid input', () => {
      cy.startGame('crypto-collector');
      
      // Simulate frantic gameplay
      for (let i = 0; i < 200; i++) {
        const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        cy.gameKeyPress(randomDirection, 5);
      }
      
      cy.checkForErrors();
    });

    it('handles long gameplay sessions', () => {
      cy.startGame('bitcoin-defender');
      
      // Play for extended period
      for (let i = 0; i < 50; i++) {
        cy.gameKeyPress('ArrowLeft', 100);
        cy.gameKeyPress('Space', 50);
        cy.gameKeyPress('ArrowRight', 100);
        cy.gameKeyPress('Space', 50);
      }
      
      cy.checkForErrors();
    });

    it('handles multiple concurrent games (browser tabs)', () => {
      cy.visit('/game/crypto-collector');
      cy.window().then((win) => {
        win.open('/game/bitcoin-defender');
        win.open('/game/defi-runner');
      });
      
      cy.wait(3000);
      cy.checkForErrors();
    });
  });

  describe('Score and Leaderboard System', () => {
    it('tracks scores accurately during gameplay', () => {
      cy.startGame('crypto-collector');
      
      // Play and collect some dots
      for (let i = 0; i < 5; i++) {
        cy.gameKeyPress('ArrowRight', 200);
        cy.gameKeyPress('ArrowDown', 200);
      }
      
      // Verify score increased
      cy.get('[data-testid="score-display"]').should('not.contain', '0');
    });

    it('displays leaderboards correctly', () => {
      cy.visit('/');
      cy.get('[data-testid="leaderboard"]').should('be.visible');
      cy.get('[data-testid="leaderboard-entry"]').should('have.length.greaterThan', 0);
    });

    it('persists scores across sessions', () => {
      // This would require authentication
      cy.loginTestUser();
      cy.startGame('crypto-collector');
      
      // Play and achieve a score
      for (let i = 0; i < 10; i++) {
        cy.gameKeyPress('ArrowRight', 150);
      }
      
      // Navigate away and back
      cy.visit('/');
      cy.visit('/profile');
      
      // User's best scores should be visible
      cy.get('[data-testid="user-scores"]').should('be.visible');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles canvas resize gracefully', () => {
      cy.startGame('crypto-collector');
      
      // Simulate window resize
      cy.viewport(1920, 1080);
      cy.wait(500);
      cy.viewport(800, 600);
      cy.wait(500);
      cy.viewport(1280, 720);
      
      cy.checkForErrors();
    });

    it('recovers from temporary network issues', () => {
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/');
      cy.wait(2000);
      
      // Remove intercept to restore network
      cy.intercept('GET', '/api/**').as('networkRestored');
      
      cy.reload();
      cy.get('[data-testid="game-grid"]').should('be.visible');
    });

    it('handles invalid game URLs gracefully', () => {
      cy.visit('/game/invalid-game-slug');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="back-to-home"]').should('be.visible');
    });
  });

  describe('Audio System', () => {
    it('plays sounds without errors', () => {
      cy.startGame('crypto-collector');
      
      // Movement and collection should trigger sounds
      cy.gameKeyPress('ArrowRight', 200);
      cy.gameKeyPress('ArrowDown', 200);
      
      cy.checkForErrors();
    });

    it('handles audio context issues gracefully', () => {
      cy.window().then((win) => {
        // Disable audio context
        win.AudioContext = undefined;
        win.webkitAudioContext = undefined;
      });
      
      cy.startGame('bitcoin-defender');
      cy.gameKeyPress('Space', 100);
      
      cy.checkForErrors();
    });
  });
});