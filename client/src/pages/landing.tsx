import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaGoogle, FaTwitter, FaCrown, FaYoutube, FaDiscord } from "react-icons/fa";
import { SiX } from "react-icons/si";
import bgtLogo from "@assets/BGT_Logo-removebg-preview_1750797015450.png";

export default function Landing() {
  const { data: games } = useQuery({
    queryKey: ["/api/games"],
    retry: false,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/scores/leaderboard"],
    retry: false,
  });

  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

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
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleGetStarted}
                className="arcade-button px-4 py-2 text-neon-cyan font-pixel text-xs"
              >
                <img 
                  src={bgtLogo} 
                  alt="Logo" 
                  className="w-4 h-4 mr-2 object-contain"
                />
                LOGIN
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 relative">
          <div className="scanlines relative">
            <h2 className="font-pixel text-3xl md:text-5xl text-neon-magenta mb-4 animate-neon-pulse">
              DIGITAL ASSET GAMING
            </h2>
            <p className="text-lg md:text-xl text-neon-cyan mb-6 font-retro">
              Challenge the leaderboards • Earn your place • #ToTheMoon</p>
            
            {/* Social Media Links */}
            <div className="flex justify-center gap-6 mb-8">
              <a href="https://x.com/billygoattales" target="_blank" rel="noopener noreferrer" 
                 className="text-cyan-400 hover:text-yellow-400 transition-colors">
                🐦 X (Twitter)
              </a>
              <a href="https://youtube.com/@billygoattales" target="_blank" rel="noopener noreferrer"
                 className="text-cyan-400 hover:text-yellow-400 transition-colors">
                📺 YouTube
              </a>
              <a href="https://discord.gg/billygoattales" target="_blank" rel="noopener noreferrer"
                 className="text-cyan-400 hover:text-yellow-400 transition-colors">
                💬 Discord
              </a>
            </div>
            
            <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center">
              <img 
                src={bgtLogo} 
                alt="Billy Goat Tales Logo" 
                className="w-32 h-32 object-contain animate-neon-pulse"
              />
            </div>
          </div>
        </section>

        {/* Game Selection */}
        <section className="mb-12">
          <h3 className="font-pixel text-2xl text-neon-yellow text-center mb-8 animate-neon-pulse">
            SELECT YOUR GAME
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-yellow rounded-lg p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan cursor-pointer crt-effect">
              <div className="text-center">
                <div className="w-full h-48 bg-gradient-to-br from-neon-yellow/20 to-electric-orange/20 rounded border-2 border-neon-yellow mb-4 flex items-center justify-center">
                  <div className="text-neon-yellow text-6xl">●</div>
                </div>
                <h4 className="font-pixel text-neon-yellow text-lg mb-2">GOAT CHOMPER</h4>
                <p className="text-sm text-neon-cyan mb-4">Navigate mazes, collect coins, avoid enemies</p>
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-neon-green">High Score: --</span>
                  <span className="text-neon-magenta">Players: --</span>
                </div>
                <Link href="/auth">
                  <Button className="arcade-button w-full py-3 text-neon-yellow font-pixel text-sm">
                    LOGIN TO PLAY
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-magenta rounded-lg p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan cursor-pointer crt-effect">
              <div className="text-center">
                <div className="w-full h-48 bg-gradient-to-br from-neon-magenta/20 to-deep-purple/40 rounded border-2 border-neon-magenta mb-4 flex items-center justify-center">
                  <div className="text-neon-magenta text-6xl">🚀</div>
                </div>
                <h4 className="font-pixel text-neon-magenta text-lg mb-2">SPACE GOATS</h4>
                <p className="text-sm text-neon-cyan mb-4">Defend the galaxy from alien invaders</p>
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-neon-green">High Score: --</span>
                  <span className="text-neon-yellow">Players: --</span>
                </div>
                <Link href="/auth">
                  <Button className="arcade-button w-full py-3 text-neon-magenta font-pixel text-sm">
                    LOGIN TO PLAY
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-green rounded-lg p-6 hover:border-neon-cyan transition-all duration-300 hover:shadow-neon-cyan cursor-pointer crt-effect">
              <div className="text-center">
                <div className="w-full h-48 bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 rounded border-2 border-neon-green mb-4 flex items-center justify-center">
                  <div className="text-neon-green text-6xl">🛣️</div>
                </div>
                <h4 className="font-pixel text-neon-green text-lg mb-2">GOAT CROSSER</h4>
                <p className="text-sm text-neon-cyan mb-4">Cross busy streets and rivers safely</p>
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-neon-cyan">High Score: --</span>
                  <span className="text-neon-magenta">Players: --</span>
                </div>
                <Link href="/auth">
                  <Button className="arcade-button w-full py-3 text-neon-green font-pixel text-sm">
                    LOGIN TO PLAY
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Global Leaderboard Preview */}
        <section className="mb-12">
          <div className="bg-gradient-to-b from-arcade-dark to-midnight-blue border-4 border-neon-cyan rounded-lg p-6 crt-effect">
            <h3 className="font-pixel text-neon-cyan text-xl mb-6 text-center animate-neon-pulse">
              GLOBAL LEADERBOARD
            </h3>
            
            <div className="space-y-3">
              {leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
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
                        <div className={`text-xs ${
                          index === 0 ? 'text-neon-yellow' : 
                          index === 1 ? 'text-neon-magenta' : 
                          index === 2 ? 'text-electric-orange' : 'text-neon-cyan'
                        }`}>
                          👤
                        </div>
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
        </section>

        {/* Social Login */}
        <section className="bg-gradient-to-r from-arcade-dark via-midnight-blue to-arcade-dark border-4 border-neon-cyan rounded-lg p-8 mb-12 crt-effect">
          <div className="text-center">
            <h3 className="font-pixel text-neon-cyan text-2xl mb-4 animate-neon-pulse">
              JOIN THE COMPETITION
            </h3>
            <p className="text-neon-yellow mb-6 font-retro">
              Create an account to save your scores and compete on the leaderboards
            </p>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleGetStarted}
                className="arcade-button flex items-center justify-center space-x-3 px-8 py-4 text-neon-green border-neon-green hover:border-neon-yellow"
              >
                <img 
                  src={bgtLogo} 
                  alt="Logo" 
                  className="w-5 h-5 object-contain"
                />
                <span className="font-pixel text-lg">GET STARTED</span>
              </Button>
            </div>
            
            <p className="text-xs text-neon-green mt-4 font-retro">
              Secure authentication • No spam • #GiversGain community
            </p>
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
                <li><a href="#" className="hover:text-neon-yellow transition-colors">Goat Chomper</a></li>
                <li><a href="#" className="hover:text-neon-yellow transition-colors">Space Goats</a></li>
                <li><a href="#" className="hover:text-neon-yellow transition-colors">Goat Crosser</a></li>
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
    </div>
  );
}
