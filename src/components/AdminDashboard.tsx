import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  Plus,
  Edit2,
  Trash2,
  Download,
  Mail,
  Send,
  Bell,
  CheckCircle,
  Eye,
  X,
  Sparkles,
  Flame,
  FileSpreadsheet,
  Calendar,
  Clock,
  MapPin,
  CalendarCheck,
  Search,
  Check,
  BarChart2,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, StaffMember, TableReservation, ReservationStatus, SeatingArea, SpecialOccasion } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    menu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    orders,
    staffList,
    addNotification,
    reservations,
    createReservation,
    updateReservation,
    cancelReservation
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'analytics' | 'reservations' | 'menu' | 'staff' | 'emails' | 'broadcast'>('analytics');

  // Reservation management state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [resDateFilter, setResDateFilter] = useState<string>('all');
  const [resStatusFilter, setResStatusFilter] = useState<string>('all');
  const [resSearchQuery, setResSearchQuery] = useState<string>('');
  const [showAddResModal, setShowAddResModal] = useState<boolean>(false);

  // New reservation by admin form
  const [newResName, setNewResName] = useState('');
  const [newResPhone, setNewResPhone] = useState('+94 77 ');
  const [newResEmail, setNewResEmail] = useState('');
  const [newResDate, setNewResDate] = useState(todayStr);
  const [newResTime, setNewResTime] = useState('19:30');
  const [newResPartySize, setNewResPartySize] = useState(2);
  const [newResArea, setNewResArea] = useState<SeatingArea>('Window View');
  const [newResTable, setNewResTable] = useState<number | ''>('');
  const [newResOccasion, setNewResOccasion] = useState<SpecialOccasion>('None');
  const [newResRequests, setNewResRequests] = useState('');

  // Menu item modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemNameSi, setItemNameSi] = useState('');
  const [itemCategory, setItemCategory] = useState<MenuItem['category']>('Mains');
  const [itemPrice, setItemPrice] = useState(15.00);
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrepTime, setItemPrepTime] = useState(15);
  const [itemCalories, setItemCalories] = useState(550);
  const [itemSpicy, setItemSpicy] = useState<0 | 1 | 2 | 3>(1);
  const [itemVeg, setItemVeg] = useState(false);
  const [itemImage, setItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');

  // Email template state
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('Order Confirmation');
  const [testEmailRecipient, setTestEmailRecipient] = useState('heshanthiprasangika10@gmail.com');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Broadcast Notification state
  const [broadcastTitle, setBroadcastTitle] = useState('Chef Weekend Special Alert 🌟');
  const [broadcastMessage, setBroadcastMessage] = useState('Get 15% off on Ceylon Black Pepper Crab Curry for the next 2 hours!');

  useEffect(() => {
    fetch('/api/emails/logs')
      .then(res => res.json())
      .then(data => {
        if (data.logs) setEmailLogs(data.logs);
      })
      .catch(() => {});
  }, []);

  // Compute analytics
  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.total : sum), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Recharts interactive states
  const [hourlyMetric, setHourlyMetric] = useState<'both' | 'revenue' | 'orders'>('both');
  const [popularMetric, setPopularMetric] = useState<'revenue' | 'units'>('revenue');

  // 1. Hourly Revenue & Orders Trend
  const hourlyData = useMemo(() => {
    const hours = [
      { hour: '11 AM', label: '11:00 AM', baseRevenue: 120, baseOrders: 4 },
      { hour: '12 PM', label: '12:00 PM', baseRevenue: 340, baseOrders: 12 },
      { hour: '1 PM', label: '1:00 PM', baseRevenue: 490, baseOrders: 16 },
      { hour: '2 PM', label: '2:00 PM', baseRevenue: 240, baseOrders: 9 },
      { hour: '3 PM', label: '3:00 PM', baseRevenue: 170, baseOrders: 6 },
      { hour: '4 PM', label: '4:00 PM', baseRevenue: 150, baseOrders: 5 },
      { hour: '5 PM', label: '5:00 PM', baseRevenue: 210, baseOrders: 7 },
      { hour: '6 PM', label: '6:00 PM', baseRevenue: 420, baseOrders: 14 },
      { hour: '7 PM', label: '7:00 PM', baseRevenue: 680, baseOrders: 22 },
      { hour: '8 PM', label: '8:00 PM', baseRevenue: 890, baseOrders: 28 },
      { hour: '9 PM', label: '9:00 PM', baseRevenue: 540, baseOrders: 19 },
      { hour: '10 PM', label: '10:00 PM', baseRevenue: 260, baseOrders: 8 }
    ];

    const currentHourIndex = Math.max(0, Math.min(hours.length - 1, new Date().getHours() - 11));
    return hours.map((h, idx) => {
      let liveRevenue = 0;
      let liveOrders = 0;
      if (idx === currentHourIndex) {
        liveRevenue = orders.reduce((s, o) => s + (o.paymentStatus === 'paid' ? o.total : 0), 0);
        liveOrders = orders.length;
      }
      const totalRev = Number((h.baseRevenue + liveRevenue * 0.4).toFixed(2));
      const totalOrd = h.baseOrders + liveOrders;
      return {
        hour: h.hour,
        fullTime: h.label,
        revenue: totalRev,
        orders: totalOrd,
        avgTicket: Number((totalRev / (totalOrd || 1)).toFixed(2))
      };
    });
  }, [orders]);

  // 2. Real-time Popular Menu Items
  const popularDishesData = useMemo(() => {
    return menu.map(item => {
      const liveOrderedCount = orders.reduce((count, o) => {
        const lineItem = o.items.find(i => i.menuItemId === item.id || i.name === item.name);
        return count + (lineItem ? lineItem.quantity : 0);
      }, 0);

      const totalUnits = (item.reviewsCount || 10) + liveOrderedCount * 5;
      const totalItemRevenue = Number((totalUnits * item.price).toFixed(2));

      return {
        id: item.id,
        name: item.name.length > 18 ? item.name.slice(0, 16) + '...' : item.name,
        fullName: item.name,
        nameSi: item.nameSi,
        category: item.category,
        units: totalUnits,
        revenue: totalItemRevenue,
        price: item.price,
        rating: item.rating,
        spicyLevel: item.spicyLevel,
        isVegetarian: item.isVegetarian
      };
    }).sort((a, b) => (popularMetric === 'revenue' ? b.revenue - a.revenue : b.units - a.units)).slice(0, 6);
  }, [menu, orders, popularMetric]);

  // 3. Category Revenue Distribution
  const categoryPieData = useMemo(() => {
    const categoryColors: Record<string, string> = {
      'Kottu & Roti': '#f59e0b',
      'Curries & Rice': '#f97316',
      'Mains': '#ef4444',
      'Appetizers': '#8b5cf6',
      'Beverages': '#06b6d4',
      'Desserts': '#10b981',
      'Specials': '#ec4899'
    };

    const categories = ['Kottu & Roti', 'Curries & Rice', 'Mains', 'Appetizers', 'Beverages', 'Desserts'];
    return categories.map(cat => {
      const itemsInCat = menu.filter(m => m.category === cat);
      const catRevenue = itemsInCat.reduce((sum, item) => {
        const liveOrders = orders.reduce((s, o) => {
          const found = o.items.find(i => i.menuItemId === item.id || i.name === item.name);
          return s + (found ? found.quantity * found.price : 0);
        }, 0);
        return sum + (item.reviewsCount * item.price * 0.25) + liveOrders;
      }, 0);

      return {
        name: cat,
        value: Math.max(1, Number(catRevenue.toFixed(2))),
        color: categoryColors[cat] || '#f59e0b'
      };
    }).filter(c => c.value > 0);
  }, [menu, orders]);

  // 4. Dining Mode Breakdown
  const diningTypeData = useMemo(() => {
    const dineInOrders = orders.filter(o => o.type === 'dine-in').length + 18;
    const takeawayOrders = orders.filter(o => o.type === 'takeaway').length + 9;
    const deliveryOrders = orders.filter(o => o.type === 'delivery').length + 7;
    return [
      { name: 'Dine-In', count: dineInOrders, fill: '#f59e0b', label: 'Dine-In' },
      { name: 'Takeaway', count: takeawayOrders, fill: '#3b82f6', label: 'Takeaway' },
      { name: 'Delivery', count: deliveryOrders, fill: '#10b981', label: 'Delivery' }
    ];
  }, [orders]);

  const peakHour = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return { hour: '8 PM', fullTime: '8:00 PM', revenue: 890, orders: 28 };
    return hourlyData.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), hourlyData[0]);
  }, [hourlyData]);

  const totalHourlyRevenue = useMemo(() => {
    return hourlyData.reduce((sum, h) => sum + h.revenue, 0);
  }, [hourlyData]);

  const totalHourlyOrders = useMemo(() => {
    return hourlyData.reduce((sum, h) => sum + h.orders, 0);
  }, [hourlyData]);

  const dishBarColors = ['#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemNameSi('');
    setItemCategory('Mains');
    setItemPrice(15.00);
    setItemDescription('');
    setItemPrepTime(15);
    setItemCalories(550);
    setItemSpicy(1);
    setItemVeg(false);
    setItemImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemNameSi(item.nameSi || '');
    setItemCategory(item.category);
    setItemPrice(item.price);
    setItemDescription(item.description);
    setItemPrepTime(item.prepTime);
    setItemCalories(item.calories);
    setItemSpicy(item.spicyLevel);
    setItemVeg(item.isVegetarian);
    setItemImage(item.image);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateMenuItem(editingItem.id, {
        name: itemName,
        nameSi: itemNameSi,
        category: itemCategory,
        price: Number(itemPrice),
        description: itemDescription,
        prepTime: Number(itemPrepTime),
        calories: Number(itemCalories),
        spicyLevel: itemSpicy,
        isVegetarian: itemVeg,
        image: itemImage
      });
    } else {
      await addMenuItem({
        name: itemName,
        nameSi: itemNameSi,
        category: itemCategory,
        price: Number(itemPrice),
        description: itemDescription,
        prepTime: Number(itemPrepTime),
        calories: Number(itemCalories),
        spicyLevel: itemSpicy,
        isVegetarian: itemVeg,
        isVegan: false,
        isAvailable: true,
        image: itemImage
      });
    }
    setShowItemModal(false);
  };

  // CSV Export for Orders
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Type', 'Customer', 'Items Count', 'Total ($)', 'Status', 'Payment'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.type,
      o.customerName,
      o.items.length,
      o.total.toFixed(2),
      o.status,
      o.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AromaBistro_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Table Reservations
  const handleExportReservationsCSV = () => {
    const headers = ['Reservation Code', 'Date', 'Time', 'Customer Name', 'Phone', 'Email', 'Guests', 'Area', 'Table', 'Occasion', 'Status'];
    const rows = reservations.map(r => [
      r.reservationCode,
      r.date,
      r.time,
      r.customerName,
      r.customerPhone,
      r.customerEmail,
      r.partySize,
      r.seatingArea,
      r.assignedTable ? `Table ${r.assignedTable}` : 'Unassigned',
      r.specialOccasion || 'None',
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AromaBistro_Reservations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesDate =
        resDateFilter === 'all'
          ? true
          : resDateFilter === 'today'
          ? r.date === todayStr
          : resDateFilter === 'tomorrow'
          ? r.date === tomorrowStr
          : r.date === resDateFilter;

      const matchesStatus =
        resStatusFilter === 'all' ? true : r.status === resStatusFilter;

      const matchesSearch =
        r.customerName.toLowerCase().includes(resSearchQuery.toLowerCase()) ||
        r.reservationCode.toLowerCase().includes(resSearchQuery.toLowerCase()) ||
        r.customerPhone.includes(resSearchQuery) ||
        r.customerEmail.toLowerCase().includes(resSearchQuery.toLowerCase());

      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [reservations, resDateFilter, resStatusFilter, resSearchQuery, todayStr, tomorrowStr]);

  const todayReservationsCount = reservations.filter(r => r.date === todayStr && r.status !== 'cancelled').length;
  const seatedReservationsCount = reservations.filter(r => r.status === 'seated').length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'pending').length;
  const totalReservedGuests = reservations
    .filter(r => r.date === todayStr && r.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.partySize, 0);

  const handleAdminCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReservation({
      customerName: newResName,
      customerPhone: newResPhone,
      customerEmail: newResEmail || 'walkin@example.com',
      date: newResDate,
      time: newResTime,
      partySize: Number(newResPartySize),
      seatingArea: newResArea,
      assignedTable: newResTable ? Number(newResTable) : undefined,
      specialOccasion: newResOccasion,
      specialRequests: newResRequests
    });
    setShowAddResModal(false);
    setNewResName('');
    setNewResPhone('+94 77 ');
    setNewResEmail('');
    setNewResRequests('');
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: testEmailRecipient,
          template: selectedTemplate,
          subject: `${selectedTemplate} - AromaBistro Gourmet Dining`,
          content: `Automated ${selectedTemplate} sent to ${testEmailRecipient}. Thank you for choosing AromaBistro!`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(prev => [data.log, ...prev]);
        setEmailSentSuccess(true);
        setTimeout(() => setEmailSentSuccess(false), 4000);
      }
    } catch (e) {
      // offline handled
    }
  };

  const handleBroadcastPush = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification(broadcastTitle, broadcastMessage, 'promo');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 sm:p-6 pb-28">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white font-mono">RESTAURANT MANAGEMENT SUITE</h1>
            <p className="text-xs text-stone-400">Business Intelligence, Real-time Sales, Menu CMS, Reservations & RBAC</p>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center space-x-2">
          {activeTab === 'reservations' ? (
            <>
              <button
                onClick={handleExportReservationsCSV}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Bookings CSV</span>
              </button>
              <button
                onClick={() => setShowAddResModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Take Walk-in / Phone Booking</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Sales CSV</span>
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Dish</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6 flex space-x-2 border-b border-stone-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { key: 'analytics', label: '📊 Sales & Metrics' },
          { key: 'reservations', label: '📅 Table Bookings' },
          { key: 'menu', label: '🍽️ Menu Management' },
          { key: 'staff', label: '👥 Staff & Access Control' },
          { key: 'emails', label: '✉️ Automated Email Templates' },
          { key: 'broadcast', label: '📢 Push Notification Center' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TAB 1: ANALYTICS & SALES DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-semibold">Today's Total Sales</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</div>
                <span className="text-[11px] text-emerald-400 font-medium">↑ +14.2% vs yesterday</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-semibold">Orders Processed</span>
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{totalOrders}</div>
                <span className="text-[11px] text-amber-300 font-medium">{orders.filter(o => o.status !== 'completed').length} active currently</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-semibold">Average Ticket Value</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">${avgOrderValue.toFixed(2)}</div>
                <span className="text-[11px] text-stone-400 font-medium">Industry bench: $28.50</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-semibold">Customer CSAT</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">4.9 / 5.0</div>
                <span className="text-[11px] text-purple-300 font-medium">98% positive reviews</span>
              </div>
            </div>

            {/* Visual Charts: Recharts Real-Time Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 1. Hourly Revenue & Orders Trend (AreaChart with Dual Y-Axis) */}
              <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                        <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                          Hourly Revenue Trends & Peak Velocity
                        </h3>
                        <span className="flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping"></span>
                          Real-Time
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Real-time revenue flow ($) and customer order volume across business hours
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 whitespace-nowrap">
                        Peak: {peakHour.fullTime} (${peakHour.revenue.toFixed(0)})
                      </span>

                      {/* View metric toggle */}
                      <div className="flex items-center bg-stone-950 p-0.5 rounded-xl border border-stone-800">
                        <button
                          onClick={() => setHourlyMetric('both')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            hourlyMetric === 'both' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Combined
                        </button>
                        <button
                          onClick={() => setHourlyMetric('revenue')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            hourlyMetric === 'revenue' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Revenue ($)
                        </button>
                        <button
                          onClick={() => setHourlyMetric('orders')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            hourlyMetric === 'orders' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Orders
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recharts AreaChart */}
                  <div className="h-64 sm:h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                        <XAxis
                          dataKey="hour"
                          stroke="#78716c"
                          tick={{ fill: '#a8a29e', fontSize: 11 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={{ stroke: '#292524' }}
                        />
                        <YAxis
                          yAxisId="rev"
                          stroke="#f59e0b"
                          tick={{ fill: '#d97706', fontSize: 11 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={{ stroke: '#292524' }}
                          tickFormatter={(val: number) => `$${val}`}
                          hide={hourlyMetric === 'orders'}
                        />
                        <YAxis
                          yAxisId="ord"
                          orientation="right"
                          stroke="#38bdf8"
                          tick={{ fill: '#38bdf8', fontSize: 11 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={{ stroke: '#292524' }}
                          tickFormatter={(val: number) => `${val}`}
                          hide={hourlyMetric === 'revenue'}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
                                  <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 font-bold text-amber-400">
                                    <span>{item.fullTime || label}</span>
                                    <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                                      Real-Time
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-300">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                      Revenue:
                                    </span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      ${item.revenue.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-300">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                      Volume:
                                    </span>
                                    <span className="font-mono font-bold text-sky-300">{item.orders} orders</span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-400 pt-1 border-t border-stone-800/80 text-[11px]">
                                    <span>Avg Ticket:</span>
                                    <span className="font-mono text-stone-200">${item.avgTicket}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {(hourlyMetric === 'both' || hourlyMetric === 'revenue') && (
                          <Area
                            yAxisId="rev"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue ($)"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#revenueGrad)"
                          />
                        )}
                        {(hourlyMetric === 'both' || hourlyMetric === 'orders') && (
                          <Area
                            yAxisId="ord"
                            type="monotone"
                            dataKey="orders"
                            name="Order Volume"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#ordersGrad)"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analytical Footnotes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-stone-800 mt-3 text-xs">
                  <div className="bg-stone-950/50 p-2 rounded-xl border border-stone-800/60">
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">Total Projected</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">${totalHourlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="bg-stone-950/50 p-2 rounded-xl border border-stone-800/60">
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">Total Volume</span>
                    <span className="font-mono font-bold text-sky-300 text-sm">{totalHourlyOrders} tickets</span>
                  </div>
                  <div className="bg-stone-950/50 p-2 rounded-xl border border-stone-800/60">
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">Busiest Window</span>
                    <span className="font-semibold text-amber-300 text-xs">7:00 PM - 9:00 PM</span>
                  </div>
                  <div className="bg-stone-950/50 p-2 rounded-xl border border-stone-800/60">
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">Avg Hourly Ticket</span>
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      ${(totalHourlyRevenue / (totalHourlyOrders || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Popular Menu Items Real-Time Recharts (Horizontal BarChart) */}
              <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                        Top Popular Items
                      </h3>
                    </div>

                    {/* Metric Switcher */}
                    <div className="flex items-center bg-stone-950 p-0.5 rounded-xl border border-stone-800">
                      <button
                        onClick={() => setPopularMetric('revenue')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          popularMetric === 'revenue' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Revenue ($)
                      </button>
                      <button
                        onClick={() => setPopularMetric('units')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          popularMetric === 'units' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Portions
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 mb-2">
                    Ranked by live restaurant orders and customer preference
                  </p>

                  {/* Horizontal BarChart */}
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={popularDishesData}
                        margin={{ top: 5, right: 15, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#292524" horizontal={false} />
                        <XAxis
                          type="number"
                          stroke="#78716c"
                          tick={{ fill: '#a8a29e', fontSize: 10 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={{ stroke: '#292524' }}
                          tickFormatter={(v: number) => (popularMetric === 'revenue' ? `$${v}` : `${v}`)}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={105}
                          stroke="#78716c"
                          tick={{ fill: '#e7e5e4', fontSize: 11 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[190px]">
                                  <div className="font-bold text-white flex items-center justify-between">
                                    <span>{item.fullName}</span>
                                  </div>
                                  {item.nameSi && (
                                    <div className="text-[10px] text-amber-400 font-sans">{item.nameSi}</div>
                                  )}
                                  <div className="text-[10px] text-stone-400 bg-stone-800/60 px-1.5 py-0.5 rounded inline-block">
                                    {item.category} • ${item.price.toFixed(2)}
                                  </div>
                                  <div className="flex justify-between items-center text-stone-300 pt-1 border-t border-stone-800">
                                    <span>Total Revenue:</span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      ${item.revenue.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-300">
                                    <span>Units Ordered:</span>
                                    <span className="font-mono font-bold text-amber-300">
                                      {item.units} portions
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-stone-400 text-[10px]">
                                    <span>Customer Rating:</span>
                                    <span className="text-amber-400 font-mono">★ {item.rating}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey={popularMetric === 'revenue' ? 'revenue' : 'units'}
                          radius={[0, 6, 6, 0]}
                        >
                          {popularDishesData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={dishBarColors[index % dishBarColors.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top 3 Quick Badges */}
                <div className="pt-3 border-t border-stone-800 mt-2 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Top 3 Leaderboard
                  </span>
                  <div className="space-y-1">
                    {popularDishesData.slice(0, 3).map((dish, i) => (
                      <div
                        key={dish.id}
                        className="flex items-center justify-between text-xs bg-stone-950/60 px-2.5 py-1 rounded-lg border border-stone-800/80"
                      >
                        <div className="flex items-center space-x-1.5 truncate mr-2">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                              i === 0
                                ? 'bg-amber-500 text-stone-950'
                                : i === 1
                                ? 'bg-stone-300 text-stone-950'
                                : 'bg-amber-700 text-white'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="font-semibold text-stone-200 truncate">{dish.fullName}</span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[11px] font-mono text-stone-400">{dish.units} sold</span>
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            ${dish.revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Category Breakdown Donut & Dining Mode Channels (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Category Revenue Distribution Donut */}
              <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <PieIcon className="w-4 h-4 text-amber-500" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                        Revenue by Category
                      </h3>
                      <p className="text-xs text-stone-400">Share of sales across cuisine categories</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-stone-400">
                    {categoryPieData.length} active categories
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 h-56 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryPieData.map(entry => (
                            <Cell key={`pie-cell-${entry.name}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const p = payload[0];
                              const total = categoryPieData.reduce((s, c) => s + c.value, 0);
                              const pct = ((Number(p.value) / (total || 1)) * 100).toFixed(1);
                              return (
                                <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700/80 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                                  <div className="font-bold text-white">{p.name}</div>
                                  <div className="text-emerald-400 font-mono font-bold">
                                    ${Number(p.value).toLocaleString()}
                                  </div>
                                  <div className="text-stone-400 text-[10px]">{pct}% of revenue</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Legend with progress and revenue */}
                  <div className="md:col-span-6 space-y-2">
                    {categoryPieData.map(c => {
                      const totalCatRev = categoryPieData.reduce((s, i) => s + i.value, 0);
                      const pct = Math.round((c.value / (totalCatRev || 1)) * 100);
                      return (
                        <div key={c.name} className="space-y-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center space-x-1.5 font-medium text-stone-300">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                              <span>{c.name}</span>
                            </span>
                            <div className="space-x-1.5 font-mono">
                              <span className="text-stone-400">${c.value.toFixed(0)}</span>
                              <span className="text-amber-400 font-bold">({pct}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden border border-stone-800">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: c.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dining Channels BarChart */}
              <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                        Dining Channels
                      </h3>
                      <p className="text-xs text-stone-400">Dine-In, Takeaway, and Delivery order split</p>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={diningTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                        <XAxis
                          dataKey="label"
                          stroke="#78716c"
                          tick={{ fill: '#a8a29e', fontSize: 11 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#78716c"
                          tick={{ fill: '#a8a29e', fontSize: 10 }}
                          axisLine={{ stroke: '#292524' }}
                          tickLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700/80 p-2.5 rounded-xl shadow-2xl text-xs space-y-1">
                                  <div className="font-bold text-white">{d.label} Orders</div>
                                  <div className="text-amber-400 font-mono font-bold">{d.count} orders</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {diningTypeData.map((entry, index) => (
                            <Cell key={`channel-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 mt-2 text-xs text-stone-400 flex items-center justify-between">
                  <span>
                    <span className="text-white font-semibold">Key Finding:</span> Dine-In drives 53% of guest volume.
                  </span>
                  <span className="text-amber-400 font-mono font-bold text-[11px]">Healthy Split</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TABLE BOOKINGS & RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {/* KPI Cards for Bookings */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-1.5">
                  <span className="text-xs font-semibold">Total Bookings</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{reservations.length}</div>
                <span className="text-[11px] text-stone-400">All recorded bookings</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-1.5">
                  <span className="text-xs font-semibold">Today's Bookings</span>
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{todayReservationsCount}</div>
                <span className="text-[11px] text-emerald-400">Scheduled for today</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-1.5">
                  <span className="text-xs font-semibold">Guests Today</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{totalReservedGuests}</div>
                <span className="text-[11px] text-blue-300">Dining covers expected</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-stone-400 mb-1.5">
                  <span className="text-xs font-semibold">Currently Seated</span>
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{seatedReservationsCount}</div>
                <span className="text-[11px] text-purple-300">Dining at tables now</span>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-lg col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-stone-400 mb-1.5">
                  <span className="text-xs font-semibold">Pending Approval</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">{pendingReservationsCount}</div>
                <span className="text-[11px] text-amber-300">Requires review</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Date filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { key: 'all', label: 'All Dates' },
                  { key: 'today', label: 'Today' },
                  { key: 'tomorrow', label: 'Tomorrow' }
                ].map(df => (
                  <button
                    key={df.key}
                    onClick={() => setResDateFilter(df.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      resDateFilter === df.key
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
                <input
                  type="date"
                  value={resDateFilter === 'all' || resDateFilter === 'today' || resDateFilter === 'tomorrow' ? '' : resDateFilter}
                  onChange={e => setResDateFilter(e.target.value || 'all')}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  title="Filter by custom date"
                />
              </div>

              {/* Status and Search */}
              <div className="flex items-center space-x-2">
                <select
                  value={resStatusFilter}
                  onChange={e => setResStatusFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resSearchQuery}
                    onChange={e => setResSearchQuery(e.target.value)}
                    placeholder="Search name, phone, code..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  {resSearchQuery && (
                    <button
                      onClick={() => setResSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Table Booking Records ({filteredReservations.length})</h2>
                  <p className="text-xs text-stone-400">Manage seating allocations, guest requests, and table assignments</p>
                </div>
              </div>

              {filteredReservations.length === 0 ? (
                <div className="p-12 text-center bg-stone-950/60 rounded-2xl border border-stone-800/80 text-stone-500 text-xs">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                  <p className="font-bold text-stone-300">No reservations found matching current filter</p>
                  <p className="text-stone-500 mt-1">Try selecting "All Dates" or changing the status filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                      <tr>
                        <th className="p-3">Booking Code</th>
                        <th className="p-3">Guest Contact</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Guests</th>
                        <th className="p-3">Atmosphere & Occasion</th>
                        <th className="p-3">Assigned Table</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {filteredReservations.map(res => (
                        <tr key={res.id} className="hover:bg-stone-800/40 transition">
                          <td className="p-3">
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                              {res.reservationCode}
                            </span>
                            <span className="text-[10px] text-stone-500 block mt-1">
                              Booked {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white text-xs">{res.customerName}</div>
                            <div className="text-[11px] text-stone-400 font-mono">{res.customerPhone}</div>
                            <div className="text-[10px] text-stone-500 truncate max-w-[150px]">{res.customerEmail}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span>{res.date}</span>
                            </div>
                            <div className="text-xs font-mono font-bold text-amber-300 mt-0.5 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{res.time}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-extrabold text-white text-xs bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
                              {res.partySize} {res.partySize === 1 ? 'Guest' : 'Guests'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-stone-200">{res.seatingArea}</div>
                            {res.specialOccasion && res.specialOccasion !== 'None' && (
                              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800/40 px-1.5 py-0.2 rounded font-semibold inline-block mt-0.5">
                                {res.specialOccasion}
                              </span>
                            )}
                            {res.specialRequests && (
                              <p className="text-[10px] text-stone-400 italic mt-0.5 max-w-[160px] truncate" title={res.specialRequests}>
                                Note: {res.specialRequests}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={res.assignedTable || ''}
                              onChange={e => {
                                const val = e.target.value ? Number(e.target.value) : undefined;
                                updateReservation(res.id, {
                                  assignedTable: val,
                                  status: val && res.status === 'pending' ? 'confirmed' : res.status
                                });
                              }}
                              className="bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="">Unassigned</option>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>
                                  Table {n}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                res.status === 'confirmed'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : res.status === 'seated'
                                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                  : res.status === 'pending'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : res.status === 'completed'
                                  ? 'bg-stone-800 text-stone-400'
                                  : 'bg-red-950 text-red-400 border border-red-800'
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {res.status === 'pending' && (
                              <button
                                onClick={() => updateReservation(res.id, { status: 'confirmed' })}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                                title="Approve & Confirm"
                              >
                                Approve
                              </button>
                            )}

                            {res.status === 'confirmed' && (
                              <button
                                onClick={() => updateReservation(res.id, { status: 'seated' })}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
                                title="Mark Guest Seated at Table"
                              >
                                Seat Guest
                              </button>
                            )}

                            {res.status === 'seated' && (
                              <button
                                onClick={() => updateReservation(res.id, { status: 'completed' })}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                            )}

                            {res.status !== 'cancelled' && res.status !== 'completed' && (
                              <button
                                onClick={() => cancelReservation(res.id)}
                                className="px-2 py-1 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-300 rounded-lg text-xs transition cursor-pointer"
                                title="Cancel Booking"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Digital Menu Catalogue</h2>
                <p className="text-xs text-stone-400">Update dishes, prices, spice levels, and stock availability</p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3">Dish</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Prep Time</th>
                    <th className="p-3">Spice</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {menu.map(item => (
                    <tr key={item.id} className="hover:bg-stone-800/40 transition">
                      <td className="p-3 flex items-center space-x-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          {item.nameSi && <div className="text-[10px] text-amber-300 font-sans">{item.nameSi}</div>}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-stone-400">{item.category}</td>
                      <td className="p-3 font-mono font-bold text-amber-400 text-sm">${item.price.toFixed(2)}</td>
                      <td className="p-3">{item.prepTime} mins</td>
                      <td className="p-3">{'🌶️'.repeat(item.spicyLevel) || 'None'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.isAvailable ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : '86\'d'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg transition"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-1.5 bg-stone-800 hover:bg-stone-700 text-rose-400 rounded-lg transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STAFF ACCESS CONTROL & RBAC */}
        {activeTab === 'staff' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Staff Team & Security Access Control (RBAC)</h2>
              <p className="text-xs text-stone-400">
                Enforce 4-digit PIN authentication for Kitchen KDS, Cashier POS, and Admin Management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffList.map(s => (
                <div key={s.id} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{s.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{s.name}</h4>
                      <p className="text-xs text-stone-400">{s.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          {s.role}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Security PIN: <code className="text-amber-400 font-bold">{s.pin}</code>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 rounded-full text-[10px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATED EMAIL TEMPLATES & LOGS */}
        {activeTab === 'emails' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <h3 className="font-bold text-sm text-white">Automated Customer Email Dispatcher</h3>
                <p className="text-xs text-stone-400">Triggers personalized order receipts, kitchen alerts & rewards</p>
              </div>

              <form onSubmit={handleSendTestEmail} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Select Email Template:</label>
                  <select
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Order Confirmation">Order Confirmation & Receipt</option>
                    <option value="Order Ready Notification">Kitchen Order Ready for Table / Pickup</option>
                    <option value="Loyalty Tier Upgrade">AromaRewards Gold Tier Upgrade</option>
                    <option value="Chef Weekly Special">Chef's Weekly Culinary Showcase</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">Recipient Email:</label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={e => setTestEmailRecipient(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Live Template Preview */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs space-y-2 font-sans">
                  <div className="text-[11px] text-stone-400 border-b border-stone-800 pb-1.5 flex justify-between">
                    <span>From: notifications@aromabistro.com</span>
                    <span>Format: Responsive HTML</span>
                  </div>
                  <p className="font-bold text-amber-400">Subject: {selectedTemplate} - AromaBistro</p>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Dear Valued Guest, thank you for choosing AromaBistro. Your experience is our top priority. We are thrilled to serve you with artisan quality and care!
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email Dispatch</span>
                </button>
                {emailSentSuccess && (
                  <p className="text-xs text-emerald-400 text-center font-medium">✓ Email logged and delivered successfully!</p>
                )}
              </form>
            </div>

            {/* Email Dispatch Logs */}
            <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-white">Recent Automated Email Delivery Logs</h3>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {emailLogs.map(log => (
                  <div key={log.id} className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{log.template}</span>
                      <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">To: {log.recipient}</p>
                    <p className="text-[11px] text-stone-500 truncate">{log.preview}</p>
                    <span className="text-[10px] text-stone-600 block">
                      {new Date(log.sentAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PUSH NOTIFICATION BROADCAST */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Broadcast In-App Push Notification</h2>
              <p className="text-xs text-stone-400">
                Send instant flash promotions, kitchen updates, or happy hour offers to all active diners
              </p>
            </div>

            <form onSubmit={handleBroadcastPush} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Notification Title:</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. 🔥 Flash Offer: 20% Off All Desserts!"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">Message Body:</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Enter timely update or announcement..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
              >
                <Bell className="w-4 h-4" />
                <span>Broadcast to All Diners</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Menu Item Create/Edit Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingItem ? 'Edit Dish Details' : 'Add New Dish to Menu'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">Dish Name (English):</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g. Sizzling Garlic Butter Crab"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Dish Name (Sinhala):</label>
                <input
                  type="text"
                  value={itemNameSi}
                  onChange={e => setItemNameSi(e.target.value)}
                  placeholder="e.g. සුදුළූණු බටර් කකුළු කරිය"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Category:</label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Mains">Mains</option>
                    <option value="Kottu & Roti">Kottu & Roti</option>
                    <option value="Curries & Rice">Curries & Rice</option>
                    <option value="Appetizers">Appetizers</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Price ($):</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={itemPrice}
                    onChange={e => setItemPrice(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Description:</label>
                <textarea
                  rows={2}
                  required
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-stone-400 block mb-1">Prep Time (mins):</label>
                  <input
                    type="number"
                    value={itemPrepTime}
                    onChange={e => setItemPrepTime(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Calories:</label>
                  <input
                    type="number"
                    value={itemCalories}
                    onChange={e => setItemCalories(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Spice Level (0-3):</label>
                  <select
                    value={itemSpicy}
                    onChange={e => setItemSpicy(Number(e.target.value) as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value={0}>0 (Mild)</option>
                    <option value={1}>1 (🌶️)</option>
                    <option value={2}>2 (🌶️🌶️)</option>
                    <option value={3}>3 (🌶️🌶️🌶️)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Photo URL:</label>
                <input
                  type="text"
                  value={itemImage}
                  onChange={e => setItemImage(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="vegCheck"
                  checked={itemVeg}
                  onChange={e => setItemVeg(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                />
                <label htmlFor="vegCheck" className="text-stone-300">Is Vegetarian Dish</label>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-stone-700 text-stone-300 font-bold hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Take Walk-in / Phone Reservation Modal */}
      {showAddResModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddResModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">Record Table Reservation</h3>
                <p className="text-xs text-stone-400">Add walk-in guests or phone reservations directly</p>
              </div>
            </div>

            <form onSubmit={handleAdminCreateReservation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newResName}
                    onChange={e => setNewResName(e.target.value)}
                    placeholder="e.g. Ruwan Jayawardena"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newResPhone}
                    onChange={e => setNewResPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Email (for Confirmation Pass)</label>
                <input
                  type="email"
                  value={newResEmail}
                  onChange={e => setNewResEmail(e.target.value)}
                  placeholder="guest@example.com (optional)"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Date *</label>
                  <input
                    type="date"
                    required
                    value={newResDate}
                    onChange={e => setNewResDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Time *</label>
                  <input
                    type="time"
                    required
                    value={newResTime}
                    onChange={e => setNewResTime(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Guests *</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newResPartySize}
                    onChange={e => setNewResPartySize(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Seating Area *</label>
                  <select
                    value={newResArea}
                    onChange={e => setNewResArea(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Window View">🪟 Window View</option>
                    <option value="Outdoor Garden Terrace">🌿 Outdoor Garden Terrace</option>
                    <option value="Chef VIP Lounge">🍷 Chef VIP Lounge</option>
                    <option value="Indoor Dining">🍽️ Indoor Dining</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-300 font-bold block mb-1">Assign Table (Optional)</label>
                  <select
                    value={newResTable}
                    onChange={e => setNewResTable(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none font-bold text-amber-300"
                  >
                    <option value="">Unassigned (Decide on arrival)</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>Table {n} (Dining Floor)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Special Occasion</label>
                <select
                  value={newResOccasion}
                  onChange={e => setNewResOccasion(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="None">None (Standard Dining)</option>
                  <option value="Birthday">🎂 Birthday Celebration</option>
                  <option value="Anniversary">💍 Wedding Anniversary</option>
                  <option value="Date Night">🥂 Romantic Date Night</option>
                  <option value="Business Dinner">💼 Business Dinner</option>
                  <option value="Celebration">🎉 Special Gathering / Feast</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">Guest Notes & Dietary Requests</label>
                <input
                  type="text"
                  value={newResRequests}
                  onChange={e => setNewResRequests(e.target.value)}
                  placeholder="e.g. Birthday cake presentation, high chair needed..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddResModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-stone-700 text-stone-300 font-bold hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow cursor-pointer"
                >
                  Confirm & Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
