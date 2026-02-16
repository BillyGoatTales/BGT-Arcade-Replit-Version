import { GameEngine } from "./GameEngine";
import { MusicEngine } from "./MusicEngine";

interface Position {
  x: number;
  y: number;
}

interface MovingObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'car' | 'truck' | 'log' | 'turtle';
  color: string;
}

interface Lane {
  y: number;
  objects: MovingObject[];
  type: 'road' | 'water' | 'safe';
  direction: number; // 1 for right, -1 for left
}

export class FroggerGame extends GameEngine {
  private player: Position = { x: 400, y: 550 };
  private playerSize: number = 30;
  private lanes: Lane[] = [];
  private laneHeight: number = 50;
  private lives: number = 8;
  private timeLeft: number = 3600;
  private maxTime: number = 3600;
  private safeZones: Position[] = [];
  private completedZones: boolean[] = [];
  private onWater: boolean = false;
  private currentLog: MovingObject | null = null;
  private audioContext: AudioContext | null = null;
  private musicEngine: any;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super(canvas, ctx);
    console.log('FroggerGame constructor called - Canvas:', canvas.width, 'x', canvas.height);
    
    try {
      this.musicEngine = new MusicEngine();
      this.initializeAudio();
      this.initializeLevel();
      this.startBackgroundMusic();
      console.log(`DeFi Runner: Level ${this.level} - Navigate DeFi protocols safely!`);
      
      // Force immediate render to test
      this.forceRender();
      
    } catch (error) {
      console.error('FroggerGame initialization error:', error);
      this.forceRender();
    }
  }

  private forceRender() {
    console.log('Force rendering FroggerGame...');
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(100, 100, 100, 100);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Frogger Ready!', 105, 150);
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio not available');
    }
  }

  private startBackgroundMusic() {
    if (this.musicEngine) {
      this.musicEngine.playBackgroundMusic('defi');
    }
  }

  public destroy() {
    super.destroy();
    if (this.musicEngine) {
      this.musicEngine.stopBackgroundMusic();
    }
  }

  private playSound(frequency: number, duration: number, type: OscillatorType = 'square') {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private initializeLevel() {
    this.lanes = [];
    this.safeZones = [];
    this.completedZones = [false, false, false, false, false];
    this.player = { x: this.canvas.width / 2, y: this.canvas.height - 25 };
    this.timeLeft = this.maxTime;
    
    const numLanes = Math.floor(this.canvas.height / this.laneHeight);
    
    for (let i = 0; i < numLanes; i++) {
      const y = this.canvas.height - (i + 1) * this.laneHeight;
      let laneType: 'road' | 'water' | 'safe' = 'safe';
      
      if (i === 0 || i === numLanes - 1) {
        laneType = 'safe'; // Start and end zones
      } else if (i >= 2 && i <= 5) {
        laneType = 'road'; // Road section
      } else if (i >= 7 && i <= 10) {
        laneType = 'water'; // Water section
      } else if (i === 6) {
        laneType = 'safe'; // Middle safe zone
      }
      
      const lane: Lane = {
        y: y,
        objects: [],
        type: laneType,
        direction: i % 2 === 0 ? 1 : -1
      };
      
      // Add objects to lanes
      if (laneType === 'road') {
        this.addRoadObjects(lane, i);
      } else if (laneType === 'water') {
        this.addWaterObjects(lane, i);
      }
      
      this.lanes.push(lane);
    }
    
    // Add safe zones at the top
    for (let i = 0; i < 5; i++) {
      this.safeZones.push({
        x: 50 + i * 140,
        y: this.laneHeight / 2
      });
    }
  }

  private addRoadObjects(lane: Lane, laneIndex: number) {
    const objectCount = 2 + Math.floor(Math.random() * 2); // Fewer objects
    const spacing = this.canvas.width / objectCount;
    
    for (let i = 0; i < objectCount; i++) {
      const isTruck = Math.random() < 0.3;
      const baseSpeed = 0.2 + Math.random() * 0.5; // Extremely slow for beginners
      const speed = baseSpeed * (1 + this.level * 0.02); // Minimal speed increase
      
      lane.objects.push({
        x: i * spacing + Math.random() * 150, // More spacing
        y: lane.y,
        width: isTruck ? 80 : 50,
        height: 35,
        speed: speed * lane.direction,
        type: isTruck ? 'truck' : 'car',
        color: isTruck ? '#ff4400' : ['#ff0000', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  private addWaterObjects(lane: Lane, laneIndex: number) {
    const objectCount = 2 + Math.floor(Math.random() * 2);
    const spacing = this.canvas.width / objectCount;
    
    for (let i = 0; i < objectCount; i++) {
      const isLog = Math.random() < 0.8; // More logs than turtles
      const baseSpeed = 0.2 + Math.random() * 0.4; // Extremely slow water objects
      const speed = baseSpeed * (1 + this.level * 0.01); // Minimal speed increase
      
      lane.objects.push({
        x: i * spacing + Math.random() * 100,
        y: lane.y,
        width: isLog ? 140 : 100, // Bigger platforms for easier gameplay
        height: 30,
        speed: speed * lane.direction,
        type: isLog ? 'log' : 'turtle',
        color: isLog ? '#8B4513' : '#228B22'
      });
    }
  }

  protected update() {
    this.updatePlayer();
    this.updateObjects();
    this.checkCollisions();
    this.updateTimer();
    
    // Check win condition
    if (this.completedZones.every(zone => zone)) {
      this.nextLevel();
    }
    
    // Check time up or lives lost
    if (this.timeLeft <= 0) {
      console.log("Crypto Collector: Time Up - Final Score:", this.score, "Level:", this.level);
      this.endGame();
    } else if (this.lives <= 0) {
      console.log("Crypto Collector: Lives Lost - Final Score:", this.score, "Level:", this.level);
      this.endGame();
    }
  }

  private moveCooldown: number = 0;

  private updatePlayer() {
    const oldX = this.player.x;
    const oldY = this.player.y;
    const moveDistance = this.laneHeight;
    
    // Reduce move cooldown
    if (this.moveCooldown > 0) {
      this.moveCooldown--;
    }
    
    let moved = false;
    
    // Only allow movement if cooldown is finished
    if (this.moveCooldown === 0) {
      if (this.keys.has('arrowup') || this.keys.has('w') || this.keys.has(' ') || this.keys.has('spacebar')) {
        this.player.y -= moveDistance;
        moved = true;
        this.moveCooldown = 35; // Much slower movement for beginners
      } else if (this.keys.has('arrowdown') || this.keys.has('s')) {
        this.player.y += moveDistance;
        moved = true;
        this.moveCooldown = 35;
      } else if (this.keys.has('arrowleft') || this.keys.has('a')) {
        this.player.x -= moveDistance;
        moved = true;
        this.moveCooldown = 35;
      } else if (this.keys.has('arrowright') || this.keys.has('d')) {
        this.player.x += moveDistance;
        moved = true;
        this.moveCooldown = 35;
      }
    }
    
    // Boundary checking
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.canvas.width - this.playerSize) {
      this.player.x = this.canvas.width - this.playerSize;
    }
    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y > this.canvas.height - this.playerSize) {
      this.player.y = this.canvas.height - this.playerSize;
    }
    
    // Check if player reached safe zone
    if (this.player.y < this.laneHeight * 2) {
      this.safeZones.forEach((zone, index) => {
        const distance = Math.abs(this.player.x - zone.x);
        if (distance < 50 && !this.completedZones[index]) {
          this.completedZones[index] = true;
          this.updateScore(this.score + 200);
          this.player = { x: this.canvas.width / 2, y: this.canvas.height - 25 };
          this.timeLeft = this.maxTime; // Reset timer
        }
      });
    }
    
    // Award points for forward movement
    if (moved && this.player.y < oldY) {
      this.updateScore(this.score + 10);
    }
  }

  private updateObjects() {
    this.onWater = false;
    this.currentLog = null;
    
    this.lanes.forEach(lane => {
      lane.objects.forEach(obj => {
        obj.x += obj.speed;
        
        // Wrap around screen
        if (obj.speed > 0 && obj.x > this.canvas.width + obj.width) {
          obj.x = -obj.width;
        } else if (obj.speed < 0 && obj.x < -obj.width) {
          obj.x = this.canvas.width;
        }
      });
    });
    
    // Check if player is on water lane
    const playerLane = this.lanes.find(lane => 
      this.player.y >= lane.y - this.laneHeight/2 && 
      this.player.y <= lane.y + this.laneHeight/2
    );
    
    if (playerLane && playerLane.type === 'water') {
      this.onWater = true;
      
      // Check if player is on a log or turtle
      const supportObject = playerLane.objects.find(obj => 
        this.player.x + this.playerSize > obj.x && 
        this.player.x < obj.x + obj.width &&
        this.player.y + this.playerSize > obj.y && 
        this.player.y < obj.y + obj.height
      );
      
      if (supportObject) {
        this.currentLog = supportObject;
        this.player.x += supportObject.speed; // Move with the object
        this.onWater = false; // Safe on log/turtle
      }
    }
  }

  private updateTimer() {
    this.timeLeft--;
  }

  private checkCollisions() {
    const playerLane = this.lanes.find(lane => 
      this.player.y >= lane.y - this.laneHeight/2 && 
      this.player.y <= lane.y + this.laneHeight/2
    );
    
    if (!playerLane) return;
    
    // Road collisions
    if (playerLane.type === 'road') {
      playerLane.objects.forEach(obj => {
        if (this.player.x + this.playerSize > obj.x && 
            this.player.x < obj.x + obj.width &&
            this.player.y + this.playerSize > obj.y && 
            this.player.y < obj.y + obj.height) {
          this.playerDied();
        }
      });
    }
    
    // Water drowning
    if (this.onWater) {
      this.playerDied();
    }
  }

  private playerDied() {
    this.lives--;
    this.player = { x: 400, y: 550 };
    this.playSound(200, 0.5, 'sawtooth');
    
    if (this.lives <= 0) {
      this.endGame();
    }
  }

  private nextLevel() {
    this.updateLevel(this.level + 1);
    this.updateScore(this.score + 500); // Level completion bonus
    this.lives++; // Bonus life for completing level
    this.lives = Math.min(this.lives, 8); // Cap at 8 lives
    
    this.player = { x: this.canvas.width / 2, y: this.canvas.height - 25 };
    this.timeLeft = this.maxTime;
    this.completedZones = new Array(5).fill(false);
    this.onWater = false;
    this.currentLog = null;
    
    // Progressive difficulty scaling - more balanced
    const difficultyIncrease = 1 + (this.level * 0.05); // 5% per level instead of 10%
    this.lanes.forEach(lane => {
      lane.objects.forEach(obj => {
        obj.speed *= difficultyIncrease;
      });
    });
    
    this.playSound(800, 0.3, 'sine');
    this.initializeLevel();
    console.log(`DeFi Runner: Level ${this.level} - Navigate DeFi protocols! Speed: ${Math.round(difficultyIncrease * 100)}%`);
  }

  protected render() {
    try {
      // Clear canvas with black background
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw lanes
      this.lanes.forEach((lane, index) => {
        if (lane.type === 'road') {
          this.ctx.fillStyle = '#333333';
        } else if (lane.type === 'water') {
          this.ctx.fillStyle = '#0066cc';
        } else {
          this.ctx.fillStyle = '#00cc66';
        }
        this.ctx.fillRect(0, lane.y, this.canvas.width, this.laneHeight);

        // Draw lane objects
        lane.objects.forEach(obj => {
          this.ctx.fillStyle = obj.color;
          this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        });
      });

      // Draw safe zones at top
      this.safeZones.forEach((zone, index) => {
        this.ctx.fillStyle = this.completedZones[index] ? '#00ff00' : '#ffff00';
        this.ctx.fillRect(zone.x, zone.y, this.playerSize, this.playerSize);
      });

      // Draw player (frog)
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(this.player.x, this.player.y, this.playerSize, this.playerSize);

      // Draw UI
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Arial';
      this.ctx.fillText(`Score: ${this.score}`, 10, 30);
      this.ctx.fillText(`Level: ${this.level}`, 10, 60);
      this.ctx.fillText(`Lives: ${this.lives}`, 10, 90);
      this.ctx.fillText(`Time: ${Math.ceil(this.timeLeft / 60)}`, 10, 120);
      
      this.ctx.strokeRect(10, 75, 200, 10);
      
      // Draw lives indicator
      for (let i = 0; i < this.lives; i++) {
        const x = this.canvas.width - 60 + i * 20;
        const y = 20;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x - 10, y - 10, 20, 20);
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px monospace';
        this.ctx.fillText('🐐', x - 8, y + 4);
      }
      
      // Draw progress indicator
      const completedCount = this.completedZones.filter(z => z).length;
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(`Goals: ${completedCount}/5`, this.canvas.width - 100, 50);
    } catch (error) {
      console.error('FroggerGame render error:', error);
    }
  }
}
