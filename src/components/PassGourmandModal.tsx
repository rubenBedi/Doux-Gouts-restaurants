/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Crown, Sparkles, CreditCard, Smartphone, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PASS_SUBSCRIPTION_PLANS, formatPrice, WAVE_PAYMENT_URL } from '../constants';
import { PassSubscriptionPlan } from '../types';

export const PassGourmandModal: React.FC = () => {
  const { isPassGourmandOpen, setIsPassGourmandOpen, customer } = useCart();
  const [selectedPlan, setSelectedPlan] = useState<PassSubscriptionPlan>(PASS_SUBSCRIPTION_PLANS[0]);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isPassGourmandOpen) return null;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const res = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          customer: {
            name: `${customer.firstName} ${customer.lastName}`.trim() || 'Client Fidèle',
            phone: customer.phone || '+225 01 41 76 06 61',
            email: customer.email || 'client@doux-gouts.ci'
          },
          paymentMethod: 'wave_ci'
        })
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Subscription failed', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
          id="pass-gourmand-modal"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#fa8107] to-amber-600 text-white relative">
            <button 
              onClick={() => setIsPassGourmandOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Crown size={24} className="text-amber-200" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                Programme Privilège
              </span>
            </div>
            <h3 className="text-2xl font-black uppercase mt-2">
              Le Pass Gourmand Doux Goûts
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Des remises permanentes, livraisons offertes et avantages exclusifs à Bingerville.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                  <Check size={32} />
                </div>
                <h4 className="text-xl font-black uppercase text-gray-900">
                  Félicitations & Bienvenue au Club !
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Votre abonnement au <strong className="text-gray-900">{selectedPlan.name}</strong> est activé. Vos avantages seront automatiquement appliqués lors de vos prochaines commandes.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setIsPassGourmandOpen(false);
                  }}
                  className="bg-[#fa8107] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase"
                >
                  Continuer mes commandes
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PASS_SUBSCRIPTION_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-[#fa8107] bg-orange-50/60 shadow-md ring-2 ring-[#fa8107]/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#fa8107] text-white">
                              {plan.badge}
                            </span>
                            <span className="text-xs font-black text-[#fa8107]">-{plan.discountRate}%</span>
                          </div>
                          <h4 className="font-black text-sm uppercase text-gray-900">{plan.name}</h4>
                          <div className="text-lg font-black text-[#fa8107] mt-1">
                            {formatPrice(plan.priceMonthly)} <span className="text-[10px] text-gray-500 font-normal">/ mois</span>
                          </div>
                        </div>

                        <ul className="space-y-1.5 mt-4 text-[11px] text-gray-600">
                          {plan.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check size={13} className="text-[#fa8107] flex-shrink-0 mt-0.5" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-sky-50 p-4 rounded-2xl border border-cyan-200 text-xs text-cyan-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={20} className="text-[#008ba3] flex-shrink-0" />
                    <span>Abonnement mensuel sans engagement, résiliable à tout moment.</span>
                  </div>
                  <a
                    href={WAVE_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#008ba3] hover:underline font-bold text-[11px] flex items-center gap-1 shrink-0"
                  >
                    <span>Lien Wave Marchand</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </>
            )}
          </div>

          {!success && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 block">Total abonnement</span>
                <span className="text-base font-black text-gray-900">{formatPrice(selectedPlan.priceMonthly)} / mois</span>
              </div>
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="bg-[#1dc4e9] hover:bg-[#19b2d4] text-white py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>{isSubscribing ? 'Activation...' : `Souscrire avec Wave CI`}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
