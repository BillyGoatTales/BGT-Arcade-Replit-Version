import { GameEngine } from "./GameEngine";

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
  isPlayerBullet: boolean;
}

interface Enemy {
  x: number;
  y: number;
  type: 'basic' | 'fighter' | 'boss';
  health: number;
  points: number;
  speed: number;
  shootTimer: number;
}

interface Explosion {
  x: number;
  y: number;
  timer: number;
}

export class GalagaGame extends GameEngine {
  private player: Position = { x: 400, y: 550 };
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private explosions: Explosion[] = [];
  private playerSpeed: number = 4;
  private bulletSpeed: number = 7;
  private enemyBulletSpeed: number = 1.5;
  private shootCooldown: number = 0;
  private readonly shootCooldownMax: number = 15; // Increased from default to make auto-fire harder
  private wave: number = 1;
  private enemiesKilled: number = 0;
  private lives: number = 5;
  private invulnerabilityTimer: number = 0;
  private waveTimer: number = 3600; // 60 seconds per wave (doubled from 30)
  private maxWaveTime: number = 3600;
  private waveObjective: number = 15; // Kill 15 enemies to advance
  private audioContext: AudioContext | null = null;
  private gameState: 'playing' | 'gameover' | 'paused' = 'playing';

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    super(canvas, ctx);
    console.log('GalagaGame constructor called - Canvas:', canvas.width, 'x', canvas.height);
    
