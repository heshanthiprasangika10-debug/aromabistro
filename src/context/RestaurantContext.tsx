import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  Order,
  OrderStatus,
  UserRole,
  StaffMember,
  SupportMessage,
  PushNotification,
  LoyaltyProfile,
  OrderItem,
  PaymentMethod,
  TableReservation,
  ReservationStatus,
  SeatingArea,
  SpecialOccasion
} from '../types';

interface CartItem extends OrderItem {
  image?: string;
  category?: string;
}

interface RestaurantContextType {
  // Menu
  menu: MenuItem[];
  isLoadingMenu: boolean;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'rating' | 'reviewsCount'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;

  // Table Reservations
  reservations: TableReservation[];
  isLoadingReservations: boolean;
  createReservation: (data: Omit<TableReservation, 'id' | 'reservationCode' | 'createdAt' | 'status'>) => Promise<TableReservation>;
  updateReservation: (id: string, updates: Partial<TableReservation>) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrderById: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderPayment: (orderId: string, paymentMethod: PaymentMethod) => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, notes?: string, selectedOptions?: string[]) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;

  // Role & Staff
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  staffList: StaffMember[];
  verifyStaffPin: (pin: string, expectedRole: UserRole) => boolean;

  // Dine-in Table
  selectedTable: number;
  setSelectedTable: (tableNum: number) => void;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  setOrderType: (type: 'dine-in' | 'takeaway' | 'delivery') => void;

  // Messages & Customer Support
  messages: SupportMessage[];
  sendMessage: (message: string, sender?: 'customer' | 'staff', tableNum?: number) => Promise<void>;

  // Notifications
  notifications: PushNotification[];
  dismissNotification: (id: string) => void;
  addNotification: (title: string, message: string, type?: 'order' | 'promo' | 'system' | 'kitchen') => void;

  // Loyalty Program
  loyalty: LoyaltyProfile;
  redeemVoucher: (voucherId: string) => number; // returns discount amount

  // Offline Mode & Connectivity
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => Promise<void>;

  // Audio Chime
  playChime: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

const DEFAULT_STAFF: StaffMember[] = [
  { id: 's1', name: 'Nishan Fernando (Manager)', role: 'Admin', pin: '1234', active: true, avatar: '👔', email: 'nishan@aromabistro.com' },
  { id: 's2', name: 'Chef Samantha (Head Chef)', role: 'Head Chef', pin: '2345', active: true, avatar: '👨‍🍳', email: 'samantha@aromabistro.com' },
  { id: 's3', name: 'Rohan Jay (Lead Cashier)', role: 'Cashier', pin: '3456', active: true, avatar: '🧾', email: 'rohan@aromabistro.com' },
  { id: 's4', name: 'Malini Perera (Floor Server)', role: 'Server', pin: '4567', active: true, avatar: '💁‍♀️', email: 'malini@aromabistro.com' }
];

const INITIAL_LOYALTY: LoyaltyProfile = {
  customerId: 'c-101',
  name: 'Heshanthi (You)',
  points: 240,
  tier: 'Gold',
  totalOrders: 14,
  totalSpent: 385.50,
  vouchers: [
    { id: 'v1', code: 'GOLD5OFF', discountAmount: 5, description: '$5 Off Any Order over $25', expiresAt: '2026-11-30', used: false },
    { id: 'v2', code: 'SWEETTREAT', discountAmount: 8.50, description: 'Free Dessert with 2 Mains', expiresAt: '2026-12-15', used: false }
  ]
};

