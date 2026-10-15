import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: (discountAmount: number, pointsUsed: number, notes: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToPayment }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    orderType,
    setOrderType,
    selectedTable,
    setSelectedTable,
    loyalty,
    redeemVoucher
  } = useRestaurant();

  const [usePoints, setUsePoints] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!isOpen) return null;

  const pointsDiscount = usePoints && loyalty.points >= 100 ? 5.00 : 0;
  const totalDiscount = appliedDiscount + pointsDiscount;
  const tax = Number((cartSubtotal * 0.1).toFixed(2));
  const finalTotal = Math.max(0, Number((cartSubtotal + tax - totalDiscount).toFixed(2)));

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'GOLD5OFF' || code === 'AROMA5') {
      setAppliedDiscount(5.00);
      setPromoMessage('✓ $5.00 discount applied!');
    } else if (code === 'WELCOME10') {
      const disc = Number((cartSubtotal * 0.1).toFixed(2));
      setAppliedDiscount(disc);
      setPromoMessage(`✓ 10% discount applied (-$${disc.toFixed(2)})!`);
    } else {
      setPromoMessage('Invalid coupon code. Try AROMA5 or GOLD5OFF');
    }
  };

  const handleProceed = () => {
    let notes = orderNotes;
    if (orderType === 'delivery' && deliveryAddress) {
      notes += ` [Delivery Address: ${deliveryAddress}]`;
    }
    onProceedToPayment(totalDiscount, usePoints ? 100 : 0, notes);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col justify-between text-stone-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-600/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Dining Tray</h2>
                <p className="text-xs text-stone-400">{cart.length} unique items selected</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-stone-500 hover:text-rose-400 transition cursor-pointer p-1"
                  title="Clear all items"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tray Items List */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-800 mx-auto flex items-center justify-center text-stone-500">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-white">Your tray is empty</h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Browse our mouthwatering Kottu, Ceylon Curries, and Gourmet dishes to add items.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                {/* Dining Mode selector */}
                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Dining Type
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['dine-in', 'takeaway', 'delivery'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOrderType(type)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                          orderType === type
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        {type === 'dine-in' ? '🍽️ Dine-in' : type === 'takeaway' ? '🥡 Takeaway' : '🛵 Delivery'}
                      </button>
                    ))}
                  </div>

                  {orderType === 'dine-in' && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-stone-300">Serving to Table:</span>
                      <select
                        value={selectedTable}
                        onChange={e => setSelectedTable(Number(e.target.value))}
                        className="bg-stone-800 text-amber-300 font-bold px-2 py-1 rounded-lg border border-stone-700 focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>Table {n}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="Enter delivery address (e.g. 45 Galle Road, Colombo)"
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {cart.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-3 flex gap-3 items-center justify-between"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                        <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-stone-400 truncate mt-0.5 italic">
                            Note: {item.notes}
                          </p>
                        )}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <p className="text-[10px] text-amber-300/80 truncate">
                            +{item.selectedOptions.join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center space-x-1.5 bg-stone-800/90 rounded-lg p-1 border border-stone-700/60">
                        <button
                          onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-stone-300 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loyalty & Promo Section */}
                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AromaPoints Balance: {loyalty.points} pts</span>
                    </div>
                    {loyalty.points >= 100 && (
                      <button
                        type="button"
                        onClick={() => setUsePoints(!usePoints)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          usePoints
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                        }`}
                      >
                        {usePoints ? 'Points Applied (-$5)' : 'Use 100 pts'}
                      </button>
                    )}
                  </div>

                  {/* Promo Code Input */}
                  <div className="flex space-x-1.5 pt-1">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        placeholder="Coupon code (e.g. AROMA5)"
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white uppercase placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold rounded-xl text-xs border border-stone-700 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[11px] ${appliedDiscount > 0 ? 'text-emerald-400 font-medium' : 'text-rose-400'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Optional Cooking Notes */}
                <div>
                  <label className="text-[11px] font-medium text-stone-400 block mb-1">Kitchen / Table Note:</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="e.g. Please bring drinks first, extra ice..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax & Service (10%)</span>
                  <span className="font-semibold text-white">${tax.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount Applied</span>
                    <span>-${totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-stone-800">
                  <span>Total Amount</span>
                  <span className="text-amber-400 font-serif">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-orange-950/50 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
