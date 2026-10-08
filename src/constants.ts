/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, DeliveryZone, PromoCode, PassSubscriptionPlan } from './types';

export const WHATSAPP_NUMBER = "2250141760661";
export const RESTAURANT_PHONE = "+225 01 41 76 06 61";
export const RESTAURANT_EMAIL = "contact@doux-gouts.ci";
export const RESTAURANT_ADDRESS = "Bingerville, Carrefour Cité Addoha-Doux Gouts";
export const FACEBOOK_URL = "https://www.facebook.com/share/1DqLG8G4Z5/";
export const TIKTOK_URL = "https://www.tiktok.com/@ethan.succs0?_r=1&_t=ZS-94UdrzWnXrY";
export const WAVE_PAYMENT_URL = "https://pay.wave.com/m/M_ci_P-0Cf3LHopcr/c/ci/";

export const MENU_CATEGORIES = [
  { id: 'Kits', name: 'NOS KITS', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', count: 5 },
  { id: 'Pizza', name: 'PIZZAS', image: 'https://i.postimg.cc/Bv4y59WG/Peperoni.png', count: 27 },
  { id: 'Chawarma', name: 'CHAWARMAS', image: 'https://i.postimg.cc/FRZLB6HD/shawarma_au_poulet.png', count: 2 },
  { id: 'Panini', name: 'PANINIS', image: 'https://i.postimg.cc/265KJQ8X/Panini_jambon_fromage.png', count: 1 },
];

export const COMMON_OPTION_GROUPS = {
  drinks: {
    id: 'drinks',
    name: 'Boisson fraîche',
    options: [
      { id: 'drink_coca', name: 'Coca-Cola 33cl', extraPrice: 700 },
      { id: 'drink_fanta', name: 'Fanta Orange 33cl', extraPrice: 700 },
      { id: 'drink_eau', name: 'Eau Minérale Céleste 50cl', extraPrice: 500 },
    ]
  }
};

export const PIZZA_NAMES = [
  'Peperoni',
  'Margerita',
  'Reine',
  '4 Fromages',
  'Bolognaise',
  'BPM',
  'Calabraise',
  'Calzone Mozzarella',
  'Calzonne Tradition',
  'Californienne',
  'Cévenole',
  'Danielle',
  'Emmanuel',
  'Montagnarde',
  'Nettuno',
  'Oignons',
  'Paysanne',
  'Primavera',
  'Regina',
  'Royale Crémière',
  'Texane',
  'Mexicaine',
  '3 Fromages',
  '4 Saisons',
  'Végétarienne',
  'Hawaïenne',
  'Napolitaine'
];

export const ALL_MENU_ITEMS: MenuItem[] = [
  // --- NOS KITS ---
  // Offres Pizzas
  { 
    id: 'kit_pizza_2', 
    name: '2 Pizzas', 
    description: 'Offre Pizza Duo : 2 délicieuses grandes pizzas au feu de bois au choix.', 
    price: '6000 F', 
    priceNumeric: 6000, 
    category: 'Kits', 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    popular: true,
    preparationTime: 20,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'kit_pizza_3', 
    name: '3 Pizzas', 
    description: 'Offre Pizza Festin : 3 délicieuses grandes pizzas au feu de bois au choix pour toute la famille.', 
    price: '9000 F', 
    priceNumeric: 9000, 
    category: 'Kits', 
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    popular: true,
    preparationTime: 25,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // Packs Promo "Pizza + Chawarma"
  { 
    id: 'kit_pc_1', 
    name: '1 Pizza + 2 Chawarmas', 
    description: 'Pack Promo Gourmand : 1 grande pizza au choix + 2 chawarmas bien garnis.', 
    price: '5000 F', 
    priceNumeric: 5000, 
    category: 'Kits', 
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80',
    popular: true,
    preparationTime: 18,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'kit_pc_2', 
    name: '2 Pizzas + 2 Chawarmas', 
    description: 'Pack Promo Festin : 2 grandes pizzas au choix + 2 chawarmas croustillants.', 
    price: '7000 F', 
    priceNumeric: 7000, 
    category: 'Kits', 
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
    popular: true,
    preparationTime: 22,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'kit_pc_3', 
    name: '2 Pizzas + 2 Chawarmas + 2 Cannettes', 
    description: 'Pack Promo Ultime : 2 grandes pizzas au choix + 2 chawarmas + 2 cannettes de boisson fraîche bien glacées.', 
    price: '9000 F', 
    priceNumeric: 9000, 
    category: 'Kits', 
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=600&q=80',
    popular: true,
    preparationTime: 22,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // --- PIZZAS ---
  { 
    id: 'p1', 
    name: 'Peperoni', 
    description: 'Mozzarella crémeuse, tranches généreuses de pepperoni boeuf et coulis de tomate maison.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/Bv4y59WG/Peperoni.png',
    popular: true,
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p2', 
    name: 'Margerita', 
    description: 'Classique indémodable : coulis de tomate San Marzano, mozzarella fondante et basilic frais.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/k5qZN3rP/Margerita.png',
    preparationTime: 12,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p3', 
    name: 'Reine', 
    description: 'Jambon de dinde sélectionné, champignons sautés et mozzarella fondante.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/7L9RmsDJ/Reine.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p4', 
    name: 'Napolitaine', 
    description: 'Anchois marinés, câpres sauvages, olives noires et mozzarella dorée au four.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/sgpqZfLD/Napolitaine.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p5', 
    name: 'Hawaïenne', 
    description: 'Mélange sucré-salé irrésistible avec ananas rôtis et jambon de dinde.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/DznDQkVv/Hawaîenne.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p6', 
    name: '4 Saisons', 
    description: 'Artichauts tendres, poivrons marinés, champignons et jambon gourmand.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/y8FtS6Gd/4_saisons.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p7', 
    name: 'Végétarienne', 
    description: 'Assortiment généreux de légumes du maraîcher : courgettes, poivrons, oignons, tomates cerises.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/bvpM0cXS/Végétarienne.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p8', 
    name: 'Mexicaine', 
    description: 'Viande hachée pur boeuf épicée, poivrons, oignons rouges et piments jalapeños.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/PJctRfbj/Mexicaine.webp',
    popular: true,
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p9', 
    name: '3 Fromages', 
    description: 'Trio savoureux : Mozzarella filante, emmental affiné et fromage de chèvre crémeux.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/5yBkTbCt/3Fromages.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p10', 
    name: '4 Fromages', 
    description: 'Quatuor gourmand : Mozzarella, fromage de chèvre, bleu d\'Auvergne et emmental suisse.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/tRWfYtmK/4_Fromages.jpg',
    popular: true,
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p11', 
    name: 'Bolognaise', 
    description: 'Sauce mijotée à la viande hachée, tomates fraîches, herbes et fromage fondant.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/4y6Fqs9k/Bolognaise.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p12', 
    name: 'BPM', 
    description: 'Le festin des carnivores : Boeuf mariné, Poulet grillé et Merguez piquante.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/SQC5J7tv/BPM.webp',
    popular: true,
    preparationTime: 18,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p13', 
    name: 'Calabraise', 
    description: 'Salami piquant calabrais, olives noires et mozzarella fondante.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/zDKMVSP4/Calabraise.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p14', 
    name: 'Calzone Mozzarella', 
    description: 'Pizza chausson dorée au four renfermant un coeur coulant de mozzarella et sauce tomate.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/hvL36cdg/Calzone_Mozarella.webp',
    preparationTime: 18,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p15', 
    name: 'Calzonne Tradition', 
    description: 'Recette traditionnelle italienne en chausson avec jambon, champignons et fromage.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/7P0cfMW8/Calzonne.webp',
    preparationTime: 18,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p16', 
    name: 'Californienne', 
    description: 'Poulet émincé grillé, sauce barbecue américaine et oignons caramélisés.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/RCK8NQbY/Carlifornienne.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p17', 
    name: 'Cévenole', 
    description: 'Saveurs rustiques de sous-bois aux champignons et crème parfumée.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/66nSyL1r/Cévénole.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p18', 
    name: 'Danielle', 
    description: 'Spécialité maison gourmande avec notre secret d\'épices douces.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/66nSyL1z/Danielle.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p19', 
    name: 'Emmanuel', 
    description: 'Création signature originale alliant viande tendre et sauce onctueuse.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/C5G6XSqL/Emmanuel.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p20', 
    name: 'Montagnarde', 
    description: 'Pommes de terre fondantes, lardons fumés, oignons et crème fraîche épaisse.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/QCQnwhT8/montagnarde.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p21', 
    name: 'Nettuno', 
    description: 'Thon émietté de l\'Atlantique, oignons croquants et mozzarella crémeuse.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/sf78v90c/Nettuno.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p22', 
    name: 'Oignons', 
    description: 'Simple, douce et savoureuse aux oignons dorés et confits au feu de bois.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/sf78v90J/Oignons.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p23', 
    name: 'Paysanne', 
    description: 'Lardons fumés, champignons émincés et oignons doux sur base crème.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/PfYcPzFV/Paysanne.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p24', 
    name: 'Primavera', 
    description: 'Légumes croquants du soleil et fromage frais battu aux herbes.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/nr4wgpDh/Primavera.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p25', 
    name: 'Regina', 
    description: 'La reine intemporelle : coulis de tomate, jambon de dinde et mozzarella fondante.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/nr4wgpDt/Regina.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p26', 
    name: 'Royale Crémière', 
    description: 'Sauce crème onctueuse, garniture royale généreuse et emmental doré.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/brxFWptX/Royale_Crémière.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p27', 
    name: 'Texane', 
    description: 'Boeuf épicé, grains de maïs doux, oignons rouges et sauce barbecue.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/7h3QdwTF/Texane.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // --- CHAWARMA ---
  { 
    id: 'ch1', 
    name: 'Chawarma au poulet', 
    description: 'Émincé de poulet mariné aux épices orientales, crème d\'ail toum maison, frites et cornichons croustillants.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Chawarma', 
    image: 'https://i.postimg.cc/FRZLB6HD/shawarma_au_poulet.png',
    popular: true,
    preparationTime: 10,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'ch2', 
    name: 'Chawarma mélange (Poulet & Viande)', 
    description: 'Duo savoureux de boeuf tendre et poulet braisé mariné, légumes frais et sauce spéciale.', 
    price: '2500 F', 
    priceNumeric: 2500, 
    category: 'Chawarma', 
    image: 'https://i.postimg.cc/RFRHDYZR/Chawarma_mélange.jpg',
    popular: true,
    preparationTime: 10,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // --- PANINI ---
  { 
    id: 'pa1', 
    name: 'Panini Jambon Fromage', 
    description: 'Pain croustillant grillé minute, jambon de dinde, emmental fondant et touche d\'origan.', 
    price: '1000 F', 
    priceNumeric: 1000, 
    category: 'Panini', 
    image: 'https://i.postimg.cc/265KJQ8X/Panini_jambon_fromage.png',
    preparationTime: 8,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'takeaway',
    name: 'Retrait sur Place (Click & Collect)',
    description: 'Au restaurant : Bingerville Carrefour Cité Addoha',
    fee: 0,
    estimatedMinutes: '15-25 min',
    isTakeaway: true,
  },
  {
    id: 'bingerville_centre',
    name: 'Bingerville Centre / Cité Addoha / Gbagba',
    description: 'Livraison express moto à Bingerville',
    fee: 2000,
    estimatedMinutes: '25-35 min',
  },
  {
    id: 'bingerville_feh_kess',
    name: 'Bingerville Feh Kessé / Carrefour Akandjé',
    description: 'Livraison rapide zone périphérique Bingerville',
    fee: 2000,
    estimatedMinutes: '30-40 min',
  },
  {
    id: 'riviera_palmeraie',
    name: 'Riviera Palmeraie / Riviera 2, 3, 4, Faya',
    description: 'Livraison secteur Cocody Est',
    fee: 2000,
    estimatedMinutes: '35-50 min',
  },
  {
    id: 'cocody_angre',
    name: 'Cocody Angré / 7ème & 8ème Tranche / Deux-Plateaux',
    description: 'Livraison secteur Cocody Nord',
    fee: 2000,
    estimatedMinutes: '45-60 min',
  },
  {
    id: 'plateau_marcory',
    name: 'Plateau / Marcory / Treichville / Zone 4',
    description: 'Livraison centre & sud Abidjan',
    fee: 2000,
    estimatedMinutes: '50-70 min',
  },
  {
    id: 'yopougon_abobo',
    name: 'Yopougon / Abobo / Adjamé',
    description: 'Livraison grand Abidjan',
    fee: 2000,
    estimatedMinutes: '60-80 min',
  },
];

export const DEFAULT_PROMO_CODES: PromoCode[] = [];

export const PASS_SUBSCRIPTION_PLANS: PassSubscriptionPlan[] = [
  {
    id: 'pass_decouverte',
    name: 'Pass Gourmand Solo',
    badge: 'Populaire',
    priceMonthly: 5000,
    discountRate: 10,
    freeDeliveriesPerMonth: 4,
    perks: [
      '10% de remise automatique sur toute la carte',
      '4 livraisons offertes par mois à Bingerville & Cocody',
      'Priorité en cuisine lors des heures de pointe',
      '1 Boisson artisanale offerte par semaine'
    ]
  },
  {
    id: 'pass_famille',
    name: 'Pass Festin Famille & Entreprise',
    badge: 'Idéal Groupes',
    priceMonthly: 12000,
    discountRate: 20,
    freeDeliveriesPerMonth: 12,
    perks: [
      '20% de remise permanente sur toutes vos pizzas & plats',
      'Livraisons ILLIMITÉES offertes tout le mois',
      'Table réservée VIP prioritaire au restaurant',
      '1 Pizza Reine ou Peperoni offerte chaque mois',
      'Paiement fractionné Alma 3x sans frais disponible'
    ]
  }
];

export const formatPrice = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} F`;
};