    try {
      this.initializeAudio();
      this.initializeWave();
      console.log('GalagaGame initialized successfully');
      
      // Force immediate render to test
      this.forceRender();
      
    } catch (error) {
      console.error('GalagaGame initialization error:', error);
      // Initialize without audio if it fails
      this.initializeWave();
      this.forceRender();
    }
  }

  private forceRender() {
    console.log('Force rendering GalagaGame...');
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillRect(50, 50, 100, 100);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Galaga Ready!', 55, 100);
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio not available');
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

  private initializeWave() {
    this.enemies = [];
    this.enemiesKilled = 0;
    this.waveTimer = this.maxWaveTime;
    this.waveObjective = Math.max(8, 6 + this.wave * 2); // Increasing objective each wave
    this.spawnInitialEnemies();
    console.log(`Bitcoin Defender: Wave ${this.wave} - Eliminate ${this.waveObjective} threats within ${Math.ceil(this.maxWaveTime/60)} seconds!`);
  }

  private spawnInitialEnemies() {
    const initialCount = Math.min(5 + this.wave, 8); // Start with 5, max 8 enemies initially
    
    for (let i = 0; i < initialCount; i++) {
      this.spawnRandomEnemy();
    }
  }

  private spawnRandomEnemy() {
    // Balanced enemy distribution
    let type: 'basic' | 'fighter' | 'boss';
    if (this.wave === 1) {
      type = 'basic'; // Only basic enemies for wave 1
    } else if (this.wave <= 3) {
      type = Math.random() < 0.7 ? 'basic' : 'fighter'; // Mostly basic, some fighters
    } else {
      const rand = Math.random();
      if (rand < 0.5) type = 'basic';
      else if (rand < 0.85) type = 'fighter';
      else type = 'boss';
    }
    
    const enemy: Enemy = {
      x: Math.random() * (this.canvas.width - 40),
      y: -50 - Math.random() * 100,
      type: type,
      health: type === 'boss' ? 3 : type === 'fighter' ? 2 : 1,
      points: type === 'boss' ? 300 : type === 'fighter' ? 200 : 100,
      speed: Math.max(0.5, 0.4 + (this.wave * 0.15)), // Faster progression
      shootTimer: Math.random() * 250 + 100
    };
    
    this.enemies.push(enemy);
  }

  protected update() {
    this.updatePlayer();
    this.updateBullets();
    this.updateEnemies();
    this.updateExplosions();
    this.checkCollisions();
    
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
    
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer--;
    }
    
    // Update wave timer
    this.waveTimer--;
    
    // Check wave completion conditions
    if (this.enemiesKilled >= this.waveObjective) {
      console.log(`Bitcoin Defender: Wave ${this.wave} completed! Advancing to next wave.`);
      this.nextWave();
    } else if (this.waveTimer <= 0) {
      // Timer expired - lose a life and restart wave
      this.handleTimerFailure();
    }
    
    // Check game over
    if (this.lives <= 0) {
      console.log("Bitcoin Defender: Game Over - Lives: 0, Final Score:", this.score, "Wave:", this.wave);
      this.endGame();
    }
  }

  private updatePlayer() {
    // Normalized key handling for consistency across all games
    const leftPressed = this.keys.has('arrowleft') || this.keys.has('a') || this.touchControls.has('left');
    const rightPressed = this.keys.has('arrowright') || this.keys.has('d') || this.touchControls.has('right');
    const upPressed = this.keys.has('arrowup') || this.keys.has('w') || this.touchControls.has('up');
    const downPressed = this.keys.has('arrowdown') || this.keys.has('s') || this.touchControls.has('down');
    const shootPressed = this.keys.has(' ') || this.keys.has('spacebar') || this.touchControls.has('shoot');
    
    // Enhanced movement with proper speed control
    if (leftPressed) {
      this.player.x = Math.max(25, this.player.x - this.playerSpeed);
    }
    if (rightPressed) {
      this.player.x = Math.min(this.canvas.width - 25, this.player.x + this.playerSpeed);
    }
    if (upPressed) {
      this.player.y = Math.max(25, this.player.y - this.playerSpeed * 0.7); // Allow vertical movement but slower
    }
    if (downPressed) {
      this.player.y = Math.min(this.canvas.height - 25, this.player.y + this.playerSpeed * 0.7);
    }
    
    // Enhanced shooting with bullet management
    if (shootPressed && this.shootCooldown === 0) {
      // Limit bullets on screen to prevent lag and maintain challenge
      const playerBullets = this.bullets.filter(b => b.isPlayerBullet).length;
      if (playerBullets < 10) { // Max 10 player bullets on screen
        this.bullets.push({
          x: this.player.x,
          y: this.player.y - 15,
          speed: -this.bulletSpeed,
          isPlayerBullet: true
        });
        this.shootCooldown = this.shootCooldownMax;
        this.playSound(440, 0.1, 'square');
      }
      this.playSound(440, 0.1);
    }
  }

  private updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bullet.speed;
      
      // Remove bullets that are off screen
      return bullet.y > -10 && bullet.y < this.canvas.height + 10;
    });
  }

  private updateEnemies() {
    // More challenging enemy spawning
    const maxEnemies = Math.min(6 + this.wave, 12); // Start with 6, max 12 enemies
    if (this.enemies.length < maxEnemies) {
      const spawnChance = this.wave === 1 ? 0.015 : 0.025; // Faster spawn after wave 1
      if (Math.random() < spawnChance) {
        this.spawnRandomEnemy();
      }
    }
    
    this.enemies.forEach(enemy => {
      // More dynamic movement patterns
      enemy.x += Math.sin(Date.now() * 0.0008 + enemy.x * 0.01) * enemy.speed * 0.7;
      enemy.y += enemy.speed * 0.6; // Faster descent
      
      // Reset enemy position when off screen
      if (enemy.y > this.canvas.height + 50) {
        enemy.y = -50 - Math.random() * 100;
        enemy.x = Math.random() * (this.canvas.width - 40);
        enemy.health = enemy.type === 'boss' ? 3 : enemy.type === 'fighter' ? 2 : 1;
      }
      
      // More aggressive shooting patterns
      enemy.shootTimer--;
      if (enemy.shootTimer <= 0) {
        let shootChance;
        if (this.wave === 1) {
          shootChance = enemy.type === 'basic' ? 0.03 : 0.05; // Gentle start
        } else {
          shootChance = enemy.type === 'boss' ? 0.25 : enemy.type === 'fighter' ? 0.15 : 0.08;
        }
        
        if (Math.random() < shootChance) {
          this.bullets.push({
            x: enemy.x + 20,
            y: enemy.y + 40,
            speed: this.enemyBulletSpeed + (this.wave > 2 ? 0.3 : 0),
            isPlayerBullet: false
          });
          this.playSound(150, 0.1);
        }
        enemy.shootTimer = Math.random() * 180 + 80;
      }
    });
  }

  private updateExplosions() {
    this.explosions = this.explosions.filter(explosion => {
      explosion.timer--;
      return explosion.timer > 0;
    });
  }

  private checkCollisions() {
    // Player bullets vs enemies
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet.isPlayerBullet) continue;
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const distance = Math.sqrt(
          Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
        );
        
        if (distance < 25) {
          enemy.health--;
          this.bullets.splice(i, 1);
          
          if (enemy.health <= 0) {
            this.updateScore(this.score + enemy.points);
            this.enemiesKilled++;
            this.explosions.push({
              x: enemy.x,
              y: enemy.y,
              timer: 20
            });
            this.enemies.splice(j, 1);
            this.playSound(400, 0.2, 'sine'); // Enemy destroyed sound
          }
          break;
        }
      }
    }
    
    // Enemy bullets vs player (with proper collision detection)
    if (this.invulnerabilityTimer <= 0) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        if (bullet.isPlayerBullet) continue;
        
        // Proper collision detection with player hitbox
        if (bullet.x >= this.player.x - 15 && bullet.x <= this.player.x + 15 &&
            bullet.y >= this.player.y - 15 && bullet.y <= this.player.y + 15) {
          
          this.bullets.splice(i, 1);
          this.lives--;
          this.invulnerabilityTimer = 90; // 1.5 seconds of invulnerability
          
          this.explosions.push({
            x: this.player.x,
            y: this.player.y,
            timer: 30
          });
          
          this.playSound(300, 0.3, 'sawtooth');
          
          // Brief screen flash effect
          setTimeout(() => {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height - 50;
          }, 100);
          break;
        }
      }
    }
  }

  private nextWave() {
    // Wave completion bonus based on time remaining
    const timeBonus = Math.floor(this.waveTimer / 10) * 50;
    this.updateScore(this.score + 500 * this.wave + timeBonus);
    
    this.wave++;
    this.updateLevel(this.wave);
    
    // Gradually increase difficulty
    if (this.wave % 2 === 0) {
      this.enemyBulletSpeed = Math.min(this.enemyBulletSpeed + 0.25, 3.0);
      this.playerSpeed = Math.min(this.playerSpeed + 0.1, 6);
      this.maxWaveTime = Math.max(2400, this.maxWaveTime - 300); // Reduce time as waves progress, minimum 40 seconds
    }
    
    this.playSound(800, 0.4, 'sine'); // Wave complete sound
    this.initializeWave();
  }

  private handleTimerFailure() {
    // Player failed to complete wave objective in time - lose a life
    this.lives--;
    this.invulnerabilityTimer = 120; // 2 seconds of invulnerability
    
    if (this.lives <= 0) {
      console.log(`Bitcoin Defender: Game Over - Lives: ${this.lives}, Final Score:`, this.score, "Wave:", this.wave);
      this.gameState = 'gameover';
      this.onGameEnd(this.score, this.level);
      return;
    }
    
    // Reset wave timer but keep same wave (restart from failure point)
    this.waveTimer = this.maxWaveTime;
    this.enemiesKilled = 0;
    
    // Clear existing enemies and enemy bullets, but keep player bullets
    this.enemies = [];
    this.bullets = this.bullets.filter(b => b.isPlayerBullet);
    
    console.log(`Bitcoin Defender: Time's up! Lost a life. Lives remaining: ${this.lives}. Restarting Wave ${this.wave}`);
    this.spawnInitialEnemies();
    this.playSound(200, 0.5); // Lower, longer sound for failure
  }

  protected render() {
    try {
      if (!this.running) return;
    
      // Clear canvas with space background
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#000011';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw digital matrix background with crypto symbols
      for (let i = 0; i < 30; i++) {
        const x = (i * 47) % this.canvas.width;
        const y = (i * 31) % this.canvas.height;
        
        // Alternating crypto symbols
        const symbols = ['₿', 'Ξ', '◊', '⟐'];
        const symbol = symbols[i % symbols.length];
        
        this.ctx.fillStyle = `rgba(0, 255, 100, 0.15)`;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(symbol, x, y);
      }
      
      // Add moving digital rain effect
      const time = Date.now() * 0.001;
      for (let i = 0; i < 15; i++) {
        const x = (i * 53) % this.canvas.width;
        const y = ((time * 50 + i * 30) % (this.canvas.height + 50)) - 50;
        
        this.ctx.fillStyle = `rgba(0, 255, 0, 0.3)`;
        this.ctx.font = '10px monospace';
        this.ctx.fillText('0', x, y);
        this.ctx.fillText('1', x, y + 15);
      }

      // Draw player ship as Bitcoin symbol
      this.ctx.fillStyle = this.invulnerabilityTimer > 0 && 
                           Math.floor(this.invulnerabilityTimer / 5) % 2 ? 
                           'rgba(255, 165, 0, 0.5)' : '#f7931a'; // Bitcoin orange
      
      // Draw Bitcoin ₿ symbol
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('₿', this.player.x, this.player.y + 8);

      // Draw bullets as crypto symbols
      this.bullets.forEach(bullet => {
        if (bullet.isPlayerBullet) {
          // Player bullets as golden coins
          this.ctx.fillStyle = '#ffd700';
          this.ctx.beginPath();
          this.ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Add sparkle effect
          this.ctx.fillStyle = '#ffff88';
          this.ctx.beginPath();
          this.ctx.arc(bullet.x - 1, bullet.y - 1, 1, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          // Enemy bullets as red virus/malware symbols
          this.ctx.fillStyle = '#ff0000';
          this.ctx.font = 'bold 12px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('⚠', bullet.x, bullet.y + 4);
        }
      });

      // Draw enemies as crypto threats
      this.enemies.forEach(enemy => {
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        
        if (enemy.type === 'basic') {
          // Basic threats as red malware
          this.ctx.fillStyle = '#ff4444';
          this.ctx.fillText('🦠', enemy.x, enemy.y + 6);
        } else if (enemy.type === 'fighter') {
          // Fighters as purple hackers
          this.ctx.fillStyle = '#aa44ff';
          this.ctx.fillText('💀', enemy.x, enemy.y + 6);
        } else {
          // Bosses as dark red mega threats
          this.ctx.fillStyle = '#cc0000';
          this.ctx.font = 'bold 24px Arial';
          this.ctx.fillText('👾', enemy.x, enemy.y + 8);
        }
        
        // Add health indicator for multi-hit enemies
        if (enemy.health > 1) {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 10px Arial';
          this.ctx.fillText(enemy.health.toString(), enemy.x + 12, enemy.y - 8);
        }
      });

      // Draw explosions with crypto effects
      this.explosions.forEach(explosion => {
        const alpha = explosion.timer / 30;
        const size = 40 - (explosion.timer * 1.5);
        
        // Golden explosion effect
        this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner bright core
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, size / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sparkle particles
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const particleX = explosion.x + Math.cos(angle) * size / 3;
          const particleY = explosion.y + Math.sin(angle) * size / 3;
          
          this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });

      // Draw crypto-themed UI
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`💰 Score: ${this.score.toLocaleString()}`, 10, 30);
      this.ctx.fillText(`🌊 Wave: ${this.wave}`, 10, 55);
      this.ctx.fillText(`💎 Lives: ${this.lives}`, 10, 80);
      this.ctx.fillText(`🎯 Threats: ${this.enemiesKilled}/${this.waveObjective}`, 10, 105);
      this.ctx.fillText(`⏰ Time: ${Math.ceil(this.waveTimer / 60)}s`, 10, 130);
      
      // Add crypto security status
      const securityLevel = Math.max(0, 100 - (this.wave * 5));
      this.ctx.fillStyle = securityLevel > 70 ? '#00ff00' : securityLevel > 30 ? '#ffaa00' : '#ff4444';
      this.ctx.fillText(`🔒 Security: ${securityLevel}%`, 10, 155);
      
      // Draw Bitcoin lives indicator
      for (let i = 0; i < this.lives; i++) {
        const x = this.canvas.width - 80 + i * 25;
        const y = 25;
        
        this.ctx.fillStyle = '#f7931a';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('₿', x, y);
        
        // Add glow effect
        this.ctx.shadowColor = '#ffa500';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText('₿', x, y);
        this.ctx.shadowBlur = 0;
      }
    } catch (error) {
      console.error('GalagaGame render error:', error);
    }
  }
}
