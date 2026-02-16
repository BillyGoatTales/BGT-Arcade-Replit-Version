import { useEffect, useRef, useState } from "react";
import { SimplePacManGame } from "@/games/SimplePacManGame";
import { GalagaGame } from "@/games/GalagaGame";
import { FroggerGame } from "@/games/FroggerGame";
import MobileControls from "./MobileControls";
import JoystickController from "./JoystickController";

interface GameCanvasProps {
  gameSlug: string;
  onScoreChange: (score: number) => void;
  onLevelChange: (level: number) => void;
  onGameEnd: (score: number, level: number) => void;
  gameState: 'menu' | 'playing' | 'paused' | 'gameover';
}

export default function GameCanvas({ 
  gameSlug, 
  onScoreChange, 
  onLevelChange, 
  onGameEnd, 
  gameState 
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set responsive canvas size optimized for mobile
    if (isMobile) {
      // For mobile, optimize for smaller screens while maintaining playability
      const availableWidth = Math.min(window.innerWidth - 20, 380);
      const availableHeight = Math.min(window.innerHeight * 0.5, 285); // 50% of screen height max
      
      // Use 4:3 aspect ratio for better mobile gaming
      canvas.width = availableWidth;
      canvas.height = Math.min(availableHeight, (canvas.width * 3) / 4);
      
      // Ensure minimum playable size
      if (canvas.width < 320) {
        canvas.width = 320;
        canvas.height = 240;
      }
    } else {
      canvas.width = 800;
      canvas.height = 600;
    }

    // Initialize the appropriate game
    try {
      console.log('Initializing game:', gameSlug, 'Canvas:', canvas.width, 'x', canvas.height);
      
      // Clear canvas and draw test pattern
      ctx.fillStyle = '#222222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(10, 10, 100, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText('Initializing ' + gameSlug, 20, 35);
      
      // Map game slugs correctly to their engines
      switch (gameSlug) {
        case 'crypto-collector':
          gameRef.current = new SimplePacManGame(canvas, ctx);
          break;
        case 'bitcoin-defender':
          gameRef.current = new GalagaGame(canvas, ctx);
          break;
        case 'defi-runner':
          gameRef.current = new FroggerGame(canvas, ctx);
          break;
        default:
          gameRef.current = new SimplePacManGame(canvas, ctx);
      }

      // Set up callbacks
      gameRef.current.onScoreChange = onScoreChange;
      gameRef.current.onLevelChange = onLevelChange;
      gameRef.current.onGameEnd = onGameEnd;
      
      console.log('Game initialized successfully:', gameRef.current);
      
      // Auto start the game for testing
      setTimeout(() => {
        if (gameRef.current && gameState === 'playing') {
          console.log('Auto-starting game...');
          gameRef.current.start();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Game initialization error:', error);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('Error: ' + error.message, 10, 50);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [gameSlug, isMobile]);

  useEffect(() => {
    if (!gameRef.current) return;

    try {
      console.log('Game state changed to:', gameState);
      if (gameState === 'playing') {
        console.log('Starting game:', gameSlug);
        gameRef.current.start();
      } else if (gameState === 'paused') {
        gameRef.current.pause();
      } else if (gameState === 'gameover') {
        gameRef.current.stop();
      }
    } catch (error) {
      console.error('Game state error:', error);
    }
  }, [gameState]);

  // Force initial render when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw test pattern immediately
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Canvas Test - Billy Goat Arcade', 50, 50);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(50, 70, 100, 50);
    
    console.log('Canvas test render completed');
  }, []);

  const getControlType = (): 'galaga' | 'pacman' | 'frogger' => {
    console.log('GameCanvas: Determining control type for gameSlug:', gameSlug);
    if (gameSlug === 'bitcoin-defender') {
      console.log('GameCanvas: Using galaga controls');
      return 'galaga';
    }
    if (gameSlug === 'defi-runner') {
      console.log('GameCanvas: Using frogger controls');
      return 'frogger';
    }
    if (gameSlug === 'crypto-collector') {
      console.log('GameCanvas: Using pacman controls for crypto-collector');
      return 'pacman';
    }
    console.log('GameCanvas: Using pacman controls (default)');
    return 'pacman';
  };

  const handleMobilePress = (action: string) => {
    console.log('GameCanvas: Mobile press forwarding -', action);
    if (gameRef.current) {
      gameRef.current.handleMobilePress(action);
      console.log('GameCanvas: Forwarded to game engine');
    } else {
      console.log('GameCanvas: No game reference available');
    }
  };

  const handleMobileRelease = (action: string) => {
    console.log('GameCanvas: Mobile release forwarding -', action);
    if (gameRef.current) {
      gameRef.current.handleMobileRelease(action);
      console.log('GameCanvas: Forwarded release to game engine');
    } else {
      console.log('GameCanvas: No game reference available for release');
    }
  };

  const handleJoystickDirection = (direction: 'up' | 'down' | 'left' | 'right' | null) => {
    if (!gameRef.current) {
      console.log('GameCanvas: No game reference for joystick');
      return;
    }
    
    console.log('GameCanvas: Joystick direction changed to -', direction);
    
    // Direct method - set the player direction immediately
    if (gameRef.current.setPlayerDirection) {
      gameRef.current.setPlayerDirection(direction);
      console.log('GameCanvas: Called setPlayerDirection with -', direction);
    } else {
      console.log('GameCanvas: setPlayerDirection method not available');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      <canvas
        ref={canvasRef}
        className="border-2 sm:border-4 border-neon-cyan rounded-lg bg-black shadow-lg shadow-neon-cyan/50"
        style={{ 
          imageRendering: 'pixelated', 
          maxWidth: '100vw', 
          maxHeight: '70vh',
          width: 'auto',
          height: 'auto',
          display: 'block'
        }}
      />
      
      {/* Joystick Controller for Pac-Man */}
      {isMobile && gameRef.current && gameState === 'playing' && gameSlug === 'crypto-collector' && (
        <>
          {console.log('GameCanvas: Rendering joystick for', gameSlug, 'Mobile:', isMobile, 'GameState:', gameState)}
          <JoystickController onDirectionChange={handleJoystickDirection} />
        </>
      )}
      
      {/* Traditional Mobile Controls for other games */}
      {isMobile && gameRef.current && gameState === 'playing' && gameSlug !== 'crypto-collector' && (
        <MobileControls
          gameType={getControlType()}
          onButtonPress={handleMobilePress}
          onButtonRelease={handleMobileRelease}
        />
      )}
      
      {/* Mobile Instructions */}
      {isMobile && gameState === 'playing' && (
        <div className="mt-2 bg-black/80 border border-neon-cyan/50 rounded p-2 text-center">
          <p className="text-neon-cyan text-xs">
            {gameSlug === 'crypto-collector' 
              ? 'Use the joystick in the bottom left to move Pac-Man'
              : 'Use controls below to play'
            }
          </p>
        </div>
      )}
    </div>
  );
}
