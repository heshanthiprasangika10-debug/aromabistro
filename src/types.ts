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

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'card' | 'cash' | 'qr';

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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'kitchen' | 'pos' | 'admin';

export interface StaffMember {
  id: string;
  name: string;
  role: 'Admin' | 'Head Chef' | 'Kitchen Staff' | 'Cashier' | 'Server';
  pin: string;
  active: boolean;
  avatar: string;
  email: string;
}

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'staff';
  tableNumber?: number;
  customerName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface EmailLog {
  id: string;
  recipient: string;
  template: string;
  subject: string;
  status: string;
  sentAt: string;
  preview: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'promo' | 'system' | 'kitchen';
  read: boolean;
}

export interface LoyaltyProfile {
  customerId: string;
  name: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalOrders: number;
  totalSpent: number;
  vouchers: {
    id: string;
    code: string;
    discountAmount: number;
    description: string;
    expiresAt: string;
    used: boolean;
  }[];
}

export type ReservationStatus = 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled';
export type SeatingArea = 'Indoor Dining' | 'Outdoor Garden Terrace' | 'Chef VIP Lounge' | 'Window View';
export type SpecialOccasion = 'None' | 'Birthday' | 'Anniversary' | 'Business Dinner' | 'Date Night' | 'Celebration';

export interface TableReservation {
  id: string;
  reservationCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "19:30"
  partySize: number; // 1 to 12+
  seatingArea: SeatingArea;
  specialOccasion?: SpecialOccasion;
  specialRequests?: string;
  assignedTable?: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt?: string;
}

