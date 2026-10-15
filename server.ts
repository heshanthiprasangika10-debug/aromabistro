import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database with realistic restaurant seed data
export interface MenuItem {
  id: string;
  name: string;
  nameSi?: string;
  category: 'Specials' | 'Mains' | 'Kottu & Roti' | 'Curries & Rice' | 'Appetizers' | 'Beverages' | 'Desserts';
  description: string;
  price: number;
  prepTime: number; // minutes
  calories: number;
  spicyLevel: 0 | 1 | 2 | 3;
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  allergens?: string[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  selectedOptions?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'card' | 'cash' | 'qr';
  notes?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: string;
  updatedAt: string;
}

let menuItems: MenuItem[] = [
  {
    id: 'm1',
    name: 'Signature Cheese Chicken Kottu',
    nameSi: 'සිග්නේචර් චීස් චිකන් කොත්තු',
    category: 'Kottu & Roti',
    description: 'Crispy shredded godamba roti tossed with spicy chicken, eggs, fresh leeks, carrots, and topped with rich molten mozzarella cheese.',
    price: 14.50,
    prepTime: 15,
    calories: 780,
    spicyLevel: 2,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    badge: "Chef's Special",
    allergens: ['Dairy', 'Gluten', 'Eggs']
  },
  {
    id: 'm2',
    name: 'Wild Ceylon Black Pepper Crab Curry',
    nameSi: 'ලංකා කළු ගම්මිරිස් කකුළු කරිය',
    category: 'Curries & Rice',
    description: 'Fresh blue swimmer lagoon crab cooked in toasted fragrant black peppercorns, roasted curry powder, and thick creamy coconut gravy.',
    price: 24.00,
    prepTime: 25,
    calories: 620,
    spicyLevel: 3,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true,
    rating: 4.95,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
    badge: 'Popular',
    allergens: ['Crustaceans']
  },
  {
    id: 'm3',
    name: 'Artisan Wood-Fired Truffle Pizza',
    nameSi: 'වුඩ් ෆයර්ඩ් ට්‍රෆල් පීසා',
    category: 'Mains',
    description: 'Hand-stretched sourdough crust with wild forest mushrooms, buffalo mozzarella, fresh basil, and aromatic black truffle oil drizzle.',
    price: 18.00,
    prepTime: 18,
    calories: 840,
    spicyLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true,
    rating: 4.8,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'm4',
    name: 'Crispy Jaffna Spiced Prawn Bites',
    nameSi: 'යාපනය ක්‍රිස්පි ඉස්සන් බයිට්ස්',
    category: 'Appetizers',
    description: 'Jumbo tiger prawns marinated with roasted chili flakes, curry leaves, and lime, deep-fried to golden crunchiness with spiced mayo.',
    price: 11.50,
    prepTime: 10,
    calories: 410,
    spicyLevel: 2,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true,
    rating: 4.7,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
    badge: 'Crispy Snack',
    allergens: ['Crustaceans', 'Eggs']
  },
  {
    id: 'm5',
    name: 'Royal Vegetable Dum Biryani',
    nameSi: 'රාජකීය එළවළු දම් බිරියානි',
    category: 'Curries & Rice',
    description: 'Slow-cooked fragrant aged basmati rice infused with saffron, paneer cubes, cashews, raisins, and aromatic spices with raita.',
    price: 13.00,
    prepTime: 20,
    calories: 590,
    spicyLevel: 1,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true,
    rating: 4.85,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    badge: 'Vegetarian Feast',
    allergens: ['Dairy', 'Nuts']
  },
  {
    id: 'm6',
    name: 'Chargrilled Wagyu Gourmet Burger',
    nameSi: 'චාග්‍රිල්ඩ් වැගියු බර්ගර්',
    category: 'Mains',
    description: 'Prime Australian Wagyu beef patty, caramelized onion relish, vintage cheddar, smoked bacon jam, and brioche bun with herb fries.',
    price: 19.50,
    prepTime: 16,
    calories: 950,
    spicyLevel: 1,
    isVegetarian: false,
    isVegan: false,
    isAvailable: true,
    rating: 4.9,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    badge: 'Bestseller',
    allergens: ['Gluten', 'Dairy']
  },
  {
    id: 'm7',
    name: 'Tropical Mango Passion Sparkler',
    nameSi: 'අඹ පැශන් පානය',
    category: 'Beverages',
    description: 'Fresh Alphonso mango nectar, wild passion fruit pulp, crushed mint leaves, and effervescent sparkling soda.',
    price: 6.00,
    prepTime: 5,
    calories: 140,
    spicyLevel: 0,
    isVegetarian: true,
    isVegan: true,
    isAvailable: true,
    rating: 4.9,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    badge: 'Refreshing'
  },
  {
    id: 'm8',
    name: 'Warm Kithul Treacle Lava Soufflé',
    nameSi: 'උණුසුම් කිතුල් ලාවා සුෆ්ලේ',
    category: 'Desserts',
    description: 'Warm dark chocolate molten sponge infused with pure organic Ceylon kithul treacle, served with Madagascar vanilla bean gelato.',
    price: 8.50,
    prepTime: 12,
    calories: 490,
    spicyLevel: 0,
    isVegetarian: true,
    isVegan: false,
    isAvailable: true,
    rating: 4.95,
    reviewsCount: 130,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    badge: 'Must Try',
    allergens: ['Dairy', 'Eggs', 'Gluten']
  }
];

let orders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'AB-101',
    type: 'dine-in',
    tableNumber: 4,
    customerName: 'Kasun Bandara',
    customerPhone: '+94 77 123 4567',
    customerEmail: 'kasun.b@example.com',
    items: [
      { id: 'item-1', menuItemId: 'm1', name: 'Signature Cheese Chicken Kottu', price: 14.50, quantity: 2, notes: 'Extra spicy please' },
      { id: 'item-2', menuItemId: 'm7', name: 'Tropical Mango Passion Sparkler', price: 6.00, quantity: 2 }
    ],
    subtotal: 41.00,
    tax: 4.10,
    discount: 4.00,
    total: 41.10,
    status: 'preparing',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    loyaltyPointsEarned: 41,
    loyaltyPointsUsed: 0,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-102',
    orderNumber: 'AB-102',
    type: 'dine-in',
    tableNumber: 7,
    customerName: 'Niluka Perera',
    customerPhone: '+94 71 987 6543',
    customerEmail: 'niluka.p@example.com',
    items: [
      { id: 'item-3', menuItemId: 'm2', name: 'Wild Ceylon Black Pepper Crab Curry', price: 24.00, quantity: 1 },
      { id: 'item-4', menuItemId: 'm5', name: 'Royal Vegetable Dum Biryani', price: 13.00, quantity: 1 }
    ],
    subtotal: 37.00,
    tax: 3.70,
    discount: 0,
    total: 40.70,
    status: 'ready',
    paymentStatus: 'paid',
    paymentMethod: 'qr',
    loyaltyPointsEarned: 40,
    loyaltyPointsUsed: 0,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-103',
    orderNumber: 'AB-103',
    type: 'takeaway',
    customerName: 'Devinda Silva',
    customerPhone: '+94 76 555 4321',
    customerEmail: 'devinda.s@example.com',
    items: [
      { id: 'item-5', menuItemId: 'm6', name: 'Chargrilled Wagyu Gourmet Burger', price: 19.50, quantity: 1, notes: 'No pickles' },
      { id: 'item-6', menuItemId: 'm8', name: 'Warm Kithul Treacle Lava Soufflé', price: 8.50, quantity: 1 }
    ],
    subtotal: 28.00,
    tax: 2.80,
    discount: 2.80,
    total: 28.00,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    loyaltyPointsEarned: 28,
    loyaltyPointsUsed: 50,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

let supportMessages = [
  {
    id: 'msg-1',
    sender: 'customer',
    tableNumber: 4,
    customerName: 'Kasun (Table 4)',
    message: 'Could we get extra cutleries and napkins for table 4 please?',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: 'msg-2',
    sender: 'staff',
    tableNumber: 4,
    customerName: 'Server Rohan',
    message: 'Sure Kasun, coming right over with napkins and cutlery!',
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    read: true
  }
];

let emailLogs = [
  {
    id: 'email-1',
    recipient: 'kasun.b@example.com',
    template: 'Order Confirmation',
    subject: 'Order #AB-101 Confirmed - AromaBistro',
    status: 'Delivered',
    sentAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    preview: 'Thank you for your order! Your delicious meal is being prepared by Chef Samantha.'
  },
  {
    id: 'email-2',
    recipient: 'niluka.p@example.com',
    template: 'Order Ready Notification',
    subject: 'Your Order #AB-102 is Ready to Serve!',
    status: 'Delivered',
    sentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    preview: 'Great news! Your Ceylon Crab & Dum Biryani is plated and on its way to Table 7.'
  }
];

export interface TableReservation {
  id: string;
  reservationCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  partySize: number;
  seatingArea: 'Indoor Dining' | 'Outdoor Garden Terrace' | 'Chef VIP Lounge' | 'Window View';
  specialOccasion?: 'None' | 'Birthday' | 'Anniversary' | 'Business Dinner' | 'Date Night' | 'Celebration';
  specialRequests?: string;
  assignedTable?: number;
  status: 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

const todayStr = new Date().toISOString().split('T')[0];
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

let reservations: TableReservation[] = [
  {
    id: 'res-1',
    reservationCode: 'RES-701',
    customerName: 'Kasun Bandara',
    customerPhone: '+94 77 123 4567',
    customerEmail: 'kasun.b@example.com',
    date: todayStr,
    time: '19:30',
    partySize: 4,
    seatingArea: 'Window View',
    specialOccasion: 'Birthday',
    specialRequests: 'Window table facing marine drive, birthday dessert plate if possible',
    assignedTable: 4,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'res-2',
    reservationCode: 'RES-702',
    customerName: 'Niluka Perera',
    customerPhone: '+94 71 987 6543',
    customerEmail: 'niluka.p@example.com',
    date: todayStr,
    time: '20:00',
    partySize: 2,
    seatingArea: 'Outdoor Garden Terrace',
    specialOccasion: 'Anniversary',
    specialRequests: 'Candlelight arrangement requested',
    assignedTable: 7,
    status: 'seated',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'res-3',
    reservationCode: 'RES-703',
    customerName: 'Dr. Sanath Wijeratne',
    customerPhone: '+94 76 888 1234',
    customerEmail: 'sanath.w@example.com',
    date: todayStr,
    time: '20:30',
    partySize: 6,
    seatingArea: 'Chef VIP Lounge',
    specialOccasion: 'Business Dinner',
    specialRequests: 'Quiet area with wine pairing menu',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'res-4',
    reservationCode: 'RES-704',
    customerName: 'Amanda Silva',
    customerPhone: '+94 70 444 9876',
    customerEmail: 'amanda.s@example.com',
    date: tomorrowStr,
    time: '13:00',
    partySize: 3,
    seatingArea: 'Indoor Dining',
    specialOccasion: 'Date Night',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

// 1. API: Get & Update Menu
app.get('/api/menu', (req: Request, res: Response) => {
  res.json({ success: true, menu: menuItems });
});

app.post('/api/menu', (req: Request, res: Response) => {
  const newItem: MenuItem = {
    ...req.body,
    id: `m-${Date.now()}`,
    rating: 5.0,
    reviewsCount: 1,
    isAvailable: req.body.isAvailable ?? true
  };
  menuItems.unshift(newItem);
  res.status(201).json({ success: true, item: newItem });
});

app.put('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = menuItems.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  menuItems[index] = { ...menuItems[index], ...req.body };
  res.json({ success: true, item: menuItems[index] });
});

app.delete('/api/menu/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  menuItems = menuItems.filter(m => m.id !== id);
  res.json({ success: true, message: 'Item deleted' });
});

app.patch('/api/menu/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = menuItems.find(m => m.id === id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  item.isAvailable = !item.isAvailable;
  res.json({ success: true, isAvailable: item.isAvailable });
});

// 2. API: Order Management & Real-time tracking
app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ success: true, orders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const body = req.body;
  const orderNum = `AB-${Math.floor(100 + Math.random() * 900)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    type: body.type || 'dine-in',
    tableNumber: body.tableNumber,
    customerName: body.customerName || 'Guest Customer',
    customerPhone: body.customerPhone || '',
    customerEmail: body.customerEmail || 'customer@example.com',
    items: body.items || [],
    subtotal: Number(body.subtotal) || 0,
    tax: Number(body.tax) || 0,
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    status: 'pending',
    paymentStatus: body.paymentStatus || 'paid',
    paymentMethod: body.paymentMethod || 'card',
    notes: body.notes || '',
    loyaltyPointsEarned: Math.floor(Number(body.total || 0)),
    loyaltyPointsUsed: Number(body.loyaltyPointsUsed || 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.unshift(newOrder);

  // Automatically trigger email log
  emailLogs.unshift({
    id: `email-${Date.now()}`,
    recipient: newOrder.customerEmail,
    template: 'Order Confirmation',
    subject: `Order #${newOrder.orderNumber} Confirmed - AromaBistro`,
    status: 'Delivered',
    sentAt: new Date().toISOString(),
    preview: `Hi ${newOrder.customerName}, your order total is $${newOrder.total.toFixed(2)}. Tracking status: Preparing.`
  });

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();

  // If status is ready, log email update
  if (status === 'ready') {
    emailLogs.unshift({
      id: `email-${Date.now()}`,
      recipient: order.customerEmail,
      template: 'Order Ready Notification',
      subject: `Order #${order.orderNumber} is Ready! - AromaBistro`,
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      preview: `Your order #${order.orderNumber} is hot, freshly prepared and ready!`
    });
  }

  res.json({ success: true, order });
});

