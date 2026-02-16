import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Affiliate() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-purple via-midnight-blue to-deep-purple">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="font-pixel text-4xl text-neon-cyan mb-4 animate-neon-pulse">
            AFFILIATE PROGRAM
          </h1>
          <p className="text-neon-yellow text-xl font-retro">Earn crypto while you sleep! #ToTheMoon</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="bg-arcade-dark border border-neon-yellow/50 rounded-lg p-8 mb-8 text-center">
            <h2 className="font-pixel text-2xl text-neon-yellow mb-4">EARN 40% RECURRING COMMISSIONS</h2>
            <p className="text-lg text-gray-300 font-retro mb-6">
              Join our affiliate program and earn $1.60 for every Premium subscriber you refer, every month they stay subscribed!
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-pixel text-neon-cyan">40%</div>
                <div className="text-sm text-gray-400 font-retro">Commission Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-pixel text-neon-cyan">$1.60</div>
                <div className="text-sm text-gray-400 font-retro">Per Month Per Referral</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-pixel text-neon-cyan">∞</div>
                <div className="text-sm text-gray-400 font-retro">Recurring Payments</div>
              </div>
            </div>
            
            {!isAuthenticated ? (
              <Link to="/auth">
                <button className="bg-neon-yellow text-black px-8 py-3 font-pixel rounded hover:bg-neon-cyan hover:text-white transition-all">
                  JOIN AFFILIATE PROGRAM
                </button>
              </Link>
            ) : (
              <button className="bg-neon-yellow text-black px-8 py-3 font-pixel rounded hover:bg-neon-cyan hover:text-white transition-all">
                ACCESS AFFILIATE DASHBOARD
              </button>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6 mb-8">
            <h3 className="font-pixel text-xl text-neon-cyan mb-6">HOW IT WORKS</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">1️⃣</div>
                <h4 className="font-pixel text-neon-yellow mb-2">SIGN UP</h4>
                <p className="text-sm text-gray-300 font-retro">Create your free account and get approved instantly</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">2️⃣</div>
                <h4 className="font-pixel text-neon-yellow mb-2">GET LINK</h4>
                <p className="text-sm text-gray-300 font-retro">Receive your unique referral link and promo code</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">3️⃣</div>
                <h4 className="font-pixel text-neon-yellow mb-2">PROMOTE</h4>
                <p className="text-sm text-gray-300 font-retro">Share with your audience using our marketing materials</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-3">4️⃣</div>
                <h4 className="font-pixel text-neon-yellow mb-2">EARN</h4>
                <p className="text-sm text-gray-300 font-retro">Get paid monthly for every active subscriber</p>
              </div>
            </div>
          </div>

          {/* Promotion Guide */}
          <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6 mb-8">
            <h3 className="font-pixel text-xl text-neon-cyan mb-6">PROMOTION GUIDE</h3>
            
            <div className="space-y-6 font-retro text-gray-300">
              <div>
                <h4 className="text-white font-semibold mb-3">📱 Social Media Strategy</h4>
                <ul className="space-y-2 text-sm ml-4">
                  <li>• Share gameplay videos and high scores</li>
                  <li>• Post about crypto gaming trends with #ToTheMoon</li>
                  <li>• Create "challenge your friends" posts</li>
                  <li>• Use our pre-made graphics and videos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">🎮 Gaming Communities</h4>
                <ul className="space-y-2 text-sm ml-4">
                  <li>• Share in Discord gaming servers</li>
                  <li>• Post in crypto and gaming subreddits</li>
                  <li>• Stream gameplay on Twitch/YouTube</li>
                  <li>• Organize tournaments with prizes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">💬 Content Ideas</h4>
                <ul className="space-y-2 text-sm ml-4">
                  <li>• "Why I'm obsessed with Crypto Arcade"</li>
                  <li>• Tutorial videos for beginners</li>
                  <li>• High score reaction videos</li>
                  <li>• Multiplayer challenge content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Marketing Materials */}
          <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6 mb-8">
            <h3 className="font-pixel text-xl text-neon-cyan mb-6">MARKETING MATERIALS</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-pixel text-neon-yellow mb-3">GRAPHICS & VIDEOS</h4>
                <ul className="space-y-2 text-sm text-gray-300 font-retro">
                  <li>• High-resolution logos and banners</li>
                  <li>• Social media post templates</li>
                  <li>• Animated GIFs of gameplay</li>
                  <li>• Video trailers and promos</li>
                  <li>• Custom graphics for your brand</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-pixel text-neon-yellow mb-3">COPY & CONTENT</h4>
                <ul className="space-y-2 text-sm text-gray-300 font-retro">
                  <li>• Pre-written social media posts</li>
                  <li>• Email templates</li>
                  <li>• Blog post outlines</li>
                  <li>• Review templates</li>
                  <li>• Sales page copy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6">
            <h3 className="font-pixel text-xl text-neon-cyan mb-6">AFFILIATE FAQ</h3>
            
            <div className="space-y-4 font-retro text-gray-300">
              <div>
                <h4 className="text-white font-semibold mb-2">How much can I earn?</h4>
                <p className="text-sm">There's no limit! Top affiliates earn $500+ per month. With just 100 referrals, that's $160/month recurring.</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">When do I get paid?</h4>
                <p className="text-sm">Commissions are paid monthly via PayPal, bank transfer, or cryptocurrency on the 1st of each month.</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">What if someone cancels?</h4>
                <p className="text-sm">You earn commissions only while your referrals remain active subscribers. If they cancel, you stop earning for that referral.</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Can I promote anywhere?</h4>
                <p className="text-sm">Yes! Promote on social media, your website, YouTube, podcasts, or anywhere else. Just follow our simple guidelines.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}