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
  ShieldCheck, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  User, 
  Truck, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Send,
  MessageCircle,
  Building
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, DELIVERY_ZONES, RESTAURANT_PHONE, RESTAURANT_ADDRESS, WAVE_PAYMENT_URL, WHATSAPP_NUMBER } from '../constants';
import { DeliveryZoneId, Order } from '../types';

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
    customer,
    setCustomer,
    clearCart,
    setActiveTrackingOrder,
    setIsTrackingOpen,
    addRecentOrderRef
  } = useCart();

  // Screen state:
  // 'form' : Saisie des 3 champs obligatoires + Récapitulatif épuré
  // 'tunnel' : Le Tunnel de commande en 2 étapes (1: Payer par Wave, 2: Envoyer sur WhatsApp)
  // 'success' : Confirmation de commande
  const [screen, setScreen] = useState<'form' | 'tunnel' | 'success'>('form');

  // Mode: livraison vs retrait
  const [isTakeaway, setIsTakeaway] = useState(deliveryZone.isTakeaway || false);

  // Tunnel state
  const [wavePaidConfirmed, setWavePaidConfirmed] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  // Mode change handler
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

  // Validation des 3 coordonnées uniques obligatoires
  const validateForm = () => {
    setErrorMessage(null);
    const fullName = (customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`).trim();
    if (!fullName) {
      setErrorMessage('Veuillez renseigner votre Nom & Prénom');
      return false;
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 8) {
      setErrorMessage('Veuillez renseigner un Numéro de téléphone valide');
      return false;
    }
    if (!isTakeaway && !customer.address.trim()) {
      setErrorMessage('Veuillez renseigner votre Adresse de livraison');
      return false;
    }
    return true;
  };

  const handleProceedToTunnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setScreen('tunnel');
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

  // Construction du message WhatsApp récapitulatif
  const buildWhatsAppMessage = (orderRef: string) => {
    const fullName = (customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`).trim();
    const itemsList = cartItems.map(item => {
      const optionsText = item.selectedOptions && item.selectedOptions.length > 0
        ? ` (${item.selectedOptions.map(o => o.optionName).join(', ')})`
        : '';
      return `• ${item.quantity}x ${item.menuItem.name}${optionsText} - ${formatPrice(item.totalPrice)}`;
    }).join('\n');

    const addressText = isTakeaway
      ? `Retrait sur place au restaurant (${RESTAURANT_ADDRESS})`
      : `${customer.address} (${deliveryZone.name})`;

    return `*NOUVELLE COMMANDE DOUX GOÛTS* 🍕
Réf : #${orderRef}
------------------------------------
👤 *Nom & Prénom :* ${fullName}
📞 *Numéro de téléphone :* ${customer.phone}
📍 *Adresse de livraison et Repère :* ${addressText}

📋 *Articles et packs commandés :*
${itemsList}

🚚 *Frais de livraison :* ${deliveryFee === 0 ? 'Offerts' : formatPrice(deliveryFee)}
💰 *Montant total :* ${formatPrice(total)}

✅ *Mention : Paiement effectué via Wave*`;
  };

  // ÉTAPE 2 : Envoyer la commande sur WhatsApp
  const handleSendWhatsAppOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullName = (customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`).trim();
    const orderRef = `DG-${Math.floor(1000 + Math.random() * 9000)}`;

    const normalizedCustomer = {
      fullName,
      phone: customer.phone.trim(),
      address: isTakeaway ? RESTAURANT_ADDRESS : customer.address.trim(),
      firstName: fullName.split(' ')[0] || fullName,
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      email: customer.email || '',
      district: deliveryZone.name,
      isBillingSameAsDelivery: true
    };

    // Payload de sauvegarde en base de données pour la cuisine & le suivi
    const orderPayload: Partial<Order> = {
      reference: orderRef,
      customer: normalizedCustomer,
      items: cartItems,
      subtotal,
      deliveryFee,
      deliveryZone,
      discountAmount: 0,
      vatAmount,
      total,
      paymentMethod: 'wave_ci',
      paymentStatus: 'succeeded',
      orderStatus: 'confirmed',
      estimatedDeliveryTime: deliveryZone.estimatedMinutes,
      notes: 'Paiement effectué via Wave - Transmis par WhatsApp'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      let savedOrder: Order;
      if (res.ok) {
        const data = await res.json();
        savedOrder = data.order;
      } else {
        // Fallback local
        savedOrder = {
          id: `ord_${Date.now()}`,
          reference: orderRef,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: normalizedCustomer,
          items: cartItems,
          subtotal,
          deliveryFee,
          deliveryZone,
          discountAmount: 0,
          vatAmount,
          total,
          paymentMethod: 'wave_ci',
          paymentStatus: 'succeeded',
          orderStatus: 'confirmed',
          estimatedDeliveryTime: deliveryZone.estimatedMinutes
        };
      }

      setCompletedOrder(savedOrder);
      addRecentOrderRef(savedOrder.reference);

      // Générer l'URL WhatsApp avec le récapitulatif
      const message = buildWhatsAppMessage(orderRef);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      
      // Ouvrir WhatsApp
      window.open(whatsappUrl, '_blank');

      // Vider le panier et passer à l'écran de succès
      clearCart();
      setScreen('success');
    } catch (err: any) {
      console.error('Erreur commande:', err);
      // Même en cas d'erreur réseau, on génère le WhatsApp pour le client
      const message = buildWhatsAppMessage(orderRef);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      setScreen('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLiveTracking = () => {
    if (completedOrder) {
      setActiveTrackingOrder(completedOrder);
      closeCheckout();
      setIsTrackingOpen(true);
    }
  };

  const currentFullName = customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();

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
          {/* Top Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/70 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg uppercase tracking-tight text-gray-900">
                  DOUX GOÛTS <span className="text-[#fa8107]">COMMANDE</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Sécurisé Wave & WhatsApp
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

            {/* Stepper indication */}
            {screen !== 'success' && (
              <div className="grid grid-cols-2 gap-2 text-center text-xs mt-3">
                <div 
                  className={`py-2 px-3 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    screen === 'form' 
                      ? 'bg-[#fa8107] text-white shadow-xs' 
                      : 'bg-emerald-50 text-emerald-700 font-bold'
                  }`}
                >
                  {screen === 'tunnel' ? <Check size={12} strokeWidth={3} /> : null}
                  <span>1. Coordonnées & Panier</span>
                </div>
                <div 
                  className={`py-2 px-3 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    screen === 'tunnel' 
                      ? 'bg-[#1dc4e9] text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span>2. Paiement Wave & WhatsApp</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <X size={16} className="text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* =========================================================================
                ÉCRAN 1 : FORMULAIRE SIMPLIFIÉ (3 CHAMPS OBLIGATOIRES) & RÉCAPITULATIF
            ========================================================================= */}
            {screen === 'form' && (
              <form onSubmit={handleProceedToTunnel} className="space-y-6">
                {/* Mode de réception */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700 block mb-2.5">
                    Mode de réception
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModeChange(false)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                        !isTakeaway 
                          ? 'border-[#fa8107] bg-orange-50/50 text-gray-900 shadow-sm' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${!isTakeaway ? 'bg-[#fa8107] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase">Livraison Directe</h4>
                        <p className="text-[10px] text-gray-400">Bingerville & Abidjan (2 000 F)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange(true)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                        isTakeaway 
                          ? 'border-[#fa8107] bg-orange-50/50 text-gray-900 shadow-sm' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isTakeaway ? 'bg-[#fa8107] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Building size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase">Retrait sur Place</h4>
                        <p className="text-[10px] text-gray-400">Click & Collect Gratuit (0 F)</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* LES 3 SEULS CHAMPS OBLIGATOIRES DU FORMULAIRE */}
                <div className="space-y-4 bg-orange-50/30 p-5 rounded-2xl border border-orange-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-2 border-b border-orange-200/50 pb-2">
                    <User size={16} className="text-[#fa8107]" /> Coordonnées du client (3 champs obligatoires)
                  </h4>

                  {/* Champ 1 : Nom & Prénom combiné */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-1">
                      1. Nom & Prénom *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Kouassi Jean-Marc"
                        value={currentFullName}
                        onChange={(e) => setCustomer(prev => ({ 
                          ...prev, 
                          fullName: e.target.value,
                          firstName: e.target.value.split(' ')[0] || e.target.value,
                          lastName: e.target.value.split(' ').slice(1).join(' ') || ''
                        }))}
                        className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:border-[#fa8107] font-bold text-gray-900 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Champ 2 : Numéro de téléphone */}
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-1">
                      2. Numéro de téléphone *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="tel"
                        required
                        placeholder="Ex: +225 07 00 00 00 00"
                        value={customer.phone}
                        onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:border-[#fa8107] font-bold text-gray-900 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Champ 3 : Adresse de livraison et Repère à proximité */}
                  {!isTakeaway ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-1">
                          Zone de livraison (Frais : 2 000 FCFA)
                        </label>
                        <select
                          value={deliveryZone.id}
                          onChange={(e) => {
                            const zone = DELIVERY_ZONES.find(z => z.id === e.target.value as DeliveryZoneId);
                            if (zone) setDeliveryZone(zone);
                          }}
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#fa8107] text-gray-900 shadow-2xs"
                        >
                          {DELIVERY_ZONES.filter(z => !z.isTakeaway).map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name} — {formatPrice(z.fee)} (~{z.estimatedMinutes})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-black uppercase tracking-wider text-gray-700 block mb-1">
                          3. Adresse de livraison et Repère à proximité *
                        </label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                          <textarea 
                            required
                            rows={2}
                            placeholder="Ex: Bingerville Cité Addoha, Villa 42, Carrefour Dokui, en face de la pharmacie..."
                            value={customer.address}
                            onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-[#fa8107] font-medium text-gray-900 shadow-2xs resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-orange-200 text-xs text-orange-950">
                      <span className="font-bold">Adresse de retrait au restaurant : </span>
                      <span>{RESTAURANT_ADDRESS}</span>
                    </div>
                  )}
                </div>

                {/* RÉCAPITULATIF DU PANIER (ÉPURÉ : SANS COUVERT ÉCOLOGIQUE ET SANS POURBOIRE) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
                      <ShoppingBag size={16} className="text-[#fa8107]" /> 
                      Articles et packs commandés ({cartItems.length})
                    </h4>
                    <span className="text-xs font-bold text-gray-500">
                      Délai : <strong className="text-[#fa8107]">{deliveryZone.estimatedMinutes}</strong>
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.menuItem.image} 
                            alt={item.menuItem.name} 
                            className="w-10 h-10 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-black text-xs uppercase text-gray-900">
                              {item.quantity}x {item.menuItem.name}
                            </div>
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <div className="text-[10px] text-gray-400">
                                {item.selectedOptions.map(o => o.optionName).join(', ')}
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

                  {/* Calculs financiers nets (sans TVA) */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total articles</span>
                      <span className="font-bold">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Frais de livraison</span>
                      <span className="font-bold">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-600 uppercase font-black text-[10px]">Offert</span>
                        ) : (
                          formatPrice(deliveryFee)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                      <span className="uppercase">Montant Net Total</span>
                      <span className="text-[#fa8107] text-xl font-black">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton pour aller au tunnel */}
                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <span>Continuer vers le Paiement Wave ({formatPrice(total)})</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* =========================================================================
                ÉCRAN 2 : TUNNEL DE COMMANDE EN 2 ÉTAPES (WAVE + WHATSAPP)
            ========================================================================= */}
            {screen === 'tunnel' && (
              <div className="space-y-6">
                {/* ---------------- ÉTAPE 1 : Payer par Wave ---------------- */}
                <div className="bg-gradient-to-br from-[#1dc4e9]/15 via-sky-50 to-cyan-50 p-5 rounded-3xl border-2 border-[#1dc4e9]/40 relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#1dc4e9] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                      ÉTAPE 1 / 2 : Payer par Wave
                    </span>
                    <span className="font-black text-lg text-[#008ba3]">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-base uppercase text-gray-900">
                      Effectuez votre paiement Wave
                    </h3>
                    <p className="text-xs text-gray-600">
                      Veuillez effectuer votre paiement de <strong className="text-[#fa8107] font-black">{formatPrice(total)}</strong> sur notre compte marchand Wave ci-dessous.
                    </p>
                  </div>

                  {/* Bouton direct Wave & Lien officiel */}
                  <div className="bg-white p-4 rounded-2xl border border-[#1dc4e9]/30 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Lien Officiel Wave Doux Goûts
                        </span>
                        <div className="font-mono text-xs font-bold text-[#008ba3] truncate">
                          {WAVE_PAYMENT_URL}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyWaveLink}
                          className="bg-cyan-50 hover:bg-cyan-100 text-[#008ba3] px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-cyan-200 transition-colors cursor-pointer"
                          title="Copier le lien Wave"
                        >
                          <Copy size={14} />
                          <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
                        </button>

                        <a
                          href={WAVE_PAYMENT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#1dc4e9] hover:bg-[#19b2d4] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-cyan-500/25 transition-all hover:scale-105"
                        >
                          <span>Payer sur Wave ({formatPrice(total)})</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Numéro Wave (sans scanner QR) */}
                  <div className="bg-white p-4 rounded-2xl border border-[#1dc4e9]/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                        Numéro Wave Doux Goûts
                      </span>
                      <div className="font-mono font-black text-gray-900 text-sm">
                        {RESTAURANT_PHONE}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyWaveNumber}
                      className="bg-cyan-50 hover:bg-cyan-100 text-[#008ba3] font-bold text-xs px-3.5 py-2.5 rounded-xl border border-cyan-200 transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Copy size={13} />
                      <span>{copiedNumber ? 'Copié !' : 'Copier le numéro'}</span>
                    </button>
                  </div>

                  {/* Confirmation check optionnelle */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={wavePaidConfirmed}
                      onChange={(e) => setWavePaidConfirmed(e.target.checked)}
                      className="w-4 h-4 accent-[#1dc4e9] cursor-pointer rounded"
                    />
                    <span className="text-xs font-bold text-gray-700 select-none">
                      J'ai effectué ou initié mon paiement Wave de {formatPrice(total)}
                    </span>
                  </label>
                </div>

                {/* ---------------- ÉTAPE 2 : Envoyer la commande sur WhatsApp ---------------- */}
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-5 rounded-3xl border-2 border-emerald-400/40 relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#25D366] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                      ÉTAPE 2 / 2 : Envoyer sur WhatsApp
                    </span>
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <MessageCircle size={14} /> Récapitulatif instantané
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-base uppercase text-gray-900">
                      Transmettre la commande sur WhatsApp
                    </h3>
                    <p className="text-xs text-gray-600">
                      Cliquez sur le bouton ci-dessous pour envoyer automatiquement le récapitulatif complet de votre commande avec mention du paiement Wave à notre équipe.
                    </p>
                  </div>

                  {/* Aperçu du récapitulatif WhatsApp */}
                  <div className="bg-white/90 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2">
                    <div className="font-bold text-gray-800 border-b border-gray-100 pb-1.5 flex items-center justify-between">
                      <span>Récapitulatif inclus dans le message :</span>
                      <span className="text-[10px] text-gray-400">wa.me/{WHATSAPP_NUMBER}</span>
                    </div>
                    <div className="text-[11px] text-gray-600 space-y-1">
                      <div>👤 <strong>Nom & Prénom :</strong> {currentFullName}</div>
                      <div>📞 <strong>Téléphone :</strong> {customer.phone}</div>
                      <div>📍 <strong>Adresse :</strong> {isTakeaway ? 'Retrait sur place' : `${customer.address} (${deliveryZone.name})`}</div>
                      <div>📋 <strong>Articles :</strong> {cartItems.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</div>
                      <div>💰 <strong>Total :</strong> {formatPrice(total)}</div>
                      <div className="text-emerald-700 font-bold">✅ Mention : "Paiement effectué via Wave"</div>
                    </div>
                  </div>

                  {/* LE BOUTON OFFICIEL WHATSAPP */}
                  <button
                    type="button"
                    onClick={handleSendWhatsAppOrder}
                    disabled={isSubmitting}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-green-600/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-60"
                    id="btn-send-order-whatsapp"
                  >
                    <MessageCircle size={22} className="fill-white" />
                    <span>{isSubmitting ? 'Préparation...' : 'Envoyer la commande sur WhatsApp'}</span>
                  </button>
                </div>

                {/* Bouton Retour vers le formulaire */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setScreen('form')}
                    className="text-gray-500 hover:text-gray-900 font-black text-xs uppercase flex items-center gap-1.5 p-3 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Modifier mes coordonnées</span>
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                ÉCRAN 3 : CONFIRMATION & SUCCÈS
            ========================================================================= */}
            {screen === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                  <CheckCircle2 size={44} />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    Commande Envoyée avec Succès
                  </span>
                  <h3 className="text-3xl font-black uppercase text-gray-900 mt-3">
                    Merci pour votre commande !
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    Votre récapitulatif a été transmis sur WhatsApp et enregistré pour la cuisine.
                  </p>
                </div>

                {completedOrder && (
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-left max-w-md mx-auto text-xs space-y-2">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Référence commande :</span>
                      <strong className="text-[#fa8107] font-black text-sm">#{completedOrder.reference}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Montant total :</span>
                      <strong className="text-emerald-700 font-bold">{formatPrice(completedOrder.total)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mode :</span>
                      <strong>{completedOrder.deliveryZone.isTakeaway ? 'Retrait sur place' : 'Livraison express'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Statut paiement :</span>
                      <strong className="text-emerald-600 font-bold">Paiement effectué via Wave</strong>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={handleOpenLiveTracking}
                    className="flex-1 bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Clock size={16} />
                    <span>Suivre en direct</span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-2xl font-black text-xs uppercase transition-colors cursor-pointer"
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