app.patch('/api/orders/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentStatus, paymentMethod } = req.body;
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;
  order.updatedAt = new Date().toISOString();
  res.json({ success: true, order });
});

// 3. API: Analytics & Reporting
app.get('/api/analytics', (req: Request, res: Response) => {
  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.total : sum), 0);
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Hourly distribution
  const hourlySales = [
    { hour: '11 AM', orders: 4, revenue: 112 },
    { hour: '12 PM', orders: 12, revenue: 340 },
    { hour: '1 PM', orders: 16, revenue: 490 },
    { hour: '2 PM', orders: 9, revenue: 235 },
    { hour: '5 PM', orders: 7, revenue: 198 },
    { hour: '6 PM', orders: 14, revenue: 410 },
    { hour: '7 PM', orders: 22, revenue: 680 },
    { hour: '8 PM', orders: 28, revenue: 890 },
    { hour: '9 PM', orders: 19, revenue: 540 }
  ];

  // Category sales split
  const categorySales = [
    { category: 'Kottu & Roti', sales: 42, percentage: 32 },
    { category: 'Curries & Rice', sales: 34, percentage: 26 },
    { category: 'Mains', sales: 25, percentage: 19 },
    { category: 'Beverages', sales: 18, percentage: 14 },
    { category: 'Desserts', sales: 12, percentage: 9 }
  ];

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      activeOrders,
      avgOrderValue,
      occupancyRate: 75,
      customerSatisfaction: 4.88,
      hourlySales,
      categorySales,
      topDishes: menuItems.slice(0, 4).map(m => ({
        name: m.name,
        orders: m.reviewsCount,
        price: m.price,
        revenue: m.reviewsCount * m.price
      }))
    }
  });
});

