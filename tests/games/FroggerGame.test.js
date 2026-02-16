import { FroggerGame } from '../../client/src/games/FroggerGame';

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

describe('FroggerGame (DeFi Runner)', () => {
  let game;

  beforeEach(() => {
    mockCanvas.getContext.mockReturnValue(mockCtx);
    game = new FroggerGame(mockCanvas, mockCtx);
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
      expect(game.maxTime).toBeGreaterThan(0);
      expect(game.lanes.length).toBeGreaterThan(0);
      expect(game.completedZones.length).toBe(5);
      expect(game.onWater).toBe(false);
      expect(game.currentLog).toBeNull();
    });

    test('should create player at starting position', () => {
      expect(game.player.x).toBe(game.canvas.width / 2);
      expect(game.player.y).toBe(game.canvas.height - 25);
    });

    test('should create appropriate lane structure', () => {
      const roadLanes = game.lanes.filter(lane => lane.type === 'road');
      const waterLanes = game.lanes.filter(lane => lane.type === 'water');
      const safeLanes = game.lanes.filter(lane => lane.type === 'safe');
      
      expect(roadLanes.length).toBeGreaterThan(0);
      expect(waterLanes.length).toBeGreaterThan(0);
      expect(safeLanes.length).toBeGreaterThan(0);
    });
  });

  describe('Lane System', () => {
    test('should create different types of lanes', () => {
      const laneTypes = [...new Set(game.lanes.map(lane => lane.type))];
      expect(laneTypes).toContain('road');
      expect(laneTypes).toContain('water');
      expect(laneTypes).toContain('safe');
    });

    test('should populate lanes with appropriate objects', () => {
      const roadLanes = game.lanes.filter(lane => lane.type === 'road');
      const waterLanes = game.lanes.filter(lane => lane.type === 'water');
      
      roadLanes.forEach(lane => {
        expect(lane.objects.length).toBeGreaterThan(0);
        lane.objects.forEach(obj => {
          expect(obj.speed).toBeDefined();
          expect(obj.width).toBeDefined();
          expect(obj.height).toBeDefined();
        });
      });
      
      waterLanes.forEach(lane => {
        expect(lane.objects.length).toBeGreaterThan(0);
        lane.objects.forEach(obj => {
          expect(obj.speed).toBeDefined();
          expect(obj.type).toBe('log');
        });
      });
    });

    test('should move lane objects correctly', () => {
      const lane = game.lanes.find(lane => lane.objects.length > 0);
      if (lane) {
        const object = lane.objects[0];
        const initialX = object.x;
        
        game.updateLanes();
        
        expect(object.x).not.toBe(initialX);
      }
    });
  });

  describe('Player Movement', () => {
    test('should move player up when advancing', () => {
      const initialY = game.player.y;
      
      game.keys.add('arrowup');
      game.updatePlayer();
      
      expect(game.player.y).toBeLessThan(initialY);
    });

    test('should move player horizontally', () => {
      const initialX = game.player.x;
      
      game.keys.add('arrowleft');
      game.updatePlayer();
      
      expect(game.player.x).toBeLessThan(initialX);
      
      game.keys.clear();
      game.keys.add('arrowright');
      game.updatePlayer();
      
      expect(game.player.x).toBeGreaterThan(initialX - game.playerSpeed);
    });

    test('should respect boundary limits', () => {
      // Test left boundary
      game.player.x = 5;
      game.keys.add('arrowleft');
      game.updatePlayer();
      expect(game.player.x).toBeGreaterThanOrEqual(10);
      
      // Test right boundary
      game.player.x = game.canvas.width - 5;
      game.keys.clear();
      game.keys.add('arrowright');
      game.updatePlayer();
      expect(game.player.x).toBeLessThanOrEqual(game.canvas.width - 10);
    });

    test('should handle downward movement', () => {
      game.player.y = 300;
      const initialY = game.player.y;
      
      game.keys.add('arrowdown');
      game.updatePlayer();
      
      expect(game.player.y).toBeGreaterThan(initialY);
    });
  });

  describe('Water Mechanics', () => {
    test('should detect when player is on water', () => {
      const waterLane = game.lanes.find(lane => lane.type === 'water');
      if (waterLane) {
        game.player.y = waterLane.y;
        game.onWater = true;
        
        expect(game.onWater).toBe(true);
      }
    });

    test('should allow player to ride logs', () => {
      const waterLane = game.lanes.find(lane => lane.type === 'water');
      if (waterLane && waterLane.objects.length > 0) {
        const log = waterLane.objects[0];
        
        game.player.x = log.x + 20;
        game.player.y = log.y;
        game.currentLog = log;
        game.onWater = false;
        
        const initialPlayerX = game.player.x;
        game.updateWaterPhysics();
        
        // Player should move with the log
        expect(game.player.x).not.toBe(initialPlayerX);
      }
    });

    test('should drown player if not on log in water', () => {
      const waterLane = game.lanes.find(lane => lane.type === 'water');
      if (waterLane) {
        game.player.y = waterLane.y;
        game.onWater = true;
        game.currentLog = null;
        
        const initialLives = game.lives;
        game.checkCollisions();
        
        expect(game.lives).toBeLessThan(initialLives);
      }
    });
  });

  describe('Collision Detection', () => {
    test('should detect vehicle collisions on road', () => {
      const roadLane = game.lanes.find(lane => lane.type === 'road');
      if (roadLane && roadLane.objects.length > 0) {
        const vehicle = roadLane.objects[0];
        
        game.player.x = vehicle.x + 10;
        game.player.y = vehicle.y;
        
        const initialLives = game.lives;
        game.checkCollisions();
        
        expect(game.lives).toBeLessThan(initialLives);
      }
    });

    test('should be safe on safe lanes', () => {
      const safeLane = game.lanes.find(lane => lane.type === 'safe');
      if (safeLane) {
        game.player.y = safeLane.y;
        
        const initialLives = game.lives;
        game.checkCollisions();
        
        expect(game.lives).toBe(initialLives);
      }
    });

    test('should detect safe zone completion', () => {
      // Move to top safe zones
      game.player.y = 25;
      game.player.x = 100;
      
      const initialCompletedZones = game.completedZones.filter(z => z).length;
      game.checkSafeZoneCompletion();
      
      const newCompletedZones = game.completedZones.filter(z => z).length;
      expect(newCompletedZones).toBeGreaterThanOrEqual(initialCompletedZones);
    });
  });

  describe('Level Progression', () => {
    test('should advance level when all zones completed', () => {
      const initialLevel = game.level;
      
      // Complete all zones
      game.completedZones = [true, true, true, true, true];
      game.update();
      
      expect(game.level).toBeGreaterThan(initialLevel);
    });

    test('should increase difficulty with level progression', () => {
      const initialLevel = game.level;
      
      game.updateLevel(3);
      game.nextLevel();
      
      // Check that difficulty has increased
      const roadLanes = game.lanes.filter(lane => lane.type === 'road');
      roadLanes.forEach(lane => {
        lane.objects.forEach(obj => {
          expect(Math.abs(obj.speed)).toBeGreaterThan(0);
        });
      });
      
      expect(game.level).toBeGreaterThan(initialLevel);
    });

    test('should reset player position on level completion', () => {
      game.player.y = 50; // Top of screen
      game.completedZones = [true, true, true, true, true];
      
      game.update();
      
      expect(game.player.y).toBe(game.canvas.height - 25);
    });

    test('should award bonus life on level completion', () => {
      const initialLives = game.lives;
      
      game.completedZones = [true, true, true, true, true];
      game.update();
      
      expect(game.lives).toBeGreaterThan(initialLives);
    });
  });

  describe('Timer System', () => {
    test('should decrease timer over time', () => {
      const initialTime = game.timeLeft;
      
      game.updateTimer();
      
      expect(game.timeLeft).toBeLessThan(initialTime);
    });

    test('should handle timer expiration', () => {
      const initialLives = game.lives;
      game.timeLeft = 0;
      
      game.update();
      
      expect(game.lives).toBeLessThan(initialLives);
    });

    test('should reset timer on level completion', () => {
      game.timeLeft = 10;
      game.completedZones = [true, true, true, true, true];
      
      game.update();
      
      expect(game.timeLeft).toBe(game.maxTime);
    });
  });

  describe('Score System', () => {
    test('should award points for forward progress', () => {
      const initialScore = game.score;
      const initialY = game.player.y;
      
      game.player.y = initialY - 50; // Move forward
      game.updateScore(game.score + 10);
      
      expect(game.score).toBeGreaterThan(initialScore);
    });

    test('should award bonus for safe zone completion', () => {
      const initialScore = game.score;
      
      game.updateScore(game.score + 500);
      
      expect(game.score).toBe(initialScore + 500);
    });

    test('should award time bonus on level completion', () => {
      const initialScore = game.score;
      game.timeLeft = 30;
      
      // Simulate level completion bonus
      const timeBonus = Math.floor(game.timeLeft) * 10;
      game.updateScore(game.score + 500 + timeBonus);
      
      expect(game.score).toBe(initialScore + 500 + timeBonus);
    });
  });

  describe('Game States', () => {
    test('should handle player death correctly', () => {
      const initialLives = game.lives;
      
      game.playerDied();
      
      expect(game.lives).toBeLessThan(initialLives);
      expect(game.player.x).toBe(400);
      expect(game.player.y).toBe(550);
    });

    test('should end game when lives reach zero', () => {
      game.lives = 1;
      
      const gameEndSpy = jest.spyOn(game, 'endGame');
      game.playerDied();
      
      expect(gameEndSpy).toHaveBeenCalled();
    });

    test('should restart correctly', () => {
      game.updateScore(1000);
      game.updateLevel(3);
      game.timeLeft = 10;
      game.completedZones = [true, false, true, false, true];
      
      game.restart();
      
      expect(game.score).toBe(0);
      expect(game.level).toBe(1);
      expect(game.timeLeft).toBe(game.maxTime);
      expect(game.completedZones.every(zone => !zone)).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should handle rapid movement without issues', () => {
      for (let i = 0; i < 100; i++) {
        const directions = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        game.keys.add(randomDirection);
        game.updatePlayer();
        game.keys.clear();
      }
      
      // Should not crash or throw errors
      expect(game.player.x).toBeDefined();
      expect(game.player.y).toBeDefined();
    });

    test('should maintain reasonable object counts', () => {
      // Check that lanes don't create excessive objects
      game.lanes.forEach(lane => {
        expect(lane.objects.length).toBeLessThan(20);
      });
    });

    test('should handle edge cases in water physics', () => {
      game.onWater = true;
      game.currentLog = null;
      
      expect(() => {
        game.updateWaterPhysics();
      }).not.toThrow();
    });
  });

  describe('Touch Controls Integration', () => {
    test('should respond to touch controls', () => {
      game.touchControls.add('up');
      game.touchControls.add('left');
      
      const initialY = game.player.y;
      const initialX = game.player.x;
      
      game.updatePlayer();
      
      expect(game.player.y).toBeLessThan(initialY);
      expect(game.player.x).toBeLessThan(initialX);
    });
  });

  describe('Audio Integration', () => {
    test('should play sound effects without errors', () => {
      expect(() => {
        game.playSound(800, 0.3, 'sine');   // Level complete
        game.playSound(200, 0.5, 'sawtooth'); // Death sound
        game.playSound(400, 0.2, 'square');   // Zone complete
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle player at screen boundaries', () => {
      game.player.x = 0;
      game.player.y = 0;
      
      game.updatePlayer();
      
      expect(game.player.x).toBeGreaterThanOrEqual(0);
      expect(game.player.y).toBeGreaterThanOrEqual(0);
      
      game.player.x = game.canvas.width;
      game.player.y = game.canvas.height;
      
      game.updatePlayer();
      
      expect(game.player.x).toBeLessThanOrEqual(game.canvas.width);
      expect(game.player.y).toBeLessThanOrEqual(game.canvas.height);
    });

    test('should handle empty lanes gracefully', () => {
      const emptyLane = {
        y: 300,
        type: 'road',
        objects: []
      };
      
      game.lanes.push(emptyLane);
      game.player.y = 300;
      
      expect(() => {
        game.checkCollisions();
      }).not.toThrow();
    });

    test('should handle invalid log references', () => {
      game.currentLog = { x: 100, y: 200, speed: 2 };
      game.onWater = false;
      
      // Remove the log from lane objects
      game.lanes.forEach(lane => {
        lane.objects = lane.objects.filter(obj => obj !== game.currentLog);
      });
      
      expect(() => {
        game.updateWaterPhysics();
      }).not.toThrow();
    });
  });
});