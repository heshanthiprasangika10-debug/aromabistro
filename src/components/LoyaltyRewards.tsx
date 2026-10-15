import React, { useState } from 'react';
import {
  Sparkles,
  Gift,
  Award,
  CheckCircle2,
  Copy,
  Check,
  X,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface LoyaltyRewardsProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher?: (discount: number) => void;
}

export const LoyaltyRewards: React.FC<LoyaltyRewardsProps> = ({ isOpen, onClose, onApplyVoucher }) => {
  const { loyalty, redeemVoucher } = useRestaurant();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRedeem = (voucherId: string) => {
    const amount = redeemVoucher(voucherId);
    if (onApplyVoucher && amount > 0) {
      onApplyVoucher(amount);
      onClose();
    }
  };

  const tierRequirements = {
    Bronze: { min: 0, next: 100, nextTier: 'Silver' },
    Silver: { min: 100, next: 250, nextTier: 'Gold' },
    Gold: { min: 250, next: 500, nextTier: 'Platinum' },
    Platinum: { min: 500, next: 1000, nextTier: 'Max VIP Tier' }
  };

  const currentTierInfo = tierRequirements[loyalty.tier];
  const progressPct = Math.min(100, Math.floor(((loyalty.totalSpent - currentTierInfo.min) / (currentTierInfo.next - currentTierInfo.min)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden text-stone-100 p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-serif">AromaRewards Club</h2>
            <p className="text-xs text-stone-400">Dine, earn points, and unlock exclusive culinary perks</p>
          </div>
        </div>

        {/* Member Tier Card */}
        <div className="bg-gradient-to-br from-amber-900/60 via-stone-900 to-amber-950/80 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-widest block">VIP Tier Status</span>
              <h3 className="text-2xl font-black text-white font-serif">{loyalty.tier} Member</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 uppercase tracking-widest block">Points Balance</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{loyalty.points} pts</span>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-stone-300">
              <span>Total Spent: ${loyalty.totalSpent.toFixed(2)}</span>
              <span>Next Tier: {currentTierInfo.nextTier} (${currentTierInfo.next})</span>
            </div>
            <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-amber-200/90 pt-1 border-t border-amber-900/40">
            <span>Lifetime Orders: {loyalty.totalOrders}</span>
            <span>$1 Spent = 1 AromaPoint</span>
          </div>
        </div>

        {/* Available Vouchers & Coupons */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Your Exclusive Vouchers</span>
          </h4>

          <div className="space-y-2.5">
            {loyalty.vouchers.map(v => (
              <div
                key={v.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  v.used
                    ? 'bg-stone-950/60 border-stone-800 opacity-50'
                    : 'bg-stone-950 border-amber-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-400 text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {v.code}
                    </span>
                    <span className="text-xs font-bold text-white">${v.discountAmount.toFixed(2)} Off</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">{v.description}</p>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Expires: {v.expiresAt}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={v.used}
                    onClick={() => handleCopy(v.code)}
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {!v.used && (
                    <button
                      onClick={() => handleRedeem(v.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow"
                    >
                      Redeem
                    </button>
                  )}
                  {v.used && (
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Redeemed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs text-stone-300">
          <span className="font-bold text-white block">AromaRewards Perks:</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Complimentary Birthday Dessert</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>100 Pts = $5 Instant Discount</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Priority Table Reservation</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Secret Chef's Tasting Invites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