// 4. API: Customer Support Messaging
app.get('/api/messages', (req: Request, res: Response) => {
  res.json({ success: true, messages: supportMessages });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { sender, tableNumber, customerName, message } = req.body;
  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: sender || 'customer',
    tableNumber: Number(tableNumber) || 1,
    customerName: customerName || 'Customer',
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  supportMessages.push(newMsg);
  res.status(201).json({ success: true, message: newMsg });
});

// 5. API: Email System & Templates
app.get('/api/emails/logs', (req: Request, res: Response) => {
  res.json({ success: true, logs: emailLogs });
});

app.post('/api/emails/send', (req: Request, res: Response) => {
  const { recipient, template, subject, content } = req.body;
  const log = {
    id: `email-${Date.now()}`,
    recipient: recipient || 'guest@example.com',
    template: template || 'Custom Notification',
    subject: subject || 'Update from AromaBistro',
    status: 'Delivered',
    sentAt: new Date().toISOString(),
    preview: content ? content.slice(0, 100) : 'Custom email alert sent successfully.'
  };
  emailLogs.unshift(log);
  res.json({ success: true, log });
});

// 5.5 API: Table Reservations System
app.get('/api/reservations', (req: Request, res: Response) => {
  res.json({ success: true, reservations });
});

app.post('/api/reservations', (req: Request, res: Response) => {
  const body = req.body;
  const resCode = `RES-${Math.floor(100 + Math.random() * 900)}`;
  const newReservation: TableReservation = {
    id: `res-${Date.now()}`,
    reservationCode: resCode,
    customerName: body.customerName || 'Guest Diner',
    customerPhone: body.customerPhone || '+94 77 123 4567',
    customerEmail: body.customerEmail || 'guest@example.com',
    date: body.date || new Date().toISOString().split('T')[0],
    time: body.time || '19:00',
    partySize: Number(body.partySize) || 2,
    seatingArea: body.seatingArea || 'Indoor Dining',
    specialOccasion: body.specialOccasion || 'None',
    specialRequests: body.specialRequests || '',
    assignedTable: body.assignedTable ? Number(body.assignedTable) : undefined,
    status: body.status || 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  reservations.unshift(newReservation);

  // Trigger automated email confirmation
  emailLogs.unshift({
    id: `email-${Date.now()}`,
    recipient: newReservation.customerEmail,
    template: 'Table Reservation Confirmation',
    subject: `Table Reservation #${newReservation.reservationCode} Confirmed - AromaBistro`,
    status: 'Delivered',
    sentAt: new Date().toISOString(),
    preview: `Hi ${newReservation.customerName}, your table for ${newReservation.partySize} guests on ${newReservation.date} at ${newReservation.time} (${newReservation.seatingArea}) is confirmed!`
  });

  res.status(201).json({ success: true, reservation: newReservation });
});

app.patch('/api/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, assignedTable, specialRequests } = req.body;
  const reservation = reservations.find(r => r.id === id);
  if (!reservation) {
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  }

  if (status) reservation.status = status;
  if (assignedTable !== undefined) reservation.assignedTable = assignedTable ? Number(assignedTable) : undefined;
  if (specialRequests !== undefined) reservation.specialRequests = specialRequests;
  reservation.updatedAt = new Date().toISOString();

  if (status === 'seated') {
    emailLogs.unshift({
      id: `email-${Date.now()}`,
      recipient: reservation.customerEmail,
      template: 'Guest Seated Notice',
      subject: `Welcome to Table ${reservation.assignedTable || 'Your Table'}! - AromaBistro`,
      status: 'Delivered',
      sentAt: new Date().toISOString(),
      preview: `Welcome ${reservation.customerName}! We have seated you in the ${reservation.seatingArea}. Enjoy your dining experience.`
    });
  }

  res.json({ success: true, reservation });
});

