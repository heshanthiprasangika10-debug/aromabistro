import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Filter,
  Check,
  Utensils
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus } from '../types';

export const KitchenKDS: React.FC = () => {
  const { orders, updateOrderStatus, menu, toggleAvailability, playChime } = useRestaurant();
  const [filterType, setFilterType] = useState<string>('all');
  const [now, setNow] = useState(Date.now());
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Update elapsed timers every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeOrders = orders.filter(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  );

  const filteredOrders = activeOrders.filter(o => {
    if (filterType === 'all') return true;
    return o.type === filterType;
  });

  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  const preparingOrders = filteredOrders.filter(o => o.status === 'preparing');
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');

  const getElapsedMinutes = (createdAt: string) => {
    const elapsed = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  const getUrgencyBadge = (mins: number) => {
    if (mins >= 20) {
      return (
        <span className="bg-red-600/90 text-white font-mono px-2 py-0.5 rounded text-xs font-black animate-pulse flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{mins}m (URGENT)</span>
        </span>
      );
    }
    if (mins >= 12) {
      return (
        <span className="bg-amber-600 text-stone-950 font-mono px-2 py-0.5 rounded text-xs font-bold">
          {mins}m
        </span>
      );
    }
    return (
      <span className="bg-emerald-800 text-emerald-200 font-mono px-2 py-0.5 rounded text-xs font-medium">
        {mins}m
      </span>
    );
  };

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    if (soundAlerts) playChime();
    await updateOrderStatus(orderId, nextStatus);
  };

  const renderTicket = (order: Order) => {
    const elapsed = getElapsedMinutes(order.createdAt);
    return (
      <div
        key={order.id}
        className={`bg-stone-900 border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition ${
          elapsed >= 20 ? 'border-red-600/80' : elapsed >= 12 ? 'border-amber-600/60' : 'border-stone-800'
        }`}
      >
        <div>
          {/* Ticket Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black font-mono text-white">#{order.orderNumber}</span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-stone-700">
                {order.type} {order.tableNumber ? `(T${order.tableNumber})` : ''}
              </span>
            </div>
            {getUrgencyBadge(elapsed)}
          </div>

          <div className="text-[11px] text-stone-400 mb-2 flex justify-between">
            <span>Customer: {order.customerName}</span>
            <span className="text-stone-500 font-mono">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Items list */}
          <div className="space-y-2 py-1">
            {order.items.map(item => (
              <div key={item.id} className="bg-stone-950/70 p-2 rounded-xl border border-stone-800/80">
                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-amber-400 text-sm mr-2">{item.quantity}x</span>
                  <span className="font-bold text-white text-xs flex-1">{item.name}</span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-rose-300 font-semibold mt-1 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                    ⚠️ {item.notes}
                  </p>
                )}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <p className="text-[10px] text-amber-200/80 mt-0.5 font-medium">
                    + {item.selectedOptions.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="mt-2 p-2 bg-amber-950/30 border border-amber-900/40 rounded-lg text-[11px] text-amber-300">
              <strong>Order Note:</strong> {order.notes}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 mt-3 border-t border-stone-800 flex gap-2">
          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange(order.id, 'preparing')}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Flame className="w-4 h-4" />
              <span>Start Cooking</span>
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              onClick={() => handleStatusChange(order.id, 'ready')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Mark Plated & Ready</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={() => handleStatusChange(order.id, 'served')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Served to Table</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 pb-28">
      {/* KDS Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white font-mono flex items-center space-x-2">
              <span>KITCHEN DISPLAY SYSTEM (KDS)</span>
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-stone-400">Station: Main Hot Line & Grill • Active Tickets: {activeOrders.length}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Order type filter */}
          <div className="flex items-center space-x-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400 ml-2" />
            {(['all', 'dine-in', 'takeaway', 'delivery'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                  filterType === f ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
              soundAlerts
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
          >
            {soundAlerts ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundAlerts ? 'Audio Chimes On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Pipeline Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: New Orders */}
        <div className="space-y-3">
          <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-extrabold text-sm text-white">NEW TICKETS ({pendingOrders.length})</h2>
            </div>
            <span className="text-[11px] text-stone-400">Needs prep assignment</span>
          </div>

          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/80 text-stone-500 text-xs">
                No new incoming tickets
              </div>
            ) : (
              pendingOrders.map(renderTicket)
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="space-y-3">
          <div className="bg-stone-900/90 border border-orange-600/40 rounded-2xl p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
              <h2 className="font-extrabold text-sm text-white">COOKING IN PROGRESS ({preparingOrders.length})</h2>
            </div>
            <span className="text-[11px] text-stone-400">On grill & stoves</span>
          </div>

          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/80 text-stone-500 text-xs">
                No active cooking tickets
              </div>
            ) : (
              preparingOrders.map(renderTicket)
            )}
          </div>
        </div>

        {/* Column 3: Plated & Ready */}
        <div className="space-y-3">
          <div className="bg-stone-900/90 border border-emerald-600/40 rounded-2xl p-3 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="font-extrabold text-sm text-white">PLATED & READY ({readyOrders.length})</h2>
            </div>
            <span className="text-[11px] text-stone-400">Call waiter / service</span>
          </div>

          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/80 text-stone-500 text-xs">
                No plated orders waiting
              </div>
            ) : (
              readyOrders.map(renderTicket)
            )}
          </div>
        </div>
      </div>

      {/* Quick 86'd (Sold Out) Item Station at Bottom */}
      <div className="max-w-7xl mx-auto mt-8 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Utensils className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Kitchen 86'd Dish Inventory Control</h3>
          </div>
          <span className="text-[11px] text-stone-400">Click to instantly toggle dish stock availability</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => toggleAvailability(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                item.isAvailable
                  ? 'bg-stone-950 border-stone-700 text-stone-300 hover:border-amber-500'
                  : 'bg-red-950/80 border-red-600 text-red-200 line-through'
              }`}
            >
              <span>{item.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${item.isAvailable ? 'bg-emerald-950 text-emerald-400' : 'bg-red-800 text-white'}`}>
                {item.isAvailable ? 'In Stock' : '86\'d'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
