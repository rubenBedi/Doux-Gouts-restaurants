/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  CartItem, 
  MenuItem, 
  SelectedOption, 
  DeliveryZone, 
  PromoCode, 
  Order, 
  CustomerDetails 
} from '../types';
import { DELIVERY_ZONES, DEFAULT_PROMO_CODES } from '../constants';

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: MenuItem, options?: SelectedOption[], quantity?: number, instructions?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  
  // Promo code
  promoInput: string;
  setPromoInput: (val: string) => void;
  appliedPromo: PromoCode | null;
  applyPromoCode: (codeToApply?: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  promoError: string | null;

  // Delivery & Options
  deliveryZone: DeliveryZone;
  setDeliveryZone: (zone: DeliveryZone) => void;
  tipAmount: number;
  setTipAmount: (amount: number) => void;
  cutleryNeeded: boolean;
  setCutleryNeeded: (val: boolean) => void;

  // Customer
  customer: CustomerDetails;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerDetails>>;

  // Totals
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  vatAmount: number;
  total: number;
  itemCount: number;

  // Modals & Navigation states
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;

  customizingItem: MenuItem | null;
  setCustomizingItem: (item: MenuItem | null) => void;

  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (val: boolean) => void;

  isAdminOpen: boolean;
  setIsAdminOpen: (val: boolean) => void;

  isPinModalOpen: boolean;
  setIsPinModalOpen: (val: boolean) => void;
  openAdminPinModal: () => void;

  isPassGourmandOpen: boolean;
  setIsPassGourmandOpen: (val: boolean) => void;

  // Recent order history in local browser
  recentOrderRefs: string[];
  addRecentOrderRef: (ref: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'doux_gouts_cart_v2';
const RECENT_ORDERS_KEY = 'doux_gouts_recent_orders';
const CUSTOMER_STORAGE_KEY = 'doux_gouts_customer';

const INITIAL_CUSTOMER: CustomerDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  district: 'Bingerville',
  landmark: '',
  deliveryNotes: '',
  isBillingSameAsDelivery: true,
  billingAddress: ''
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customer, setCustomer] = useState<CustomerDetails>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMER;
    } catch {
      return INITIAL_CUSTOMER;
    }
  });

  const [recentOrderRefs, setRecentOrderRefs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_ORDERS_KEY);
      return saved ? JSON.parse(saved) : ['DG-8842'];
    } catch {
      return ['DG-8842'];
    }
  });

  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>(DELIVERY_ZONES[1]); // Bingerville centre default
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [cutleryNeeded, setCutleryNeeded] = useState<boolean>(true);

  // Modal controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPassGourmandOpen, setIsPassGourmandOpen] = useState(false);

  const openAdminPinModal = () => {
    setIsPinModalOpen(true);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [customer]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recentOrderRefs));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [recentOrderRefs]);

  const addRecentOrderRef = (ref: string) => {
    setRecentOrderRefs(prev => [ref, ...prev.filter(r => r !== ref)].slice(0, 10));
  };

  // Add Item to cart
  const addItem = (
    item: MenuItem, 
    options: SelectedOption[] = [], 
    quantity = 1, 
    instructions = ''
  ) => {
    const extraTotal = options.reduce((sum, opt) => sum + opt.extraPrice, 0);
    const unitPrice = item.priceNumeric + extraTotal;
    const totalPrice = unitPrice * quantity;

    // Check if exact same item with exact same options already in cart
    const optionsKey = options.map(o => `${o.groupId}:${o.optionId}`).sort().join('|');
    const existingIndex = cartItems.findIndex(ci => 
      ci.menuItem.id === item.id && 
      (ci.specialInstructions || '') === instructions &&
      ci.selectedOptions.map(o => `${o.groupId}:${o.optionId}`).sort().join('|') === optionsKey
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const existing = updated[existingIndex];
      const newQty = existing.quantity + quantity;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: existing.unitPrice * newQty
      };
      setCartItems(updated);
    } else {
      const newCartItem: CartItem = {
        cartItemId: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        menuItem: item,
        quantity,
        selectedOptions: options,
        specialInstructions: instructions,
        unitPrice,
        totalPrice
      };
      setCartItems(prev => [...prev, newCartItem]);
    }
  };

  const removeItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
    setPromoError(null);
    setTipAmount(0);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (subtotal < appliedPromo.minOrder) return 0;

    if (appliedPromo.discountType === 'percentage') {
      return Math.round((subtotal * appliedPromo.value) / 100);
    }
    if (appliedPromo.discountType === 'fixed') {
      return Math.min(appliedPromo.value, subtotal);
    }
    return 0;
  }, [appliedPromo, subtotal]);

  const deliveryFee = useMemo(() => {
    if (deliveryZone.isTakeaway) return 0;
    if (appliedPromo?.discountType === 'free_shipping' && subtotal >= appliedPromo.minOrder) {
      return 0;
    }
    return deliveryZone.fee;
  }, [deliveryZone, appliedPromo, subtotal]);

  // TVA 18% standard UEMOA / Côte d'Ivoire (calculée pour affichage de transparence fiscale)
  const vatAmount = useMemo(() => {
    const taxableBase = Math.max(0, subtotal - discountAmount);
    return Math.round((taxableBase * 0.18) / 1.18);
  }, [subtotal, discountAmount]);

  const total = useMemo(() => {
    const payableSubtotal = Math.max(0, subtotal - discountAmount);
    return payableSubtotal + deliveryFee + tipAmount;
  }, [subtotal, discountAmount, deliveryFee, tipAmount]);

  // Promo Code Validation
  const applyPromoCode = async (codeToApply?: string): Promise<{ success: boolean; message: string }> => {
    const rawCode = (codeToApply || promoInput).trim().toUpperCase();
    setPromoError(null);

    if (!rawCode) {
      const msg = 'Veuillez saisir un code promo';
      setPromoError(msg);
      return { success: false, message: msg };
    }

    try {
      // 1. Try server verification first
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawCode, subtotal })
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedPromo(data.promo);
        return { success: true, message: data.message };
      }
    } catch (e) {
      console.warn('Server promo validation fallback to local rules', e);
    }

    // 2. Client fallback
    const found = DEFAULT_PROMO_CODES.find(p => p.code.toUpperCase() === rawCode);
    if (!found) {
      const msg = 'Code promo non reconnu ou invalide';
      setPromoError(msg);
      return { success: false, message: msg };
    }

    if (subtotal < found.minOrder) {
      const msg = `Ce code nécessite un panier minimum de ${found.minOrder.toLocaleString()} F (Panier actuel: ${subtotal.toLocaleString()} F)`;
      setPromoError(msg);
      return { success: false, message: msg };
    }

    setAppliedPromo(found);
    return { success: true, message: `Code ${found.code} appliqué avec succès !` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  return (
    <CartContext.Provider value={{
      cartItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      promoInput,
      setPromoInput,
      appliedPromo,
      applyPromoCode,
      removePromoCode,
      promoError,
      deliveryZone,
      setDeliveryZone,
      tipAmount,
      setTipAmount,
      cutleryNeeded,
      setCutleryNeeded,
      customer,
      setCustomer,
      subtotal,
      discountAmount,
      deliveryFee,
      vatAmount,
      total,
      itemCount,
      isCartOpen,
      openCart,
      closeCart,
      isCheckoutOpen,
      openCheckout,
      closeCheckout,
      customizingItem,
      setCustomizingItem,
      activeTrackingOrder,
      setActiveTrackingOrder,
      isTrackingOpen,
      setIsTrackingOpen,
      isAdminOpen,
      setIsAdminOpen,
      isPinModalOpen,
      setIsPinModalOpen,
      openAdminPinModal,
      isPassGourmandOpen,
      setIsPassGourmandOpen,
      recentOrderRefs,
      addRecentOrderRef
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