app.delete('/api/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  reservations = reservations.filter(r => r.id !== id);
  res.json({ success: true, message: 'Reservation cancelled successfully' });
});

// 6. API: AI Chatbot (Gemini 3.8 Flash)
app.post('/api/chat/ai', async (req: Request, res: Response) => {
  const { message, orderHistory } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Fallback answer generator if API Key is not set or network issues
  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('reserve') || q.includes('table') || q.includes('booking') || q.includes('බුක්') || q.includes('මේස')) {
      return "You can easily reserve a table using our 'Book a Table' button! Choose your preferred date, time slot, party size (1-12 guests), and seating zone (Outdoor Garden Terrace, Marine Drive Window View, or Chef VIP Lounge). Instant confirmation is provided!";
    }
    if (q.includes('kottu') || q.includes('කොත්තු')) {
      return "Our Signature Cheese Chicken Kottu ($14.50) is our most loved dish! It features crispy shredded godamba roti tossed with spicy chicken, eggs, and rich molten mozzarella cheese. We can adjust the spice level to your preference.";
    }
    if (q.includes('veg') || q.includes('vegan') || q.includes('එළවළු')) {
      return "Yes! We have delicious Vegetarian & Vegan choices like the Royal Vegetable Dum Biryani ($13.00), Wood-Fired Truffle Pizza ($18.00), and Tropical Mango Passion Sparkler. Just check the 'Veg' filter in our menu!";
    }
    if (q.includes('crab') || q.includes('කකුළු') || q.includes('seafood')) {
      return "Our Wild Ceylon Black Pepper Crab Curry ($24.00) is prepared with fresh blue swimmer lagoon crab, toasted black peppercorns, and thick coconut milk gravy. It's a house specialty!";
    }
    if (q.includes('order') || q.includes('status') || q.includes('track') || q.includes('ඕඩර්')) {
      return "You can track your order in real-time in the 'Track Order' tab! If you provide your Order ID (like AB-101), our kitchen updates your status instantly from 'Preparing' to 'Ready'.";
    }
    if (q.includes('loyalty') || q.includes('point') || q.includes('පොයින්ට්')) {
      return "With our AromaRewards program, you earn 1 point for every $1 spent! 100 points give you a $5 instant discount voucher, plus birthday surprises and free dessert rewards.";
    }
    if (q.includes('time') || q.includes('hour') || q.includes('open') || q.includes('වේලාව')) {
      return "AromaBistro is open daily from 11:00 AM to 11:00 PM. Our kitchen accepts last orders at 10:30 PM.";
    }
    return "Welcome to AromaBistro! I can help you with dish recommendations, spice levels, allergen details, checking your live order status, or redeeming loyalty points. How can I assist you today?";
  };

  try {
    const menuSummary = menuItems
      .map(m => `- ${m.name} (${m.nameSi || ''}): $${m.price.toFixed(2)}, Category: ${m.category}, Spice Level: ${m.spicyLevel}/3, Veg: ${m.isVegetarian}, Prep Time: ${m.prepTime} mins. Description: ${m.description}`)
      .join('\n');

    const systemPrompt = `You are AromaBot, the intelligent and friendly AI Restaurant Concierge for "AromaBistro" (a premier modern restaurant specializing in artisanal fusion Ceylon & International culinary creations).
Current restaurant hours: Daily 11:00 AM - 11:00 PM.
You assist customers in both English and Sinhala (or Singlish) based on how they speak to you.
You have complete knowledge of our current menu:
${menuSummary}

Rules:
1. Always be polite, warm, and appetizing when describing food.
2. If customer asks in Sinhala (e.g. "Kottu eke mila kiyada?", "Monawada thiyena special dishes?"), answer fluently and naturally in friendly Sinhala with English menu names.
3. Recommend food pairings, beverages, and desserts.
4. Mention dietary tags (Vegetarian, Vegan, Gluten-free, Spicy levels) accurately.
5. If user asks about their order or table service, guide them that staff can be paged or live tracking is available on the screen.
6. Keep responses concise (under 120 words) and helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || generateFallbackResponse(message);
    res.json({ success: true, reply });
  } catch (err: any) {
    console.warn('Gemini API call failed or key not configured, using smart restaurant fallback:', err?.message || err);
    res.json({
      success: true,
      reply: generateFallbackResponse(message),
      isFallback: true
    });
  }
});

// Vite middleware for dev or static for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
