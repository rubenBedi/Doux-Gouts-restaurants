/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MapPin, 
  Facebook, 
  Music, 
  Clock, 
  Instagram, 
  Mail, 
  Plus, 
  Flame, 
  Sparkles, 
  Crown, 
  ShoppingBag, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  KeyRound
} from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AdminPinModal } from './components/AdminPinModal';
import { PassGourmandModal } from './components/PassGourmandModal';
import { ItemCustomizationModal } from './components/ItemCustomizationModal';
import { 
  MENU_CATEGORIES, 
  ALL_MENU_ITEMS, 
  WHATSAPP_NUMBER, 
  FACEBOOK_URL, 
  TIKTOK_URL,
  RESTAURANT_PHONE,
  RESTAURANT_ADDRESS,
  formatPrice
} from './constants';
import { MenuItem } from './types';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

// Inner App with context consumers
const MainApp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0].id);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  
  // États pour la réservation
  const [resName, setResName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resDate, setResDate] = useState("");
  const [resGuests, setResGuests] = useState(2);
  const [resSubmitted, setResSubmitted] = useState(false);

  const { 
    addItem, 
    openCart, 
    itemCount, 
    total, 
    setIsPassGourmandOpen, 
    setIsTrackingOpen,
    isPinModalOpen,
    setIsPinModalOpen,
    setIsAdminOpen,
    openAdminPinModal
  } = useCart();

  // Slider pour la section Restaurant
  const restaurantMedia = [
    { type: 'video', url: "https://res.cloudinary.com/dvltbduum/video/upload/lv_0_20260304110711_ehycrq.mp4" },
    { type: 'image', url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" },
    { type: 'image', url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" },
    { type: 'image', url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80" },
    { type: 'image', url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80" },
    { type: 'image', url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80" }
  ];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % restaurantMedia.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [restaurantMedia.length]);

  // Quick 1-click add to cart or open customization if options exist
  const handleQuickAdd = (item: MenuItem) => {
    if (item.availableOptions && item.availableOptions.length > 0) {
      setCustomizingItem(item);
    } else {
      addItem(item, [], 1);
      openCart();
    }
  };

  // Handle Table Reservation
  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || !resPhone.trim() || !resDate.trim()) return;

    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: resName,
          customerPhone: resPhone,
          reservationDate: resDate,
          guestCount: resGuests
        })
      });
      setResSubmitted(true);
    } catch (err) {
      console.error('Reservation log failed', err);
    }

    const message = `Bonjour Doux Goûts Resto, je souhaite réserver une table.\n\n👤 Nom : ${resName}\n📞 Tél : ${resPhone}\n📅 Date & Heure : ${resDate}\n👥 Nombre de convives : ${resGuests} personnes`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredItems = ALL_MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-white text-gray-900 selection:bg-[#fa8107] selection:text-white relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.postimg.cc/BvqYT04b/Favicon.jpg" 
            alt="Doux Goûts Resto Ambiance"
            className="w-full h-full object-cover opacity-60 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/40 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/30 text-white text-[11px] font-black tracking-[0.3em] uppercase mb-8 rounded-full bg-white/10 backdrop-blur-md shadow-lg">
              <Sparkles size={14} className="text-[#fa8107]" />
              <span>Saveurs Authentiques & Grillades au Feu de Bois</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase italic tracking-tight drop-shadow-lg mb-6">
              DOUX GOÛTS <span className="text-[#fa8107]">RESTO</span>
            </h1>

            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium mb-10 drop-shadow-sm">
              Commandez en ligne vos pizzas croustillantes, chawarmas généreux et spécialités ivoiriennes. Livraison express à Bingerville & Abidjan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="#notre-carte" 
                className="w-full sm:w-auto bg-[#fa8107] hover:bg-[#e07306] text-white px-9 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                <span>Commander en ligne</span>
              </a>

              <button
                onClick={() => setIsTrackingOpen(true)}
                className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Clock size={18} className="text-[#fa8107]" />
                <span>Suivre ma commande</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Perks Banner */}
        <div className="absolute bottom-6 left-6 right-6 max-w-5xl mx-auto hidden md:grid grid-cols-3 gap-4 z-10">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#fa8107] flex items-center justify-center font-black">
              <Truck size={20} />
            </div>
            <div>
              <div className="font-black text-xs uppercase text-gray-900">Livraison Express</div>
              <div className="text-[11px] text-gray-500">Bingerville & environs en ~30 min</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-[#008ba3] flex items-center justify-center font-black">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-black text-xs uppercase text-gray-900">Paiement 100% Sécurisé</div>
              <div className="text-[11px] text-gray-500">Wave Côte d'Ivoire (Scan QR & 0% Frais)</div>
            </div>
          </div>

          <div 
            onClick={() => setIsPassGourmandOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-[#fa8107] text-white p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Crown size={22} className="text-amber-200" />
              <div>
                <div className="font-black text-xs uppercase">Pass VIP Gourmand</div>
                <div className="text-[11px] text-white/80">Jusqu'à -20% toute l'année</div>
              </div>
            </div>
            <ChevronRight size={18} />
          </div>
        </div>
      </section>

      {/* Section Le Restaurant */}
      <section id="le-restaurant" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#fa8107] font-black uppercase tracking-widest text-xs mb-3 block">
              Notre Histoire Culinaire
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase mb-6 italic text-gray-900">
              Doux Goûts <span className="text-[#fa8107]">Resto</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 text-base">
              Bienvenue chez Doux Goûts Resto, l'adresse incontournable de Bingerville pour les amoureux de saveurs authentiques. 
              Nous marions le savoir-faire des pizzas au feu de bois, des chawarmas croustillants et des spécialités ivoiriennes préparés minute avec des ingrédients rigoureusement sélectionnés.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                <div className="w-12 h-12 bg-[#fa8107]/10 rounded-xl flex items-center justify-center text-[#fa8107]">
                  <Clock size={24}/>
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase text-gray-900">Ouvert 7j/7</h4>
                  <p className="text-xs text-gray-400">10h00 - 23h00 Non-Stop</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
                <div className="w-12 h-12 bg-[#fa8107]/10 rounded-xl flex items-center justify-center text-[#fa8107]">
                  <Phone size={24}/>
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase text-gray-900">Commandes & Résa</h4>
                  <p className="text-xs text-gray-400">{RESTAURANT_PHONE}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border-4 border-white">
            <AnimatePresence mode="wait">
              {restaurantMedia[currentImgIndex].type === 'video' ? (
                <motion.video
                  key={currentImgIndex}
                  src={restaurantMedia[currentImgIndex].url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <motion.img 
                  key={currentImgIndex}
                  src={restaurantMedia[currentImgIndex].url} 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Restaurant ambiance" 
                  referrerPolicy="no-referrer"
                />
              )}
            </AnimatePresence>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {restaurantMedia.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    currentImgIndex === i ? "bg-[#fa8107] w-8" : "bg-white/60"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Carte Section */}
      <section id="notre-carte" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#fa8107] font-black uppercase tracking-widest text-xs mb-2 block">
              Menu En Ligne & Commande Directe
            </span>
            <h2 className="text-4xl sm:text-6xl font-black uppercase italic text-gray-900">
              Notre <span className="text-[#fa8107]">Carte</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Cliquez sur un plat pour choisir votre boisson fraîche et commander.
            </p>
          </div>
          
          {/* Categories Selector */}
          <div className="flex overflow-x-auto gap-3 md:justify-center mb-12 no-scrollbar pb-2">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer",
                  activeCategory === cat.id 
                    ? "border-[#fa8107] bg-orange-50/70 text-[#fa8107] shadow-sm scale-105" 
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
                )}
              >
                <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                <span className="text-xs font-black uppercase tracking-wider">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <motion.div 
                layout 
                key={item.id} 
                className="group bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-2xl hover:border-orange-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-60 overflow-hidden relative cursor-pointer" onClick={() => setCustomizingItem(item)}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-3 py-1.5 rounded-xl">
                        <SlidersHorizontal size={14} /> Choisir une boisson fraîche
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl font-black text-[#fa8107] text-sm shadow-md">
                      {formatPrice(item.priceNumeric)}
                    </div>

                    {item.popular && (
                      <div className="absolute top-4 left-4 bg-[#fa8107] text-white px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-md">
                        Best-Seller
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-black text-lg uppercase text-gray-900 group-hover:text-[#fa8107] transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    <p className="text-gray-500 text-xs leading-relaxed mb-6 h-10 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex gap-2">
                  {/* Quick Add / Customize */}
                  <button 
                    onClick={() => handleQuickAdd(item)}
                    className="flex-1 bg-[#fa8107] hover:bg-[#e07306] text-white py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.02] shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Ajouter au Panier</span>
                  </button>

                  {item.availableOptions && item.availableOptions.length > 0 && (
                    <button
                      onClick={() => setCustomizingItem(item)}
                      title="Choisir une boisson"
                      className="w-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <SlidersHorizontal size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Localisation avec Carte Interactive */}
      <section id="localisation" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#fa8107] font-black uppercase tracking-widest text-xs mb-2 block">
              Nous Rendre Visite à Bingerville
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase italic text-gray-900">
              Où nous <span className="text-[#fa8107]">trouver</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Infos de contact */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#fa8107] flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs text-gray-900">Adresse</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{RESTAURANT_ADDRESS}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#fa8107] flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs text-gray-900">Téléphone & WhatsApp</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{RESTAURANT_PHONE}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#fa8107] flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs text-gray-900">Horaires de service</h4>
                  <p className="text-gray-500 text-xs mt-0.5">7j/7 : 10h00 - 23h00 Non-Stop</p>
                </div>
              </div>
            </div>

            {/* La Carte */}
            <div className="lg:col-span-2 min-h-[380px] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.580194480572!2d-3.8979313251457193!3d5.328014094650532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfc1f30034caf303%3A0xf23c4e2f38da4dde!2sDoux%20go%C3%BBts%20resto!5e0!3m2!1sfr!2sci!4v1715600000000!5m2!1sfr!2sci" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '380px' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Réservation */}
      <section id="reservation" className="py-24 bg-[#fa8107] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-white/80 font-black uppercase text-xs tracking-widest block mb-2">
            Service en Salle & Événements
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase mb-4 italic">
            Réserver une table
          </h2>
          <p className="mb-10 text-white/90 font-medium text-sm max-w-md mx-auto">
            Préparez votre venue pour un moment gourmand en famille ou entre amis.
          </p>

          <form onSubmit={handleReservation} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">Votre Nom & Prénom</label>
              <input 
                type="text" 
                required
                placeholder="JEAN-MARC KOUASSI" 
                value={resName}
                onChange={(e) => setResName(e.target.value)}
                className="w-full bg-white/10 border border-white/30 p-4 rounded-2xl outline-none placeholder:text-white/50 font-bold uppercase text-xs focus:bg-white/20" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">Numéro Téléphone / WhatsApp</label>
              <input 
                type="tel" 
                required
                placeholder="+225 07 00 00 00 00" 
                value={resPhone}
                onChange={(e) => setResPhone(e.target.value)}
                className="w-full bg-white/10 border border-white/30 p-4 rounded-2xl outline-none placeholder:text-white/50 font-bold uppercase text-xs focus:bg-white/20" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">Date & Heure souhaitée</label>
              <input 
                type="datetime-local" 
                required
                value={resDate}
                onChange={(e) => setResDate(e.target.value)}
                className="w-full bg-white/10 border border-white/30 p-4 rounded-2xl outline-none text-white font-bold text-xs focus:bg-white/20" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">Nombre de personnes</label>
              <select
                value={resGuests}
                onChange={(e) => setResGuests(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/30 p-4 rounded-2xl outline-none text-white font-bold text-xs focus:bg-white/20"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
                  <option key={n} value={n} className="text-gray-900">{n} personne{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              className="md:col-span-2 bg-white text-[#fa8107] hover:bg-orange-50 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-transform shadow-xl shadow-black/10 mt-2"
            >
              {resSubmitted ? '✅ Réservation transmise !' : 'Confirmer ma réservation'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer Enrichi avec Accès Discret Cuisine & PIN */}
      <footer className="bg-black text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Colonne 1: Brand */}
            <div className="space-y-6">
              <div className="font-black text-2xl italic tracking-tight">
                DOUX GOÛTS <span className="text-[#fa8107]">RESTO</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                L'excellence de la cuisine fusion à Bingerville. Pizzas au four, spécialités grillées et chawarmas avec livraison rapide à domicile.
              </p>
              <div className="flex gap-4">
                <a href={FACEBOOK_URL} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#fa8107] transition-colors" title="Facebook">
                  <Facebook size={18} />
                </a>
                <a href={TIKTOK_URL} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#fa8107] transition-colors" title="TikTok">
                  <Music size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#fa8107] transition-colors" title="Instagram">
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            {/* Colonne 2: Liens Rapides */}
            <div>
              <h4 className="font-black uppercase text-xs mb-6 tracking-widest text-[#fa8107]">Navigation</h4>
              <ul className="space-y-3">
                <li><a href="#le-restaurant" className="text-gray-400 hover:text-white text-xs transition-colors">Le Restaurant</a></li>
                <li><a href="#notre-carte" className="text-gray-400 hover:text-white text-xs transition-colors">Notre Carte</a></li>
                <li><a href="#localisation" className="text-gray-400 hover:text-white text-xs transition-colors">Localisation</a></li>
                <li><a href="#reservation" className="text-gray-400 hover:text-white text-xs transition-colors">Réservation</a></li>
                <li>
                  <button onClick={() => setIsPassGourmandOpen(true)} className="text-amber-400 hover:text-amber-300 text-xs transition-colors font-bold flex items-center gap-1">
                    <Crown size={12} /> Pass Gourmand VIP
                  </button>
                </li>
                {/* Bouton discret Espace Cuisine dans la liste */}
                <li>
                  <button 
                    onClick={openAdminPinModal} 
                    className="text-gray-500 hover:text-orange-400 text-xs transition-colors font-bold flex items-center gap-1.5 pt-1"
                    title="Accès réservé au personnel (Code PIN)"
                  >
                    <Lock size={12} className="text-[#fa8107]" />
                    <span>Espace Cuisine (PIN)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Colonne 3: Contact */}
            <div>
              <h4 className="font-black uppercase text-xs mb-6 tracking-widest text-[#fa8107]">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400 text-xs">
                  <Phone size={16} className="text-[#fa8107]" />
                  <span>{RESTAURANT_PHONE}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-xs">
                  <Mail size={16} className="text-[#fa8107]" />
                  <span>contact@doux-gouts.ci</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 text-xs">
                  <MapPin size={16} className="text-[#fa8107]" />
                  <span>{RESTAURANT_ADDRESS}</span>
                </li>
              </ul>
            </div>

            {/* Colonne 4: Horaires & Moyens de paiement */}
            <div className="space-y-4">
              <h4 className="font-black uppercase text-xs mb-2 tracking-widest text-[#fa8107]">Paiement Accepté</h4>
              <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-950/60 p-3.5 rounded-2xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌊</span>
                  <div>
                    <div className="font-black text-xs text-white uppercase tracking-wider">Wave Côte d'Ivoire</div>
                    <div className="text-[10px] text-cyan-300 font-bold">Transfert direct & Scan QR</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-300 bg-white/5 p-2 rounded-xl border border-white/10 font-medium">
                  ⚡ 0% de frais • Instantané & Sécurisé
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Discreet Admin Trigger */}
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">
              © 2026 DOUX GOÛTS RESTO — SYSTÈME DE COMMANDE & PAIEMENT SÉCURISÉ.
            </p>
            <div className="flex items-center gap-6 text-[10px] text-gray-500 uppercase tracking-widest">
              <span>Fait avec passion à Bingerville</span>
              {/* Discreet Lock Icon / Link in footer bottom */}
              <button
                onClick={openAdminPinModal}
                className="text-gray-600 hover:text-orange-400 transition-colors flex items-center gap-1 hover:underline cursor-pointer"
                title="Accès Espace Cuisine (Code PIN)"
                id="footer-btn-cuisine"
              >
                <KeyRound size={12} className="text-gray-600 hover:text-[#fa8107]" />
                <span className="normal-case font-medium">Espace Cuisine</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Cart Bar for Mobile */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:hidden z-30">
          <button
            onClick={openCart}
            className="w-full bg-[#fa8107] text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-500/40 flex items-center justify-between animate-bounce"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <span>Voir le Panier ({itemCount})</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black">{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {/* Interactive Modals */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <PassGourmandModal />
      <ItemCustomizationModal 
        item={customizingItem} 
        onClose={() => setCustomizingItem(null)} 
      />

      {/* Admin PIN Verification Modal (Default code: "1234") */}
      <AdminPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={() => setIsAdminOpen(true)} 
      />

      {/* Admin Kitchen Dashboard */}
      <AdminDashboardModal />
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
