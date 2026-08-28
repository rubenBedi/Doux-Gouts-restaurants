/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Truck, 
  MapPin, 
  Phone, 
  Share2, 
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus } from '../types';
import { formatPrice, RESTAURANT_PHONE, WHATSAPP_NUMBER } from '../constants';

export const OrderTrackingModal: React.FC = () => {
  const { 
    isTrackingOpen, 
    setIsTrackingOpen, 
    activeTrackingOrder, 
    setActiveTrackingOrder,
    recentOrderRefs 
  } = useCart();

  const [searchRef, setSearchRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-search if active order provided
  useEffect(() => {
    if (activeTrackingOrder) {
      setSearchRef(activeTrackingOrder.reference);
    } else if (recentOrderRefs.length > 0) {
      setSearchRef(recentOrderRefs[0]);
      handleFetchOrder(recentOrderRefs[0]);
    }
  }, [activeTrackingOrder]);

  const handleFetchOrder = async (refToFind: string) => {
    if (!refToFind.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${refToFind.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTrackingOrder(data.order);
      } else {
        setError('Aucune commande trouvée avec cette référence');
      }
    } catch (err: any) {
      setError('Impossible de récupérer la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchOrder(searchRef);
  };

  if (!isTrackingOpen) return null;

  const order = activeTrackingOrder;

  const getStepIndex = (status?: OrderStatus): number => {
    switch (status) {
      case 'pending':
      case 'confirmed': return 1;
      case 'in_kitchen': return 2;
      case 'in_delivery': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const currentStep = getStepIndex(order?.orderStatus);

  const handleShareWhatsApp = () => {
    if (!order) return;
    const msg = `Suivi de ma commande Doux Goûts Resto #${order.reference} : Montant ${formatPrice(order.total)}, Statut : ${order.orderStatus}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
          id="order-tracking-modal"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between flex-shrink-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#fa8107] block">
                Suivi en temps réel
              </span>
              <h3 className="font-black text-xl uppercase tracking-tight text-gray-900">
                Où est ma commande ?
              </h3>
            </div>
            <button 
              onClick={() => setIsTrackingOpen(false)}
              className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search bar & Recent orders tabs */}
          <div className="p-6 pb-2 border-b border-gray-100 bg-white">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Référence de commande (ex: DG-8842)"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold uppercase outline-none focus:border-[#fa8107] focus:bg-white"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !searchRef.trim()}
                className="bg-[#fa8107] hover:bg-[#e07306] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Rechercher'}
              </button>
            </form>

            {recentOrderRefs.length > 0 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                <span className="text-gray-400 font-bold whitespace-nowrap">Commandes récentes :</span>
                {recentOrderRefs.map((ref) => (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => {
                      setSearchRef(ref);
                      handleFetchOrder(ref);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono font-black uppercase text-xs transition-colors whitespace-nowrap ${
                      order?.reference === ref 
                        ? 'bg-[#fa8107] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{ref}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {order ? (
              <>
                {/* Status Hero Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 p-6 rounded-3xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white text-[#fa8107] px-3 py-1 rounded-full shadow-xs">
                        {order.deliveryZone.isTakeaway ? 'Retrait Restaurant' : 'Livraison Express'}
                      </span>
                      <h4 className="text-2xl font-black uppercase text-gray-900 mt-2">
                        Commande #{order.reference}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Passée le {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-orange-200 text-center shadow-xs">
                      <span className="text-[10px] font-black uppercase text-gray-400 block">Arrivée estimée</span>
                      <span className="text-xl font-black text-[#fa8107] block">{order.estimatedDeliveryTime}</span>
                    </div>
                  </div>
                </div>

                {/* 4-Step Progress Tracker */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Progression de votre commande
                  </h4>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { step: 1, label: 'Confirmée', icon: CheckCircle2, desc: 'Paiement reçu' },
                      { step: 2, label: 'En Cuisine', icon: ChefHat, desc: 'Au four & braise' },
                      { step: 3, label: 'En Route', icon: Truck, desc: 'Livreur en route' },
                      { step: 4, label: 'Livrée', icon: MapPin, desc: 'Bon appétit !' }
                    ].map((s) => {
                      const Icon = s.icon;
                      const isPast = currentStep >= s.step;
                      const isCurrent = currentStep === s.step;
                      return (
                        <div 
                          key={s.step}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                            isCurrent 
                              ? 'border-[#fa8107] bg-orange-50/80 shadow-sm ring-2 ring-[#fa8107]/20' 
                              : isPast 
                              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800' 
                              : 'border-gray-100 bg-gray-50 text-gray-400 opacity-60'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                            isCurrent ? 'bg-[#fa8107] text-white animate-pulse' : isPast ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-gray-900 leading-tight">{s.label}</span>
                          <span className="text-[9px] text-gray-500 mt-0.5 hidden sm:block">{s.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Driver & Support Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-400">Livreur assigné</div>
                      <div className="text-xs font-black text-gray-900 mt-0.5">Moussa (Moto Flash Bingerville)</div>
                      <div className="text-[10px] text-emerald-600 font-bold">À ~10 min de chez vous</div>
                    </div>
                    <a 
                      href={`tel:${RESTAURANT_PHONE}`}
                      className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:scale-105 transition-transform"
                      title="Appeler le restaurant"
                    >
                      <Phone size={18} />
                    </a>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-gray-400">Partager le suivi</div>
                      <div className="text-xs font-black text-gray-900 mt-0.5">Envoyer à un proche</div>
                      <div className="text-[10px] text-gray-500">Via WhatsApp en 1 clic</div>
                    </div>
                    <button 
                      onClick={handleShareWhatsApp}
                      className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-transform"
                      title="Partager sur WhatsApp"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Items & Delivery Details */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3 text-xs">
                  <div className="flex justify-between font-black uppercase text-gray-700 border-b border-gray-100 pb-2">
                    <span>Récapitulatif des articles ({order.items?.length || 0})</span>
                    <span>Total : {formatPrice(order.total)}</span>
                  </div>

                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-600">
                        <span>{item.quantity}x {item.menuItem?.name || 'Plat'}</span>
                        <span className="font-bold text-gray-900">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                    <strong>Adresse :</strong> {order.customer.address}, {order.customer.district}
                    {order.customer.landmark ? ` (Repère: ${order.customer.landmark})` : ''}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Clock size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-xs">Saisissez une référence de commande pour afficher son statut en direct.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
