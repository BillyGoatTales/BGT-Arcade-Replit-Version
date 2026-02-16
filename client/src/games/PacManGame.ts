import { GameEngine } from "./GameEngine";

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
}

export class PacManGame extends GameEngine {
  private player: Position = { x: 400, y: 300 };
  private playerDirection: string = '';
  private ghosts: Ghost[] = [];
  private dots: Position[] = [];
  private powerPellets: Position[] = [];
  private maze: number[][] = [];
  private cellSize: number = 20;
  private vulnerableTimer: number = 0;
  private lives: number = 5; // More lives for beginners // More lives for beginners

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super(canvas, ctx);
    try {
      this.initializeGame();
    } catch (error) {
      console.error('Error initializing PacMan game:', error);
    }
  }

  private initializeGame() {
    try {
      this.generateMaze();
      this.spawnDots();
      this.spawnGhosts();
      this.spawnPowerPellets();
      
      // Debug log to check if dots are spawned
      console.log(`PacMan: Spawned ${this.dots.length} dots for level ${this.level}`);
    } catch (error) {
      console.error('Error in initializeGame:', error);
      // Fallback: ensure we have some dots
      this.dots = [
        { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 },
        { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 },
        { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 }
      ];
    }
  }

  private generateMaze() {
    const rows = Math.floor(this.canvas.height / this.cellSize);
    const cols = Math.floor(this.canvas.width / this.cellSize);
    
    this.maze = [];
    // Simple maze generation - create walls around edges and some internal walls
    for (let y = 0; y < rows; y++) {
      this.maze[y] = [];
      for (let x = 0; x < cols; x++) {
        if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
          this.maze[y][x] = 1; // Wall
        } else if (Math.random() < 0.02) {
          this.maze[y][x] = 1; // Very few walls for beginners
        } else {
          this.maze[y][x] = 0; // Mostly empty space
        }
      }
    }
    
    // Ensure player starting position is clear
    const playerGridX = Math.floor(this.player.x / this.cellSize);
    const playerGridY = Math.floor(this.player.y / this.cellSize);
    if (playerGridY >= 0 && playerGridY < rows && playerGridX >= 0 && playerGridX < cols) {
      this.maze[playerGridY][playerGridX] = 0;
    }
  }

  private spawnDots() {
    this.dots = [];
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        if (this.maze[y][x] === 0 && Math.random() < 0.8) {
          this.dots.push({
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2
          });
        }
      }
    }
    
    // Ensure we always have at least 20 dots
    if (this.dots.length < 20) {
      const rows = Math.floor(this.canvas.height / this.cellSize);
      const cols = Math.floor(this.canvas.width / this.cellSize);
      
      for (let i = this.dots.length; i < 30; i++) {
        const x = Math.floor(Math.random() * (cols - 2)) + 1;
        const y = Math.floor(Math.random() * (rows - 2)) + 1;
        
        if (this.maze[y] && this.maze[y][x] === 0) {
          this.dots.push({
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2
          });
        }
      }
    }
  }

  private spawnPowerPellets() {
    this.powerPellets = [];
    const corners = [
      { x: 2 * this.cellSize, y: 2 * this.cellSize },
      { x: this.canvas.width - 3 * this.cellSize, y: 2 * this.cellSize },
      { x: 2 * this.cellSize, y: this.canvas.height - 3 * this.cellSize },
      { x: this.canvas.width - 3 * this.cellSize, y: this.canvas.height - 3 * this.cellSize }
    ];
    
    this.powerPellets = corners;
  }

  private spawnGhosts() {
    this.ghosts = [];
    const colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Start with just one ghost for beginners
    const ghostCount = Math.min(1 + Math.floor(this.level / 2), 3);
    
    for (let i = 0; i < ghostCount; i++) {
      this.ghosts.push({
        x: centerX + (i - 0.5) * 80,
        y: centerY,
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
        color: colors[i],
        vulnerable: false
      });
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    
    if (gridY < 0 || gridY >= this.maze.length || gridX < 0 || gridX >= this.maze[0].length) {
      return false;
    }
    
    return this.maze[gridY][gridX] === 0;
  }

  protected update() {
    // Don't update if game isn't running
    if (!this.running) return;
    
    try {
      this.updatePlayer();
      this.updateGhosts();
      this.updateVulnerableTimer();
      this.checkCollisions();
      
      // Check win condition - only if we actually have dots to begin with
      if (this.dots.length === 0 && this.score > 0) {
        this.nextLevel();
      }
    } catch (error) {
      console.error('Error in PacMan update:', error);
    }
  }

  private updatePlayer() {
    let newX = this.player.x;
    let newY = this.player.y;
    const speed = 2; // Slower movement

    if (this.keys.has('arrowup') || this.keys.has('w')) {
      newY -= speed;
      this.playerDirection = 'up';
    }
    if (this.keys.has('arrowdown') || this.keys.has('s')) {
      newY += speed;
      this.playerDirection = 'down';
    }
    if (this.keys.has('arrowleft') || this.keys.has('a')) {
      newX -= speed;
      this.playerDirection = 'left';
    }
    if (this.keys.has('arrowright') || this.keys.has('d')) {
      newX += speed;
      this.playerDirection = 'right';
    }

    // Wall collision
    if (this.canMoveTo(newX, this.player.y)) {
      this.player.x = newX;
    }
    if (this.canMoveTo(this.player.x, newY)) {
      this.player.y = newY;
    }

    // Screen wrapping
    if (this.player.x < 0) this.player.x = this.canvas.width;
    if (this.player.x > this.canvas.width) this.player.x = 0;
  }

  private updateGhosts() {
    this.ghosts.forEach(ghost => {
      let newX = ghost.x;
      let newY = ghost.y;
      const speed = ghost.vulnerable ? 0.5 : 1.2; // Slower ghosts

      // Simple ghost AI - move toward player with some randomness
      if (Math.random() < 0.1) {
        ghost.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
      } else if (Math.random() < 0.3) {
        // Move toward player
        if (this.player.x > ghost.x) ghost.direction = 'right';
        else if (this.player.x < ghost.x) ghost.direction = 'left';
        else if (this.player.y > ghost.y) ghost.direction = 'down';
        else if (this.player.y < ghost.y) ghost.direction = 'up';
      }

      switch (ghost.direction) {
        case 'up': newY -= speed; break;
        case 'down': newY += speed; break;
        case 'left': newX -= speed; break;
        case 'right': newX += speed; break;
      }

      if (this.canMoveTo(newX, newY)) {
        ghost.x = newX;
        ghost.y = newY;
      } else {
        // Change direction if hit wall
        ghost.direction = ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
      }

      // Screen wrapping
      if (ghost.x < 0) ghost.x = this.canvas.width;
      if (ghost.x > this.canvas.width) ghost.x = 0;
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
    // Dot collection
    this.dots = this.dots.filter(dot => {
      const distance = Math.sqrt(
        Math.pow(this.player.x - dot.x, 2) + Math.pow(this.player.y - dot.y, 2)
      );
      
      if (distance < 15) {
        this.updateScore(this.score + 10);
        return false;
      }
      return true;
    });

    // Power pellet collection
    this.powerPellets = this.powerPellets.filter(pellet => {
      const distance = Math.sqrt(
        Math.pow(this.player.x - pellet.x, 2) + Math.pow(this.player.y - pellet.y, 2)
      );
      
      if (distance < 20) {
        this.updateScore(this.score + 50);
        this.vulnerableTimer = 300; // 5 seconds at 60fps
        this.ghosts.forEach(ghost => ghost.vulnerable = true);
        return false;
      }
      return true;
    });

    // Ghost collision
    this.ghosts.forEach((ghost, index) => {
      const distance = Math.sqrt(
        Math.pow(this.player.x - ghost.x, 2) + Math.pow(this.player.y - ghost.y, 2)
      );
      
      if (distance < 25) {
        if (ghost.vulnerable) {
          this.updateScore(this.score + 200);
          // Respawn ghost
          ghost.x = this.canvas.width / 2;
          ghost.y = this.canvas.height / 2;
          ghost.vulnerable = false;
        } else {
          // Only lose life if we're actually playing (have collected some dots)
          if (this.score > 0) {
            this.lives--;
            if (this.lives <= 0) {
              this.endGame();
            } else {
              // Reset player position and continue
              this.player.x = 400;
              this.player.y = 300;
              this.playerDirection = '';
            }
          }
        }
      }
    });
  }

  private nextLevel() {
    this.updateLevel(this.level + 1);
    this.updateScore(this.score + 1000); // Level bonus
    
    // Reset player position
    this.player.x = 400;
    this.player.y = 300;
    this.playerDirection = '';
    
    // Regenerate level content
    this.initializeGame();
  }

  protected render() {
    // Don't render if game isn't running
    if (!this.running) return;
    
    try {
      // Clear canvas
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw maze
    this.ctx.fillStyle = '#0000ff';
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        if (this.maze[y][x] === 1) {
          this.ctx.fillRect(
            x * this.cellSize, 
            y * this.cellSize, 
            this.cellSize, 
            this.cellSize
          );
        }
      }
    }

    // Draw Bitcoin (small coins)
    this.ctx.fillStyle = '#f7931a';
    this.dots.forEach(dot => {
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      // Add Bitcoin symbol
      this.ctx.fillStyle = '#000';
      this.ctx.font = '6px monospace';
      this.ctx.fillText('₿', dot.x - 2, dot.y + 2);
      this.ctx.fillStyle = '#f7931a';
    });

    // Draw power pellets (Ethereum)
    this.ctx.fillStyle = '#627eea';
    this.powerPellets.forEach(pellet => {
      this.ctx.beginPath();
      this.ctx.arc(pellet.x, pellet.y, 8, 0, Math.PI * 2);
      this.ctx.fill();
      // Add Ethereum symbol
      this.ctx.fillStyle = '#000';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('Ξ', pellet.x - 4, pellet.y + 3);
      this.ctx.fillStyle = '#627eea';
    });

    // Draw player (Bitcoin collector)
    this.ctx.fillStyle = '#f7931a'; // Bitcoin orange
    this.ctx.beginPath();
    
    // Create collector shape with mouth
    const mouthAngle = Math.PI / 4;
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    switch (this.playerDirection) {
      case 'right':
        startAngle = mouthAngle;
        endAngle = Math.PI * 2 - mouthAngle;
        break;
      case 'left':
        startAngle = Math.PI - mouthAngle;
        endAngle = Math.PI + mouthAngle;
        break;
      case 'up':
        startAngle = Math.PI * 1.5 - mouthAngle;
        endAngle = Math.PI * 1.5 + mouthAngle;
        break;
      case 'down':
        startAngle = Math.PI * 0.5 - mouthAngle;
        endAngle = Math.PI * 0.5 + mouthAngle;
        break;
    }
    
    this.ctx.arc(this.player.x, this.player.y, 12, startAngle, endAngle);
    this.ctx.lineTo(this.player.x, this.player.y);
    this.ctx.fill();

    // Draw crypto scammers (bad actors)
    this.ghosts.forEach(ghost => {
      this.ctx.fillStyle = ghost.vulnerable ? '#00ff00' : '#ff0000';
      
      // Scammer body (robot-like)
      this.ctx.fillRect(ghost.x - 15, ghost.y - 15, 30, 30);
      
      // Scammer head
      this.ctx.fillStyle = ghost.vulnerable ? '#00aa00' : '#aa0000';
      this.ctx.fillRect(ghost.x - 12, ghost.y - 20, 24, 10);
      
      // Eyes (glowing)
      this.ctx.fillStyle = ghost.vulnerable ? '#ffffff' : '#ffff00';
      this.ctx.fillRect(ghost.x - 8, ghost.y - 18, 4, 4);
      this.ctx.fillRect(ghost.x + 4, ghost.y - 18, 4, 4);
      
      // Add warning symbol
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = '12px monospace';
      this.ctx.fillText('⚠', ghost.x - 6, ghost.y + 5);
    });

    // Draw UI
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    this.ctx.fillText(`Level: ${this.level}`, 150, 25);
    this.ctx.fillText(`Lives: ${this.lives}`, 250, 25);
    
    // Add dots remaining counter
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillText(`Bitcoin Left: ${this.dots.length}`, 10, 50);
    
    if (this.vulnerableTimer > 0) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillText(`Power Mode: ${Math.ceil(this.vulnerableTimer / 60)}s`, 10, 75);
    }
    } catch (error) {
      console.error('Error in PacMan render:', error);
    }
  }
}