// Web Audio API Synthesized Chime (no external asset needed)
function playToneNotification() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Ignore audio permission restrictions before user interaction
  }
}

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [staffList] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [selectedTable, setSelectedTable] = useState<number>(4);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile>(() => {
    const cached = localStorage.getItem('aroma_loyalty');
    return cached ? JSON.parse(cached) : INITIAL_LOYALTY;
  });
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif-1',
      title: '🎉 Happy Hour 20% Off!',
      message: 'Enjoy 20% off all Kottu & Roti varieties until 7 PM today.',
      timestamp: '10m ago',
      type: 'promo',
      read: false
    }
  ]);
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    const cached = localStorage.getItem('aroma_offline_orders');
    return cached ? JSON.parse(cached) : [];
  });

  const playChime = useCallback(() => {
    playToneNotification();
  }, []);

  const addNotification = useCallback((title: string, message: string, type: 'order' | 'promo' | 'system' | 'kitchen' = 'system') => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    playChime();
  }, [playChime]);

  // Load Menu, Orders, and Reservations from Server
  const fetchMenuAndOrders = useCallback(async () => {
    try {
      const [menuRes, ordersRes, msgsRes, resRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/orders'),
        fetch('/api/messages'),
        fetch('/api/reservations')
      ]);

      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenu(data.menu || []);
        localStorage.setItem('aroma_cached_menu', JSON.stringify(data.menu));
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
        localStorage.setItem('aroma_cached_orders', JSON.stringify(data.orders));
        if (!activeOrder && data.orders?.length > 0) {
          setActiveOrder(data.orders[0]);
        }
      }
      if (msgsRes.ok) {
        const data = await msgsRes.json();
        setMessages(data.messages || []);
      }
      if (resRes.ok) {
        const data = await resRes.json();
        setReservations(data.reservations || []);
        localStorage.setItem('aroma_cached_reservations', JSON.stringify(data.reservations));
      }
    } catch (err) {
      console.warn('Network offline or fetch error, loading from local cache:', err);
      // Fallback to cache
      const cachedMenu = localStorage.getItem('aroma_cached_menu');
      if (cachedMenu) setMenu(JSON.parse(cachedMenu));
      const cachedOrders = localStorage.getItem('aroma_cached_orders');
      if (cachedOrders) setOrders(JSON.parse(cachedOrders));
      const cachedRes = localStorage.getItem('aroma_cached_reservations');
      if (cachedRes) setReservations(JSON.parse(cachedRes));
    } finally {
      setIsLoadingMenu(false);
      setIsLoadingReservations(false);
    }
  }, [activeOrder]);

  useEffect(() => {
    fetchMenuAndOrders();
    const interval = setInterval(fetchMenuAndOrders, 5000); // Poll for real-time kitchen & order updates
    return () => clearInterval(interval);
  }, [fetchMenuAndOrders]);

  // Sync offline queue when back online
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    try {
      for (const queuedOrder of offlineQueue) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queuedOrder)
        });
      }
      localStorage.removeItem('aroma_offline_orders');
      setOfflineQueue([]);
      addNotification('Offline Sync Complete', 'Queued orders have been synced to the kitchen server!', 'system');
      fetchMenuAndOrders();
    } catch (e) {
      console.error('Failed to sync offline queue:', e);
    }
  }, [offlineQueue, addNotification, fetchMenuAndOrders]);

  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isOffline, offlineQueue, syncOfflineQueue]);

  // Cart operations
  const addToCart = (item: MenuItem, quantity = 1, notes = '', selectedOptions: string[] = []) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        ci => ci.menuItemId === item.id && ci.notes === notes && JSON.stringify(ci.selectedOptions) === JSON.stringify(selectedOptions)
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity,
          notes,
          selectedOptions,
          image: item.image,
          category: item.category
        }
      ];
    });
    addNotification('Added to Order', `${item.name} (${quantity}) added to your tray`, 'order');
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Menu operations
  const addMenuItem = async (itemData: Omit<MenuItem, 'id' | 'rating' | 'reviewsCount'>) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (res.ok) {
        const data = await res.json();
        setMenu(prev => [data.item, ...prev]);
        addNotification('Menu Updated', `New dish "${itemData.name}" added successfully!`, 'system');
      }
    } catch (err) {
      // Local fallback
      const newItem: MenuItem = {
        ...itemData,
        id: `m-${Date.now()}`,
        rating: 5.0,
        reviewsCount: 1
      };
      setMenu(prev => [newItem, ...prev]);
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setMenu(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
        addNotification('Menu Item Saved', `Dish updated successfully.`, 'system');
      }
    } catch (err) {
      setMenu(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    } catch (err) {
      // fallback
    }
    setMenu(prev => prev.filter(m => m.id !== id));
    addNotification('Dish Removed', 'Item deleted from menu.', 'system');
  };

  const toggleAvailability = async (id: string) => {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const newStatus = !item.isAvailable;
    setMenu(prev => prev.map(m => (m.id === id ? { ...m, isAvailable: newStatus } : m)));
    try {
      await fetch(`/api/menu/${id}/toggle`, { method: 'PATCH' });
    } catch (e) {
      // ignored in offline
    }
    addNotification(
      'Availability Changed',
      `"${item.name}" is now ${newStatus ? 'Available' : 'Sold Out (86\'d)'}`,
      'kitchen'
    );
  };

  // Order operations
  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `AB-${Math.floor(100 + Math.random() * 900)}`,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
      customerName: orderData.customerName || 'Heshanthi (You)',
      customerPhone: orderData.customerPhone || '+94 77 123 4567',
      customerEmail: orderData.customerEmail || 'heshanthiprasangika10@gmail.com',
      items: cart.map(c => ({
        id: c.id,
        menuItemId: c.menuItemId,
        name: c.name,
        price: c.price,
        quantity: c.quantity,
        notes: c.notes,
        selectedOptions: c.selectedOptions
      })),
      subtotal: cartSubtotal,
      tax: Number((cartSubtotal * 0.1).toFixed(2)),
      discount: orderData.discount || 0,
      total: Number((cartSubtotal + cartSubtotal * 0.1 - (orderData.discount || 0)).toFixed(2)),
      status: 'pending',
      paymentStatus: orderData.paymentStatus || 'paid',
      paymentMethod: orderData.paymentMethod || 'card',
      notes: orderData.notes || '',
      loyaltyPointsEarned: Math.floor(cartSubtotal),
      loyaltyPointsUsed: orderData.loyaltyPointsUsed || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isOffline) {
      // Store in offline queue
      const updatedQueue = [...offlineQueue, newOrder];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('aroma_offline_orders', JSON.stringify(updatedQueue));
      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      clearCart();
      addNotification('Order Queued Offline', `Order #${newOrder.orderNumber} saved locally. Will sync when online!`, 'order');
      return newOrder;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const data = await res.json();
        const created = data.order || newOrder;
        setOrders(prev => [created, ...prev]);
        setActiveOrder(created);
        clearCart();

        // Update Loyalty Profile
        const updatedLoyalty: LoyaltyProfile = {
          ...loyalty,
          points: loyalty.points + created.loyaltyPointsEarned - created.loyaltyPointsUsed,
          totalOrders: loyalty.totalOrders + 1,
          totalSpent: loyalty.totalSpent + created.total
        };
        // Tier upgrade check
        if (updatedLoyalty.totalSpent > 500) updatedLoyalty.tier = 'Platinum';
        else if (updatedLoyalty.totalSpent > 250) updatedLoyalty.tier = 'Gold';
        else if (updatedLoyalty.totalSpent > 100) updatedLoyalty.tier = 'Silver';

        setLoyalty(updatedLoyalty);
        localStorage.setItem('aroma_loyalty', JSON.stringify(updatedLoyalty));

        addNotification(
          'Order Sent to Kitchen',
          `Order #${created.orderNumber} placed! Estimated prep time: ~18 mins.`,
          'order'
        );
        return created;
      }
    } catch (e) {
      console.warn('Network issue creating order, fallback locally:', e);
    }

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder(prev => (prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null));
    }

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      // handled
    }

    addNotification(
      'Order Status Updated',
      `Order is now marked as ${status.toUpperCase()}!`,
      status === 'ready' ? 'kitchen' : 'order'
    );
  };

  const updateOrderPayment = async (orderId: string, paymentMethod: PaymentMethod) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, paymentStatus: 'paid', paymentMethod } : o)));
    try {
      await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid', paymentMethod })
      });
    } catch (e) {
      // offline handled
    }
    addNotification('Payment Received', `Order payment settled via ${paymentMethod.toUpperCase()}`, 'order');
  };

  const setActiveOrderById = (orderId: string) => {
    const found = orders.find(o => o.id === orderId);
    if (found) setActiveOrder(found);
  };

  // Staff PIN verification
  const verifyStaffPin = (pin: string, expectedRole: UserRole): boolean => {
    if (pin === '1234') return true; // Master bypass PIN
    const member = staffList.find(s => s.pin === pin);
    if (!member) return false;
    if (expectedRole === 'admin') return member.role === 'Admin';
    if (expectedRole === 'kitchen') return member.role === 'Head Chef' || member.role === 'Kitchen Staff' || member.role === 'Admin';
    if (expectedRole === 'pos') return member.role === 'Cashier' || member.role === 'Server' || member.role === 'Admin';
    return true;
  };

  // Messages
  const sendMessage = async (messageText: string, sender: 'customer' | 'staff' = 'customer', tableNum = selectedTable) => {
    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      sender,
      tableNumber: tableNum,
      customerName: sender === 'customer' ? `Table ${tableNum}` : 'Floor Staff',
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {
      // offline
    }

    if (sender === 'customer') {
      addNotification(`New Request from Table ${tableNum}`, messageText, 'kitchen');
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const redeemVoucher = (voucherId: string): number => {
    const v = loyalty.vouchers.find(item => item.id === voucherId && !item.used);
    if (!v) return 0;
    const updated = {
      ...loyalty,
      vouchers: loyalty.vouchers.map(item => (item.id === voucherId ? { ...item, used: true } : item))
    };
    setLoyalty(updated);
    localStorage.setItem('aroma_loyalty', JSON.stringify(updated));
    addNotification('Voucher Applied', `Successfully redeemed ${v.code} for $${v.discountAmount.toFixed(2)} off!`, 'promo');
    return v.discountAmount;
  };

  // Table Reservations Management
  const createReservation = async (
    data: Omit<TableReservation, 'id' | 'reservationCode' | 'createdAt' | 'status'>
  ): Promise<TableReservation> => {
    const resCode = `RES-${Math.floor(100 + Math.random() * 900)}`;
    const newRes: TableReservation = {
      ...data,
      id: `res-${Date.now()}`,
      reservationCode: resCode,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        const created = json.reservation || newRes;
        setReservations(prev => [created, ...prev]);
        addNotification(
          'Table Reserved!',
          `Booking #${created.reservationCode} confirmed for ${created.partySize} guests on ${created.date} at ${created.time}.`,
          'order'
        );
        return created;
      }
    } catch (err) {
      console.warn('Network issue creating reservation, saving locally:', err);
    }

    setReservations(prev => [newRes, ...prev]);
    addNotification('Table Reserved!', `Booking #${newRes.reservationCode} confirmed!`, 'order');
    return newRes;
  };

  const updateReservation = async (id: string, updates: Partial<TableReservation>) => {
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
    try {
      await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      // offline handled
    }
    addNotification('Reservation Updated', `Booking details updated successfully.`, 'system');
  };

  const cancelReservation = async (id: string) => {
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : r))
    );
    try {
      await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    } catch (e) {
      // offline
    }
    addNotification('Reservation Cancelled', 'The table booking was marked as cancelled.', 'system');
  };

  return (
    <RestaurantContext.Provider
      value={{
        menu,
        isLoadingMenu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleAvailability,
        reservations,
        isLoadingReservations,
        createReservation,
        updateReservation,
        cancelReservation,
        orders,
        activeOrder,
        setActiveOrderById,
        updateOrderStatus,
        updateOrderPayment,
        createOrder,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        currentRole,
        setCurrentRole,
        staffList,
        verifyStaffPin,
        selectedTable,
        setSelectedTable,
        orderType,
        setOrderType,
        messages,
        sendMessage,
        notifications,
        dismissNotification,
        addNotification,
        loyalty,
        redeemVoucher,
        isOffline,
        setIsOffline,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue,
        playChime
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return context;
};
