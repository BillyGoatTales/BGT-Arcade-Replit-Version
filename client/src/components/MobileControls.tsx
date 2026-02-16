import React from 'react';

interface MobileControlsProps {
  gameType: 'galaga' | 'pacman' | 'frogger';
  onButtonPress: (action: string) => void;
  onButtonRelease: (action: string) => void;
}

export default function MobileControls({ gameType, onButtonPress, onButtonRelease }: MobileControlsProps) {
  const handleTouchStart = (action: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    onButtonPress(action);
  };

  const handleTouchEnd = (action: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    onButtonRelease(action);
  };

  if (gameType === 'galaga') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {/* Movement Controls */}
          <div className="flex space-x-2">
            <button
              className="w-16 h-16 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg flex items-center justify-center text-neon-cyan font-bold active:bg-neon-cyan/40 touch-manipulation"
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              onMouseDown={() => onButtonPress('left')}
              onMouseUp={() => onButtonRelease('left')}
            >
              ←
            </button>
            <button
              className="w-16 h-16 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg flex items-center justify-center text-neon-cyan font-bold active:bg-neon-cyan/40 touch-manipulation"
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              onMouseDown={() => onButtonPress('right')}
              onMouseUp={() => onButtonRelease('right')}
            >
              →
            </button>
          </div>
          
          {/* Shoot Button */}
          <button
            className="w-20 h-20 bg-electric-orange/20 border-2 border-electric-orange rounded-full flex items-center justify-center text-electric-orange font-bold text-xl active:bg-electric-orange/40 touch-manipulation"
            onTouchStart={handleTouchStart('shoot')}
            onTouchEnd={handleTouchEnd('shoot')}
            onMouseDown={() => onButtonPress('shoot')}
            onMouseUp={() => onButtonRelease('shoot')}
          >
            FIRE
          </button>
        </div>
      </div>
    );
  }

  if (gameType === 'pacman') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          {/* D-Pad Controls */}
          <div className="relative w-32 h-32">
            {/* Up */}
            <button
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-neon-yellow/30 border-4 border-neon-yellow rounded-xl flex items-center justify-center text-neon-yellow font-bold active:bg-neon-yellow/60 touch-manipulation text-4xl select-none shadow-lg"
              style={{ 
                touchAction: 'manipulation', 
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Up pressed - ENHANCED');
                onButtonPress('up');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Up released - ENHANCED');
                onButtonRelease('up');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                console.log('Mouse: Pac-Man Up pressed');
                onButtonPress('up');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                onButtonRelease('up');
              }}
            >
              ↑
            </button>
            
            {/* Left */}
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-neon-yellow/30 border-4 border-neon-yellow rounded-xl flex items-center justify-center text-neon-yellow font-bold active:bg-neon-yellow/60 touch-manipulation text-4xl select-none shadow-lg"
              style={{ 
                touchAction: 'manipulation', 
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Left pressed - ENHANCED');
                onButtonPress('left');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Left released - ENHANCED');
                onButtonRelease('left');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                console.log('Mouse: Pac-Man Left pressed');
                onButtonPress('left');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                onButtonRelease('left');
              }}
            >
              ←
            </button>
            
            {/* Right */}
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-neon-yellow/30 border-4 border-neon-yellow rounded-xl flex items-center justify-center text-neon-yellow font-bold active:bg-neon-yellow/60 touch-manipulation text-4xl select-none shadow-lg"
              style={{ 
                touchAction: 'manipulation', 
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Right pressed - ENHANCED');
                onButtonPress('right');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Right released - ENHANCED');
                onButtonRelease('right');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                console.log('Mouse: Pac-Man Right pressed');
                onButtonPress('right');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                onButtonRelease('right');
              }}
            >
              →
            </button>
            
            {/* Down */}
            <button
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-neon-yellow/30 border-4 border-neon-yellow rounded-xl flex items-center justify-center text-neon-yellow font-bold active:bg-neon-yellow/60 touch-manipulation text-4xl select-none shadow-lg"
              style={{ 
                touchAction: 'manipulation', 
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Down pressed - ENHANCED');
                onButtonPress('down');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Mobile: Pac-Man Down released - ENHANCED');
                onButtonRelease('down');
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                console.log('Mouse: Pac-Man Down pressed');
                onButtonPress('down');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                onButtonRelease('down');
              }}
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameType === 'frogger') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex justify-center items-center max-w-sm mx-auto">
          {/* D-Pad Controls */}
          <div className="relative w-32 h-32">
            {/* Up (Primary movement) */}
            <button
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-neon-green/20 border-2 border-neon-green rounded-lg flex items-center justify-center text-neon-green font-bold text-xl active:bg-neon-green/40 touch-manipulation"
              onTouchStart={handleTouchStart('up')}
              onTouchEnd={handleTouchEnd('up')}
              onMouseDown={() => onButtonPress('up')}
              onMouseUp={() => onButtonRelease('up')}
            >
              ↑
            </button>
            
            {/* Left */}
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-neon-magenta/20 border-2 border-neon-magenta rounded-lg flex items-center justify-center text-neon-magenta font-bold active:bg-neon-magenta/40 touch-manipulation"
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              onMouseDown={() => onButtonPress('left')}
              onMouseUp={() => onButtonRelease('left')}
            >
              ←
            </button>
            
            {/* Right */}
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-neon-magenta/20 border-2 border-neon-magenta rounded-lg flex items-center justify-center text-neon-magenta font-bold active:bg-neon-magenta/40 touch-manipulation"
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              onMouseDown={() => onButtonPress('right')}
              onMouseUp={() => onButtonRelease('right')}
            >
              →
            </button>
            
            {/* Down */}
            <button
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg flex items-center justify-center text-neon-cyan font-bold active:bg-neon-cyan/40 touch-manipulation"
              onTouchStart={handleTouchStart('down')}
              onTouchEnd={handleTouchEnd('down')}
              onMouseDown={() => onButtonPress('down')}
              onMouseUp={() => onButtonRelease('down')}
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}