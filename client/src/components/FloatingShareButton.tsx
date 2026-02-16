import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';

interface FloatingShareButtonProps {
  score?: number;
  gameName?: string;
  level?: number;
  isPlaying?: boolean;
}

export default function FloatingShareButton({ 
  score = 0, 
  gameName = "Billy Goat Arcade", 
  level = 1,
  isPlaying = false 
}: FloatingShareButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getShareText = () => {
    if (isPlaying && score > 0) {
      return `🎮 Currently scoring ${score.toLocaleString()} points on ${gameName} (Level ${level}) at Billy Goat Arcade! Join me in this epic crypto gaming session! #BillyGoatArcade #Web3Gaming #LiveGaming`;
    } else {
      return `🚀 Having an amazing time at Billy Goat Arcade! Join me for some epic crypto gaming action! #BillyGoatArcade #Web3Gaming #CryptoGaming`;
    }
  };

  const shareToX = () => {
    const shareText = getShareText();
    const shareUrl = window.location.origin;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsExpanded(false);
  };

  const copyToClipboard = async () => {
    const shareText = getShareText();
    const shareUrl = window.location.origin;
    const fullText = `${shareText}\n\n🎮 Play at: ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setIsExpanded(false);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded Share Options */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-purple-900/95 to-teal-900/95 backdrop-blur-sm border border-purple-400/40 rounded-lg p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="text-center">
              <h4 className="text-white font-semibold text-sm mb-1">🔥 Share the Epic Action!</h4>
              <p className="text-gray-300 text-xs">Challenge friends to beat your scores!</p>
            </div>
            
            <Button
              onClick={shareToX}
              className="w-full bg-black hover:bg-gray-900 text-white flex items-center justify-center gap-2 py-2 text-sm"
            >
              <FaXTwitter className="w-4 h-4" />
              Share on X
            </Button>
            
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full border-purple-400/40 text-white hover:bg-purple-500/20 py-2 text-sm"
            >
              Copy Share Text
            </Button>
          </div>
        </div>
      )}

      {/* Floating Share Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 hover:from-purple-600 hover:to-teal-500 shadow-lg shadow-purple-500/25 border-2 border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <Share2 className="w-5 h-5 text-white" />
      </Button>
    </div>
  );
}