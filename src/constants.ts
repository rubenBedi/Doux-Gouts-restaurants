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
  { id: 'Pizza', name: 'PIZZAS', image: 'https://i.postimg.cc/Bv4y59WG/Peperoni.png', count: 27 },
  { id: 'Chawarma', name: 'CHAWARMAS', image: 'https://i.postimg.cc/FRZLB6HD/shawarma_au_poulet.png', count: 3 },
  { id: 'Manaïche', name: 'MANAÏCHES', image: 'https://i.postimg.cc/NMYXbtB1/Manaïche_Cocktail.webp', count: 5 },
  { id: 'Plat Local', name: 'PLATS LOCAUX', image: 'https://i.postimg.cc/s2mLw6y8/Tchep_à_la_viande.png', count: 6 },
  { id: 'Panini', name: 'PANINIS', image: 'https://i.postimg.cc/265KJQ8X/Panini_jambon_fromage.png', count: 1 },
];

export const COMMON_OPTION_GROUPS = {
  drinks: {
    id: 'drinks',
    name: 'Boisson fraîche (au choix)',
    maxSelect: 1,
    options: [
      { id: 'drink_coca', name: 'Coca-Cola 33cl', extraPrice: 700 },
      { id: 'drink_fanta', name: 'Fanta Orange 33cl', extraPrice: 700 },
      { id: 'drink_bissap', name: 'Bissap frais maison 50cl', extraPrice: 800 },
      { id: 'drink_gingembre', name: 'Gnamankoudji (Gingembre) 50cl', extraPrice: 800 },
      { id: 'drink_eau', name: 'Eau Minérale Céleste 50cl', extraPrice: 500 },
    ]
  }
};

