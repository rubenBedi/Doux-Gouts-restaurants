/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check, Clock } from 'lucide-react';
import { MenuItem, SelectedOption } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../constants';

interface Props {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemCustomizationModal: React.FC<Props> = ({ item, onClose }) => {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  if (!item) return null;

  const handleToggleOption = (groupId: string, groupName: string, option: { id: string; name: string; extraPrice: number }, maxSelect = 1) => {
    const isAlreadySelected = selectedOptions.some(o => o.groupId === groupId && o.optionId === option.id);

    if (isAlreadySelected) {
      setSelectedOptions(prev => prev.filter(o => !(o.groupId === groupId && o.optionId === option.id)));
    } else {
      const currentGroupOptions = selectedOptions.filter(o => o.groupId === groupId);
      if (currentGroupOptions.length >= maxSelect) {
        // If maxSelect is 1, replace it. If more, ignore or replace oldest
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
    addItem(item, selectedOptions, quantity);
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
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md"
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
                Prix de base : <span className="text-[#fa8107]">{formatPrice(item.priceNumeric)}</span>
              </div>
            </div>

            {/* Available option groups (Boisson fraîche) */}
            {item.availableOptions?.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                    {group.name}
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {group.maxSelect ? `Max ${group.maxSelect}` : 'Optionnel'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedOptions.some(o => o.groupId === group.id && o.optionId === opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleToggleOption(group.id, group.name, opt, group.maxSelect || 1)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
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
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                id="btn-qty-minus"
              >
                <Minus size={16} />
              </button>
              <span className="w-9 text-center font-black text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                id="btn-qty-plus"
              >
                <Plus size={16} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-[#fa8107] hover:bg-[#e07306] text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] flex items-center justify-between"
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
