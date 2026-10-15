import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Printer,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
  loyaltyPointsUsed: number;
  notes: string;
  onOrderSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  discount,
  loyaltyPointsUsed,
  notes,
  onOrderSuccess
}) => {
  const { cartSubtotal, createOrder, selectedTable, orderType } = useRestaurant();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('421');
  const [cardHolder, setCardHolder] = useState('Heshanthi P.');
  const [customerName, setCustomerName] = useState('Heshanthi');
  const [customerPhone, setCustomerPhone] = useState('+94 77 123 4567');
  const [customerEmail, setCustomerEmail] = useState('heshanthiprasangika10@gmail.com');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const tax = Number((cartSubtotal * 0.1).toFixed(2));
  const total = Math.max(0, Number((cartSubtotal + tax - discount).toFixed(2)));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate safe SSL / payment gateway delay
    await new Promise(r => setTimeout(r, 1200));

    try {
      const order = await createOrder({
        customerName,
        customerPhone,
        customerEmail,
        discount,
        loyaltyPointsUsed,
        notes,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'unpaid' : 'paid'
      });

      setCompletedOrder(order);
      setIsProcessing(false);
      onOrderSuccess(order);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden text-stone-100">
        {!completedOrder ? (
          <>
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Secure Checkout & Payment</h3>
                  <p className="text-xs text-stone-400">256-Bit Encrypted Dining Transaction</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePay} className="p-5 space-y-4">
              {/* Customer Contact Details */}
              <div className="space-y-2 bg-stone-950 p-3 rounded-2xl border border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Customer & Order Notification
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-0.5">Your Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-0.5">Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 block mb-0.5">Email for Receipt & Kitchen Updates</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-2">Choose Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">Credit/Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      paymentMethod === 'qr'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">LankaQR Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold">Cash at Counter</span>
                  </button>
                </div>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-2.5 bg-gradient-to-br from-stone-950 to-stone-900 p-4 rounded-2xl border border-stone-800">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="font-semibold text-white">Card Information</span>
                    <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-amber-300">Visa / Mastercard / Amex</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="Card Number"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    placeholder="Cardholder Name"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* QR Pay Interface */}
              {paymentMethod === 'qr' && (
                <div className="text-center p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                  <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AROMABISTRO-PAY-$${total}`}
                      alt="Payment QR"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs font-semibold text-white">Scan with any LankaQR / Banking App</p>
                  <p className="text-[11px] text-stone-400">
                    Amount: <span className="font-bold text-amber-400">${total.toFixed(2)}</span> • Instant confirmation
                  </p>
                </div>
              )}

              {/* Cash at Counter Notice */}
              {paymentMethod === 'cash' && (
                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-1">
                  <p className="font-bold text-white">Pay at Counter or Table</p>
                  <p className="text-stone-400 leading-relaxed">
                    Our server will bring the wireless bill presenter to Table {orderType === 'dine-in' ? selectedTable : '(Takeaway)'} with your total of ${total.toFixed(2)}.
                  </p>
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 block">Total Payable</span>
                  <span className="text-2xl font-black text-amber-400 font-serif">${total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-950/40 transition cursor-pointer flex items-center space-x-2 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <span>Authorizing...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{paymentMethod === 'cash' ? 'Confirm Order' : `Pay $${total.toFixed(2)}`}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Order Complete & Receipt Modal */
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white font-serif">Order Confirmed & Placed!</h3>
              <p className="text-xs text-stone-400">
                Ticket sent instantly to Kitchen Display System (KDS).
              </p>
            </div>

            {/* Printable Receipt Paper Card */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs space-y-3 font-mono">
              <div className="text-center border-b border-dashed border-stone-700 pb-2.5">
                <p className="font-bold text-white text-sm">AROMABISTRO RESTAURANT</p>
                <p className="text-[10px] text-stone-400">No. 24 Marine Drive, Colombo 03</p>
                <p className="text-[10px] text-stone-400">Tel: +94 11 234 5678</p>
              </div>

              <div className="flex justify-between text-stone-300">
                <span>Order No:</span>
                <span className="font-bold text-amber-400">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Dining Type:</span>
                <span className="uppercase font-semibold">
                  {completedOrder.type} {completedOrder.tableNumber ? `(Table ${completedOrder.tableNumber})` : ''}
                </span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Payment:</span>
                <span className="uppercase text-emerald-400 font-bold">
                  {completedOrder.paymentStatus} ({completedOrder.paymentMethod})
                </span>
              </div>

              {/* Items */}
              <div className="border-t border-b border-dashed border-stone-700 py-2 space-y-1">
                {completedOrder.items.map(i => (
                  <div key={i.id} className="flex justify-between">
                    <span className="truncate pr-2">
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-semibold text-white">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal:</span>
                  <span>${completedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Tax (10%):</span>
                  <span>${completedOrder.tax.toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-${completedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-stone-800">
                  <span>Total Paid:</span>
                  <span className="text-amber-400">${completedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md"
              >
                <span>Track Live Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
