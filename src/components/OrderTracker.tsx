import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  Sparkles,
  ArrowLeft,
  Search,
  MessageCircle,
  HelpCircle,
  BellRing
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus } from '../types';

interface OrderTrackerProps {
  onBackToMenu: () => void;
  onOpenChat: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ onBackToMenu, onOpenChat }) => {
  const { orders, activeOrder, setActiveOrderById, selectedTable, sendMessage } = useRestaurant();
  const [searchCode, setSearchCode] = useState('');
  const [serviceMessageSent, setServiceMessageSent] = useState(false);

  const displayOrder = activeOrder || (orders.length > 0 ? orders[0] : null);

  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Order Received', desc: 'Sent to Chef & KDS station', icon: <BellRing className="w-5 h-5" /> },
    { key: 'preparing', label: 'Kitchen Preparing', desc: 'Fresh ingredients being cooked', icon: <ChefHat className="w-5 h-5" /> },
    { key: 'ready', label: 'Plated & Ready', desc: 'Ready for table service or dispatch', icon: <Sparkles className="w-5 h-5" /> },
    { key: 'served', label: 'Served / Out', desc: 'Delivered to your table', icon: <Bike className="w-5 h-5" /> },
    { key: 'completed', label: 'Completed', desc: 'Thank you for dining with us!', icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'served': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = displayOrder ? getStepIndex(displayOrder.status) : 0;

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      o => o.orderNumber.toLowerCase() === searchCode.trim().toLowerCase() || o.id === searchCode.trim()
    );
    if (found) {
      setActiveOrderById(found.id);
      setSearchCode('');
    }
  };

  const handleRequestUpdate = () => {
    if (!displayOrder) return;
    sendMessage(`Inquiry regarding Order #${displayOrder.orderNumber}: Any updates on prep time?`, 'customer', displayOrder.tableNumber || selectedTable);
    setServiceMessageSent(true);
    setTimeout(() => setServiceMessageSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-8 px-4 sm:px-6 max-w-4xl mx-auto pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-stone-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        {/* Order search box */}
        <form onSubmit={handleSearchOrder} className="flex space-x-1.5">
          <input
            type="text"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            placeholder="Find by #AB-101..."
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-36 sm:w-48"
          />
          <button
            type="submit"
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl border border-stone-700"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {!displayOrder ? (
        <div className="text-center py-20 bg-stone-900/60 rounded-3xl border border-stone-800">
          <Clock className="w-12 h-12 text-stone-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">No Active Orders Yet</h2>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1 mb-4">
            Place your first order from our menu to track live kitchen preparation and delivery progress!
          </p>
          <button
            onClick={onBackToMenu}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
          >
            Explore Menu & Order
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    Order #{displayOrder.orderNumber}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {displayOrder.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Placed at {new Date(displayOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  <span className="capitalize">{displayOrder.type}</span>
                  {displayOrder.tableNumber && ` (Table ${displayOrder.tableNumber})`}
                </p>
              </div>

              {/* Estimated Prep Timer */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Estimated Wait</span>
                  <span className="text-lg font-black text-white font-mono">
                    {displayOrder.status === 'ready' || displayOrder.status === 'served' || displayOrder.status === 'completed'
                      ? 'Ready Now!'
                      : '~12 - 16 mins'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Step Progress Timeline */}
            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className={`flex flex-col items-center text-center p-3 rounded-2xl border transition ${
                        isCurrent
                          ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/40'
                          : isDone
                          ? 'bg-stone-950/60 border-stone-800 text-stone-300'
                          : 'bg-stone-950/30 border-stone-900 text-stone-600'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold transition ${
                          isDone
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-stone-500'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : isDone ? 'text-white' : 'text-stone-500'}`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5 max-w-[120px]">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Kitchen Feed Note */}
            <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-stone-300">
                  {displayOrder.status === 'pending' && 'Order received at KDS station. Waiting for chef assignment.'}
                  {displayOrder.status === 'preparing' && 'Chef is currently seasoning and cooking your order in the kitchen.'}
                  {displayOrder.status === 'ready' && 'Order is plated, garnished, and ready to be served to your table!'}
                  {displayOrder.status === 'served' && 'Delivered to Table. Bon Appétit! Enjoy your delicious meal.'}
                  {displayOrder.status === 'completed' && 'Order completed and closed.'}
                </span>
              </div>
              <button
                onClick={handleRequestUpdate}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-semibold border border-stone-700 shrink-0 cursor-pointer"
              >
                Page Waiter
              </button>
            </div>
            {serviceMessageSent && (
              <p className="text-[11px] text-emerald-400 mt-2 text-center font-medium">
                ✓ Message dispatched to floor staff!
              </p>
            )}
          </div>

          {/* Order Details & Summary Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Ordered Dishes & Customizations</h3>
            <div className="divide-y divide-stone-800">
              {displayOrder.items.map(item => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-400 text-sm">{item.quantity}x</span>
                      <span className="font-bold text-white text-sm">{item.name}</span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-stone-400 mt-0.5 italic">Note: {item.notes}</p>
                    )}
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-xs text-amber-300/80">Extras: {item.selectedOptions.join(', ')}</p>
                    )}
                  </div>
                  <span className="font-bold text-sm text-white font-mono">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment & Total breakdown */}
            <div className="border-t border-stone-800 pt-4 space-y-1.5 text-xs text-stone-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${displayOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax & Service (10%)</span>
                <span>${displayOrder.tax.toFixed(2)}</span>
              </div>
              {displayOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Loyalty / Voucher Discount</span>
                  <span>-${displayOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-stone-800">
                <span>Total Paid</span>
                <span className="text-amber-400 font-mono">${displayOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                <span>Payment Method</span>
                <span className="uppercase text-stone-400 font-semibold">{displayOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>Loyalty Points Earned</span>
                <span className="text-amber-400 font-bold">+{displayOrder.loyaltyPointsEarned} AromaPoints</span>
              </div>
            </div>
          </div>

          {/* Quick Help / Inquiry Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/60 border border-stone-800 p-4 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs text-stone-400">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Have a question about spice level or ingredients in your dish?</span>
            </div>
            <button
              onClick={onOpenChat}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl text-xs font-bold border border-amber-500/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask AromaBot AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
