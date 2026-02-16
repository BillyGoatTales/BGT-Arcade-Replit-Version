import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import GameCanvas from "@/components/GameCanvas";
import Leaderboard from "@/components/Leaderboard";
import ShareScore from "@/components/ShareScore";
import FloatingShareButton from "@/components/FloatingShareButton";
import MultiplayerChallenge from "@/components/MultiplayerChallenge";
import { FaArrowLeft, FaPlay, FaPause, FaRedo } from "react-icons/fa";

export default function Game() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover' | 'multiplayer'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showMultiplayer, setShowMultiplayer] = useState(false);

  const { data: game } = useQuery<any>({
    queryKey: ["/api/games"],
    enabled: !!slug,
    select: (games) => games?.find((g: any) => g.slug === slug),
  });

  const { data: gameLeaderboard } = useQuery<any>({
    queryKey: ["/api/scores/leaderboard", { gameId: game?.id }],
    enabled: !!game?.id,
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { gameId: number; score: number; level: number }) => {
      console.log("Submitting score:", scoreData);
      const response = await apiRequest("POST", "/api/scores", scoreData);
      console.log("Score submission response:", response);
      return response;
    },
    onSuccess: () => {
      // Invalidate all score-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/scores/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scores/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/scores/leaderboard"] });
      queryClient.refetchQueries({ queryKey: ["/api/scores/user"] });
      
      toast({
        title: "Score Submitted!",
        description: `Your score of ${score.toLocaleString()} has been recorded.`,
      });
    },
    onError: (error) => {
      console.error("Score submission error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your score.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Score Save Failed",
        description: "Unable to save your score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGameEnd = (finalScore: number, finalLevel: number) => {
    console.log("=== GAME END HANDLER ===");
    console.log("Final Score:", finalScore);
    console.log("Final Level:", finalLevel);
    console.log("Game ID:", game?.id);
    console.log("User authenticated:", !!user);
    
    setScore(finalScore);
    setLevel(finalLevel);
    setGameState('gameover');
    
    // Always submit score if we have game data, even if score is 0
    if (game?.id && user) {
      console.log("Submitting score for game:", game.id, "score:", finalScore, "level:", finalLevel);
      submitScoreMutation.mutate({
        gameId: game.id,
        score: Math.round(finalScore), // Ensure integer
        level: finalLevel,
      });
    } else {
      console.error("Cannot submit score - missing game or user:", { 
        gameObject: game, 
        gameId: game?.id, 
        hasUser: !!user,
        userObject: user,
        slug: slug
      });
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setLevel(1);
    setGameState('playing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-cyan font-pixel text-xl animate-neon-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-magenta font-pixel text-xl mb-4">
            AUTHENTICATION REQUIRED
          </div>
          <Link href="/">
            <Button className="arcade-button text-neon-cyan font-pixel">
              RETURN TO HOME
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-magenta font-pixel text-xl mb-4">
            GAME NOT FOUND
          </div>
          <Link href="/">
            <Button className="arcade-button text-neon-cyan font-pixel">
              RETURN TO HOME
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getGameColor = (slug: string) => {
    switch (slug) {
      case 'crypto-collector':
        return 'purple-400';
      case 'bitcoin-defender':
        return 'orange-400';
      case 'defi-runner':
        return 'teal-400';
      default:
        return 'neon-cyan';
    }
  };

  const gameColor = getGameColor(slug!);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative border-b-4 border-neon-cyan">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-yellow/10"></div>
        <div className="relative z-10 container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button className="arcade-button px-3 py-2 text-neon-cyan font-pixel text-xs">
                  <FaArrowLeft className="mr-2" />
                  BACK
                </Button>
              </Link>
              <h1 className={`font-pixel text-${gameColor} text-xl md:text-2xl animate-neon-pulse`}>
                {game?.name?.toUpperCase() || 'LOADING...'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-neon-green">
                Score: <span className="font-pixel">{score.toLocaleString()}</span>
              </div>
              <div className="text-neon-cyan">
                Level: <span className="font-pixel">{level}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div className={`bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-${gameColor} rounded-lg p-6 crt-effect`}>
              {gameState === 'menu' && (
                <div className="text-center py-8 sm:py-16">
                  <h2 className={`font-pixel text-${gameColor} text-xl sm:text-3xl mb-4 animate-neon-pulse`}>
                    {game?.name?.toUpperCase() || 'LOADING...'}
                  </h2>
                  <p className="text-neon-cyan mb-6 sm:mb-8 font-retro text-sm sm:text-base">{game?.description || 'Loading game description...'}</p>
                  
                  <div className="mb-6 sm:mb-8">
                    <h3 className="font-pixel text-neon-yellow text-base sm:text-lg mb-3 sm:mb-4">HOW TO PLAY</h3>
                    <div className="text-left max-w-md mx-auto space-y-1 sm:space-y-2 text-xs sm:text-sm text-neon-cyan">
                      {slug === 'crypto-collector' && (
                        <>
                          <p>• Use ARROW KEYS, WASD, or TOUCH to move</p>
                          <p>• Collect all tokens to advance</p>
                          <p>• Avoid the security threats</p>
                          <p>• Grab power-ups to turn the tables!</p>
                        </>
                      )}
                      {slug === 'bitcoin-defender' && (
                        <>
                          <p>• Use ARROW KEYS, WASD, or TOUCH to move</p>
                          <p>• Press SPACEBAR or TAP to shoot</p>
                          <p>• Destroy all network threats</p>
                          <p>• Protect the blockchain network</p>
                        </>
                      )}
                      {slug === 'defi-runner' && (
                        <>
                          <p>• Use ARROW KEYS, WASD, SPACEBAR, or TAP to jump</p>
                          <p>• Cross protocol networks safely</p>
                          <p>• Jump on stable platforms</p>
                          <p>• Reach liquidity pools to score!</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <Button 
                      onClick={() => setGameState('playing')}
                      className={`w-full arcade-button px-4 sm:px-8 py-3 sm:py-4 text-${gameColor} font-pixel text-sm sm:text-lg`}
                    >
                      <FaPlay className="mr-2 sm:mr-3" />
                      START SINGLE PLAYER
                    </Button>
                    
                    <Button 
                      onClick={() => setShowMultiplayer(!showMultiplayer)}
                      className="w-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta px-8 py-4 font-pixel text-lg hover:bg-neon-magenta hover:text-black"
                    >
                      2-PLAYER CHALLENGE
                    </Button>
                  </div>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="w-full">
                  <div className="mb-2 sm:mb-4 flex justify-center space-x-2 sm:space-x-4">
                    <Button 
                      onClick={() => setGameState('paused')}
                      className="arcade-button px-3 sm:px-4 py-2 text-neon-cyan font-pixel text-xs"
                    >
                      <FaPause className="mr-1 sm:mr-2" />
                      PAUSE
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <GameCanvas 
                      gameSlug={slug!}
                      onScoreChange={setScore}
                      onLevelChange={setLevel}
                      onGameEnd={handleGameEnd}
                      gameState={gameState}
                    />
                  </div>
                </div>
              )}

              {gameState === 'paused' && (
                <div className="text-center py-16">
                  <h2 className="font-pixel text-neon-cyan text-3xl mb-8 animate-neon-pulse">
                    GAME PAUSED
                  </h2>
                  <div className="space-x-4">
                    <Button 
                      onClick={() => setGameState('playing')}
                      className="arcade-button px-6 py-3 text-neon-green font-pixel"
                    >
                      <FaPlay className="mr-2" />
                      RESUME
                    </Button>
                    <Button 
                      onClick={() => setGameState('menu')}
                      className="arcade-button px-6 py-3 text-neon-magenta font-pixel"
                    >
                      MENU
                    </Button>
                  </div>
                </div>
              )}

              {gameState === 'gameover' && (
                <div className="text-center py-8">
                  <h2 className="font-pixel text-neon-magenta text-3xl mb-4 animate-neon-pulse">
                    GAME OVER
                  </h2>
                  <div className="mb-6">
                    <div className="text-neon-yellow font-pixel text-xl mb-2">
                      FINAL SCORE: {score.toLocaleString()}
                    </div>
                    <div className="text-neon-cyan font-pixel">
                      LEVEL REACHED: {level}
                    </div>
                  </div>

                  {/* Share Score Component */}
                  <div className="mb-8">
                    <ShareScore 
                      score={score}
                      game={game?.name || 'Crypto Game'}
                      level={level}
                    />
                  </div>

                  <div className="space-x-4">
                    <Button 
                      onClick={handlePlayAgain}
                      className={`arcade-button px-6 py-3 text-${gameColor} font-pixel`}
                    >
                      <FaRedo className="mr-2" />
                      PLAY AGAIN
                    </Button>
                    <Button 
                      onClick={() => setGameState('menu')}
                      className="arcade-button px-6 py-3 text-neon-cyan font-pixel"
                    >
                      MENU
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Leaderboard gameId={game?.id} gameColor={gameColor} />
            
            {/* Game Instructions */}
            <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-cyan rounded-lg p-4 crt-effect">
              <h3 className="font-pixel text-neon-cyan text-sm mb-4 text-center">
                CONTROLS
              </h3>
              <div className="space-y-2 text-xs text-neon-yellow">
                <div className="flex justify-between">
                  <span>Move:</span>
                  <span className="font-pixel">ARROW KEYS</span>
                </div>
                <div className="flex justify-between">
                  <span>Alt Move:</span>
                  <span className="font-pixel">WASD</span>
                </div>
                {slug === 'bitcoin-defender' && (
                  <div className="flex justify-between">
                    <span>Shoot:</span>
                    <span className="font-pixel">SPACEBAR</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pause:</span>
                  <span className="font-pixel">P</span>
                </div>
              </div>
            </div>

            {/* Billy Goat Branding */}
            <div className="bg-gradient-to-b from-neon-green/10 to-neon-cyan/10 border-4 border-neon-green rounded-lg p-4">
              <div className="text-center">
                <h4 className="font-pixel text-neon-green text-sm mb-2">
                  BILLYGOAT TALES
                </h4>
                <p className="text-neon-cyan font-retro text-xs mb-3">
                  #GiversGain
                </p>
                <p className="text-xs text-gray-300">
                  Keep playing and climbing those leaderboards!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Share Button - Available everywhere */}
      <FloatingShareButton 
        score={score}
        gameName={game?.name}
        level={level}
        isPlaying={gameState === 'playing'}
      />
    </div>
  );
}
