import { GameEngine } from '../../client/src/games/GameEngine';

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
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  }))
};

describe('GameEngine', () => {
  let gameEngine;

  beforeEach(() => {
    mockCanvas.getContext.mockReturnValue(mockCtx);
    gameEngine = new GameEngine(mockCanvas, mockCtx);
  });

  afterEach(() => {
    if (gameEngine) {
      gameEngine.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(gameEngine.score).toBe(0);
      expect(gameEngine.level).toBe(1);
      expect(gameEngine.lives).toBe(3);
      expect(gameEngine.running).toBe(false);
    });

    test('should have empty key sets initially', () => {
      expect(gameEngine.keys.size).toBe(0);
      expect(gameEngine.touchControls.size).toBe(0);
    });
  });

  describe('Score Management', () => {
    test('should update score correctly', () => {
      gameEngine.updateScore(100);
      expect(gameEngine.score).toBe(100);
      
      gameEngine.updateScore(250);
      expect(gameEngine.score).toBe(250);
    });

    test('should call score callback when score changes', () => {
      const scoreCallback = jest.fn();
      gameEngine.onScoreUpdate = scoreCallback;
      
      gameEngine.updateScore(500);
      expect(scoreCallback).toHaveBeenCalledWith(500);
    });

    test('should not allow negative scores', () => {
      gameEngine.updateScore(-100);
      expect(gameEngine.score).toBe(0);
    });
  });

  describe('Level Management', () => {
    test('should update level correctly', () => {
      gameEngine.updateLevel(5);
      expect(gameEngine.level).toBe(5);
    });

    test('should call level callback when level changes', () => {
      const levelCallback = jest.fn();
      gameEngine.onLevelUpdate = levelCallback;
      
      gameEngine.updateLevel(3);
      expect(levelCallback).toHaveBeenCalledWith(3);
    });

    test('should not allow levels below 1', () => {
      gameEngine.updateLevel(0);
      expect(gameEngine.level).toBe(1);
    });
  });

  describe('Key Handling', () => {
    test('should handle key press correctly', () => {
      const event = { key: 'ArrowUp', preventDefault: jest.fn() };
      gameEngine.handleKeyDown(event);
      
      expect(gameEngine.keys.has('arrowup')).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('should handle key release correctly', () => {
      gameEngine.keys.add('arrowup');
      
      const event = { key: 'ArrowUp', preventDefault: jest.fn() };
      gameEngine.handleKeyUp(event);
      
      expect(gameEngine.keys.has('arrowup')).toBe(false);
    });

    test('should normalize key names correctly', () => {
      gameEngine.keys.add('ArrowLeft');
      gameEngine.keys.add('SPACE');
      gameEngine.keys.add('A');
      
      expect(gameEngine.keys.has('arrowleft')).toBe(true);
      expect(gameEngine.keys.has('spacebar')).toBe(true);
      expect(gameEngine.keys.has('a')).toBe(true);
    });
  });

  describe('Mobile Controls', () => {
    test('should handle mobile input correctly', () => {
      gameEngine.handleMobileInput('up');
      expect(gameEngine.touchControls.has('up')).toBe(true);
      expect(gameEngine.keys.has('arrowup')).toBe(true);
    });

    test('should handle mobile release correctly', () => {
      gameEngine.touchControls.add('left');
      gameEngine.keys.add('arrowleft');
      
      gameEngine.handleMobileRelease('left');
      
      expect(gameEngine.touchControls.has('left')).toBe(false);
      expect(gameEngine.keys.has('arrowleft')).toBe(false);
    });
  });

  describe('Audio System', () => {
    test('should play sound without errors', () => {
      expect(() => {
        gameEngine.playSound(440, 0.5, 'sine');
      }).not.toThrow();
    });

    test('should handle audio context errors gracefully', () => {
      // Simulate audio context failure
      global.AudioContext = undefined;
      global.webkitAudioContext = undefined;
      
      expect(() => {
        gameEngine.playSound(220, 0.3, 'square');
      }).not.toThrow();
    });
  });

  describe('Game Lifecycle', () => {
    test('should start game correctly', () => {
      gameEngine.start();
      expect(gameEngine.running).toBe(true);
    });

    test('should pause game correctly', () => {
      gameEngine.start();
      gameEngine.pause();
      expect(gameEngine.running).toBe(false);
    });

    test('should stop game correctly', () => {
      gameEngine.start();
      gameEngine.stop();
      expect(gameEngine.running).toBe(false);
    });

    test('should handle restart correctly', () => {
      gameEngine.updateScore(500);
      gameEngine.updateLevel(3);
      
      gameEngine.restart();
      
      expect(gameEngine.score).toBe(0);
      expect(gameEngine.level).toBe(1);
      expect(gameEngine.lives).toBe(3);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid canvas gracefully', () => {
      expect(() => {
        new GameEngine(null, mockCtx);
      }).not.toThrow();
    });

    test('should handle invalid context gracefully', () => {
      expect(() => {
        new GameEngine(mockCanvas, null);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should not create memory leaks with event listeners', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const engine = new GameEngine(mockCanvas, mockCtx);
      engine.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});