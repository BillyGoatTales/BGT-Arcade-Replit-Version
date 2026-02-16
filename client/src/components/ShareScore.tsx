import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareScoreProps {
  score: number;
  game: string;
  level: number;
}

export default function ShareScore({ score, game, level }: ShareScoreProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🔥 EPIC SCORE ALERT! 💎 Just crushed ${score.toLocaleString()} points on ${game} (Level ${level})! 🎮 Billy Goat Arcade is the most addictive crypto gaming experience - think you can beat me? 🚀⚡ #BillyGoatArcade #Web3Gaming #HighScore #CryptoGaming #GiversGain`;
  const shareUrl = window.location.origin;

  const handleCopy = async () => {
    const fullText = `${shareText}\n\n🎮 Play at: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/90 to-teal-900/90 backdrop-blur-sm border border-purple-400/40 rounded-xl p-6 max-w-sm mx-auto shadow-2xl">
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-teal-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-teal-300 bg-clip-text text-transparent mb-2">
          🔥 LEGENDARY SCORE! 💎
        </h3>
        <p className="text-gray-300">Brag about this epic achievement!</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={shareToX}
          className="w-full bg-black hover:bg-gray-900 text-white flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 border border-gray-700"
        >
          <FaXTwitter className="w-5 h-5" />
          Share on X
        </button>
        
        <button
          onClick={handleCopy}
          className="w-full border border-purple-400/40 text-white hover:bg-purple-500/20 hover:border-purple-400/60 flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 bg-purple-500/10"
        >
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Copied to Clipboard!' : 'Copy Share Text'}
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-300 leading-relaxed">
          {shareText}
        </p>
        <p className="text-xs text-purple-300 mt-2">
          🎮 Play at: {shareUrl}
        </p>
      </div>
    </div>
  );
}