export const ALL_MENU_ITEMS: MenuItem[] = [
  // --- PIZZAS ---
  { 
    id: 'p1', 
    name: 'Peperoni', 
    description: 'Mozzarella crémeuse, tranches généreuses de pepperoni boeuf et coulis de tomate maison.', 
    price: '3000 F', 
    priceNumeric: 3000, 
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
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/k5qZN3rP/Margerita.png',
    preparationTime: 12,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p3', 
    name: 'Reine', 
    description: 'Jambon de dinde sélectionné, champignons sautés et mozzarella fondante.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/7L9RmsDJ/Reine.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p4', 
    name: 'Napolitaine', 
    description: 'Anchois marinés, câpres sauvages, olives noires et mozzarella dorée au four.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/sgpqZfLD/Napolitaine.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p5', 
    name: 'Hawaïenne', 
    description: 'Mélange sucré-salé irrésistible avec ananas rôtis et jambon de dinde.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/DznDQkVv/Hawaîenne.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p6', 
    name: '4 Saisons', 
    description: 'Artichauts tendres, poivrons marinés, champignons et jambon gourmand.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/y8FtS6Gd/4_saisons.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p7', 
    name: 'Végétarienne', 
    description: 'Assortiment généreux de légumes du maraîcher : courgettes, poivrons, oignons, tomates cerises.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/bvpM0cXS/Végétarienne.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p8', 
    name: 'Mexicaine', 
    description: 'Viande hachée pur boeuf épicée, poivrons, oignons rouges et piments jalapeños.', 
    price: '3000 F', 
    priceNumeric: 3000, 
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
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/5yBkTbCt/3Fromages.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p10', 
    name: '4 Fromages', 
    description: 'Quatuor gourmand : Mozzarella, fromage de chèvre, bleu d\'Auvergne et emmental suisse.', 
    price: '3000 F', 
    priceNumeric: 3000, 
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
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/4y6Fqs9k/Bolognaise.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p12', 
    name: 'BPM', 
    description: 'Le festin des carnivores : Boeuf mariné, Poulet grillé et Merguez piquante.', 
    price: '3000 F', 
    priceNumeric: 3000, 
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
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/zDKMVSP4/Calabraise.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p14', 
    name: 'Calzone Mozzarella', 
    description: 'Pizza chausson dorée au four renfermant un coeur coulant de mozzarella et sauce tomate.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/hvL36cdg/Calzone_Mozarella.webp',
    preparationTime: 18,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p15', 
    name: 'Calzonne Tradition', 
    description: 'Recette traditionnelle italienne en chausson avec jambon, champignons et fromage.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/7P0cfMW8/Calzonne.webp',
    preparationTime: 18,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p16', 
    name: 'Californienne', 
    description: 'Poulet émincé grillé, sauce barbecue américaine et oignons caramélisés.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/RCK8NQbY/Carlifornienne.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p17', 
    name: 'Cévenole', 
    description: 'Saveurs rustiques de sous-bois aux champignons et crème parfumée.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/66nSyL1r/Cévénole.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p18', 
    name: 'Danielle', 
    description: 'Spécialité maison gourmande avec notre secret d\'épices douces.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/66nSyL1z/Danielle.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p19', 
    name: 'Emmanuel', 
    description: 'Création signature originale alliant viande tendre et sauce onctueuse.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/C5G6XSqL/Emmanuel.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p20', 
    name: 'Montagnarde', 
    description: 'Pommes de terre fondantes, lardons fumés, oignons et crème fraîche épaisse.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/QCQnwhT8/montagnarde.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p21', 
    name: 'Nettuno', 
    description: 'Thon émietté de l\'Atlantique, oignons croquants et mozzarella crémeuse.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/sf78v90c/Nettuno.png',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p22', 
    name: 'Oignons', 
    description: 'Simple, douce et savoureuse aux oignons dorés et confits au feu de bois.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/sf78v90J/Oignons.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p23', 
    name: 'Paysanne', 
    description: 'Lardons fumés, champignons émincés et oignons doux sur base crème.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/PfYcPzFV/Paysanne.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p24', 
    name: 'Primavera', 
    description: 'Légumes croquants du soleil et fromage frais battu aux herbes.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/nr4wgpDh/Primavera.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p25', 
    name: 'Regina', 
    description: 'La reine intemporelle : coulis de tomate, jambon de dinde et mozzarella fondante.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/nr4wgpDt/Regina.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p26', 
    name: 'Royale Crémière', 
    description: 'Sauce crème onctueuse, garniture royale généreuse et emmental doré.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/brxFWptX/Royale_Crémière.webp',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'p27', 
    name: 'Texane', 
    description: 'Boeuf épicé, grains de maïs doux, oignons rouges et sauce barbecue.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Pizza', 
    image: 'https://i.postimg.cc/7h3QdwTF/Texane.jpg',
    preparationTime: 15,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // --- CHAWARMA ---
  { 
    id: 'ch1', 
    name: 'Chawarma Poulet', 
    description: 'Émincé de poulet mariné 24h aux épices libanaises, crème d\'ail toum et cornichons.', 
    price: '3000 F', 
    priceNumeric: 3000, 
    category: 'Chawarma', 
    image: 'https://i.postimg.cc/FRZLB6HD/shawarma_au_poulet.png',
    popular: true,
    preparationTime: 10,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'ch2', 
    name: 'Chawarma Mélange', 
    description: 'Duo boeuf et poulet braisé pour varier les plaisirs avec frites et sauce spéciale.', 
    price: '3500 F', 
    priceNumeric: 3500, 
    category: 'Chawarma', 
    image: 'https://i.postimg.cc/RFRHDYZR/Chawarma_mélange.jpg',
    popular: true,
    preparationTime: 10,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'ch3', 
    name: 'Chawarma Viande', 
    description: 'Boeuf fondant mariné à la cardamome et sumac, sauce tahina et persil haché.', 
    price: '3500 F', 
    priceNumeric: 3500, 
    category: 'Chawarma', 
    image: 'https://i.postimg.cc/G2Qy5fmj/Chawarma_viande.jpg',
    preparationTime: 10,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // --- MANAÏCHE ---
  { 
    id: 'm1', 
    name: 'Manaïche Cocktail', 
    description: 'Mélange savoureux de fromage libanais, viande hachée et zaatar croustillant.', 
    price: '2500 F', 
    priceNumeric: 2500, 
    category: 'Manaïche', 
    image: 'https://i.postimg.cc/NMYXbtB1/Manaïche_Cocktail.webp',
    popular: true,
    preparationTime: 12,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'm2', 
    name: 'Manaïche Fromage', 
    description: 'Galette libanaise cuite au four avec fromage Akkaoui et mozzarella fondants.', 
    price: '2500 F', 
    priceNumeric: 2500, 
    category: 'Manaïche', 
    image: 'https://i.postimg.cc/FRZLB6Hc/Manaïche_Fromage.webp',
    preparationTime: 12,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'm3', 
    name: 'Manaïche Légumes', 
    description: 'Tomates fraîches, poivrons rouges, oignons et herbes aromatiques sur galette fine.', 
    price: '2000 F', 
    priceNumeric: 2000, 
    category: 'Manaïche', 
    image: 'https://i.postimg.cc/KzFTQbxQ/Manaïche_Légumes.webp',
    preparationTime: 12,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'm4', 
    name: 'Manaïche Viande', 
    description: 'Galette garnie de viande de boeuf finement hachée, tomates et 7 épices libanaises.', 
    price: '2500 F', 
    priceNumeric: 2500, 
    category: 'Manaïche', 
    image: 'https://i.postimg.cc/C1Y8J0Sm/Manaïche_Viande.webp',
    preparationTime: 12,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'm5', 
    name: 'Manaïche Zaatar', 
    description: 'Mélange traditionnel de thym sauvage, sésame grillé et huile d\'olive extra vierge.', 
    price: '1500 F', 
    priceNumeric: 1500, 
    category: 'Manaïche', 
    image: 'https://i.postimg.cc/sXyWKzsm/Manaïche_Zataar.webp',
    preparationTime: 10,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },

  // --- PLATS LOCAUX ---
  { 
    id: 'l1', 
    name: 'Tchep à la Viande', 
    description: 'Riz rouge sénégalais parfumé, mijoté aux épices avec boeuf tendre braisé et légumes.', 
    price: '4500 F', 
    priceNumeric: 4500, 
    category: 'Plat Local', 
    image: 'https://i.postimg.cc/s2mLw6y8/Tchep_à_la_viande.png',
    popular: true,
    preparationTime: 20,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'l2', 
    name: 'Tchep au Poulet', 
    description: 'Riz gras sénégalais accompagné d\'un beau quartier de poulet doré et pimenté.', 
    price: '4000 F', 
    priceNumeric: 4000, 
    category: 'Plat Local', 
    image: 'https://i.postimg.cc/43P0BLZL/Tchep_au_poulet.png',
    popular: true,
    preparationTime: 20,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'l3', 
    name: 'Riz au Soumara', 
    description: 'Saveur ivoirienne authentique au soumara traditionnel, servi avec viande tendre.', 
    price: '4000 F', 
    priceNumeric: 4000, 
    category: 'Plat Local', 
    image: 'https://i.postimg.cc/ZRcdMQ5H/Riz_au_soumara.webp',
    preparationTime: 20,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'l4', 
    name: 'Tchep au Poisson', 
    description: 'Le grand classique : thiof ou mérou frais doré, riz rouge et légumes racine au bouillon.', 
    price: '4500 F', 
    priceNumeric: 4500, 
    category: 'Plat Local', 
    image: 'https://i.postimg.cc/d06f4Hwc/Tchep_au_poisson.png',
    preparationTime: 20,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'l5', 
    name: 'Soupe Cabri au Riz', 
    description: 'Bouillon épicé vivifiant de cabri aux herbes aromatiques, servi avec un bol de riz parfumé.', 
    price: '5000 F', 
    priceNumeric: 5000, 
    category: 'Plat Local', 
    image: 'https://i.postimg.cc/50tRGBNZ/Soupe_de_cabri_au_riz.png',
    popular: true,
    preparationTime: 25,
    availableOptions: [COMMON_OPTION_GROUPS.drinks]
  },
  { 
    id: 'l6', 
    name: 'Cabri Sauté au Riz', 
    description: 'Morceaux de cabri sautés aux oignons, poivrons et piments frais, accompagnés de riz.', 
    price: '5000 F', 
    priceNumeric: 5000, 
    category: 'Plat Local', 
    image: 'https://i.postimg.cc/vBmNjrHP/Cabri_sauté_au_riz.png',
    preparationTime: 25,
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
    fee: 1000,
    estimatedMinutes: '25-35 min',
  },
  {
    id: 'bingerville_feh_kess',
    name: 'Bingerville Feh Kessé / Carrefour Akandjé',
    description: 'Livraison rapide zone périphérique Bingerville',
    fee: 1000,
    estimatedMinutes: '30-40 min',
  },
  {
    id: 'riviera_palmeraie',
    name: 'Riviera Palmeraie / Riviera 2, 3, 4, Faya',
    description: 'Livraison secteur Cocody Est',
    fee: 1000,
    estimatedMinutes: '35-50 min',
  },
  {
    id: 'cocody_angre',
    name: 'Cocody Angré / 7ème & 8ème Tranche / Deux-Plateaux',
    description: 'Livraison secteur Cocody Nord',
    fee: 1000,
    estimatedMinutes: '45-60 min',
  },
  {
    id: 'plateau_marcory',
    name: 'Plateau / Marcory / Treichville / Zone 4',
    description: 'Livraison centre & sud Abidjan',
    fee: 1000,
    estimatedMinutes: '50-70 min',
  },
  {
    id: 'yopougon_abobo',
    name: 'Yopougon / Abobo / Adjamé',
    description: 'Livraison grand Abidjan',
    fee: 1000,
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
