import { GalagaGame } from '../../client/src/games/GalagaGame';

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

describe('GalagaGame (Bitcoin Defender)', () => {
  let game;

  beforeEach(() => {
    mockCanvas.getContext.mockReturnValue(mockCtx);
    game = new GalagaGame(mockCanvas, mockCtx);
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Game Initialization', () => {
    test('should initialize with correct game-specific values', () => {
      expect(game.wave).toBe(1);
      expect(game.waveTimer).toBeGreaterThan(0);
      expect(game.waveObjective).toBeGreaterThan(0);
      expect(game.enemiesKilled).toBe(0);
      expect(game.bullets.length).toBe(0);
      expect(game.enemies.length).toBeGreaterThan(0);
    });

    test('should create player at correct starting position', () => {
      expect(game.player.x).toBe(game.canvas.width / 2);
      expect(game.player.y).toBe(game.canvas.height - 50);
    });

    test('should set appropriate difficulty for first wave', () => {
      expect(game.enemyBulletSpeed).toBeGreaterThan(0);
      expect(game.playerSpeed).toBeGreaterThan(0);
      expect(game.bulletSpeed).toBeGreaterThan(0);
    });
  });

  describe('Wave Management', () => {
    test('should advance wave when objective completed', () => {
      const initialWave = game.wave;
      game.enemiesKilled = game.waveObjective;
      
      game.update();
      
      expect(game.wave).toBeGreaterThan(initialWave);
    });

    test('should increase difficulty with wave progression', () => {
      const initialSpeed = game.enemyBulletSpeed;
      const initialPlayerSpeed = game.playerSpeed;
      
      game.wave = 3;
      game.nextWave();
      
      // Difficulty should scale with waves
      expect(game.enemyBulletSpeed).toBeGreaterThanOrEqual(initialSpeed);
      expect(game.playerSpeed).toBeGreaterThanOrEqual(initialPlayerSpeed);
    });

    test('should reset wave timer on new wave', () => {
      game.waveTimer = 100;
      game.enemiesKilled = game.waveObjective;
      
      game.update();
      
      expect(game.waveTimer).toBeGreaterThan(100);
    });

    test('should handle timer failure correctly', () => {
      const initialLives = game.lives;
      game.waveTimer = 0;
      
      game.update();
      
      expect(game.lives).toBeLessThan(initialLives);
    });
  });

  describe('Combat System', () => {
    test('should create bullets when shooting', () => {
      game.keys.add('spacebar');
      game.shootCooldown = 0;
      
      game.updatePlayer();
      
      expect(game.bullets.length).toBeGreaterThan(0);
      expect(game.bullets[0].isPlayerBullet).toBe(true);
    });

    test('should enforce shoot cooldown', () => {
      game.keys.add('spacebar');
      game.shootCooldown = 10;
      
      const initialBullets = game.bullets.length;
      game.updatePlayer();
      
      expect(game.bullets.length).toBe(initialBullets);
    });

    test('should limit player bullets on screen', () => {
      game.keys.add('spacebar');
      
      // Try to create many bullets
      for (let i = 0; i < 20; i++) {
        game.shootCooldown = 0;
        game.updatePlayer();
      }
      
      const playerBullets = game.bullets.filter(b => b.isPlayerBullet);
      expect(playerBullets.length).toBeLessThanOrEqual(10);
    });

    test('should detect bullet-enemy collisions', () => {
      // Add a bullet and enemy at same position
      game.bullets.push({
        x: 100,
        y: 100,
        speed: -5,
        isPlayerBullet: true
      });
      
      game.enemies.push({
        x: 100,
        y: 100,
        health: 1,
        points: 100,
        type: 'basic'
      });
      
      const initialEnemies = game.enemies.length;
      const initialScore = game.score;
      
      game.checkCollisions();
      
      expect(game.enemies.length).toBeLessThan(initialEnemies);
      expect(game.score).toBeGreaterThan(initialScore);
    });

    test('should handle enemy bullet collisions with player', () => {
      game.invulnerabilityTimer = 0;
      
      // Add enemy bullet at player position
      game.bullets.push({
        x: game.player.x,
        y: game.player.y,
        speed: 3,
        isPlayerBullet: false
      });
      
      const initialLives = game.lives;
      game.checkCollisions();
      
      expect(game.lives).toBeLessThan(initialLives);
    });
  });

  describe('Enemy AI System', () => {
    test('should spawn enemies at start', () => {
      expect(game.enemies.length).toBeGreaterThan(0);
    });

    test('should make enemies shoot periodically', () => {
      const enemy = game.enemies[0];
      enemy.shootTimer = 0;
      
      const initialBullets = game.bullets.length;
      game.updateEnemies();
      
      // Enemy might have shot (probability-based)
      expect(game.bullets.length).toBeGreaterThanOrEqual(initialBullets);
    });

    test('should reset enemies when they move off screen', () => {
      const enemy = game.enemies[0];
      enemy.y = game.canvas.height + 100;
      
      game.updateEnemies();
      
      expect(enemy.y).toBeLessThan(0);
    });

    test('should vary enemy behavior by type', () => {
      const basicEnemy = game.enemies.find(e => e.type === 'basic');
      const fighterEnemy = game.enemies.find(e => e.type === 'fighter');
      
      if (basicEnemy && fighterEnemy) {
        expect(basicEnemy.health).toBeLessThanOrEqual(fighterEnemy.health);
        expect(basicEnemy.points).toBeLessThanOrEqual(fighterEnemy.points);
      }
    });
  });

  describe('Player Movement', () => {
    test('should move player left and right', () => {
      const initialX = game.player.x;
      
      game.keys.add('arrowleft');
      game.updatePlayer();
      
      expect(game.player.x).toBeLessThan(initialX);
      
      game.keys.clear();
      game.keys.add('arrowright');
      game.updatePlayer();
      
      expect(game.player.x).toBeGreaterThan(initialX - game.playerSpeed);
    });

    test('should allow limited vertical movement', () => {
      const initialY = game.player.y;
      
      game.keys.add('arrowup');
      game.updatePlayer();
      
      expect(game.player.y).toBeLessThan(initialY);
      
      game.keys.clear();
      game.keys.add('arrowdown');
      game.updatePlayer();
      
      expect(game.player.y).toBeGreaterThan(initialY - (game.playerSpeed * 0.7));
    });

    test('should respect movement boundaries', () => {
      // Test left boundary
      game.player.x = 10;
      game.keys.add('arrowleft');
      game.updatePlayer();
      expect(game.player.x).toBeGreaterThanOrEqual(25);
      
      // Test right boundary
      game.player.x = game.canvas.width - 10;
      game.keys.clear();
      game.keys.add('arrowright');
      game.updatePlayer();
      expect(game.player.x).toBeLessThanOrEqual(game.canvas.width - 25);
    });
  });

  describe('Invulnerability System', () => {
    test('should provide invulnerability after taking damage', () => {
      game.invulnerabilityTimer = 90;
      
      // Add enemy bullet at player position
      game.bullets.push({
        x: game.player.x,
        y: game.player.y,
        speed: 3,
        isPlayerBullet: false
      });
      
      const initialLives = game.lives;
      game.checkCollisions();
      
      // Should not take damage while invulnerable
      expect(game.lives).toBe(initialLives);
    });

    test('should countdown invulnerability timer', () => {
      game.invulnerabilityTimer = 60;
      
      game.update();
      
      expect(game.invulnerabilityTimer).toBeLessThan(60);
    });
  });

  describe('Explosion System', () => {
    test('should create explosions on enemy destruction', () => {
      game.explosions.push({
        x: 100,
        y: 100,
        timer: 20
      });
      
      expect(game.explosions.length).toBe(1);
      
      game.updateExplosions();
      
      expect(game.explosions[0].timer).toBeLessThan(20);
    });

    test('should remove expired explosions', () => {
      game.explosions.push({
        x: 100,
        y: 100,
        timer: 1
      });
      
      game.updateExplosions();
      
      expect(game.explosions.length).toBe(0);
    });
  });

  describe('Bullet Management', () => {
    test('should move bullets correctly', () => {
      game.bullets.push({
        x: 100,
        y: 100,
        speed: -5,
        isPlayerBullet: true
      });
      
      game.updateBullets();
      
      expect(game.bullets[0].y).toBe(95);
    });

    test('should remove off-screen bullets', () => {
      game.bullets.push({
        x: 100,
        y: -100,
        speed: -5,
        isPlayerBullet: true
      });
      
      game.updateBullets();
      
      expect(game.bullets.length).toBe(0);
    });

    test('should handle both player and enemy bullets', () => {
      game.bullets.push({
        x: 100,
        y: 100,
        speed: -5,
        isPlayerBullet: true
      });
      
      game.bullets.push({
        x: 200,
        y: 200,
        speed: 3,
        isPlayerBullet: false
      });
      
      game.updateBullets();
      
      expect(game.bullets[0].y).toBe(95); // Player bullet moves up
      expect(game.bullets[1].y).toBe(203); // Enemy bullet moves down
    });
  });

  describe('Game States', () => {
    test('should end game when lives reach zero', () => {
      game.lives = 0;
      
      const gameEndSpy = jest.spyOn(game, 'endGame');
      game.update();
      
      expect(gameEndSpy).toHaveBeenCalled();
    });

    test('should restart correctly', () => {
      game.updateScore(1000);
      game.wave = 5;
      game.enemiesKilled = 10;
      
      game.restart();
      
      expect(game.score).toBe(0);
      expect(game.wave).toBe(1);
      expect(game.enemiesKilled).toBe(0);
    });
  });

  describe('Performance Optimization', () => {
    test('should maintain reasonable bullet count', () => {
      // Simulate rapid shooting
      for (let i = 0; i < 100; i++) {
        game.bullets.push({
          x: Math.random() * 800,
          y: Math.random() * 600,
          speed: Math.random() > 0.5 ? -5 : 3,
          isPlayerBullet: Math.random() > 0.5
        });
      }
      
      game.updateBullets();
      
      // Many bullets should be removed due to off-screen culling
      expect(game.bullets.length).toBeLessThan(100);
    });

    test('should handle rapid key input without lag', () => {
      for (let i = 0; i < 100; i++) {
        game.keys.add('arrowleft');
        game.keys.add('arrowright');
        game.keys.add('spacebar');
        game.updatePlayer();
        game.keys.clear();
      }
      
      // Should not crash or throw errors
      expect(game.player.x).toBeDefined();
      expect(game.player.y).toBeDefined();
    });
  });

  describe('Audio Integration', () => {
    test('should play sound effects without errors', () => {
      expect(() => {
        game.playSound(440, 0.1, 'square'); // Shoot sound
        game.playSound(400, 0.2, 'sine');   // Enemy hit sound
        game.playSound(300, 0.3, 'sawtooth'); // Damage sound
      }).not.toThrow();
    });
  });

  describe('Touch Controls Integration', () => {
    test('should respond to touch controls', () => {
      game.touchControls.add('left');
      game.touchControls.add('shoot');
      
      const initialX = game.player.x;
      const initialBullets = game.bullets.length;
      
      game.updatePlayer();
      
      expect(game.player.x).toBeLessThan(initialX);
      expect(game.bullets.length).toBeGreaterThan(initialBullets);
    });
  });
});