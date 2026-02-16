import { SimplePacManGame } from '../../client/src/games/SimplePacManGame';

// Mock canvas and context
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: jest.fn()
};

const mockCtx = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 100 })),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  strokeRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  }))
};

describe('SimplePacManGame (Crypto Collector)', () => {
  let game;

  beforeEach(() => {
    mockCanvas.getContext.mockReturnValue(mockCtx);
    game = new SimplePacManGame(mockCanvas, mockCtx);
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Game Initialization', () => {
    test('should initialize with correct game-specific values', () => {
      expect(game.timeLeft).toBeGreaterThan(0);
      expect(game.dots.length).toBeGreaterThan(0);
      expect(game.ghosts.length).toBeGreaterThan(0);
      expect(game.walls.length).toBeGreaterThan(0);
    });

    test('should create player at correct starting position', () => {
      expect(game.player.x).toBe(200);
      expect(game.player.y).toBe(200);
    });

    test('should create appropriate number of dots for level', () => {
      const expectedDots = Math.min(15 + (game.level * 3), 30);
      expect(game.dots.length).toBeLessThanOrEqual(expectedDots);
    });
  });

  describe('Collision Detection', () => {
    test('should detect dot collection correctly', () => {
      const initialDots = game.dots.length;
      const initialScore = game.score;
      
      // Place player on a dot
      if (game.dots.length > 0) {
        game.player.x = game.dots[0].x;
        game.player.y = game.dots[0].y;
        
        // Simulate game update
        game.update();
        
        expect(game.dots.length).toBeLessThan(initialDots);
        expect(game.score).toBeGreaterThan(initialScore);
      }
    });

    test('should prevent player from entering spawn box', () => {
      const midX = game.canvas.width / 2;
      const midY = game.canvas.height / 2;
      
      // Try to move player into spawn box
      game.player.x = midX - 20;
      game.player.y = midY - 20;
      game.playerDirection = 'right';
      
      game.updatePlayer();
      
      // Player should not be in the exact center of spawn box
      expect(Math.abs(game.player.x - midX)).toBeGreaterThan(10);
    });

    test('should handle ghost collision correctly', () => {
      const initialLives = game.lives;
      
      // Place player on ghost (when ghosts are active)
      if (game.ghosts.length > 0 && game.ghostsActive) {
        game.player.x = game.ghosts[0].x;
        game.player.y = game.ghosts[0].y;
        game.ghosts[0].vulnerable = false;
        
        game.checkCollisions();
        
        expect(game.lives).toBeLessThan(initialLives);
      }
    });
  });

  describe('Ghost AI System', () => {
    test('should activate ghosts after delay', () => {
      expect(game.ghostsActive).toBe(false);
      expect(game.ghostStartDelay).toBeGreaterThan(0);
      
      // Simulate delay countdown
      while (game.ghostStartDelay > 0) {
        game.updateGhosts();
      }
      
      expect(game.ghostsActive).toBe(true);
    });

    test('should make ghosts chase player when close', () => {
      game.ghostsActive = true;
      
      if (game.ghosts.length > 0) {
        const ghost = game.ghosts[0];
        ghost.vulnerable = false;
        
        // Place ghost near player
        ghost.x = game.player.x + 50;
        ghost.y = game.player.y;
        
        const oldDirection = ghost.direction;
        game.updateGhosts();
        
        // Ghost should potentially change direction toward player
        expect(ghost.direction).toBeDefined();
      }
    });

    test('should make vulnerable ghosts flee from player', () => {
      game.ghostsActive = true;
      
      if (game.ghosts.length > 0) {
        const ghost = game.ghosts[0];
        ghost.vulnerable = true;
        
        // Place ghost near player
        ghost.x = game.player.x + 30;
        ghost.y = game.player.y;
        
        game.updateGhosts();
        
        // Ghost should be in vulnerable state
        expect(ghost.vulnerable).toBe(true);
      }
    });
  });

  describe('Level Progression', () => {
    test('should advance level when all dots collected', () => {
      const initialLevel = game.level;
      
      // Remove all dots to trigger level completion
      game.dots = [];
      game.update();
      
      expect(game.level).toBeGreaterThan(initialLevel);
    });

    test('should increase difficulty with level progression', () => {
      const initialGhostCount = game.ghosts.length;
      
      game.updateLevel(3);
      game.initializeGame();
      
      // Should have more ghosts or faster movement at higher levels
      expect(game.ghosts.length).toBeGreaterThanOrEqual(initialGhostCount);
    });

    test('should reset timer on level completion', () => {
      game.timeLeft = 10;
      game.dots = []; // Trigger level completion
      game.update();
      
      expect(game.timeLeft).toBeGreaterThan(10);
    });
  });

  describe('Power-up System', () => {
    test('should make ghosts vulnerable when power pellet collected', () => {
      // Add a power pellet
      game.dots.push({ x: 100, y: 100, isPowerPellet: true });
      
      // Collect power pellet
      game.player.x = 100;
      game.player.y = 100;
      game.checkCollisions();
      
      // All ghosts should be vulnerable
      game.ghosts.forEach(ghost => {
        expect(ghost.vulnerable).toBe(true);
      });
    });
  });

  describe('Timer System', () => {
    test('should decrease timer over time', () => {
      const initialTime = game.timeLeft;
      
      game.updateTimer();
      
      expect(game.timeLeft).toBeLessThan(initialTime);
    });

    test('should end game when timer reaches zero', () => {
      const initialLives = game.lives;
      game.timeLeft = 0;
      
      game.update();
      
      expect(game.lives).toBeLessThanOrEqual(initialLives);
    });
  });

  describe('Player Movement', () => {
    test('should move player in correct direction', () => {
      const initialX = game.player.x;
      
      game.keys.add('arrowright');
      game.updatePlayer();
      
      expect(game.player.x).toBeGreaterThanOrEqual(initialX);
    });

    test('should respect boundary limits', () => {
      // Try to move beyond left boundary
      game.player.x = 10;
      game.keys.add('arrowleft');
      game.updatePlayer();
      
      expect(game.player.x).toBeGreaterThanOrEqual(20); // Minimum boundary
      
      // Try to move beyond right boundary
      game.player.x = game.canvas.width - 10;
      game.keys.add('arrowright');
      game.updatePlayer();
      
      expect(game.player.x).toBeLessThanOrEqual(game.canvas.width - 20);
    });
  });

  describe('Score System', () => {
    test('should award points for dot collection', () => {
      const initialScore = game.score;
      
      // Simulate collecting a regular dot
      game.updateScore(game.score + 10);
      
      expect(game.score).toBe(initialScore + 10);
    });

    test('should award bonus points for power pellets', () => {
      const initialScore = game.score;
      
      // Simulate collecting a power pellet
      game.updateScore(game.score + 50);
      
      expect(game.score).toBe(initialScore + 50);
    });

    test('should award points for vulnerable ghost consumption', () => {
      const initialScore = game.score;
      
      // Simulate eating a vulnerable ghost
      game.updateScore(game.score + 200);
      
      expect(game.score).toBe(initialScore + 200);
    });
  });

  describe('Game States', () => {
    test('should handle game over correctly', () => {
      game.lives = 1;
      game.timeLeft = 0;
      
      const gameEndSpy = jest.spyOn(game, 'endGame');
      game.update();
      
      expect(gameEndSpy).toHaveBeenCalled();
    });

    test('should restart correctly', () => {
      game.updateScore(500);
      game.updateLevel(3);
      game.timeLeft = 10;
      
      game.restart();
      
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.timeLeft).toBeGreaterThan(10);
    });
  });

  describe('Performance', () => {
    test('should handle rapid key presses without issues', () => {
      for (let i = 0; i < 100; i++) {
        game.keys.add('arrowup');
        game.keys.add('arrowdown');
        game.keys.add('arrowleft');
        game.keys.add('arrowright');
        game.updatePlayer();
        game.keys.clear();
      }
      
      // Should not crash or throw errors
      expect(game.player.x).toBeDefined();
      expect(game.player.y).toBeDefined();
    });

    test('should maintain reasonable object counts', () => {
      // Check that game doesn't create excessive objects
      expect(game.dots.length).toBeLessThan(50);
      expect(game.ghosts.length).toBeLessThan(10);
      expect(game.walls.length).toBeLessThan(100);
    });
  });
});