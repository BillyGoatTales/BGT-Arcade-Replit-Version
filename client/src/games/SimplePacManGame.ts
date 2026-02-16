import { GameEngine } from './GameEngine';
import { MusicEngine } from './MusicEngine';

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  x: number;
  y: number;
  direction: string;
  color: string;
  vulnerable: boolean;
  speed: number;
  lastMoveTime: number;
  inBox: boolean;
  exitDelay: number;
}

export class SimplePacManGame extends GameEngine {
  // Add mobile control methods
  public handleMobilePress(action: string) {
    console.log('SimplePacManGame: Mobile press received -', action);
    this.touchControls.add(action);
    
    // Set direction immediately for responsive controls
    switch(action) {
      case 'up':
        this.nextDirection = 'up';
        console.log('SimplePacManGame: Direction set to UP from mobile press');
        break;
      case 'down':
        this.nextDirection = 'down';
        console.log('SimplePacManGame: Direction set to DOWN from mobile press');
        break;
      case 'left':
        this.nextDirection = 'left';
        console.log('SimplePacManGame: Direction set to LEFT from mobile press');
        break;
      case 'right':
        this.nextDirection = 'right';
        console.log('SimplePacManGame: Direction set to RIGHT from mobile press');
        break;
    }
    
    console.log('SimplePacManGame: Touch controls now:', Array.from(this.touchControls));
    console.log('SimplePacManGame: Next direction is now:', this.nextDirection);
  }

  public handleMobileRelease(action: string) {
    console.log('SimplePacManGame: Mobile release received -', action);
    this.touchControls.delete(action);
    console.log('SimplePacManGame: Touch controls now:', Array.from(this.touchControls));
  }

  // Direct direction setting for joystick
  public setDirection(direction: string) {
    console.log('SimplePacManGame: Direct setDirection called with:', direction);
    this.nextDirection = direction as 'up' | 'down' | 'left' | 'right';
    console.log('SimplePacManGame: Next direction directly set to:', this.nextDirection);
  }

  // Direct player direction control for joystick
  public setPlayerDirection(direction: 'up' | 'down' | 'left' | 'right' | null) {
    console.log('SimplePacManGame: setPlayerDirection called with:', direction);
    
    if (direction === null) {
      console.log('SimplePacManGame: Direction cleared');
      return;
    }
    
    // Set both current and next direction for immediate response
    this.playerDirection = direction;
    this.nextDirection = direction;
    
    // Force player to snap to grid for better movement
    this.player.x = Math.round(this.player.x / this.gridSize) * this.gridSize;
    this.player.y = Math.round(this.player.y / this.gridSize) * this.gridSize;
    
    console.log('SimplePacManGame: Player direction set to:', this.playerDirection);
    console.log('SimplePacManGame: Next direction set to:', this.nextDirection);
  }
  private player: Position = { x: 200, y: 200 };
  private playerDirection: string = '';
  private nextDirection: string = '';
  private ghosts: Ghost[] = [];
  private dots: Position[] = [];
  private powerPellets: Position[] = [];
  private walls: Position[] = [];
  private lives: number = 5;
  private vulnerableTimer: number = 0;
  private timeLeft: number = 30;
  private maxTime: number = 30;
  private gridSize: number = 40;
  private musicEngine: MusicEngine;
  private ghostStartDelay: number = 180; // 3 seconds at 60fps
  private ghostsActive: boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super(canvas, ctx);
    console.log('SimplePacManGame constructor called - Canvas:', canvas.width, 'x', canvas.height);
    
