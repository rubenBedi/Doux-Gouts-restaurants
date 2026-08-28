/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string; // e.g. "4000 F"
  priceNumeric: number; // e.g. 4000
  category: 'Pizza' | 'Chawarma' | 'Manaïche' | 'Plat Local' | 'Panini';
  image: string;
  popular?: boolean;
  preparationTime?: number; // minutes
  spicyLevel?: 0 | 1 | 2 | 3;
  availableOptions?: ItemOptionGroup[];
}

export interface ItemOptionGroup {
  id: string;
  name: string;
  required?: boolean;
  maxSelect?: number;
  options: {
    id: string;
    name: string;
    extraPrice: number; // in FCFA
  }[];
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  extraPrice: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export type DeliveryZoneId = 'bingerville_centre' | 'bingerville_feh_kess' | 'riviera_palmeraie' | 'cocody_angre' | 'plateau_marcory' | 'yopougon_abobo' | 'takeaway';

export interface DeliveryZone {
  id: DeliveryZoneId;
  name: string;
  description: string;
  fee: number; // FCFA
  estimatedMinutes: string;
  isTakeaway?: boolean;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  landmark?: string;
  deliveryNotes?: string;
  isBillingSameAsDelivery?: boolean;
  billingAddress?: string;
}

export type PaymentMethodType = 'wave_ci';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export type OrderStatus = 'pending' | 'confirmed' | 'in_kitchen' | 'in_delivery' | 'delivered' | 'cancelled';

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // percentage (e.g. 10 for 10%) or fixed amount in FCFA
  minOrder: number;
  validUntil: string;
  isActive: boolean;
  description: string;
}

export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  deliveryZone: DeliveryZone;
  discountAmount: number;
  promoCode?: string;
  vatAmount: number; // TVA 18%
  tipAmount: number;
  cutleryNeeded: boolean;
  total: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  estimatedDeliveryTime: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  menuItemId: string;
  name: string;
  stockQuantity: number;
  isInStock: boolean;
  lowStockThreshold: number;
  category: string;
}

export interface PassSubscriptionPlan {
  id: string;
  name: string;
  badge: string;
  priceMonthly: number;
  perks: string[];
  discountRate: number;
  freeDeliveriesPerMonth: number;
}
