import React, { useState } from 'react';
import {
  Receipt,
  Users,
  CheckCircle,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  MessageSquare,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, PaymentMethod } from '../types';

export const PosCashier: React.FC = () => {
  const { orders, updateOrderStatus, updateOrderPayment, messages, sendMessage, playChime } = useRestaurant();

  const [selectedTableNum, setSelectedTableNum] = useState<number>(4);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [replyText, setReplyText] = useState('');
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);

  // Derive Table Statuses
  const tableData = Array.from({ length: 12 }, (_, i) => {
    const tableNum = i + 1;
    const tableOrder = orders.find(
      o => o.tableNumber === tableNum && o.status !== 'completed' && o.status !== 'cancelled'
    );
    return {
      tableNum,
      order: tableOrder,
      status: tableOrder ? (tableOrder.paymentStatus === 'paid' ? 'paid-dining' : 'occupied') : 'available'
    };
  });

  const activeTableOrder = tableData.find(t => t.tableNum === selectedTableNum)?.order;

  const handleSettlePayment = async (orderId: string, method: PaymentMethod) => {
    playChime();
    await updateOrderPayment(orderId, method);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setReceiptModalOrder({ ...order, paymentStatus: 'paid', paymentMethod: method });
    }
  };

  const handleCloseOrder = async (orderId: string) => {
    playChime();
    await updateOrderStatus(orderId, 'completed');
  };

  const handleSendStaffReply = (tableNum: number) => {
    if (!replyText.trim()) return;
    sendMessage(replyText.trim(), 'staff', tableNum);
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 pb-28">
      {/* POS Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white font-mono">POS BILLING & FLOOR TABLES</h1>
            <p className="text-xs text-stone-400">Cashier Terminal #01 • Shift: Rohan Jay (Lead Cashier)</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-stone-300">Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-stone-300">Occupied / Dining</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-stone-300">Bill Settled</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Table Map (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Restaurant Dining Floor Plan (12 Tables)</span>
              </h2>
              <span className="text-xs text-stone-400">Select table to view ticket</span>
            </div>

            {/* Grid of Tables */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
              {tableData.map(t => {
                const isSelected = t.tableNum === selectedTableNum;
                const isOccupied = t.status !== 'available';

                return (
                  <button
                    key={t.tableNum}
                    onClick={() => setSelectedTableNum(t.tableNum)}
                    className={`relative p-4 rounded-2xl border flex flex-col justify-between transition cursor-pointer text-left h-28 ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/40 bg-stone-850 shadow-lg'
                        : t.status === 'paid-dining'
                        ? 'border-blue-700/60 bg-blue-950/20'
                        : isOccupied
                        ? 'border-amber-700/60 bg-amber-950/20 hover:border-amber-600'
                        : 'border-stone-800 bg-stone-900/60 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base font-mono text-white">Table {t.tableNum}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          t.status === 'paid-dining'
                            ? 'bg-blue-400'
                            : isOccupied
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-emerald-400'
                        }`}
                      />
                    </div>

                    <div>
                      {t.order ? (
                        <>
                          <div className="text-[11px] font-bold text-amber-300">
                            #{t.order.orderNumber}
                          </div>
                          <div className="text-xs font-black text-white font-mono">
                            ${t.order.total.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-stone-400 capitalize truncate">
                            {t.order.items.length} items • {t.order.status}
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] text-stone-500 font-medium">Ready for guests</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Service Pager & Live Chat Messages */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Customer Assistance & Waiter Paging Feed</span>
              </h3>
              <span className="text-xs text-stone-400">{messages.length} messages</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {messages.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">No pending table service requests.</p>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border text-xs flex justify-between items-start ${
                      m.sender === 'customer'
                        ? 'bg-amber-950/30 border-amber-800/40 text-stone-200'
                        : 'bg-stone-950 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-amber-400">{m.customerName}:</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick staff reply to selected table */}
            <div className="flex space-x-2 pt-2 border-t border-stone-800">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Send reply to Table ${selectedTableNum} (e.g. Server is on the way)...`}
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleSendStaffReply(selectedTableNum)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Send to Table
              </button>
            </div>
          </div>
        </div>

        {/* Right: Table Bill Presenter & Cashier Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-base text-white">Table {selectedTableNum} Details</h3>
                  <p className="text-xs text-stone-400">
                    {activeTableOrder ? `Order #${activeTableOrder.orderNumber}` : 'No active order for this table'}
                  </p>
                </div>
                {activeTableOrder && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      activeTableOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {activeTableOrder.paymentStatus}
                  </span>
                )}
              </div>

              {activeTableOrder ? (
                <div className="space-y-4">
                  {/* Order items */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-stone-800/80">
                    {activeTableOrder.items.map(item => (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">
                            <span className="text-amber-400 mr-1.5">{item.quantity}x</span>
                            {item.name}
                          </div>
                          {item.notes && <p className="text-[11px] text-stone-400 italic">Note: {item.notes}</p>}
                        </div>
                        <span className="font-mono font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Split Bill Calculator */}
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-300">Split Bill Among Guests:</span>
                      <div className="flex items-center space-x-1.5">
                        {[2, 3, 4].map(num => (
                          <button
                            key={num}
                            onClick={() => setSplitCount(num)}
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              splitCount === num ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {num} ways
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-amber-300 font-mono font-bold">
                      <span>Each Person Pays:</span>
                      <span>${(activeTableOrder.total / splitCount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-1.5 border-t border-stone-800 pt-3 text-xs text-stone-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${activeTableOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax & Service (10%)</span>
                      <span>${activeTableOrder.tax.toFixed(2)}</span>
                    </div>
                    {activeTableOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount</span>
                        <span>-${activeTableOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-extrabold text-white pt-2 border-t border-stone-800">
                      <span>Total Due</span>
                      <span className="text-amber-400 font-mono">${activeTableOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    {activeTableOrder.paymentStatus !== 'paid' ? (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleSettlePayment(activeTableOrder.id, 'card')}
                          className="py-2.5 px-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow transition cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Card</span>
                        </button>
                        <button
                          onClick={() => handleSettlePayment(activeTableOrder.id, 'cash')}
                          className="py-2.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow transition cursor-pointer"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Cash</span>
                        </button>
                        <button
                          onClick={() => handleSettlePayment(activeTableOrder.id, 'qr')}
                          className="py-2.5 px-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 shadow transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Pay</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-center text-xs text-emerald-300 font-semibold">
                          ✓ Bill Paid via {activeTableOrder.paymentMethod?.toUpperCase()}
                        </div>
                        <button
                          onClick={() => handleCloseOrder(activeTableOrder.id)}
                          className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl border border-stone-700 flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Clear & Reset Table for Next Guests</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-stone-500 space-y-2">
                  <p className="text-sm font-semibold text-stone-400">Table {selectedTableNum} is unoccupied</p>
                  <p className="text-xs">No active bills or pending food orders.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
