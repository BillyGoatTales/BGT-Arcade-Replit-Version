export abstract class GameEngine {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected running: boolean = false;
  protected paused: boolean = false;
  protected animationId: number | null = null;
  protected score: number = 0;
  protected level: number = 1;
  protected keys: Set<string> = new Set();
  protected touchControls: Set<string> = new Set();

  public onScoreChange?: (score: number) => void;
  public onLevelChange?: (level: number) => void;
  public onGameEnd?: (score: number, level: number) => void;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.setupInput();
    this.setupTouchInput();
  }

  private setupInput() {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent default behavior for game keys
      if (e.code === 'Space' || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      
      // Handle spacebar properly
      if (e.code === 'Space') {
        this.keys.add(' ');
        this.keys.add('spacebar');
      } else {
        this.keys.add(key);
      }
      
      if (key === 'p') {
        this.paused ? this.resume() : this.pause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent default behavior for game keys
      if (e.code === 'Space' || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      
      // Handle spacebar properly
      if (e.code === 'Space') {
        this.keys.delete(' ');
        this.keys.delete('spacebar');
      } else {
        this.keys.delete(key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Store references for cleanup
    this.canvas.addEventListener('blur', () => this.keys.clear());
  }

  private setupTouchInput() {
    // Add touch and swipe support
    let startX = 0, startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      const minSwipeDistance = 30;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            this.handleMobileInput('right');
          } else {
            this.handleMobileInput('left');
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            this.handleMobileInput('down');
          } else {
            this.handleMobileInput('up');
          }
        }
      }
      
      // Reset values
      startX = 0;
      startY = 0;
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  // Mobile control interface
  public handleMobileInput(action: string) {
    // Simulate key press for mobile controls
    switch (action) {
      case 'up':
        this.keys.add('arrowup');
        this.keys.add('w');
        this.keys.add(' ');
        this.keys.add('spacebar');
        setTimeout(() => {
          this.keys.delete('arrowup');
          this.keys.delete('w');
          this.keys.delete(' ');
          this.keys.delete('spacebar');
        }, 100);
        break;
      case 'down':
        this.keys.add('arrowdown');
        this.keys.add('s');
        setTimeout(() => {
          this.keys.delete('arrowdown');
          this.keys.delete('s');
        }, 100);
        break;
      case 'left':
        this.keys.add('arrowleft');
        this.keys.add('a');
        setTimeout(() => {
          this.keys.delete('arrowleft');
          this.keys.delete('a');
        }, 100);
        break;
      case 'right':
        this.keys.add('arrowright');
        this.keys.add('d');
        setTimeout(() => {
          this.keys.delete('arrowright');
          this.keys.delete('d');
        }, 100);
        break;
      case 'shoot':
        this.keys.add(' ');
        this.keys.add('spacebar');
        setTimeout(() => {
          this.keys.delete(' ');
          this.keys.delete('spacebar');
        }, 100);
        break;
    }
  }

  public handleMobilePress(action: string) {
    console.log('GameEngine: Mobile press -', action);
    this.touchControls.add(action);
    
    // Normalized key handling for consistency across all games
    switch (action) {
      case 'up':
        this.keys.add('arrowup');
        this.keys.add('w');
        this.keys.add(' ');
        this.keys.add('spacebar');
        break;
      case 'down':
        this.keys.add('arrowdown');
        this.keys.add('s');
        break;
      case 'left':
        this.keys.add('arrowleft');
        this.keys.add('a');
        break;
      case 'right':
        this.keys.add('arrowright');
        this.keys.add('d');
        break;
      case 'shoot':
        this.keys.add(' ');
        this.keys.add('spacebar');
        break;
    }
    console.log('GameEngine: Touch controls now:', Array.from(this.touchControls));
  }

  public handleMobileRelease(action: string) {
    console.log('GameEngine: Mobile release -', action);
    this.touchControls.delete(action);
    
    // Remove from keys with normalized handling to match game expectations
    switch (action) {
      case 'up':
        this.keys.delete('arrowup');
        this.keys.delete('w');
        this.keys.delete(' ');
        this.keys.delete('spacebar');
        break;
      case 'down':
        this.keys.delete('arrowdown');
        this.keys.delete('s');
        break;
      case 'left':
        this.keys.delete('arrowleft');
        this.keys.delete('a');
        break;
      case 'right':
        this.keys.delete('arrowright');
        this.keys.delete('d');
        break;
      case 'shoot':
        this.keys.delete(' ');
        this.keys.delete('spacebar');
        break;
    }
    console.log('GameEngine: Touch controls now:', Array.from(this.touchControls));
  }

  protected updateScore(newScore: number) {
    this.score = newScore;
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
  }

  protected updateLevel(newLevel: number) {
    this.level = newLevel;
    if (this.onLevelChange) {
      this.onLevelChange(this.level);
    }
  }

  protected endGame() {
    this.running = false;
    if (this.onGameEnd) {
      this.onGameEnd(this.score, this.level);
    }
  }

  public start() {
    console.log('Game engine starting...');
    this.running = true;
    this.paused = false;
    
    // Clear canvas and ensure it's ready
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Force initial render
    try {
      this.render();
    } catch (error) {
      console.error('Initial render error:', error);
    }
    
    this.gameLoop();
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    this.paused = false;
    if (this.running) {
      this.gameLoop();
    }
  }

  public stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  public destroy() {
    this.stop();
    this.keys.clear();
    this.touchControls.clear();
  }

  private gameLoop = () => {
    if (!this.running) {
      return;
    }
    
    try {
      if (!this.paused) {
        this.update();
        this.render();
      } else {
        // Still render when paused to show pause state
        this.render();
      }
    } catch (error) {
      console.error('Game loop error:', error);
      // Draw error message on canvas
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Game Error: ' + error.message, 10, 50);
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  protected abstract update(): void;
  protected abstract render(): void;
}
