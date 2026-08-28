/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, DELIVERY_ZONES } from '../constants';
import { DeliveryZoneId } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    vatAmount,
    total,
    itemCount,
    deliveryZone,
    setDeliveryZone,
    openCheckout
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Sliding Panel */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
          id="cart-drawer-panel"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fa8107]/10 flex items-center justify-center text-[#fa8107]">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight text-gray-900">Mon Panier</h3>
                <p className="text-xs text-gray-400 font-medium">
                  {itemCount} {itemCount > 1 ? 'articles sélectionnés' : 'article sélectionné'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button 
                  onClick={clearCart}
                  title="Vider le panier"
                  className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  id="btn-clear-cart"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button 
                onClick={closeCart}
                className="text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                id="btn-close-cart"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Delivery progress bar banner */}
          <div className="bg-orange-50/70 border-b border-orange-100 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5 text-[#fa8107]">
                <Truck size={14} /> 
                <span>Livraison express directe à Bingerville & Abidjan</span>
              </span>
              <span className="font-black text-[#fa8107]">{deliveryZone.name}</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                  <ShoppingBag size={36} />
                </div>
                <h4 className="font-black text-gray-700 text-lg uppercase mb-1">Votre panier est vide</h4>
                <p className="text-xs text-gray-400 max-w-xs mb-6">
                  Découvrez nos délicieuses pizzas au feu de bois, chawarmas et spécialités locales.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-[#fa8107] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#e07306] transition-colors"
                >
                  Explorer la Carte
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <motion.div 
                  layout
                  key={item.cartItemId}
                  className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex gap-4 items-center group hover:border-orange-200 transition-colors"
                >
                  <img 
                    src={item.menuItem.image} 
                    alt={item.menuItem.name} 
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-sm uppercase text-gray-900 truncate">
                        {item.menuItem.name}
                      </h4>
                      <span className="font-black text-sm text-[#fa8107] whitespace-nowrap">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>

                    {item.selectedOptions.length > 0 && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {item.selectedOptions.map(o => o.optionName).join(', ')}
                      </p>
                    )}

                    {item.specialInstructions && (
                      <p className="text-[10px] text-[#fa8107] italic truncate mt-0.5">
                        « {item.specialInstructions} »
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-xs transition-all"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center font-black text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-xs transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer with promo code & totals */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              {/* Delivery Zone Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center justify-between">
                  <span>Zone de Livraison / Retrait</span>
                  <span className="text-[#fa8107] font-bold">{deliveryZone.estimatedMinutes}</span>
                </label>
                <select
                  value={deliveryZone.id}
                  onChange={(e) => {
                    const zone = DELIVERY_ZONES.find(z => z.id === e.target.value as DeliveryZoneId);
                    if (zone) setDeliveryZone(zone);
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-[#fa8107]"
                  id="select-delivery-zone"
                >
                  {DELIVERY_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.fee === 0 ? 'Gratuit' : formatPrice(zone.fee)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-gray-200/80 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total articles</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Frais de livraison</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 uppercase font-black text-[11px]">Offert</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400 text-[10px]">
                  <span>TVA (18% UEMOA incluse)</span>
                  <span>{formatPrice(vatAmount)}</span>
                </div>

                <div className="flex justify-between items-center text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span className="uppercase tracking-tight">Total TTC à payer</span>
                  <span className="text-[#fa8107] text-xl font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={openCheckout}
                className="w-full bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
                id="btn-go-to-checkout"
              >
                <span>Commander maintenant ({formatPrice(total)})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
