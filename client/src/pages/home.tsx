import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import FloatingShareButton from "@/components/FloatingShareButton";
import { FaCrown, FaUser, FaSignOutAlt, FaYoutube, FaDiscord, FaComments } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { useEffect } from "react";
import bgtLogo from "@assets/BGT_Logo-removebg-preview_1750797015450.png";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: games } = useQuery({
    queryKey: ["/api/games"],
  });

  const { data: leaderboard } = useQuery<any>({
    queryKey: ["/api/scores/leaderboard"],
  });

  const { data: userScores } = useQuery<any>({
    queryKey: ["/api/scores/user"],
    enabled: !!(user as any)?.id,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Not authenticated')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.reload();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Please log in again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/auth/google";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

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
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-yellow/10"></div>
        <div className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                <img 
                  src={bgtLogo} 
                  alt="Billy Goat Tales Logo" 
                  className="w-16 h-16 object-contain animate-neon-pulse"
                />
              </div>
              <div>
                <h1 className="font-pixel text-neon-cyan text-xl md:text-2xl animate-neon-pulse">
                  BILLYGOAT ARCADE
                </h1>
                <p className="text-neon-yellow text-sm font-pixel">#GiversGain</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-neon-green">Score:</span>
                <span className="text-neon-yellow font-pixel">
                  {(user as any)?.totalScore?.toLocaleString() || "0"}
                </span>
              </div>
              
              <Link href="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex items-center space-x-2">
                  {(user as any)?.profileImageUrl ? (
                    <img 
                      src={(user as any).profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-neon-cyan object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-neon-cyan bg-gradient-to-br from-neon-green/20 to-neon-yellow/20 flex items-center justify-center">
                      <FaUser className="text-neon-yellow text-xs" />
                    </div>
                  )}
                  <span className="text-neon-cyan font-pixel text-xs hover:text-neon-yellow cursor-pointer">
                    {(user as any)?.username || (user as any)?.firstName || "Player"}
                  </span>
                </div>
              </Link>
              
              <Link 
                href="/feedback" 
                className="text-neon-cyan hover:text-neon-yellow transition-colors text-xs"
                title="Send Feedback"
              >
                <FaComments className="text-lg" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 relative">
          <div className="scanlines relative">
            <h2 className="font-pixel text-3xl md:text-5xl text-neon-magenta mb-4 animate-neon-pulse">
              WELCOME BACK, {((user as any)?.username || (user as any)?.firstName || "PLAYER").toUpperCase()}
            </h2>
            <p className="text-lg md:text-xl text-neon-cyan mb-6 font-retro">
              Ready to climb the leaderboards? • #GiversGain
            </p>
            
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-neon-green/20 to-neon-yellow/20 rounded-full border-4 border-neon-green flex items-center justify-center">
              <FaCrown className="text-neon-yellow text-4xl animate-glow" />
            </div>
          </div>
        </section>

        {/* Game Selection */}
        <section className="mb-12">
          <h3 className="font-pixel text-2xl text-neon-yellow text-center mb-8 animate-neon-pulse">
            SELECT YOUR GAME
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            <Link href="/game/crypto-collector">
              <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-yellow rounded-lg p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan cursor-pointer crt-effect">
                <div className="text-center">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 rounded border-2 border-purple-400 mb-4 overflow-hidden relative flex items-center justify-center">
                    {/* Crypto Collector Game Board Preview */}
                    <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0">
                      {/* Maze-like background */}
                      <rect width="300" height="200" fill="#000011"/>
                      
                      {/* Complete maze walls (nearly finished level) */}
                      <rect x="10" y="10" width="280" height="8" fill="#0066ff"/>
                      <rect x="10" y="10" width="8" height="180" fill="#0066ff"/>
                      <rect x="282" y="10" width="8" height="180" fill="#0066ff"/>
                      <rect x="10" y="182" width="280" height="8" fill="#0066ff"/>
                      
                      {/* Internal maze structure */}
                      <rect x="30" y="30" width="60" height="8" fill="#0066ff"/>
                      <rect x="120" y="30" width="8" height="40" fill="#0066ff"/>
                      <rect x="150" y="30" width="80" height="8" fill="#0066ff"/>
                      <rect x="250" y="30" width="8" height="60" fill="#0066ff"/>
                      
                      <rect x="30" y="60" width="8" height="40" fill="#0066ff"/>
                      <rect x="60" y="80" width="40" height="8" fill="#0066ff"/>
                      <rect x="130" y="60" width="60" height="8" fill="#0066ff"/>
                      <rect x="220" y="60" width="8" height="40" fill="#0066ff"/>
                      
                      <rect x="50" y="120" width="40" height="8" fill="#0066ff"/>
                      <rect x="120" y="100" width="8" height="60" fill="#0066ff"/>
                      <rect x="150" y="140" width="60" height="8" fill="#0066ff"/>
                      <rect x="240" y="120" width="8" height="40" fill="#0066ff"/>
                      
                      {/* Only a few remaining crypto symbols (almost complete level) */}
                      <text x="200" y="110" fontSize="14" fill="#f7931a" textAnchor="middle">₿</text>
                      <text x="180" y="170" fontSize="14" fill="#627eea" textAnchor="middle">Ξ</text>
                      
                      {/* Player (Pac-Man style) */}
                      <circle cx="160" cy="110" r="12" fill="#ffff00"/>
                      <path d="M 160 110 L 170 105 L 170 115 Z" fill="#000011"/>
                      
                      {/* Enemy ghosts as red viruses (distant) */}
                      <text x="60" y="50" fontSize="16" fill="#ff4444" textAnchor="middle">🦠</text>
                      <text x="240" y="170" fontSize="16" fill="#ff6666" textAnchor="middle">🦠</text>
                      
                      {/* Power pellet */}
                      <circle cx="70" cy="160" r="4" fill="#ffd700"/>
                      
                      {/* UI Elements */}
                      <text x="10" y="15" fontSize="10" fill="#00ff88">Score: 18,750</text>
                      <text x="10" y="195" fontSize="10" fill="#00ff88">Lives: ₿₿₿</text>
                      <text x="200" y="15" fontSize="10" fill="#ffd700">Level: 3</text>
                    </svg>
                    <div className="absolute inset-0 bg-purple-500/10 hover:bg-transparent transition-colors"></div>
                  </div>
                  <h4 className="font-pixel text-purple-400 text-lg mb-2">CRYPTO COLLECTOR</h4>
                  <p className="text-sm text-neon-cyan mb-4">Navigate Web3 networks, collect tokens, avoid hackers</p>
                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-green-400">
                      Your Best: {userScores?.find((s: any) => s.gameId === 1)?.score?.toLocaleString() || "--"}
                    </span>
                  </div>
                  <Button className="arcade-button w-full py-3 text-neon-yellow font-pixel text-sm">
                    PLAY NOW
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/game/bitcoin-defender" className="block">
              <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-magenta rounded-lg p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan cursor-pointer crt-effect">
                <div className="text-center">
                  <div className="w-full h-48 bg-gradient-to-br from-orange-900/80 to-red-900/80 rounded border-2 border-orange-400 mb-4 overflow-hidden relative flex items-center justify-center">
                    {/* Bitcoin Defender Game Board Preview */}
                    <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0">
                      {/* Space background with digital rain */}
                      <rect width="300" height="200" fill="#000011"/>
                      
                      {/* Digital rain effect */}
                      <text x="30" y="20" fontSize="8" fill="#00ff0040">0</text>
                      <text x="30" y="35" fontSize="8" fill="#00ff0040">1</text>
                      <text x="80" y="30" fontSize="8" fill="#00ff0040">₿</text>
                      <text x="150" y="25" fontSize="8" fill="#00ff0040">Ξ</text>
                      <text x="220" y="40" fontSize="8" fill="#00ff0040">1</text>
                      <text x="270" y="20" fontSize="8" fill="#00ff0040">0</text>
                      
                      {/* Player Bitcoin ship */}
                      <text x="150" y="170" fontSize="20" fill="#f7931a" textAnchor="middle">₿</text>
                      
                      {/* Enemy threats */}
                      <text x="60" y="60" fontSize="16" fill="#ff4444" textAnchor="middle">🦠</text>
                      <text x="140" y="80" fontSize="16" fill="#aa44ff" textAnchor="middle">💀</text>
                      <text x="220" y="50" fontSize="20" fill="#cc0000" textAnchor="middle">👾</text>
                      
                      {/* Player bullets (golden coins) */}
                      <circle cx="150" cy="140" r="3" fill="#ffd700"/>
                      <circle cx="150" cy="120" r="3" fill="#ffd700"/>
                      
                      {/* Enemy bullets (warning symbols) */}
                      <text x="60" y="90" fontSize="10" fill="#ff0000" textAnchor="middle">⚠</text>
                      <text x="220" y="80" fontSize="10" fill="#ff0000" textAnchor="middle">⚠</text>
                      
                      {/* Explosion effect */}
                      <circle cx="180" cy="100" r="8" fill="#ffd70080"/>
                      <circle cx="180" cy="100" r="4" fill="#ffffff80"/>
                      
                      {/* UI Elements */}
                      <text x="10" y="15" fontSize="8" fill="#00ff88">💰 Score: 15,250</text>
                      <text x="10" y="25" fontSize="8" fill="#00ff88">🌊 Wave: 3</text>
                      <text x="10" y="35" fontSize="8" fill="#00ff88">⏰ Time: 45s</text>
                      <text x="210" y="15" fontSize="8" fill="#f7931a">₿₿₿₿</text>
                    </svg>
                    <div className="absolute inset-0 bg-orange-500/10 hover:bg-transparent transition-colors"></div>
                  </div>
                  <h4 className="font-pixel text-orange-400 text-lg mb-2">BITCOIN DEFENDER</h4>
                  <p className="text-sm text-neon-cyan mb-4">Defend the blockchain against digital threats</p>
                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-green-400">
                      Your Best: {userScores?.find((s: any) => s.gameId === 2)?.score?.toLocaleString() || "--"}
                    </span>
                  </div>
                  <Button className="arcade-button w-full py-3 text-neon-magenta font-pixel text-sm">
                    PLAY NOW
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/game/defi-runner" className="block">
              <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-green rounded-lg p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan cursor-pointer crt-effect">
                <div className="text-center">
                  <div className="w-full h-48 bg-gradient-to-br from-teal-900/80 to-cyan-900/80 rounded border-2 border-teal-400 mb-4 overflow-hidden relative flex items-center justify-center">
                    {/* DeFi Runner Game Board Preview */}
                    <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0">
                      {/* Enhanced background with blockchain grid pattern */}
                      <rect width="300" height="200" fill="#001122"/>
                      
                      {/* Grid pattern suggesting blockchain */}
                      <defs>
                        <pattern id="blockchainGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <rect width="20" height="20" fill="none" stroke="#00334460" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="300" height="200" fill="url(#blockchainGrid)"/>
                      
                      {/* Water lanes with enhanced effects */}
                      <rect x="0" y="40" width="300" height="30" fill="#003366"/>
                      <rect x="0" y="80" width="300" height="30" fill="#002244"/>
                      <rect x="0" y="120" width="300" height="30" fill="#003366"/>
                      
                      {/* Animated water waves */}
                      <path d="M0,55 Q10,50 20,55 T40,55 T60,55 T80,55 T100,55 T120,55 T140,55 T160,55 T180,55 T200,55 T220,55 T240,55 T260,55 T280,55 T300,55" 
                            stroke="#4488aa" strokeWidth="1" fill="none" opacity="0.6"/>
                      <path d="M0,95 Q15,90 30,95 T60,95 T90,95 T120,95 T150,95 T180,95 T210,95 T240,95 T270,95 T300,95" 
                            stroke="#4488aa" strokeWidth="1" fill="none" opacity="0.6"/>
                      
                      {/* Road lanes with enhanced detail */}
                      <rect x="0" y="0" width="300" height="30" fill="#333333"/>
                      <rect x="0" y="170" width="300" height="30" fill="#333333"/>
                      
                      {/* Road markings */}
                      <rect x="10" y="14" width="15" height="2" fill="#ffff00"/>
                      <rect x="35" y="14" width="15" height="2" fill="#ffff00"/>
                      <rect x="60" y="14" width="15" height="2" fill="#ffff00"/>
                      <rect x="85" y="14" width="15" height="2" fill="#ffff00"/>
                      
                      {/* Enhanced vehicles with crypto branding */}
                      <g>
                        <rect x="40" y="5" width="30" height="15" fill="#ff4444" rx="3"/>
                        <rect x="43" y="7" width="24" height="11" fill="#ffaaaa"/>
                        <text x="55" y="16" fontSize="6" fill="#ffd700" textAnchor="middle">₿</text>
                        <circle cx="45" cy="18" r="2" fill="#222"/>
                        <circle cx="65" cy="18" r="2" fill="#222"/>
                      </g>
                      
                      <g>
                        <rect x="180" y="175" width="35" height="15" fill="#4444ff" rx="3"/>
                        <rect x="183" y="177" width="29" height="11" fill="#aaaaff"/>
                        <text x="197" y="186" fontSize="6" fill="#ffd700" textAnchor="middle">Ξ</text>
                        <circle cx="185" cy="188" r="2" fill="#222"/>
                        <circle cx="210" cy="188" r="2" fill="#222"/>
                      </g>
                      
                      {/* Enhanced logs with crypto symbols */}
                      <g>
                        <rect x="50" y="85" width="45" height="10" fill="#8B4513" rx="5"/>
                        <rect x="52" y="87" width="41" height="6" fill="#A0522D"/>
                        <text x="72" y="93" fontSize="8" fill="#654321" textAnchor="middle">Ξ</text>
                      </g>
                      
                      <g>
                        <rect x="170" y="125" width="40" height="10" fill="#8B4513" rx="5"/>
                        <rect x="172" y="127" width="36" height="6" fill="#A0522D"/>
                        <text x="190" y="133" fontSize="8" fill="#654321" textAnchor="middle">₿</text>
                      </g>
                      
                      {/* Turtles with blockchain shell patterns */}
                      <g>
                        <circle cx="120" cy="95" r="8" fill="#228B22"/>
                        <polygon points="120,87 125,92 120,97 115,92" fill="#006400" stroke="#003300" strokeWidth="0.5"/>
                        <polygon points="115,90 120,95 115,100 110,95" fill="#006400" stroke="#003300" strokeWidth="0.5"/>
                        <polygon points="125,90 130,95 125,100 120,95" fill="#006400" stroke="#003300" strokeWidth="0.5"/>
                      </g>
                      
                      {/* Enhanced player frog with crypto wallet */}
                      <g>
                        <circle cx="150" cy="135" r="10" fill="#00ff88"/>
                        <circle cx="145" cy="130" r="2" fill="#ffffff"/>
                        <circle cx="155" cy="130" r="2" fill="#ffffff"/>
                        <circle cx="145" cy="130" r="1" fill="#000000"/>
                        <circle cx="155" cy="130" r="1" fill="#000000"/>
                        <text x="150" y="139" fontSize="8" fill="#00cc66" textAnchor="middle">₿</text>
                      </g>
                      
                      {/* Enhanced lily pads with crypto rewards */}
                      <g>
                        <circle cx="60" cy="185" r="12" fill="#00ff88"/>
                        <circle cx="70" cy="180" r="4" fill="#001100"/>
                        <text x="60" y="190" fontSize="10" fill="#ffd700" textAnchor="middle">₿</text>
                      </g>
                      
                      <g>
                        <circle cx="150" cy="185" r="12" fill="#228B22"/>
                        <circle cx="160" cy="180" r="4" fill="#001100"/>
                        <text x="150" y="190" fontSize="8" fill="#66ff66" textAnchor="middle">?</text>
                      </g>
                      
                      <g>
                        <circle cx="240" cy="185" r="12" fill="#00ff88"/>
                        <circle cx="250" cy="180" r="4" fill="#001100"/>
                        <text x="240" y="190" fontSize="10" fill="#627eea" textAnchor="middle">Ξ</text>
                      </g>
                      
                      {/* UI Elements */}
                      <text x="10" y="15" fontSize="8" fill="#00ff88">💰 Score: 8,750</text>
                      <text x="10" y="195" fontSize="8" fill="#00ff88">Lives: 🐸🐸🐸</text>
                      <text x="200" y="15" fontSize="8" fill="#00ff88">⏰ Time: 1:45</text>
                      <text x="200" y="25" fontSize="8" fill="#ffd700">Level: 2</text>
                    </svg>
                    <div className="absolute inset-0 bg-teal-500/10 hover:bg-transparent transition-colors"></div>
                  </div>
                  <h4 className="font-pixel text-teal-400 text-lg mb-2">DEFI RUNNER</h4>
                  <p className="text-sm text-neon-cyan mb-4">Navigate DeFi protocols and liquidity pools</p>
                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-green-400">
                      Your Best: {userScores?.find((s: any) => s.gameId === 3)?.score?.toLocaleString() || "--"}
                    </span>
                  </div>
                  <Button className="arcade-button w-full py-3 text-neon-green font-pixel text-sm">
                    PLAY NOW
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Leaderboards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Global Leaderboard */}
          <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-cyan rounded-lg p-6 crt-effect">
            <h3 className="font-pixel text-neon-cyan text-xl mb-6 text-center animate-neon-pulse">
              GLOBAL LEADERBOARD
            </h3>
            
            <div className="space-y-3">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((entry: any, index: number) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 px-4 bg-deep-purple/50 rounded border border-neon-cyan/30">
                    <div className="flex items-center space-x-3">
                      <span className={`font-pixel text-sm w-6 ${
                        index === 0 ? 'text-neon-yellow' : 
                        index === 1 ? 'text-neon-magenta' : 
                        index === 2 ? 'text-electric-orange' : 'text-neon-cyan'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className={`w-8 h-8 rounded border flex items-center justify-center ${
                        index === 0 ? 'bg-neon-yellow/20 border-neon-yellow' : 
                        index === 1 ? 'bg-neon-magenta/20 border-neon-magenta' : 
                        index === 2 ? 'bg-electric-orange/20 border-electric-orange' : 'bg-neon-cyan/20 border-neon-cyan'
                      }`}>
                        <FaUser className={`text-xs ${
                          index === 0 ? 'text-neon-yellow' : 
                          index === 1 ? 'text-neon-magenta' : 
                          index === 2 ? 'text-electric-orange' : 'text-neon-cyan'
                        }`} />
                      </div>
                      <span className="text-white font-retro">{entry.username}</span>
                    </div>
                    <span className={`font-pixel text-sm ${
                      index === 0 ? 'text-neon-yellow' : 
                      index === 1 ? 'text-neon-magenta' : 
                      index === 2 ? 'text-electric-orange' : 'text-neon-cyan'
                    }`}>
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-neon-cyan font-retro">No scores yet. Be the first to play!</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Stats */}
          <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-magenta rounded-lg p-6 crt-effect">
            <h3 className="font-pixel text-neon-magenta text-xl mb-6 text-center animate-neon-pulse">
              YOUR STATS
            </h3>
            
            <div className="space-y-4">
              <div className="bg-deep-purple/50 rounded p-4 border border-neon-magenta/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neon-yellow font-retro">Total Score</span>
                  <span className="text-neon-cyan font-pixel">{(user as any)?.totalScore?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neon-yellow font-retro">Games Played</span>
                  <span className="text-neon-green font-pixel">{(user as any)?.gamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neon-yellow font-retro">Rank</span>
                  <span className="text-neon-magenta font-pixel">
                    #{leaderboard ? leaderboard.findIndex((entry: any) => entry.userId === (user as any)?.id) + 1 || "N/A" : "N/A"}
                  </span>
                </div>
              </div>
              
              {/* Individual Game Stats */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 px-3 bg-neon-yellow/10 rounded">
                  <span className="text-neon-yellow font-retro text-sm">Goat Chomper</span>
                  <span className="text-white font-pixel text-sm">
                    {userScores?.find((s: any) => s.gameId === 1)?.score?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-neon-magenta/10 rounded">
                  <span className="text-neon-magenta font-retro text-sm">Space Goats</span>
                  <span className="text-white font-pixel text-sm">
                    {userScores?.find((s: any) => s.gameId === 2)?.score?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-neon-green/10 rounded">
                  <span className="text-neon-green font-retro text-sm">Goat Crosser</span>
                  <span className="text-white font-pixel text-sm">
                    {userScores?.find((s: any) => s.gameId === 3)?.score?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Promotion */}
        <section className="bg-gradient-to-br from-neon-green/10 via-neon-cyan/10 to-neon-magenta/10 border-4 border-neon-green rounded-lg p-8 scanlines">
          <div className="text-center mb-6">
            <h3 className="font-pixel text-neon-green text-2xl mb-2 animate-neon-pulse">
              BILLYGOAT TALES
            </h3>
            <p className="text-neon-cyan font-retro text-lg">#GiversGain Community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="https://youtube.com/@billygoattales" target="_blank" rel="noopener noreferrer" className="bg-arcade-dark/70 rounded-lg p-4 border-2 border-red-500 hover:border-yellow-400 transition-colors block">
              <div className="text-center">
                <FaYoutube className="text-red-500 text-3xl mb-3 mx-auto" />
                <h4 className="font-pixel text-yellow-400 text-sm mb-2">YOUTUBE</h4>
                <p className="text-xs text-cyan-400 mb-3">Gaming tutorials, reviews, and community content</p>
                <Button className="arcade-button px-4 py-2 text-red-500 text-xs font-pixel w-full">
                  SUBSCRIBE
                </Button>
              </div>
            </a>
            
            <a href="https://x.com/billygoattales" target="_blank" rel="noopener noreferrer" className="bg-arcade-dark/70 rounded-lg p-4 border-2 border-blue-500 hover:border-yellow-400 transition-colors block">
              <div className="text-center">
                <SiX className="text-blue-400 text-3xl mb-3 mx-auto" />
                <h4 className="font-pixel text-yellow-400 text-sm mb-2">X (TWITTER)</h4>
                <p className="text-xs text-cyan-400 mb-3">Latest updates and community discussions</p>
                <Button className="arcade-button px-4 py-2 text-blue-400 text-xs font-pixel w-full">
                  FOLLOW
                </Button>
              </div>
            </a>
            
            <a href="https://discord.gg/billygoattales" target="_blank" rel="noopener noreferrer" className="bg-arcade-dark/70 rounded-lg p-4 border-2 border-indigo-500 hover:border-yellow-400 transition-colors block">
              <div className="text-center">
                <FaDiscord className="text-indigo-500 text-3xl mb-3 mx-auto" />
                <h4 className="font-pixel text-yellow-400 text-sm mb-2">DISCORD</h4>
                <p className="text-xs text-cyan-400 mb-3">Join our gaming community and chat</p>
                <Button className="arcade-button px-4 py-2 text-indigo-500 text-xs font-pixel w-full">
                  JOIN
                </Button>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-neon-cyan bg-gradient-to-r from-deep-purple to-midnight-blue py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-pixel text-neon-cyan text-lg mb-4">BILLY GOAT ARCADE</h4>
              <p className="text-sm text-neon-yellow font-retro mb-2">#GiversGain</p>
              <p className="text-xs text-gray-300">
                Retro gaming experience powered by billygoattales.io
              </p>
            </div>
            
            <div>
              <h5 className="font-pixel text-neon-magenta text-sm mb-4">GAMES</h5>
              <ul className="space-y-2 text-xs text-neon-cyan">
                <li><Link href="/game/goat-chomper" className="hover:text-neon-yellow transition-colors">Goat Chomper</Link></li>
                <li><Link href="/game/space-goats" className="hover:text-neon-yellow transition-colors">Space Goats</Link></li>
                <li><Link href="/game/goat-crosser" className="hover:text-neon-yellow transition-colors">Goat Crosser</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-pixel text-neon-green text-sm mb-4">COMMUNITY</h5>
              <ul className="space-y-2 text-xs text-neon-cyan">
                <li><a href="#" className="hover:text-neon-yellow transition-colors">Leaderboards</a></li>
                <li><a href="#" className="hover:text-neon-yellow transition-colors">How to Play</a></li>
                <li><a href="#" className="hover:text-neon-yellow transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neon-cyan/30 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-400">
              © 2024 billygoattales.io - All rights reserved • Made with ❤️ for the gaming community
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Share Button - Available everywhere */}
      <FloatingShareButton />
    </div>
  );
}
