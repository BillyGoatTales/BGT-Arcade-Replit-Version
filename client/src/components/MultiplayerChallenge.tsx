import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Users, Crown, Trophy } from "lucide-react";

interface MultiplayerChallengeProps {
  gameSlug: string;
  gameName: string;
  onStartChallenge: (challengeId: string) => void;
}

export default function MultiplayerChallenge({ gameSlug, gameName, onStartChallenge }: MultiplayerChallengeProps) {
  const { user } = useAuth();
  const [challengeCode, setChallengeCode] = useState('');
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  const generateChallengeCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createChallenge = () => {
    const code = generateChallengeCode();
    setChallengeCode(code);
    setWaitingForOpponent(true);
    setShowCreateChallenge(false);
    
    // In a real implementation, this would connect to a WebSocket server
    // For now, we'll simulate the challenge creation
    onStartChallenge(code);
  };

  const joinChallenge = () => {
    if (challengeCode.length === 6) {
      onStartChallenge(challengeCode);
    }
  };

  // Check if user has premium access
  const hasPremiumAccess = (user as any)?.isPremium || false;

  if (!hasPremiumAccess) {
    return (
      <div className="bg-arcade-dark border border-neon-yellow/50 rounded-lg p-6">
        <div className="text-center">
          <Crown className="w-12 h-12 text-neon-yellow mx-auto mb-4" />
          <h3 className="font-pixel text-xl text-neon-yellow mb-2">PREMIUM FEATURE</h3>
          <p className="text-gray-300 font-retro mb-4">
            2-Player challenges are available with Premium subscription
          </p>
          <Button className="bg-neon-yellow text-black hover:bg-neon-cyan hover:text-white">
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6">
      <div className="text-center mb-6">
        <Users className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
        <h3 className="font-pixel text-xl text-neon-cyan mb-2">2-PLAYER CHALLENGE</h3>
        <p className="text-gray-300 font-retro">
          Challenge a friend to a head-to-head match in {gameName}!
        </p>
      </div>

      {!waitingForOpponent && !showCreateChallenge && (
        <div className="space-y-4">
          <Button 
            onClick={() => setShowCreateChallenge(true)}
            className="w-full bg-neon-green text-black hover:bg-neon-cyan hover:text-white font-pixel"
          >
            CREATE CHALLENGE
          </Button>
          
          <div className="text-center text-gray-400 font-retro">OR</div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter 6-digit challenge code"
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-midnight-blue border border-neon-cyan/50 text-white text-center font-pixel text-lg p-3 rounded"
            />
            <Button 
              onClick={joinChallenge}
              disabled={challengeCode.length !== 6}
              className="w-full bg-neon-magenta text-black hover:bg-neon-cyan hover:text-white font-pixel"
            >
              JOIN CHALLENGE
            </Button>
          </div>
        </div>
      )}

      {showCreateChallenge && (
        <div className="text-center space-y-4">
          <div className="bg-midnight-blue border border-neon-yellow/50 rounded p-4">
            <h4 className="font-pixel text-neon-yellow mb-2">CHALLENGE SETTINGS</h4>
            <div className="space-y-2 text-sm text-gray-300 font-retro">
              <div>Game: {gameName}</div>
              <div>Mode: Best Score Wins</div>
              <div>Time Limit: 3 minutes</div>
            </div>
          </div>
          
          <div className="space-x-2">
            <Button 
              onClick={createChallenge}
              className="bg-neon-green text-black hover:bg-neon-cyan hover:text-white font-pixel"
            >
              CREATE CHALLENGE
            </Button>
            <Button 
              onClick={() => setShowCreateChallenge(false)}
              className="bg-gray-600 text-white hover:bg-gray-500 font-pixel"
            >
              CANCEL
            </Button>
          </div>
        </div>
      )}

      {waitingForOpponent && (
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Trophy className="w-16 h-16 text-neon-yellow mx-auto mb-4" />
          </div>
          <h4 className="font-pixel text-neon-yellow text-lg">CHALLENGE CREATED!</h4>
          <div className="bg-midnight-blue border border-neon-yellow/50 rounded p-4">
            <p className="text-gray-300 font-retro mb-2">Share this code with your friend:</p>
            <div className="text-3xl font-pixel text-neon-yellow tracking-wider">
              {challengeCode}
            </div>
          </div>
          <p className="text-sm text-gray-400 font-retro">
            Waiting for opponent to join...
          </p>
          <Button 
            onClick={() => {
              setWaitingForOpponent(false);
              setChallengeCode('');
            }}
            className="bg-gray-600 text-white hover:bg-gray-500 font-pixel"
          >
            CANCEL CHALLENGE
          </Button>
        </div>
      )}
    </div>
  );
}