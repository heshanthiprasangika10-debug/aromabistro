/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { CustomerMenu } from './components/CustomerMenu';
import { CartDrawer } from './components/CartDrawer';
import { PaymentModal } from './components/PaymentModal';
import { OrderTracker } from './components/OrderTracker';
import { KitchenKDS } from './components/KitchenKDS';
import { PosCashier } from './components/PosCashier';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatBot } from './components/ChatBot';
import { LoyaltyRewards } from './components/LoyaltyRewards';
import { SocialShareModal } from './components/SocialShareModal';
import { TableReservationModal } from './components/TableReservationModal';
import { Bot, Sparkles, ShoppingBag, Clock } from 'lucide-react';
import { Order } from './types';

function MainApp() {
  const { currentRole, cartItemCount, activeOrder } = useRestaurant();

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  // Payment checkout parameters
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPointsUsed, setCheckoutPointsUsed] = useState(0);
  const [checkoutNotes, setCheckoutNotes] = useState('');

  const handleProceedToPayment = (discount: number, pointsUsed: number, notes: string) => {
    setCheckoutDiscount(discount);
    setCheckoutPointsUsed(pointsUsed);
    setCheckoutNotes(notes);
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setIsPaymentOpen(false);
    setIsOrderTrackerOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Global Navigation Header */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onOpenSocial={() => setIsSocialOpen(true)}
        onOpenReservation={() => setIsReservationOpen(true)}
      />

      {/* Main Role-Based Views */}
      <div className="flex-1">
        {currentRole === 'customer' && (
          isOrderTrackerOpen ? (
            <OrderTracker
              onBackToMenu={() => setIsOrderTrackerOpen(false)}
              onOpenChat={() => setIsChatOpen(true)}
            />
          ) : (
            <CustomerMenu
              onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
              onOpenChat={() => setIsChatOpen(true)}
              onOpenLoyalty={() => setIsLoyaltyOpen(true)}
              onOpenSocial={() => setIsSocialOpen(true)}
              onOpenReservation={() => setIsReservationOpen(true)}
            />
          )
        )}

        {currentRole === 'kitchen' && <KitchenKDS />}

        {currentRole === 'pos' && <PosCashier />}

        {currentRole === 'admin' && <AdminDashboard />}
      </div>

      {/* Floating Action Buttons for Diners */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end space-y-3">
        {/* Active Order Pill if exists and in customer view */}
        {currentRole === 'customer' && activeOrder && !isOrderTrackerOpen && (
          <button
            onClick={() => setIsOrderTrackerOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-stone-900 to-amber-950 border border-amber-500/50 hover:border-amber-400 text-white px-4 py-2.5 rounded-full shadow-2xl transition hover:scale-105 cursor-pointer text-xs font-bold"
          >
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Track #{activeOrder.orderNumber}</span>
            <span className="bg-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full uppercase">
              {activeOrder.status}
            </span>
          </button>
        )}

        {/* Floating AromaBot AI Assistant Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-orange-950/60 border border-amber-400/30 transition-transform duration-200 hover:scale-105 cursor-pointer"
          title="Ask AromaBot AI & Waiter Pager"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-stone-950" />
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            AromaBot AI
          </span>
          <span className="hidden sm:inline text-[10px] bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded-full">
            Online
          </span>
        </button>
      </div>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* Secure Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        discount={checkoutDiscount}
        loyaltyPointsUsed={checkoutPointsUsed}
        notes={checkoutNotes}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Floating Chat / AI Concierge Modal */}
      <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Loyalty Rewards Modal */}
      <LoyaltyRewards
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        onApplyVoucher={discount => {
          setCheckoutDiscount(prev => prev + discount);
          setIsCartOpen(true);
        }}
      />

      {/* Social Media Share Modal */}
      <SocialShareModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
      />

      {/* Customer Table Reservation Modal */}
      <TableReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <MainApp />
    </RestaurantProvider>
  );
}
