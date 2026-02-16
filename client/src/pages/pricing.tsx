import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-purple via-midnight-blue to-deep-purple">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">₿</div>
          <h1 className="font-pixel text-4xl text-neon-cyan mb-4 animate-neon-pulse">
            CRYPTO ARCADE PREMIUM
          </h1>
          <p className="text-neon-yellow text-xl font-retro">#ToTheMoon</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Free Tier */}
            <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6">
              <h3 className="font-pixel text-2xl text-neon-cyan mb-4">FREE TIER</h3>
              <div className="text-4xl font-pixel text-white mb-4">$0/month</div>
              <ul className="space-y-3 text-gray-300 font-retro mb-6">
                <li>✓ Access to all 3 games</li>
                <li>✓ Basic leaderboards</li>
                <li>✓ Score tracking</li>
                <li>✗ No multiplayer</li>
                <li>✗ Limited features</li>
              </ul>
              <button className="w-full bg-gray-600 text-white py-3 rounded font-pixel">
                Current Plan
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-arcade-dark border-2 border-neon-yellow rounded-lg p-6 relative overflow-hidden">
              <div className="absolute -top-2 -right-2 bg-neon-yellow text-black px-3 py-1 text-sm font-pixel rotate-12">
                LIMITED TIME!
              </div>
              
              <h3 className="font-pixel text-2xl text-neon-yellow mb-4">PREMIUM</h3>
              <div className="mb-4">
                <div className="text-2xl font-pixel text-gray-400 line-through">$6.99/month</div>
                <div className="text-4xl font-pixel text-neon-yellow">$3.99/month</div>
                <div className="text-sm text-gray-400 font-retro">After 30-day free trial</div>
              </div>
              
              <ul className="space-y-3 text-gray-300 font-retro mb-6">
                <li>✓ Everything in Free</li>
                <li>✓ 2-Player challenges</li>
                <li>✓ Advanced leaderboards</li>
                <li>✓ Exclusive tournaments</li>
                <li>✓ Priority support</li>
                <li>✓ Affiliate program access</li>
              </ul>
              
              <Link to={isAuthenticated ? "/upgrade" : "/auth"}>
                <button className="w-full bg-neon-yellow text-black py-3 rounded font-pixel hover:bg-neon-cyan hover:text-white transition-all transform hover:scale-105">
                  START FREE TRIAL
                </button>
              </Link>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6 mb-8">
            <h3 className="font-pixel text-xl text-neon-cyan mb-6">FEATURE COMPARISON</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-retro">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 text-white">Feature</th>
                    <th className="text-center py-3 text-gray-400">Free</th>
                    <th className="text-center py-3 text-neon-yellow">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 text-gray-300">Single Player Games</td>
                    <td className="text-center py-3 text-green-400">✓</td>
                    <td className="text-center py-3 text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 text-gray-300">2-Player Challenges</td>
                    <td className="text-center py-3 text-red-400">✗</td>
                    <td className="text-center py-3 text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 text-gray-300">Tournament Mode</td>
                    <td className="text-center py-3 text-red-400">✗</td>
                    <td className="text-center py-3 text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 text-gray-300">Affiliate Program</td>
                    <td className="text-center py-3 text-red-400">✗</td>
                    <td className="text-center py-3 text-green-400">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">Priority Support</td>
                    <td className="text-center py-3 text-red-400">✗</td>
                    <td className="text-center py-3 text-green-400">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-arcade-dark border border-neon-cyan/30 rounded-lg p-6">
            <h3 className="font-pixel text-xl text-neon-cyan mb-6">FREQUENTLY ASKED QUESTIONS</h3>
            
            <div className="space-y-4 font-retro text-gray-300">
              <div>
                <h4 className="text-white font-semibold mb-2">How does the free trial work?</h4>
                <p className="text-sm">Get full Premium access for 30 days absolutely free. Cancel anytime during the trial with no charges.</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-sm">Yes! Cancel your subscription anytime from your account settings. No contracts, no hidden fees.</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm">We accept all major credit cards, PayPal, and popular cryptocurrencies including Bitcoin and Ethereum.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}