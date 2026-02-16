import React, { useRef, useEffect, useState } from 'react';

interface JoystickControllerProps {
  onDirectionChange: (direction: 'up' | 'down' | 'left' | 'right' | null) => void;
  size?: number;
}

export default function JoystickController({ onDirectionChange, size = 120 }: JoystickControllerProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  useEffect(() => {
    console.log('JoystickController: Component mounted and ready');
  }, []);

  const calculateDirection = (centerX: number, centerY: number, touchX: number, touchY: number) => {
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Minimum distance threshold to register direction
    if (distance < 20) {
      return null;
    }
    
    // Determine primary direction based on angle
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    if (angle >= -45 && angle < 45) return 'right';
    if (angle >= 45 && angle < 135) return 'down';
    if (angle >= 135 || angle < -135) return 'left';
    if (angle >= -135 && angle < -45) return 'up';
    
    return null;
  };

  const updateKnobPosition = (centerX: number, centerY: number, touchX: number, touchY: number) => {
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = size / 2 - 20; // Keep knob within bounds
    
    let knobX = deltaX;
    let knobY = deltaY;
    
    if (distance > maxDistance) {
      knobX = (deltaX / distance) * maxDistance;
      knobY = (deltaY / distance) * maxDistance;
    }
    
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }
  };

  const resetKnob = () => {
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    
    setIsDragging(true);
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const direction = calculateDirection(centerX, centerY, clientX, clientY);
    setCurrentDirection(direction);
    onDirectionChange(direction);
    
    updateKnobPosition(centerX, centerY, clientX, clientY);
    
    console.log('Joystick: Direction detected -', direction);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const direction = calculateDirection(centerX, centerY, clientX, clientY);
    
    if (direction !== currentDirection) {
      setCurrentDirection(direction);
      onDirectionChange(direction);
      console.log('Joystick: Direction changed to -', direction);
    }
    
    updateKnobPosition(centerX, centerY, clientX, clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setCurrentDirection(null);
    onDirectionChange(null);
    resetKnob();
    console.log('Joystick: Released');
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, currentDirection]);

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <div
        ref={joystickRef}
        className="relative bg-black/60 border-4 border-neon-cyan rounded-full shadow-2xl"
        style={{
          width: size,
          height: size,
          touchAction: 'none',
          userSelect: 'none',
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleStart(touch.clientX, touch.clientY);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientX, e.clientY);
        }}
      >
        {/* Joystick base with direction indicators */}
        <div className="absolute inset-2 rounded-full border-2 border-neon-cyan/30">
          {/* Direction indicators */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-neon-cyan text-xs">↑</div>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-neon-cyan text-xs">↓</div>
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-neon-cyan text-xs">←</div>
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-neon-cyan text-xs">→</div>
        </div>
        
        {/* Moveable knob */}
        <div
          ref={knobRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-neon-yellow border-2 border-neon-yellow rounded-full shadow-lg transition-none"
          style={{
            pointerEvents: 'none',
            background: currentDirection 
              ? 'radial-gradient(circle, #ffd700, #ffed4e)' 
              : 'radial-gradient(circle, #ffd700, #b8860b)',
          }}
        />
      </div>
      
      {/* Joystick label */}
      <div className="text-center mt-2">
        <span className="text-neon-cyan text-xs font-pixel">MOVE</span>
      </div>
    </div>
  );
}