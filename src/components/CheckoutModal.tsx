/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  CreditCard, 
  Smartphone, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Banknote, 
  Truck, 
  Building, 
  CheckCircle2, 
  Clock, 
  Heart,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, DELIVERY_ZONES, RESTAURANT_PHONE, RESTAURANT_ADDRESS, WAVE_PAYMENT_URL } from '../constants';
import { DeliveryZoneId, PaymentMethodType, Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    cartItems,
    subtotal,
    deliveryFee,
    vatAmount,
    total,
    deliveryZone,
    setDeliveryZone,
    tipAmount,
    setTipAmount,
    cutleryNeeded,
    setCutleryNeeded,
    customer,
    setCustomer,
    clearCart,
    setActiveTrackingOrder,
    setIsTrackingOpen,
    addRecentOrderRef
  } = useCart();

  // Wizard step (1: Coordonnées & Mode, 2: Récapitulatif, 3: Paiement, 4: Succès)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Mode: delivery vs takeaway
  const [isTakeaway, setIsTakeaway] = useState(deliveryZone.isTakeaway || false);

  // Selected Payment Method (Exclusively Wave CI)
  const [paymentMethod] = useState<PaymentMethodType>('wave_ci');
  
  // Wave state
  const [wavePhone, setWavePhone] = useState(customer.phone || '');
  const [waveConfirmed, setWaveConfirmed] = useState(true);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  // Handle Mode Change
  const handleModeChange = (takeaway: boolean) => {
    setIsTakeaway(takeaway);
    if (takeaway) {
      const takeawayZone = DELIVERY_ZONES.find(z => z.isTakeaway);
      if (takeawayZone) setDeliveryZone(takeawayZone);
    } else {
      const defaultDeliveryZone = DELIVERY_ZONES.find(z => !z.isTakeaway) || DELIVERY_ZONES[1];
      setDeliveryZone(defaultDeliveryZone);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    setErrorMessage(null);
    if (!customer.firstName.trim()) {
      setErrorMessage('Veuillez renseigner votre prénom');
      return false;
    }
    if (!customer.phone.trim() || customer.phone.length < 8) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone ou WhatsApp valide');
      return false;
    }
    if (!isTakeaway && !customer.address.trim()) {
      setErrorMessage('Veuillez renseigner une adresse de livraison précise');
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCopyWaveNumber = () => {
    navigator.clipboard.writeText(RESTAURANT_PHONE.replace(/\s+/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleCopyWaveLink = () => {
    navigator.clipboard.writeText(WAVE_PAYMENT_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Final submit & Payment processing
  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const orderRef = `DG-${Math.floor(1000 + Math.random() * 9000)}`;

      // Submit order to database with Wave payment
      const orderPayload: Partial<Order> = {
        reference: orderRef,
        customer,
        items: cartItems,
        subtotal,
        deliveryFee,
        deliveryZone,
        discountAmount: 0,
        promoCode: undefined,
        vatAmount,
        tipAmount,
        cutleryNeeded,
        total,
        paymentMethod: 'wave_ci',
        paymentStatus: 'succeeded',
        orderStatus: 'confirmed',
        estimatedDeliveryTime: deliveryZone.estimatedMinutes,
        notes: isTakeaway ? 'Retrait sur place (Click & Collect) - Réglé par Wave' : `${customer.deliveryNotes || ''} - Réglé par Wave`
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        throw new Error('Erreur lors de la confirmation de votre commande');
      }

      const orderResult = await orderRes.json();
      const savedOrder = orderResult.order as Order;

      setCompletedOrder(savedOrder);
      addRecentOrderRef(savedOrder.reference);
      clearCart();
      setStep(4);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors de la validation du paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenLiveTracking = () => {
    if (completedOrder) {
      setActiveTrackingOrder(completedOrder);
      closeCheckout();
      setIsTrackingOpen(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 relative"
          id="checkout-modal-container"
        >
          {/* Top Progress Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/70 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg uppercase tracking-tight text-gray-900">
                  DOUX GOÛTS <span className="text-[#fa8107]">CHECKOUT</span>
                </span>
                <span className="bg-orange-100 text-[#fa8107] text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Sécurisé SSL
                </span>
              </div>
              <button 
                onClick={closeCheckout}
                className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                id="btn-close-checkout"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper tabs */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { num: 1, label: '1. Coordonnées' },
                { num: 2, label: '2. Récapitulatif' },
                { num: 3, label: '3. Paiement' }
              ].map((s) => (
                <div 
                  key={s.num}
                  className={`py-2 px-3 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    step === s.num 
                      ? 'bg-[#fa8107] text-white shadow-sm' 
                      : step > s.num 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-white text-gray-400 border border-gray-100'
                  }`}
                >
                  {step > s.num ? <Check size={12} strokeWidth={3} /> : null}
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Wizard Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <X size={16} className="text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ----------------- STEP 1 : COORDONNÉES & MODE ----------------- */}
            {step === 1 && (
              <form onSubmit={handleNextFromStep1} className="space-y-6">
                {/* Reception Mode Switcher */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-3">
                    Mode de réception
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModeChange(false)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                        !isTakeaway 
                          ? 'border-[#fa8107] bg-orange-50/50 text-gray-900 shadow-sm' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isTakeaway ? 'bg-[#fa8107] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase">Livraison à Domicile</h4>
                        <p className="text-[10px] text-gray-400">Bingerville & Abidjan</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange(true)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                        isTakeaway 
                          ? 'border-[#fa8107] bg-orange-50/50 text-gray-900 shadow-sm' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTakeaway ? 'bg-[#fa8107] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Building size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase">Retrait sur Place</h4>
                        <p className="text-[10px] text-gray-400">Click & Collect Gratuit</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <User size={16} className="text-[#fa8107]" /> Vos Coordonnées
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Prénom *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Jean-Marc"
                        value={customer.firstName}
                        onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Nom de famille</label>
                      <input 
                        type="text"
                        placeholder="Ex: Kouassi"
                        value={customer.lastName}
                        onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Numéro Téléphone / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="tel"
                          required
                          placeholder="+225 07 00 00 00 00"
                          value={customer.phone}
                          onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Email (reçu de paiement)
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email"
                          placeholder="votre.email@gmail.com"
                          value={customer.email}
                          onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address (if delivery) */}
                {!isTakeaway ? (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <MapPin size={16} className="text-[#fa8107]" /> Adresse de Livraison
                    </h4>

                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Commune / Zone de livraison
                      </label>
                      <select
                        value={deliveryZone.id}
                        onChange={(e) => {
                          const zone = DELIVERY_ZONES.find(z => z.id === e.target.value as DeliveryZoneId);
                          if (zone) setDeliveryZone(zone);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#fa8107] focus:bg-white"
                      >
                        {DELIVERY_ZONES.filter(z => !z.isTakeaway).map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name} — {formatPrice(z.fee)} (~{z.estimatedMinutes})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 block mb-1">
                          Adresse précise (Rue, Villa, Immeuble) *
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Cité Addoha, Villa 42"
                          value={customer.address}
                          onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-600 block mb-1">
                          Repère à proximité (Optionnel)
                        </label>
                        <input 
                          type="text"
                          placeholder="Ex: En face de la pharmacie, Carrefour Dokui"
                          value={customer.landmark}
                          onChange={(e) => setCustomer(prev => ({ ...prev, landmark: e.target.value }))}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">
                        Instructions particulières pour le livreur
                      </label>
                      <input 
                        type="text"
                        placeholder="Ex: Appeler au portail, laisser à l'accueil, monnaie sur 10 000 F..."
                        value={customer.deliveryNotes}
                        onChange={(e) => setCustomer(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#fa8107] focus:bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
                    <div className="font-black flex items-center gap-2 text-[#fa8107]">
                      <Building size={16} /> Adresse de retrait au restaurant :
                    </div>
                    <p className="font-bold">{RESTAURANT_ADDRESS}</p>
                    <p className="text-[11px] text-gray-600">Votre commande sera préparée et chaude sous 15 à 25 minutes.</p>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:scale-[1.01] transition-all"
                  >
                    <span>Continuer vers le Récapitulatif</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* ----------------- STEP 2 : RÉCAPITULATIF & OPTIONS ----------------- */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#fa8107]" /> Articles de votre commande ({cartItems.length})
                  </h4>
                  <span className="text-xs font-bold text-gray-500">
                    Délai estimé : <strong className="text-[#fa8107]">{deliveryZone.estimatedMinutes}</strong>
                  </span>
                </div>

                {/* Items Summary list */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.menuItem.image} 
                          alt={item.menuItem.name} 
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-black text-xs uppercase text-gray-900">
                            {item.quantity}x {item.menuItem.name}
                          </div>
                          {item.selectedOptions.length > 0 && (
                            <div className="text-[10px] text-gray-400">
                              {item.selectedOptions.map(o => o.optionName).join(', ')}
                            </div>
                          )}
                          {item.specialInstructions && (
                            <div className="text-[10px] text-[#fa8107] italic">
                              « {item.specialInstructions} »
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-xs text-[#fa8107]">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cutlery option & Driver Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-gray-800">Couverts écologiques</div>
                      <div className="text-[10px] text-gray-400">Serviettes & couverts en bois</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={cutleryNeeded}
                      onChange={(e) => setCutleryNeeded(e.target.checked)}
                      className="w-5 h-5 accent-[#fa8107] cursor-pointer rounded"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                    <div className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                      <Heart size={14} className="text-red-500" /> Pourboire livreur
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {[0, 500, 1000, 2000].map((tip) => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => setTipAmount(tip)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                            tipAmount === tip 
                              ? 'bg-[#fa8107] text-white border-[#fa8107]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {tip === 0 ? '0 F' : `${tip} F`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recipient & Destination recap card */}
                <div className="bg-orange-50/60 border border-orange-100 p-4 rounded-2xl text-xs space-y-1">
                  <div className="font-black text-gray-900 flex items-center justify-between">
                    <span>Destinataire : {customer.firstName} {customer.lastName} ({customer.phone})</span>
                    <button onClick={() => setStep(1)} className="text-[#fa8107] font-bold hover:underline">Modifier</button>
                  </div>
                  <div className="text-gray-600">
                    {isTakeaway 
                      ? '🏬 Retrait sur place au restaurant Doux Goûts' 
                      : `🛵 Livraison à : ${customer.address}, ${deliveryZone.name}`}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total articles</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Frais de livraison</span>
                    <span className="font-bold">
                      {deliveryFee === 0 ? <span className="text-emerald-600 uppercase font-black text-[10px]">Offert</span> : formatPrice(deliveryFee)}
                    </span>
                  </div>

                  {tipAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Pourboire livreur</span>
                      <span className="font-bold">+{formatPrice(tipAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-400 text-[10px]">
                    <span>TVA incluse (18%)</span>
                    <span>{formatPrice(vatAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                    <span className="uppercase">Total Final TTC</span>
                    <span className="text-[#fa8107] text-xl font-black">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-900 font-black text-xs uppercase flex items-center gap-1.5 p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Retour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 hover:scale-[1.01] transition-all"
                  >
                    <span>Passer au Paiement ({formatPrice(total)})</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 3 : PAIEMENT EXCLUSIF WAVE CÔTE D'IVOIRE ----------------- */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Header Wave */}
                <div className="bg-gradient-to-br from-[#1dc4e9]/15 via-sky-50 to-cyan-50 p-5 rounded-3xl border border-[#1dc4e9]/30 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1dc4e9] text-white flex items-center justify-center shadow-md font-black text-xl">
                        🌊
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base uppercase text-gray-900 tracking-tight">Paiement Sécurisé Wave Côte d'Ivoire</h4>
                          <span className="bg-[#1dc4e9] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                            0% Frais
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Réglez directement via votre compte Wave en 1 clic
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Wave Direct Action Banner */}
                  <div className="mt-4 p-4 rounded-2xl bg-white border border-[#1dc4e9]/30 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Lien Officiel Wave Marchand
                        </span>
                        <div className="font-mono text-xs font-bold text-[#008ba3] truncate max-w-[280px] sm:max-w-[340px]">
                          {WAVE_PAYMENT_URL}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyWaveLink}
                          className="bg-cyan-50 hover:bg-cyan-100 text-[#008ba3] px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-cyan-200 transition-colors"
                          title="Copier le lien de paiement"
                        >
                          <Copy size={14} />
                          <span>{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
                        </button>
                        
                        <a
                          href={WAVE_PAYMENT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#1dc4e9] hover:bg-[#19b2d4] text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
                        >
                          <span>Payer sur Wave</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Wave QR & Instructions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white p-4 rounded-2xl border border-[#1dc4e9]/20 shadow-xs mt-3">
                    {/* QR Code Wave */}
                    <a
                      href={WAVE_PAYMENT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center text-center p-3 bg-cyan-50/40 rounded-xl border border-cyan-100 group hover:border-[#1dc4e9] transition-all cursor-pointer"
                      title="Cliquez ou scannez pour payer sur Wave"
                    >
                      <div className="w-32 h-32 bg-white p-2 rounded-xl border border-cyan-200 flex items-center justify-center shadow-xs relative overflow-hidden group-hover:shadow-md transition-all">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(WAVE_PAYMENT_URL)}`}
                          alt="QR Code Wave Paiement"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // fallback if qr server is unreachable
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-white/95 px-1.5 py-0.5 rounded-md text-[9px] font-black text-[#1dc4e9] shadow-xs border border-[#1dc4e9]/30">
                            WAVE
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-[#008ba3] uppercase tracking-wider mt-2 group-hover:underline flex items-center gap-1">
                        <span>Scanner / Cliquer pour payer</span>
                        <ExternalLink size={11} />
                      </span>
                    </a>

                    {/* Transfer Details & Direct Action */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                          Numéro Wave Doux Goûts
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 px-3 py-2 rounded-xl font-mono font-black text-gray-900 text-sm flex-1">
                            {RESTAURANT_PHONE}
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyWaveNumber}
                            className="bg-[#1dc4e9]/10 hover:bg-[#1dc4e9]/20 text-[#008ba3] font-bold text-xs px-3 py-2 rounded-xl border border-[#1dc4e9]/30 transition-colors"
                            title="Copier le numéro"
                          >
                            {copiedNumber ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-cyan-50 p-2.5 rounded-xl border border-cyan-200/60 text-[11px] text-cyan-950 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>Montant exact de la commande :</span>
                          <span className="text-[#fa8107] font-black text-xs">{formatPrice(total)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                          Cliquez sur le bouton "Payer sur Wave" ci-dessus ou scannez le QR code pour régler votre panier en toute sécurité.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Numéro Wave du client */}
                  <div className="mt-4 pt-4 border-t border-[#1dc4e9]/20 space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-700 block">
                      Votre numéro de téléphone Wave (pour confirmation du reçu)
                    </label>
                    <input 
                      type="tel"
                      value={wavePhone}
                      onChange={(e) => setWavePhone(e.target.value)}
                      placeholder="+225 07 00 00 00 00"
                      className="w-full bg-white border border-[#1dc4e9]/40 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#1dc4e9]"
                    />
                    
                    <div className="flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        id="wave-done-check" 
                        checked={waveConfirmed} 
                        onChange={(e) => setWaveConfirmed(e.target.checked)} 
                        className="accent-[#1dc4e9] w-4 h-4 cursor-pointer" 
                      />
                      <label htmlFor="wave-done-check" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                        Je confirme effectuer mon paiement de {formatPrice(total)} sur le compte Wave Doux Goûts
                      </label>
                    </div>
                  </div>
                </div>

                {/* Navigation and Final Pay Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-gray-500 hover:text-gray-900 font-black text-xs uppercase flex items-center gap-1.5 p-3 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Retour</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing || !waveConfirmed}
                    onClick={handleProcessPayment}
                    className="bg-[#1dc4e9] hover:bg-[#19b2d4] text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/25 flex items-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
                    id="btn-confirm-payment"
                  >
                    <Lock size={15} />
                    <span>{isProcessing ? 'Validation...' : `Valider la commande (${formatPrice(total)})`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ----------------- STEP 4 : CONFIRMATION & SUCCÈS ----------------- */}
            {step === 4 && completedOrder && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                  <CheckCircle2 size={44} />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    Commande Enregistrée avec Wave
                  </span>
                  <h3 className="text-3xl font-black uppercase text-gray-900 mt-3">
                    Merci pour votre commande !
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    Votre commande <strong className="text-gray-900">#{completedOrder.reference}</strong> a été transmise à notre chef de cuisine à Bingerville.
                  </p>
                </div>

                {/* Recap badge */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-left max-w-md mx-auto text-xs space-y-2">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Numéro de commande :</span>
                    <strong className="text-[#fa8107] font-black text-sm">#{completedOrder.reference}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant total réglé :</span>
                    <strong className="text-emerald-700 font-bold">{formatPrice(completedOrder.total)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mode :</span>
                    <strong>{completedOrder.deliveryZone.isTakeaway ? 'Retrait sur place' : 'Livraison express'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Délai estimé :</span>
                    <strong className="text-emerald-600 font-bold">{completedOrder.estimatedDeliveryTime}</strong>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <a
                    href={WAVE_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1dc4e9] hover:bg-[#19b2d4] text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Lien Wave Marchand</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    type="button"
                    onClick={handleOpenLiveTracking}
                    className="flex-1 bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    id="btn-view-live-tracking"
                  >
                    <Clock size={16} />
                    <span>Suivre en direct</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl font-black text-xs uppercase transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
