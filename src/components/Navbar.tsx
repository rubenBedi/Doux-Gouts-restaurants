/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu as MenuIcon, 
  X, 
  ShoppingBag, 
  Clock, 
  Crown, 
  Facebook, 
  Music,
  MapPin,
  Phone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, FACEBOOK_URL, TIKTOK_URL } from '../constants';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { 
    openCart, 
    itemCount, 
    total, 
    setIsTrackingOpen, 
    setIsPassGourmandOpen 
  } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Le Restaurant', href: '#le-restaurant' },
    { name: 'La Carte', href: '#notre-carte' },
    { name: 'Localisation', href: '#localisation' },
    { name: 'Réservation', href: '#reservation' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-40 transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur-md border-b border-gray-100 py-3.5 shadow-md" 
        : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className={cn(
            "font-display text-xl sm:text-2xl font-black tracking-tighter uppercase italic transition-colors",
            scrolled ? "text-gray-900" : "text-white"
          )}>
            DOUX GOÛTS <span className="text-[#fa8107]">RESTO</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className={cn(
                "text-[11px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[#fa8107]",
                scrolled ? "text-gray-700" : "text-white/90"
              )}
            >
              {link.name}
            </a>
          ))}

          {/* Pass Gourmand button */}
          <button
            onClick={() => setIsPassGourmandOpen(true)}
            className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <Crown size={14} />
            <span>Pass VIP</span>
          </button>
        </div>

        {/* Action Controls (Tracking, Admin, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Suivi Commande Button */}
          <button
            onClick={() => setIsTrackingOpen(true)}
            title="Suivre ma commande en direct"
            className={cn(
              "px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all",
              scrolled 
                ? "bg-gray-100 hover:bg-gray-200 text-gray-800" 
                : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs"
            )}
            id="nav-btn-tracking"
          >
            <Clock size={15} className="text-[#fa8107]" />
            <span className="hidden sm:inline">Suivi</span>
          </button>

          {/* Cart Floating Button */}
          <button
            onClick={openCart}
            className="bg-[#fa8107] hover:bg-[#e07306] text-white px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center gap-2.5 transition-all hover:scale-105"
            id="nav-btn-cart"
          >
            <div className="relative">
              <ShoppingBag size={17} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#fa8107] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-black">
              {itemCount > 0 ? formatPrice(total) : 'Panier'}
            </span>
          </button>

          {/* Mobile hamburger */}
          <button 
            className={cn("lg:hidden p-2 rounded-xl", scrolled ? "text-gray-900" : "text-white")} 
            onClick={() => setIsOpen(!isOpen)}
            id="nav-btn-mobile-menu"
          >
            {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b border-gray-100 py-6 px-6 flex flex-col gap-4 lg:hidden shadow-2xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)} 
                className="text-gray-900 font-black text-base uppercase py-1 border-b border-gray-50"
              >
                {link.name}
              </a>
            ))}

            <button
              onClick={() => {
                setIsOpen(false);
                setIsPassGourmandOpen(true);
              }}
              className="text-amber-600 font-black text-sm uppercase py-2 flex items-center gap-2"
            >
              <Crown size={16} />
              <span>Pass Gourmand VIP (-20%)</span>
            </button>

            <div className="flex gap-4 pt-2">
              <a href={FACEBOOK_URL} className="text-[#fa8107]"><Facebook size={20} /></a>
              <a href={TIKTOK_URL} className="text-[#fa8107]"><Music size={20} /></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
