/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check, Clock } from 'lucide-react';
import { MenuItem, SelectedOption } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice, PIZZA_NAMES } from '../constants';

interface Props {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemCustomizationModal: React.FC<Props> = ({ item, onClose }) => {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  // Pour les kits pizza : déterminer le nombre de pizzas à choisir
  const isPizzaKit = item?.category === 'Kits';
  const pizzaCount = isPizzaKit 
    ? (item?.id === 'kit_pizza_3' ? 3 : item?.id === 'kit_pc_1' ? 1 : 2)
    : 0;

  // États des pizzas choisies par défaut
  const [pizza1, setPizza1] = useState(PIZZA_NAMES[0] || 'Peperoni');
  const [pizza2, setPizza2] = useState(PIZZA_NAMES[1] || 'Margerita');
  const [pizza3, setPizza3] = useState(PIZZA_NAMES[2] || 'Reine');

  if (!item) return null;

  const handleToggleOption = (groupId: string, groupName: string, option: { id: string; name: string; extraPrice: number }, maxSelect = 1) => {
    const isAlreadySelected = selectedOptions.some(o => o.groupId === groupId && o.optionId === option.id);

    if (isAlreadySelected) {
      setSelectedOptions(prev => prev.filter(o => !(o.groupId === groupId && o.optionId === option.id)));
    } else {
      const currentGroupOptions = selectedOptions.filter(o => o.groupId === groupId);
      if (currentGroupOptions.length >= maxSelect) {
        if (maxSelect === 1) {
          setSelectedOptions(prev => [
            ...prev.filter(o => o.groupId !== groupId),
            { groupId, groupName, optionId: option.id, optionName: option.name, extraPrice: option.extraPrice }
          ]);
        }
      } else {
        setSelectedOptions(prev => [
          ...prev,
          { groupId, groupName, optionId: option.id, optionName: option.name, extraPrice: option.extraPrice }
        ]);
      }
    }
  };

  const extrasTotal = selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0);
  const unitPrice = item.priceNumeric + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    // Si c'est un kit pizza, enregistrer les pizzas choisies dans les options
    const pizzaOptions: SelectedOption[] = [];
    if (isPizzaKit && pizzaCount > 0) {
      if (pizzaCount === 1) {
        pizzaOptions.push({
          groupId: 'pizza_selection',
          groupName: 'Pizza au choix',
          optionId: `pizza_${pizza1.toLowerCase().replace(/\s+/g, '_')}`,
          optionName: `Pizza choisie : ${pizza1}`,
          extraPrice: 0
        });
      } else {
        pizzaOptions.push({
          groupId: 'pizza_selection_1',
          groupName: '1ère Pizza au choix',
          optionId: `p1_${pizza1.toLowerCase().replace(/\s+/g, '_')}`,
          optionName: `Pizza 1 : ${pizza1}`,
          extraPrice: 0
        });
        pizzaOptions.push({
          groupId: 'pizza_selection_2',
          groupName: '2ème Pizza au choix',
          optionId: `p2_${pizza2.toLowerCase().replace(/\s+/g, '_')}`,
          optionName: `Pizza 2 : ${pizza2}`,
          extraPrice: 0
        });
        if (pizzaCount >= 3) {
          pizzaOptions.push({
            groupId: 'pizza_selection_3',
            groupName: '3ème Pizza au choix',
            optionId: `p3_${pizza3.toLowerCase().replace(/\s+/g, '_')}`,
            optionName: `Pizza 3 : ${pizza3}`,
            extraPrice: 0
          });
        }
      }
    }

    const finalOptions = [...pizzaOptions, ...selectedOptions];
    addItem(item, finalOptions, quantity);
    onClose();
    openCart();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
          id="item-customization-modal"
        >
          {/* Header with image */}
          <div className="relative h-56 flex-shrink-0">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer"
              id="btn-close-customization"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="bg-[#fa8107] text-white text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
                {item.category}
              </span>
              <h3 className="text-2xl font-black uppercase mt-1 drop-shadow-sm">{item.name}</h3>
              <p className="text-white/80 text-xs line-clamp-2 mt-0.5">{item.description}</p>
            </div>
          </div>

          {/* Body Options */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Prep Time & Base info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#fa8107]" />
                <span>Préparation : ~{item.preparationTime || 15} min</span>
              </div>
              <div className="font-bold text-gray-900 text-sm">
                Prix : <span className="text-[#fa8107] font-black">{formatPrice(item.priceNumeric)}</span>
              </div>
            </div>

            {/* SECTION DÉROULANTE CHOIX DES PIZZAS (KIT PIZZA ET UNIQUEMENT KIT PIZZA) */}
            {isPizzaKit && pizzaCount > 0 && (
              <div className="space-y-3 p-4 bg-orange-50/60 rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <span>🍕</span>
                    <span>
                      {pizzaCount === 1 ? 'Choisissez votre Pizza au choix' : `Choisissez vos ${pizzaCount} Pizzas au choix`}
                    </span>
                  </h4>
                  <span className="text-[10px] font-black uppercase bg-[#fa8107] text-white px-2 py-0.5 rounded-full">
                    Inclus au choix
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Pizza 1 */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      {pizzaCount === 1 ? 'Sélectionnez votre Pizza :' : '1ère Pizza au choix :'}
                    </label>
                    <select
                      value={pizza1}
                      onChange={(e) => setPizza1(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#fa8107] shadow-xs cursor-pointer"
                    >
                      {PIZZA_NAMES.map((name) => (
                        <option key={name} value={name}>
                          Pizza {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pizza 2 */}
                  {pizzaCount >= 2 && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        2ème Pizza au choix :
                      </label>
                      <select
                        value={pizza2}
                        onChange={(e) => setPizza2(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#fa8107] shadow-xs cursor-pointer"
                      >
                        {PIZZA_NAMES.map((name) => (
                          <option key={name} value={name}>
                            Pizza {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pizza 3 */}
                  {pizzaCount >= 3 && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        3ème Pizza au choix :
                      </label>
                      <select
                        value={pizza3}
                        onChange={(e) => setPizza3(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-[#fa8107] shadow-xs cursor-pointer"
                      >
                        {PIZZA_NAMES.map((name) => (
                          <option key={name} value={name}>
                            Pizza {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION BOISSONS FRAÎCHES (SANS LE "MAX 1" NI BISSAP/GNAMANKOUDJI) */}
            {item.availableOptions?.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                    {group.name}
                  </h4>
                  {/* Pas de mention MAX 1 pour Boisson fraîche */}
                  {group.id !== 'drinks' && group.maxSelect && (
                    <span className="text-[11px] text-gray-400">
                      Optionnel
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedOptions.some(o => o.groupId === group.id && o.optionId === opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleOption(group.id, group.name, opt, group.maxSelect || 1)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'border-[#fa8107] bg-[#fa8107]/5 text-gray-900 shadow-sm' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs transition-colors ${
                            isSelected ? 'bg-[#fa8107] text-white' : 'border border-gray-300 text-transparent'
                          }`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-bold">{opt.name}</span>
                        </div>
                        <span className="text-xs font-black text-[#fa8107]">
                          {opt.extraPrice > 0 ? `+${formatPrice(opt.extraPrice)}` : 'Inclus'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer with quantity & add to cart CTA */}
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                id="btn-qty-minus"
              >
                <Minus size={16} />
              </button>
              <span className="w-9 text-center font-black text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                id="btn-qty-plus"
              >
                <Plus size={16} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] flex items-center justify-between cursor-pointer"
              id="btn-confirm-add-to-cart"
            >
              <span>Ajouter au panier</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black">{formatPrice(totalPrice)}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
