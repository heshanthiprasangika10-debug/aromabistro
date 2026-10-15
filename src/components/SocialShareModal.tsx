import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Instagram,
  MessageCircle,
  Twitter,
  Facebook,
  Sparkles,
  Award
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useRestaurant();
  const [copied, setCopied] = useState(false);
  const [pointsClaimed, setPointsClaimed] = useState(false);

  if (!isOpen) return null;

  const shareText = "Having an exquisite culinary experience at AromaBistro! Check out their artisan Ceylon Kottu, Black Pepper Crab, and wood-fired gourmet specialties: https://aromabistro.lk";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareClick = (platform: string) => {
    if (!pointsClaimed) {
      setPointsClaimed(true);
      addNotification('Social Bonus Claimed! 🎉', 'You earned +25 AromaRewards points for spreading the word!', 'promo');
    }
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden text-stone-100 p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Share Your Dining Feast</h3>
            <p className="text-xs text-stone-400">Share with friends & get +25 AromaPoints!</p>
          </div>
        </div>

        {/* Share preview card */}
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Referral Promo Code: AROMA-FEAST-15</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            Give your friends 15% off their first order, and you receive 50 bonus points when they dine!
          </p>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleShareClick('whatsapp')}
            className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => handleShareClick('twitter')}
            className="p-3 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-700/60 text-sky-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter / X</span>
          </button>
          <button
            onClick={() => handleShareClick('instagram')}
            className="p-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram Story</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>

        {pointsClaimed && (
          <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/40 text-center text-xs text-amber-300 font-semibold flex items-center justify-center space-x-1.5">
            <Award className="w-4 h-4" />
            <span>+25 Points added to your account!</span>
          </div>
        )}
      </div>
    </div>
  );
};