    try {
      this.musicEngine = new MusicEngine();
      this.initializeGame();
      this.startBackgroundMusic();
      console.log('SimplePacManGame initialized successfully');
      
      // Force immediate render to test
      this.forceRender();
      
    } catch (error) {
      console.error('SimplePacManGame initialization error:', error);
      // Initialize without music if audio fails
      this.initializeGame();
      this.forceRender();
    }
  }

  private forceRender() {
    console.log('Force rendering SimplePacManGame...');
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.fillRect(10, 10, 100, 100);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('PacMan Ready!', 15, 60);
    
    // Log current input state for debugging
    if (this.keys.size > 0 || this.touchControls.size > 0) {
      console.log('Current keys:', Array.from(this.keys));
      console.log('Current touch controls:', Array.from(this.touchControls));
    }
  }

  private startBackgroundMusic() {
    this.musicEngine.playBackgroundMusic('crypto');
  }

  private playSound(frequency: number, duration: number, type: OscillatorType = 'square') {
    this.musicEngine.playSound(frequency, duration, type);
  }

  public destroy() {
    super.destroy();
    this.musicEngine.stopBackgroundMusic();
  }

  private initializeGame() {
    // Reset timer with level progression - much more generous for level 1
    this.timeLeft = this.maxTime = Math.max(60 - (this.level - 1) * 5, 20); // 60s, 55s, 50s... min 20s
    
    // Position player at starting position
    this.player = { x: 200, y: 200 };
    this.playerDirection = '';
    this.nextDirection = '';
    
    // Create walls based on level
    this.createWalls();
    
    // Create many more dots for engaging gameplay
    this.dots = [];
    const dotSpacing = this.gridSize / 2; // Closer spacing for more dots
    
    for (let x = 60; x < this.canvas.width - 60; x += dotSpacing) {
      for (let y = 60; y < this.canvas.height - 60; y += dotSpacing) {
        // Skip dots in spawn box area but don't worry about wall collision
        const midX = Math.floor(this.canvas.width / 2);
        const midY = Math.floor(this.canvas.height / 2);
        const boxSize = 35;
        
        if (Math.abs(x - midX) < boxSize && Math.abs(y - midY) < boxSize) continue;
        
        // Skip area near player starting position (smaller area)
        const distanceFromPlayer = Math.sqrt(
          Math.pow(x - this.player.x, 2) + Math.pow(y - this.player.y, 2)
        );
        
        // Bigger safe area around player for easier start
        if (distanceFromPlayer > this.gridSize * 2) {
          this.dots.push({ x, y });
        }
      }
    }

    // Snap player to grid
    this.player.x = Math.round(this.player.x / this.gridSize) * this.gridSize;
    this.player.y = Math.round(this.player.y / this.gridSize) * this.gridSize;

    // Create power pellets in corners - aligned to grid
    this.powerPellets = [
      { x: this.gridSize * 2, y: this.gridSize * 2 },
      { x: this.canvas.width - this.gridSize * 2, y: this.gridSize * 2 },
      { x: this.gridSize * 2, y: this.canvas.height - this.gridSize * 2 },
      { x: this.canvas.width - this.gridSize * 2, y: this.canvas.height - this.gridSize * 2 }
    ];

    // Create ghosts based on level (1-4 ghosts)
    this.createGhosts();
    
    // Reset ghost delay timer
    this.ghostStartDelay = 180; // 3 seconds
    this.ghostsActive = false;

    console.log(`Simple PacMan: Level ${this.level} - Created ${this.dots.length} dots, ${this.ghosts.length} ghosts, Timer: ${this.timeLeft}s`);
    console.log('SimplePacManGame: Ghosts will activate in 3 seconds - ready for joystick testing');
  }

  private createWalls() {
    this.walls = [];
    
    // Remove boundary walls completely - they're causing stuck issues
    // We'll handle boundaries with code instead
    
    // Add smaller, more precise ghost spawn box
    const midX = Math.floor(this.canvas.width / 2);
    const midY = Math.floor(this.canvas.height / 2);
    const boxSize = 30; // Smaller spawn box to reduce collision issues
    
    // Create minimal spawn box walls - just enough to contain ghosts
    for (let x = midX - boxSize; x <= midX + boxSize; x += 15) {
      // Bottom wall
      this.walls.push({ x, y: midY + boxSize });
      // Top wall (leave opening for ghost exit)
      if (Math.abs(x - midX) > 15) {
        this.walls.push({ x, y: midY - boxSize });
      }
    }
    
    for (let y = midY - boxSize + 15; y <= midY + boxSize; y += 15) {
      // Left and right walls (shorter to allow easier movement around)
      this.walls.push({ x: midX - boxSize, y });
      this.walls.push({ x: midX + boxSize, y });
    }
    
    console.log('SimplePacManGame: Created maze with', this.walls.length, 'walls including ghost spawn box');
  }

  private createGhosts() {
    this.ghosts = [];
    const colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
    const ghostCount = Math.min(this.level + 1, 3); // Start with 2 ghosts on level 1, max 3
    
    for (let i = 0; i < ghostCount; i++) {
      const baseX = Math.round(this.canvas.width / 2 / this.gridSize) * this.gridSize;
      const baseY = Math.round(this.canvas.height / 2 / this.gridSize) * this.gridSize;
      
      // Position ghosts in safe corners, very far from player (200, 200)
      let startX, startY;
      const safeDistance = this.gridSize * 6; // Much larger safe distance
      
      switch (i) {
        case 0:
          startX = this.canvas.width - safeDistance; // Far right corner
          startY = safeDistance; // Top
          break;
        case 1:
          startX = safeDistance; // Far left corner
          startY = this.canvas.height - safeDistance; // Bottom
          break;
        case 2:
          startX = this.canvas.width - safeDistance; // Far right corner
          startY = this.canvas.height - safeDistance; // Bottom
          break;
        default:
          startX = safeDistance;
          startY = safeDistance;
      }
      
      this.ghosts.push({
        x: startX,
        y: startY,
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
        color: colors[i],
        vulnerable: false,
        speed: this.level === 1 ? 0.1 : 0.3 + (this.level * 0.05), // Much slower for beginner level
        lastMoveTime: 0,
        inBox: true, // Ghost starts in spawn box
        exitDelay: 180 + (i * 60), // Staggered exit times (3-6 seconds)
      });
    }
  }

  private isWall(x: number, y: number): boolean {
    // Improved wall collision detection with proper boundaries
    return this.walls.some(wall => 
      Math.abs(wall.x - x) < 10 && Math.abs(wall.y - y) < 10
    );
  }

  private isInSpawnBox(x: number, y: number): boolean {
    const midX = this.canvas.width / 2;
    const midY = this.canvas.height / 2;
    const boxSize = 30; // Match the smaller spawn box size
    
    return Math.abs(x - midX) < boxSize && Math.abs(y - midY) < boxSize;
  }

  protected update() {
    if (!this.running) return;

    this.updateTimer();
    this.updatePlayer();
    this.updateGhosts();
    this.updateVulnerableTimer();
    this.checkCollisions();

    // Win condition
    if (this.dots.length === 0) {
      this.updateScore(this.score + 1000 + (this.timeLeft * 10)); // Bonus for time remaining
      this.updateLevel(this.level + 1);
      this.initializeGame();
    }

    // Time up condition
    if (this.timeLeft <= 0) {
      this.lives--;
      if (this.lives <= 0) {
        this.endGame();
      } else {
        this.initializeGame(); // Reset level with time penalty
      }
    }
  }

  private updateTimer() {
    this.timeLeft -= 1/60; // Decrease by 1/60th of a second (60 FPS)
    if (this.timeLeft < 0) this.timeLeft = 0;
  }

  private updatePlayer() {
    // Handle input for next direction - check all key variations
    const upPressed = this.keys.has('ArrowUp') || this.keys.has('w') || this.keys.has('W') || this.touchControls.has('up');
    const downPressed = this.keys.has('ArrowDown') || this.keys.has('s') || this.keys.has('S') || this.touchControls.has('down');
    const leftPressed = this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A') || this.touchControls.has('left');
    const rightPressed = this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D') || this.touchControls.has('right');

    // Debug input state when movement is detected
    if (upPressed || downPressed || leftPressed || rightPressed) {
      console.log('Pac-Man: Movement input - Up:', upPressed, 'Down:', downPressed, 'Left:', leftPressed, 'Right:', rightPressed);
    }

    if (upPressed) {
      this.nextDirection = 'up';
      console.log('Pac-Man: Up input detected - setting next direction');
    } else if (downPressed) {
      this.nextDirection = 'down';
      console.log('Pac-Man: Down input detected - setting next direction');
    } else if (leftPressed) {
      this.nextDirection = 'left';
      console.log('Pac-Man: Left input detected - setting next direction');
    } else if (rightPressed) {
      this.nextDirection = 'right';
      console.log('Pac-Man: Right input detected - setting next direction');
    }

    // Handle joystick/mobile input directly
    if (this.touchControls.size > 0) {
      const direction = Array.from(this.touchControls)[0]; // Get the first touch control
      console.log('SimplePacManGame: Processing touch control direction:', direction);
      this.nextDirection = direction as 'up' | 'down' | 'left' | 'right';
      console.log('SimplePacManGame: Set nextDirection to:', this.nextDirection);
    }

    // Faster movement to escape stuck situations
    const speed = 1.0;

    // Immediate joystick responsiveness - try to change direction instantly
    if (this.nextDirection) {
      // For mobile joystick, be very permissive about direction changes
      this.playerDirection = this.nextDirection;
      this.nextDirection = '';
    }

    // Move in current direction
    if (this.playerDirection) {
      let newX = this.player.x;
      let newY = this.player.y;

      switch (this.playerDirection) {
        case 'up':
          newY -= speed;
          break;
        case 'down':
          newY += speed;
          break;
        case 'left':
          newX -= speed;
          break;
        case 'right':
          newX += speed;
          break;
      }

      // Check boundaries and walls - allow edge access
      const minBound = this.gridSize;
      const maxXBound = this.canvas.width - this.gridSize;
      const maxYBound = this.canvas.height - this.gridSize;

      const oldX = this.player.x;
      const oldY = this.player.y;

      // Improved collision detection that prevents getting stuck
      const margin = 15;
      const midX = this.canvas.width / 2;
      const midY = this.canvas.height / 2;
      const boxSize = 30; // Smaller spawn box to reduce stuck zones
      
      // More precise spawn box detection - only block if truly inside the box
      const insideSpawnBoxX = Math.abs(newX - midX) < boxSize;
      const insideSpawnBoxY = Math.abs(newY - midY) < boxSize;
      const wouldEnterSpawnBox = insideSpawnBoxX && insideSpawnBoxY;
      
      // Allow movement unless specifically blocked by spawn box or boundaries
      let canMoveX = true;
      let canMoveY = true;
      
      // Check boundaries
      if (newX < margin || newX > this.canvas.width - margin) {
        canMoveX = false;
      }
      if (newY < margin || newY > this.canvas.height - margin) {
        canMoveY = false;
      }
      
      // Check spawn box collision only if moving INTO the box (not if already near it)
      if (wouldEnterSpawnBox) {
        // Allow movement along the edges of the spawn box
        const currentlyNearBoxX = Math.abs(this.player.x - midX) < boxSize + 20;
        const currentlyNearBoxY = Math.abs(this.player.y - midY) < boxSize + 20;
        
        // Only block if moving deeper into the box
        if (!currentlyNearBoxX && insideSpawnBoxX) canMoveX = false;
        if (!currentlyNearBoxY && insideSpawnBoxY) canMoveY = false;
      }
      
      // Apply movement
      if (canMoveX) {
        this.player.x = Math.max(margin, Math.min(this.canvas.width - margin, newX));
      }
      if (canMoveY) {
        this.player.y = Math.max(margin, Math.min(this.canvas.height - margin, newY));
      }

      // Emergency escape mechanism if player gets truly stuck
      if (this.player.x === oldX && this.player.y === oldY && this.playerDirection) {
        console.log('SimplePacManGame: Player stuck, applying emergency escape');
        // Nudge player away from center if stuck
        if (Math.abs(this.player.x - midX) < boxSize + 5 && Math.abs(this.player.y - midY) < boxSize + 5) {
          if (this.player.x < midX) this.player.x -= 5;
          else this.player.x += 5;
          if (this.player.y < midY) this.player.y -= 5;
          else this.player.y += 5;
        }
      }

      // Log movement for debugging  
      if (this.player.x !== oldX || this.player.y !== oldY) {
        console.log('SimplePacManGame: Player moved from', oldX, oldY, 'to', this.player.x, this.player.y, 'Direction:', this.playerDirection);
      }
    }
  }

  private canMoveInDirection(x: number, y: number, direction: string): boolean {
    let newX = x, newY = y;
    const step = this.gridSize;

    switch (direction) {
      case 'up':
        newY -= step;
        break;
      case 'down':
        newY += step;
        break;
      case 'left':
        newX -= step;
        break;
      case 'right':
        newX += step;
        break;
    }

    // Allow movement within playable area
    return newX >= this.gridSize && newX <= this.canvas.width - this.gridSize &&
           newY >= this.gridSize && newY <= this.canvas.height - this.gridSize &&
           !this.isWall(newX, newY);
  }

  private updateGhosts() {
    // Countdown ghost start delay
    if (this.ghostStartDelay > 0) {
      this.ghostStartDelay--;
      return; // Don't move ghosts during delay
    }
    
    if (!this.ghostsActive) {
      this.ghostsActive = true;
      console.log('SimplePacManGame: Ghosts are now active!');
    }
    
    const currentTime = Date.now();
    
    this.ghosts.forEach(ghost => {
      // Control ghost movement speed with timing
      if (currentTime - ghost.lastMoveTime < (150 / ghost.speed)) return;
      
      ghost.lastMoveTime = currentTime;
      
      const directions = ['up', 'down', 'left', 'right'];
      const moveDistance = this.gridSize;
      
      // Enhanced AI: chase player when close, flee when vulnerable
      const distanceToPlayer = Math.abs(ghost.x - this.player.x) + Math.abs(ghost.y - this.player.y);
      const shouldChasePlayer = !ghost.vulnerable && distanceToPlayer < 200 && Math.random() < 0.4;
      const shouldFleePlayer = ghost.vulnerable && distanceToPlayer < 150 && Math.random() < 0.6;
      
      if (shouldChasePlayer) {
        // Intelligent chase logic
        if (Math.abs(ghost.x - this.player.x) > Math.abs(ghost.y - this.player.y)) {
          ghost.direction = ghost.x > this.player.x ? 'left' : 'right';
        } else {
          ghost.direction = ghost.y > this.player.y ? 'up' : 'down';
        }
      } else if (shouldFleePlayer) {
        // Flee from player when vulnerable
        if (Math.abs(ghost.x - this.player.x) > Math.abs(ghost.y - this.player.y)) {
          ghost.direction = ghost.x > this.player.x ? 'right' : 'left';
        } else {
          ghost.direction = ghost.y > this.player.y ? 'down' : 'up';
        }
      } else if (Math.random() < 0.15) {
        // Random direction change for unpredictability
        ghost.direction = directions[Math.floor(Math.random() * directions.length)];
      }
      
      // Calculate next position
      let nextX = ghost.x;
      let nextY = ghost.y;
      
      switch (ghost.direction) {
        case 'up':
          nextY = ghost.y - moveDistance;
          break;
        case 'down':
          nextY = ghost.y + moveDistance;
          break;
        case 'left':
          nextX = ghost.x - moveDistance;
          break;
        case 'right':
          nextX = ghost.x + moveDistance;
          break;
      }
      
      // Check bounds and walls
      if (nextX < this.gridSize || nextX >= this.canvas.width - this.gridSize ||
          nextY < this.gridSize || nextY >= this.canvas.height - this.gridSize ||
          this.isWall(nextX, nextY)) {
        
        // Hit boundary or wall, choose new valid direction
        const validDirections = directions.filter(dir => {
          let testX = ghost.x, testY = ghost.y;
          switch (dir) {
            case 'up': testY -= moveDistance; break;
            case 'down': testY += moveDistance; break;
            case 'left': testX -= moveDistance; break;
            case 'right': testX += moveDistance; break;
          }
          return testX >= this.gridSize && testX < this.canvas.width - this.gridSize &&
                 testY >= this.gridSize && testY < this.canvas.height - this.gridSize &&
                 !this.isWall(testX, testY);
        });
        
        if (validDirections.length > 0) {
          ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
          
          // Recalculate position with new direction
          switch (ghost.direction) {
            case 'up': nextY = ghost.y - moveDistance; break;
            case 'down': nextY = ghost.y + moveDistance; break;
            case 'left': nextX = ghost.x - moveDistance; break;
            case 'right': nextX = ghost.x + moveDistance; break;
          }
        }
      }
      
      // Update position if movement is valid
      if (nextX >= this.gridSize && nextX < this.canvas.width - this.gridSize &&
          nextY >= this.gridSize && nextY < this.canvas.height - this.gridSize &&
          !this.isWall(nextX, nextY)) {
        ghost.x = nextX;
        ghost.y = nextY;
      }
    });
  }

  private updateVulnerableTimer() {
    if (this.vulnerableTimer > 0) {
      this.vulnerableTimer--;
      if (this.vulnerableTimer === 0) {
        this.ghosts.forEach(ghost => ghost.vulnerable = false);
      }
    }
  }

  private checkCollisions() {
    // Dot collection with larger collection radius for mobile
    this.dots = this.dots.filter(dot => {
      const distance = Math.sqrt(
        Math.pow(this.player.x - dot.x, 2) + Math.pow(this.player.y - dot.y, 2)
      );
      if (distance < 25) { // Larger collection radius
        this.updateScore(this.score + 10);
        this.timeLeft += 1; // More time bonus
        this.playSound(800, 0.1, 'square'); // Dot collection sound
        return false;
      }
      return true;
    });

    // Power pellet collection
    this.powerPellets = this.powerPellets.filter(pellet => {
      const distance = Math.sqrt(
        Math.pow(this.player.x - pellet.x, 2) + Math.pow(this.player.y - pellet.y, 2)
      );
      if (distance < 25) {
        this.updateScore(this.score + 50);
        this.vulnerableTimer = 600; // 10 seconds at 60fps - longer edible time
        this.timeLeft += 3;
        this.ghosts.forEach(ghost => ghost.vulnerable = true);
        this.playSound(220, 0.3, 'sine'); // Power-up sound
        return false;
      }
      return true;
    });

    // Ghost collision - only if ghosts are active
    if (this.ghostsActive) {
      this.ghosts.forEach(ghost => {
        const distance = Math.sqrt(
          Math.pow(this.player.x - ghost.x, 2) + Math.pow(this.player.y - ghost.y, 2)
        );
        
        if (distance < 20) { // Smaller collision radius
          if (ghost.vulnerable) {
            this.updateScore(this.score + 200);
            ghost.x = Math.round(this.canvas.width / 2 / this.gridSize) * this.gridSize;
            ghost.y = Math.round(this.canvas.height / 2 / this.gridSize) * this.gridSize;
            ghost.vulnerable = false;
            this.playSound(1000, 0.2, 'sine'); // Ghost eaten sound
          } else {
            this.lives--;
            console.log('SimplePacManGame: Player hit ghost, lives remaining:', this.lives);
            if (this.lives <= 0) {
              this.endGame();
            } else {
              // Reset positions with brief invulnerability
              this.player.x = 200;
              this.player.y = 200;
              this.playerDirection = '';
              this.nextDirection = '';
              this.timeLeft = Math.max(this.timeLeft - 3, 10); // Less time penalty
              this.playSound(150, 0.5, 'sawtooth'); // Death sound
              
              // Give player 2 seconds of breathing room
              setTimeout(() => {
                this.ghosts.forEach((ghost, index) => {
                  const safeDistance = this.gridSize * 6;
                  switch (index) {
                    case 0:
                      ghost.x = this.canvas.width - safeDistance;
                      ghost.y = safeDistance;
                      break;
                    case 1:
                      ghost.x = safeDistance;
                      ghost.y = this.canvas.height - safeDistance;
                      break;
                    default:
                      ghost.x = this.canvas.width - safeDistance;
                      ghost.y = this.canvas.height - safeDistance;
                  }
                });
              }, 100);
              
              // Reset ghost delay for next life
              this.ghostStartDelay = 180;
              this.ghostsActive = false;
            }
          }
        }
      });
    }
  }

  protected render() {
    try {
      if (!this.running) return;

      // Clear canvas with vibrant gaming gradient
      const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(0.5, '#312e81');
      gradient.addColorStop(1, '#1e3a8a');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw walls - much smaller and thinner
    this.walls.forEach(wall => {
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(wall.x - 6, wall.y - 6, 12, 12);
      
      // Add subtle border
      this.ctx.strokeStyle = '#334155';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(wall.x - 6, wall.y - 6, 12, 12);
    });

    // Draw BTC crypto coins instead of dots
    this.dots.forEach(dot => {
      this.ctx.fillStyle = '#f7931a'; // Bitcoin orange
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      
      // Draw BTC coin circle
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw "₿" symbol
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 8px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('₿', dot.x, dot.y);
    });

    // Draw power pellets (modern style)
    this.powerPellets.forEach(pellet => {
      this.ctx.fillStyle = '#8b5cf6';
      this.ctx.beginPath();
      this.ctx.arc(pellet.x, pellet.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add pulse effect
      this.ctx.strokeStyle = '#a78bfa';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(pellet.x, pellet.y, 12, 0, Math.PI * 2);
      this.ctx.stroke();
    });

    // Draw player (modern character)
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, 14, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add player border
    this.ctx.strokeStyle = '#1d4ed8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, 14, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Direction indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    let dirX = this.player.x, dirY = this.player.y;
    switch (this.playerDirection) {
      case 'up': dirY -= 8; break;
      case 'down': dirY += 8; break;
      case 'left': dirX -= 8; break;
      case 'right': dirX += 8; break;
    }
    this.ctx.arc(dirX, dirY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw ghosts (modern floating style)
    this.ghosts.forEach(ghost => {
      const pulseEffect = Math.sin(Date.now() * 0.01) * 2;
      
      // Show countdown timer if ghosts aren't active yet
      if (!this.ghostsActive) {
        const secondsLeft = Math.ceil(this.ghostStartDelay / 60);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillText(secondsLeft.toString(), ghost.x - 4, ghost.y - 20);
      }
      
      // Main ghost body - dimmed if not active
      const alpha = this.ghostsActive ? 1 : 0.3;
      this.ctx.fillStyle = ghost.vulnerable ? '#6366f1' : ghost.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(ghost.x, ghost.y, 15 + pulseEffect, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Holographic border effect
      this.ctx.strokeStyle = ghost.vulnerable ? '#8b5cf6' : '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(ghost.x - 6, ghost.y - 4, 3, 0, Math.PI * 2);
      this.ctx.arc(ghost.x + 6, ghost.y - 4, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#1f2937';
      this.ctx.beginPath();
      this.ctx.arc(ghost.x - 6, ghost.y - 4, 1.5, 0, Math.PI * 2);
      this.ctx.arc(ghost.x + 6, ghost.y - 4, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw UI (modern style)
    this.ctx.fillStyle = '#1f2937';
    this.ctx.font = '16px Inter, sans-serif';
    this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    this.ctx.fillText(`Level: ${this.level}`, 150, 25);
    this.ctx.fillText(`Lives: ${this.lives}`, 250, 25);
    
    // Timer with modern color coding
    const timeColor = this.timeLeft <= 10 ? '#ef4444' : this.timeLeft <= 20 ? '#f59e0b' : '#10b981';
    this.ctx.fillStyle = timeColor;
    this.ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, 350, 25);
    
    this.ctx.fillStyle = '#6366f1';
    this.ctx.fillText(`Coins Left: ${this.dots.length}`, 10, 50);

    if (this.vulnerableTimer > 0) {
      this.ctx.fillStyle = '#8b5cf6';
      this.ctx.fillText(`Power Mode: ${Math.ceil(this.vulnerableTimer / 60)}s`, 10, 75);
    }
    } catch (error) {
      console.error('SimplePacManGame render error:', error);
    }
  }
}