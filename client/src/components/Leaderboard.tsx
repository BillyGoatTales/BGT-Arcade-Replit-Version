import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaUser, FaTrophy } from "react-icons/fa";

interface LeaderboardProps {
  gameId?: number;
  gameColor: string;
}

export default function Leaderboard({ gameId, gameColor }: LeaderboardProps) {
  const [viewMode, setViewMode] = useState<'game' | 'overall'>('game');
  
  const { data: gameLeaderboard, isLoading: gameLoading } = useQuery({
    queryKey: gameId ? ["/api/scores/leaderboard", { gameId }] : ["/api/scores/leaderboard"],
    refetchInterval: 5000,
    enabled: viewMode === 'game'
  });

  const { data: overallLeaderboard, isLoading: overallLoading } = useQuery({
    queryKey: ["/api/scores/leaderboard/overall"],
    refetchInterval: 5000,
    enabled: viewMode === 'overall'
  });

  const leaderboard = viewMode === 'game' ? gameLeaderboard : overallLeaderboard;
  const isLoading = viewMode === 'game' ? gameLoading : overallLoading;

  return (
    <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-cyan rounded-lg p-4 crt-effect">
      <h3 className="font-pixel text-neon-cyan text-sm mb-3 text-center animate-neon-pulse flex items-center justify-center">
        <FaTrophy className="mr-2" />
        LEADERBOARD
      </h3>
      
      {/* Toggle between game-specific and overall */}
      <div className="flex justify-center mb-4">
        <div className="bg-black/40 rounded p-1 flex text-xs">
          <Button
            onClick={() => setViewMode('game')}
            size="sm"
            className={`px-2 py-1 font-pixel transition-all ${
              viewMode === 'game' 
                ? 'bg-neon-cyan text-black' 
                : 'bg-transparent text-neon-cyan hover:bg-neon-cyan/20'
            }`}
          >
            {gameId ? 'GAME' : 'BY GAME'}
          </Button>
          <Button
            onClick={() => setViewMode('overall')}
            size="sm"
            className={`px-2 py-1 font-pixel transition-all ${
              viewMode === 'overall' 
                ? 'bg-neon-cyan text-black' 
                : 'bg-transparent text-neon-cyan hover:bg-neon-cyan/20'
            }`}
          >
            OVERALL
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-600 rounded"></div>
            ))}
          </div>
        ) : leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
          leaderboard.slice(0, 5).map((entry: any, index: number) => (
            <div key={entry.id || `${entry.username}-${index}`} className="flex items-center justify-between py-1 px-2 bg-deep-purple/30 rounded text-xs">
              <div className="flex items-center space-x-2">
                <span className={`font-pixel w-4 ${
                  index === 0 ? 'text-yellow-400' : 
                  index === 1 ? 'text-purple-400' : 
                  index === 2 ? 'text-orange-400' : 'text-cyan-400'
                }`}>
                  #{index + 1}
                </span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <FaUser className={`text-xs ${
                    index === 0 ? 'text-neon-yellow' : 
                    index === 1 ? 'text-neon-magenta' : 
                    index === 2 ? 'text-electric-orange' : 'text-neon-cyan'
                  }`} />
                </div>
                <div className="text-white font-retro text-xs truncate max-w-16">
                  <div>{entry.username}</div>
                  {viewMode === 'overall' && entry.gamesPlayed && (
                    <div className="text-neon-cyan opacity-60 text-[10px]">
                      {entry.gamesPlayed} games
                    </div>
                  )}
                </div>
              </div>
              <span className={`font-pixel text-xs ${
                index === 0 ? 'text-neon-yellow' : 
                index === 1 ? 'text-neon-magenta' : 
                index === 2 ? 'text-electric-orange' : 'text-neon-cyan'
              }`}>
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-neon-cyan font-retro text-xs">No scores yet!</p>
          </div>
        )}
      </div>
    </div>
  );
}
