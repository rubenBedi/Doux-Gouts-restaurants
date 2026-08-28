/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChefHat, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Package, 
  RefreshCw, 
  Search, 
  AlertTriangle,
  TrendingUp,
  Tag,
  Phone,
  MapPin,
  Lock,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  Calendar,
  Filter,
  PieChart,
  ShoppingBag,
  Award,
  BarChart3,
  CreditCard,
  Percent,
  CalendarDays,
  Sparkles,
  Download,
  Users,
  FileSpreadsheet,
  MessageSquare,
  UserCheck,
  Send,
  Copy,
  Check,
  Megaphone,
  Radio,
  ExternalLink,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus, InventoryItem, MenuItem } from '../types';
import { formatPrice, WAVE_PAYMENT_URL } from '../constants';

// Helper to format phone number for Côte d'Ivoire WhatsApp (starts with 225)
const formatPhoneForWhatsApp = (rawPhone: string): string => {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/[^0-9]/g, '');
  // If it starts with 00225, remove 00
  if (cleaned.startsWith('00225')) {
    cleaned = cleaned.substring(2);
  }
  // If it doesn't start with 225 and is standard 10-digit Ivorian number, prepend 225
  if (!cleaned.startsWith('225') && cleaned.length >= 8) {
    cleaned = `225${cleaned}`;
  }
  return cleaned;
};

// Helper to convert Date to YYYY-MM-DD
const toLocalDateString = (d: Date | string): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper for French human readable date
const formatFrenchDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
};

export interface CustomerDirectoryEntry {
  phone: string;
  name: string;
  firstName: string;
  lastName: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  addresses: string[];
}

export const AdminDashboardModal: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'stats' | 'customers'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Statistics Date Filtering States
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'custom' | 'all'>('today');

  // WhatsApp Marketing Campaign State
  const [broadcastMessage, setBroadcastMessage] = useState(
    '🔥 Bonjour de la part de Doux Goûts Resto Bingerville ! Profitez ce weekend d\'une offre exclusive sur toutes nos pizzas & spécialités maison. Commandez dès maintenant : livraison rapide chez vous ! 🛵🍕'
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  
  // Interactive Step-by-Step WhatsApp Queue Sender
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    if (isAdminOpen) {
      fetchOrders();
      fetchInventory();
    }
  }, [isAdminOpen]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  // -------------------------------------------------------------
  // 1. Status Update with Automatic WhatsApp Notification
  // -------------------------------------------------------------
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedOrder: Order = data.order;
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

        // Automatic WhatsApp notification when changing to "Prête à livrer" (in_delivery)
        if (newStatus === 'in_delivery' && updatedOrder) {
          const clientPhone = formatPhoneForWhatsApp(updatedOrder.customer.phone);
          const clientName = `${updatedOrder.customer.firstName} ${updatedOrder.customer.lastName || ''}`.trim() || 'Client';
          const orderRef = updatedOrder.reference || updatedOrder.id.slice(-6);

          const deliveryMsg = `Bonjour ${clientName}, votre commande #${orderRef} chez Doux Goûts Resto est prête ! Notre livreur est en route pour vous livrer. 🛵💨`;
          const whatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(deliveryMsg)}`;

          // Trigger automatic opening of WhatsApp window
          try {
            window.open(whatsappUrl, '_blank');
          } catch (e) {
            console.warn('Popup blocked, url is available via quick action', e);
          }
        }
      }
    } catch (err) {
      console.error('Status update failed', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStock = async (menuItemId: string, newQty: number) => {
    try {
      const res = await fetch(`/api/inventory/${menuItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: Math.max(0, newQty) })
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (err) {
      console.error('Stock update failed', err);
    }
  };

  // Quick date shortcuts handlers
  const handleSetDateFilter = (mode: 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'all') => {
    setDateFilterMode(mode);
    const now = new Date();

    if (mode === 'today') {
      setSelectedDate(toLocalDateString(now));
    } else if (mode === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400000);
      setSelectedDate(toLocalDateString(yesterday));
    } else if (mode === 'last7days') {
      setSelectedDate(toLocalDateString(now));
    } else if (mode === 'thisMonth') {
      setSelectedDate(toLocalDateString(now));
    }
  };

  const handleCustomDateChange = (dateValue: string) => {
    setSelectedDate(dateValue);
    setDateFilterMode('custom');
  };

  // -------------------------------------------------------------
  // Customer Directory Aggregation
  // -------------------------------------------------------------
  const customersDirectory: CustomerDirectoryEntry[] = useMemo(() => {
    const map = new Map<string, CustomerDirectoryEntry>();

    orders.forEach((o) => {
      if (!o.customer || !o.customer.phone) return;
      const rawPhone = o.customer.phone.trim();
      const fullName = `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() || 'Client';

      if (!map.has(rawPhone)) {
        map.set(rawPhone, {
          phone: rawPhone,
          name: fullName,
          firstName: o.customer.firstName || '',
          lastName: o.customer.lastName || '',
          totalOrders: 1,
          totalSpent: o.total || 0,
          lastOrderDate: o.createdAt,
          addresses: o.customer.address ? [o.customer.address] : []
        });
      } else {
        const existing = map.get(rawPhone)!;
        existing.totalOrders += 1;
        existing.totalSpent += (o.total || 0);
        if (fullName && fullName !== 'Client') {
          existing.name = fullName;
        }
        if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = o.createdAt;
        }
        if (o.customer.address && !existing.addresses.includes(o.customer.address)) {
          existing.addresses.push(o.customer.address);
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
    });
  }, [orders]);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm.trim()) return customersDirectory;
    const term = customerSearchTerm.toLowerCase();
    return customersDirectory.filter((c) => 
      c.name.toLowerCase().includes(term) || 
      c.phone.toLowerCase().includes(term)
    );
  }, [customersDirectory, customerSearchTerm]);

  // -------------------------------------------------------------
  // 2. CSV Exporter for Customer Directory
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (customersDirectory.length === 0) {
      alert("Aucun client enregistré à exporter.");
      return;
    }

    const header = "Nom;Téléphone;Total_Commandes;Total_Depense_FCFA;Derniere_Commande\n";
    const rows = customersDirectory.map((c) => {
      const formattedDate = new Date(c.lastOrderDate).toLocaleDateString('fr-FR');
      const cleanName = c.name.replace(/;/g, ' ');
      const cleanPhone = c.phone.replace(/;/g, ' ');
      return `"${cleanName}";"${cleanPhone}";${c.totalOrders};${c.totalSpent};"${formattedDate}"`;
    }).join("\n");

    const csvContent = "\uFEFF" + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = toLocalDateString(new Date());
    link.setAttribute("download", `Clients_Doux_Gouts_Resto_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // 3. WhatsApp Mass Marketing Helpers
  // -------------------------------------------------------------
  // Copy all formatted numbers to clipboard
  const handleCopyAllPhoneNumbers = () => {
    if (customersDirectory.length === 0) return;
    const formattedList = customersDirectory
      .map((c) => `+${formatPhoneForWhatsApp(c.phone)}`)
      .join(', ');
    
    navigator.clipboard.writeText(formattedList);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 3000);
  };

  // Automated Background API Broadcast
  const handleSendAutomatedBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      alert('Veuillez saisir un message pour la diffusion.');
      return;
    }
    if (customersDirectory.length === 0) {
      alert('Aucun contact client disponible.');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const recipients = customersDirectory.map((c) => ({
        phone: formatPhoneForWhatsApp(c.phone),
        name: c.name
      }));

      const res = await fetch('/api/marketing/whatsapp-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMessage,
          recipients
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBroadcastResult(`Diffusion réussie à ${data.recipientsCount} contacts clients !`);
      } else {
        setBroadcastResult('Erreur lors de la diffusion automatique.');
      }
    } catch (err) {
      console.error('Broadcast failed', err);
      setBroadcastResult('Erreur de connexion au serveur de diffusion.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Start Interactive Step-by-Step Queue
  const handleStartQueue = () => {
    if (customersDirectory.length === 0) {
      alert('Aucun contact client dans le répertoire.');
      return;
    }
    setQueueIndex(0);
    setQueueModalOpen(true);
  };

  const handleOpenCurrentQueueWhatsApp = () => {
    const currentCustomer = customersDirectory[queueIndex];
    if (!currentCustomer) return;

    const phone = formatPhoneForWhatsApp(currentCustomer.phone);
    const personalizedMessage = broadcastMessage.replace(/\[Nom\]/g, currentCustomer.firstName || currentCustomer.name);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(personalizedMessage)}`;
    window.open(url, '_blank');
  };

  // Filtered orders for Tab 1 (Orders Live View)
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchSearch =
      searchTerm === '' ||
      o.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer.lastName && o.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.customer.phone.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  // Global counts for badges
  const inKitchenCount = orders.filter((o) => o.orderStatus === 'in_kitchen').length;
  const inDeliveryCount = orders.filter((o) => o.orderStatus === 'in_delivery').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;

  // -------------------------------------------------------------
  // Filtered Orders specifically for Statistics based on selected date/period
  // -------------------------------------------------------------
  const statsFilteredOrders = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return orders.filter((o) => {
      const orderDateStr = toLocalDateString(o.createdAt);
      const orderTime = new Date(o.createdAt).getTime();

      switch (dateFilterMode) {
        case 'today':
          return orderDateStr === todayStr;
        case 'yesterday': {
          const yesterdayStr = toLocalDateString(new Date(now.getTime() - 86400000));
          return orderDateStr === yesterdayStr;
        }
        case 'custom':
          return orderDateStr === selectedDate;
        case 'last7days': {
          const sevenDaysAgo = now.getTime() - 7 * 86400000;
          return orderTime >= sevenDaysAgo;
        }
        case 'thisMonth': {
          const od = new Date(o.createdAt);
          return od.getFullYear() === currentYear && od.getMonth() === currentMonth;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, dateFilterMode, selectedDate, todayStr]);

  // Statistics KPI Calculations for the selected period
  const statsRevenue = useMemo(() => {
    return statsFilteredOrders.reduce((sum, o) => sum + (o.paymentStatus === 'succeeded' ? o.total : o.total), 0);
  }, [statsFilteredOrders]);

  const statsOrderCount = statsFilteredOrders.length;
  const statsAverageTicket = statsOrderCount > 0 ? Math.round(statsRevenue / statsOrderCount) : 0;
  
  const statsDeliveredCount = statsFilteredOrders.filter((o) => o.orderStatus === 'delivered').length;
  const statsCompletionRate = statsOrderCount > 0 ? Math.round((statsDeliveredCount / statsOrderCount) * 100) : 0;

  // -------------------------------------------------------------
  // Category Breakdown for the selected date/period
  // -------------------------------------------------------------
  const categoryBreakdown = useMemo(() => {
    const categoryMap: Record<string, { count: number; revenue: number }> = {
      'Pizza': { count: 0, revenue: 0 },
      'Chawarma': { count: 0, revenue: 0 },
      'Manaïche': { count: 0, revenue: 0 },
      'Plat Local': { count: 0, revenue: 0 },
      'Panini': { count: 0, revenue: 0 }
    };

    let totalItemsSold = 0;

    statsFilteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.menuItem?.category || 'Plat Local';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, revenue: 0 };
        }
        categoryMap[cat].count += item.quantity;
        categoryMap[cat].revenue += item.totalPrice;
        totalItemsSold += item.quantity;
      });
    });

    const categoryColors: Record<string, { bg: string; bar: string; text: string; lightBg: string }> = {
      'Pizza': { bg: 'bg-[#fa8107]', bar: 'bg-[#fa8107]', text: 'text-[#fa8107]', lightBg: 'bg-orange-50' },
      'Chawarma': { bg: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-50' },
      'Manaïche': { bg: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50' },
      'Plat Local': { bg: 'bg-blue-600', bar: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50' },
      'Panini': { bg: 'bg-rose-500', bar: 'bg-rose-500', text: 'text-rose-600', lightBg: 'bg-rose-50' }
    };

    return Object.entries(categoryMap).map(([catName, data]) => {
      const percentage = totalItemsSold > 0 ? Math.round((data.count / totalItemsSold) * 100) : 0;
      return {
        category: catName,
        count: data.count,
        revenue: data.revenue,
        percentage,
        colors: categoryColors[catName] || { bg: 'bg-gray-600', bar: 'bg-gray-600', text: 'text-gray-700', lightBg: 'bg-gray-50' }
      };
    }).sort((a, b) => b.count - a.count);
  }, [statsFilteredOrders]);

  const totalDishesCount = useMemo(() => {
    return categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
  }, [categoryBreakdown]);

  // -------------------------------------------------------------
  // Top 5 Best-Selling Dishes for the selected date/period
  // -------------------------------------------------------------
  const topSellingDishes = useMemo(() => {
    const dishMap: Record<string, { menuItem: MenuItem; quantity: number; totalRevenue: number }> = {};

    statsFilteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!item.menuItem) return;
        const key = item.menuItem.id || item.menuItem.name;
        if (!dishMap[key]) {
          dishMap[key] = {
            menuItem: item.menuItem,
            quantity: 0,
            totalRevenue: 0
          };
        }
        dishMap[key].quantity += item.quantity;
        dishMap[key].totalRevenue += item.totalPrice;
      });
    });

    return Object.values(dishMap)
      .sort((a, b) => b.quantity - a.quantity || b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [statsFilteredOrders]);

  // -------------------------------------------------------------
  // Payment methods breakdown for the selected date/period
  // -------------------------------------------------------------
  const paymentBreakdown = useMemo(() => {
    let waveCount = 0;

    statsFilteredOrders.forEach((o) => {
      if (o.paymentMethod === 'wave_ci' || !o.paymentMethod) {
        waveCount++;
      } else {
        waveCount++;
      }
    });

    const totalOrders = statsFilteredOrders.length || 1;

    return {
      wave: { count: statsFilteredOrders.length, percent: 100 },
    };
  }, [statsFilteredOrders]);

  if (!isAdminOpen) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
      case 'pending':
        return {
          label: 'À préparer',
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'in_kitchen':
        return {
          label: 'En préparation',
          bg: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'in_delivery':
        return {
          label: 'Prête à livrer',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'delivered':
        return {
          label: 'Livrée',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          bg: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          bg: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  // Human readable title for current date filter in statistics
  const getFilterDisplayLabel = () => {
    switch (dateFilterMode) {
      case 'today':
        return `Aujourd'hui (${formatFrenchDate(todayStr)})`;
      case 'yesterday': {
        const yesterday = new Date(Date.now() - 86400000);
        return `Hier (${formatFrenchDate(toLocalDateString(yesterday))})`;
      }
      case 'last7days':
        return 'Les 7 derniers jours';
      case 'thisMonth':
        return 'Ce mois-ci';
      case 'custom':
        return `Journée du ${formatFrenchDate(selectedDate)}`;
      case 'all':
      default:
        return 'Toutes les dates enregistrées';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
          id="admin-dashboard-modal"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-800 bg-gray-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fa8107] flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/30">
                <ChefHat size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg uppercase tracking-tight">
                    Espace Cuisine & Supervision
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En direct
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Doux Goûts Resto Bingerville — Commandes, Stocks, Ventes & WhatsApp Marketing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={fetchOrders}
                title="Rafraîchir les données"
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#fa8107]' : ''} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>

              <button 
                onClick={() => setIsAdminOpen(false)}
                title="Verrouiller et fermer"
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-bold bg-white/5 border border-white/10 cursor-pointer"
              >
                <Lock size={14} className="text-[#fa8107]" />
                <span className="hidden sm:inline">Quitter</span>
                <X size={16} className="sm:hidden" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-100 px-4 sm:px-6 py-2.5 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2 text-xs">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'orders', label: `Commandes (${orders.length})` },
                { id: 'inventory', label: `Stocks & Portions (${inventory.length})` },
                { id: 'stats', label: 'Statistiques & Ventes' },
                { id: 'customers', label: `Marketing / Clients (${customersDirectory.length})`, icon: MessageSquare }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-black uppercase text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === t.id 
                      ? 'bg-white text-[#fa8107] shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.icon && <t.icon size={13} />}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 text-[11px] font-bold text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {inKitchenCount} en préparation
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {inDeliveryCount} prête(s)
              </span>
            </div>
          </div>

          {/* Body content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50">
            {/* ---------------- TAB 1 : ORDERS LIST ---------------- */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="relative w-full sm:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Rechercher réf, nom, téléphone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#fa8107] transition-colors"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: `Toutes (${orders.length})` },
                      { id: 'confirmed', label: `À préparer (${orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'pending').length})` },
                      { id: 'in_kitchen', label: `En préparation (${inKitchenCount})` },
                      { id: 'in_delivery', label: `Prête à livrer (${inDeliveryCount})` },
                      { id: 'delivered', label: `Livrées (${deliveredCount})` },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setStatusFilter(st.id)}
                        className={`px-3 py-2 rounded-xl font-black uppercase text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                          statusFilter === st.id 
                            ? 'bg-[#fa8107] text-white shadow-xs' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Cards Grid */}
                <div className="space-y-3.5">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 text-gray-400 text-xs space-y-2">
                      <UtensilsCrossed size={32} className="mx-auto text-gray-300 mb-2" />
                      <div className="font-bold text-gray-600">Aucune commande trouvée</div>
                      <div>Aucune commande ne correspond aux filtres actuels.</div>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const statusBadge = getStatusBadge(ord.orderStatus);
                      const clientPhone = formatPhoneForWhatsApp(ord.customer.phone);
                      const clientName = `${ord.customer.firstName} ${ord.customer.lastName || ''}`.trim() || 'Client';
                      const readyDeliveryMsg = `Bonjour ${clientName}, votre commande #${ord.reference} chez Doux Goûts Resto est prête ! Notre livreur est en route pour vous livrer. 🛵💨`;

                      return (
                        <div 
                          key={ord.id}
                          className="bg-white border border-gray-200 p-5 rounded-3xl shadow-xs space-y-4 hover:border-orange-200 transition-colors"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-mono font-black text-xs sm:text-sm text-[#fa8107] bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-100">
                                #{ord.reference}
                              </span>
                              <span className="font-black text-sm text-gray-900">
                                {ord.customer.firstName} {ord.customer.lastName}
                              </span>
                              <a 
                                href={`tel:${ord.customer.phone}`}
                                className="text-xs text-gray-500 font-bold bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1"
                              >
                                <Phone size={12} className="text-[#fa8107]" />
                                <span>{ord.customer.phone}</span>
                              </a>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${statusBadge.bg}`}>
                                {statusBadge.label}
                              </span>
                              <span className="font-black text-base text-gray-900">
                                {formatPrice(ord.total)}
                              </span>
                            </div>
                          </div>

                          {/* Items and Delivery info */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                            {/* Items list */}
                            <div className="md:col-span-7 space-y-2">
                              <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                Détails des plats ({ord.items.reduce((acc, i) => acc + i.quantity, 0)} article(s))
                              </div>
                              <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-100 last:border-0 pb-1.5 last:pb-0">
                                    <div>
                                      <div className="font-black text-gray-900 flex items-center gap-1.5">
                                        <span className="bg-orange-100 text-[#fa8107] text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                          {it.quantity}x
                                        </span>
                                        <span>{it.menuItem?.name}</span>
                                      </div>
                                      {it.selectedOptions && it.selectedOptions.length > 0 && (
                                        <div className="text-[11px] text-gray-500 pl-6 space-y-0.5 mt-0.5">
                                          {it.selectedOptions.map((opt, oIdx) => (
                                            <div key={oIdx} className="text-[#fa8107] font-medium">
                                              + {opt.optionName} {opt.extraPrice > 0 ? `(${formatPrice(opt.extraPrice)})` : ''}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {it.specialInstructions && (
                                        <div className="text-[10px] text-amber-700 font-medium pl-6 italic">
                                          Note: {it.specialInstructions}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-gray-500 font-bold">{formatPrice(it.totalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Customer and Delivery info */}
                            <div className="md:col-span-5 bg-orange-50/60 p-3.5 rounded-2xl border border-orange-100 text-[11px] text-gray-600 space-y-1.5">
                              <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                Livraison & Paiement
                              </div>
                              <div className="flex items-start gap-1.5">
                                <MapPin size={13} className="text-[#fa8107] mt-0.5 shrink-0" />
                                <div>
                                  <div className="font-bold text-gray-800">
                                    {ord.customer.address}, {ord.customer.district}
                                  </div>
                                  {ord.customer.landmark && (
                                    <div className="text-gray-500 text-[10px]">
                                      Repère : {ord.customer.landmark}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <strong>Zone :</strong> {ord.deliveryZone?.name || 'Bingerville'} ({formatPrice(ord.deliveryFee)})
                              </div>
                              <div>
                                <strong>Paiement :</strong> <span className="font-bold uppercase">{ord.paymentMethod}</span> ({ord.paymentStatus})
                              </div>
                              {ord.notes && (
                                <div className="text-amber-800 font-bold bg-amber-100/70 p-1.5 rounded-lg">
                                  Consigne : {ord.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status transition action buttons & WhatsApp Trigger */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                              <Clock size={13} />
                              <span>Passée à {new Date(ord.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1. Passer en Préparation */}
                              {ord.orderStatus !== 'in_kitchen' && ord.orderStatus !== 'in_delivery' && ord.orderStatus !== 'delivered' && (
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'in_kitchen')}
                                  disabled={updatingId === ord.id}
                                  className="bg-orange-50 hover:bg-orange-100 text-[#fa8107] border border-orange-200 font-black text-[11px] uppercase px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                                >
                                  <ChefHat size={14} />
                                  <span>En préparation</span>
                                </button>
                              )}

                              {/* 2. Passer en Prête à livrer (Déclenche WhatsApp auto) */}
                              {ord.orderStatus !== 'in_delivery' && ord.orderStatus !== 'delivered' && (
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'in_delivery')}
                                  disabled={updatingId === ord.id}
                                  title="Passe la commande à Prête à livrer et prépare la notification WhatsApp client"
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-blue-600/20 cursor-pointer"
                                >
                                  <Truck size={14} />
                                  <span>Prête à livrer 🛵</span>
                                </button>
                              )}

                              {/* 3. Bouton Direct WhatsApp "En route" si déjà en livraison */}
                              {ord.orderStatus === 'in_delivery' && (
                                <a
                                  href={`https://wa.me/${clientPhone}?text=${encodeURIComponent(readyDeliveryMsg)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-[11px] uppercase px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                                >
                                  <MessageSquare size={14} className="text-emerald-600" />
                                  <span>Notifier WhatsApp 🛵</span>
                                </a>
                              )}

                              {/* 4. Marquer Livrée */}
                              {ord.orderStatus !== 'delivered' && (
                                <button
                                  onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                                  disabled={updatingId === ord.id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Marquer Livrée</span>
                                </button>
                              )}

                              {/* Si déjà livrée */}
                              {ord.orderStatus === 'delivered' && (
                                <span className="text-emerald-600 font-black text-xs flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                  <CheckCircle2 size={14} /> Commande terminée
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ---------------- TAB 2 : INVENTORY ---------------- */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-black text-xs uppercase text-gray-800">
                      Disponibilité & Portions en direct
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Les stocks se décrémentent automatiquement lors de chaque commande validée.
                    </p>
                  </div>
                  <button 
                    onClick={fetchInventory}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Actualiser</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {inventory.map((inv) => (
                    <div 
                      key={inv.id}
                      className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-black text-xs uppercase text-gray-900">{inv.name}</div>
                        <span className="text-[10px] text-gray-400 uppercase">{inv.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateStock(inv.menuItemId, inv.stockQuantity - 5)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xs cursor-pointer"
                          title="-5"
                        >
                          -5
                        </button>
                        <span className={`w-8 text-center font-black text-xs ${inv.stockQuantity <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {inv.stockQuantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateStock(inv.menuItemId, inv.stockQuantity + 5)}
                          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xs cursor-pointer"
                          title="+5"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- TAB 3 : STATS AVEC SÉLECTEUR DE DATE INTERACTIF ---------------- */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* 1. Date Picker & Quick Shortcuts Header */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#fa8107] flex items-center justify-center font-black">
                          <Calendar size={16} />
                        </div>
                        <h4 className="font-black text-sm sm:text-base uppercase tracking-tight text-gray-900">
                          Filtrage par Date & Période d'Analyse
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-10">
                        Sélectionnez un jour précis sur le calendrier ou utilisez un raccourci rapide pour analyser les ventes.
                      </p>
                    </div>

                    {/* Interactive HTML5 Date Input with custom styling */}
                    <div className="flex items-center gap-2 self-start md:self-auto bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                      <CalendarDays size={16} className="text-[#fa8107] ml-2 shrink-0" />
                      <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleCustomDateChange(e.target.value)}
                        className="bg-transparent border-0 outline-none text-xs font-black uppercase text-gray-900 cursor-pointer pr-2 py-1"
                        id="stats-date-picker"
                      />
                    </div>
                  </div>

                  {/* Preset Shortcut Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-black uppercase text-gray-400 mr-1 flex items-center gap-1">
                      <Filter size={12} /> Raccourcis :
                    </span>

                    {[
                      { id: 'today', label: "Aujourd'hui" },
                      { id: 'yesterday', label: 'Hier' },
                      { id: 'last7days', label: '7 derniers jours' },
                      { id: 'thisMonth', label: 'Ce mois' },
                      { id: 'all', label: 'Toutes les dates' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleSetDateFilter(btn.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl font-black uppercase text-[11px] transition-all cursor-pointer ${
                          dateFilterMode === btn.id 
                            ? 'bg-[#fa8107] text-white shadow-xs shadow-orange-500/30' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Active Filter Summary Banner */}
                  <div className="bg-orange-50/80 border border-orange-100 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-orange-950 font-bold">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#fa8107]" />
                      <span>Période active : <strong className="text-[#fa8107] font-black capitalize">{getFilterDisplayLabel()}</strong></span>
                    </div>
                    <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-lg border border-orange-200 text-gray-600">
                      {statsOrderCount} commande(s) trouvée(s)
                    </span>
                  </div>
                </div>

                {/* 2. Key Indicator Cards (KPIs) calculated for selected date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CA Total */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-gray-400 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider">Chiffre d'Affaires</span>
                        <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#fa8107] flex items-center justify-center">
                          <DollarSign size={14} />
                        </div>
                      </div>
                      <span className="text-2xl font-black text-[#fa8107] block tracking-tight">
                        {formatPrice(statsRevenue)}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium mt-3 flex items-center gap-1">
                      <Calendar size={12} className="text-[#fa8107]" />
                      Généré sur la sélection
                    </span>
                  </div>

                  {/* Nombre de Commandes */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-gray-400 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider">Commandes Enregistrées</span>
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <ShoppingBag size={14} />
                        </div>
                      </div>
                      <span className="text-2xl font-black text-gray-900 block tracking-tight">
                        {statsOrderCount}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium mt-3 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      {statsDeliveredCount} livrée(s) ({statsCompletionRate}%)
                    </span>
                  </div>

                  {/* Panier Moyen */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-gray-400 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider">Panier Moyen</span>
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <TrendingUp size={14} />
                        </div>
                      </div>
                      <span className="text-2xl font-black text-gray-900 block tracking-tight">
                        {formatPrice(statsAverageTicket)}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium mt-3 flex items-center gap-1">
                      <Layers size={12} className="text-gray-400" />
                      {totalDishesCount} portion(s) totale(s)
                    </span>
                  </div>
                </div>

                {/* 3. Products Analysis for the Selected Date (Category Breakdown & Top 5 Dishes) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Category Breakdown */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#fa8107] flex items-center justify-center font-black">
                          <PieChart size={16} />
                        </div>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight text-gray-900">
                            Ventilation par Catégorie
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            Répartition des ventes sur la date choisie
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#fa8107] bg-orange-50 px-2.5 py-1 rounded-xl">
                        {totalDishesCount} plat(s)
                      </span>
                    </div>

                    {totalDishesCount === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">
                        Aucun article vendu sur cette période.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categoryBreakdown.map((cat) => (
                          <div key={cat.category} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${cat.colors.bg}`} />
                                <span className="font-black text-gray-800">{cat.category}</span>
                              </div>
                              <div className="flex items-center gap-2 font-bold text-gray-600">
                                <span>{cat.count} portion{cat.count > 1 ? 's' : ''} ({cat.percentage}%)</span>
                                <span className="text-gray-400 font-normal">|</span>
                                <span className="font-black text-gray-900">{formatPrice(cat.revenue)}</span>
                              </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`h-full ${cat.colors.bar} rounded-full transition-all duration-500`}
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top 5 Best-Selling Dishes for Selected Day */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                          <Award size={16} />
                        </div>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight text-gray-900">
                            Top 5 des Plats les Plus Vendus
                          </h4>
                          <p className="text-[10px] text-gray-400">
                            Classement des ventes pour la période
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-500">
                        Top Ventes
                      </span>
                    </div>

                    {topSellingDishes.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">
                        Aucune vente enregistrée pour cette date.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {topSellingDishes.map((dish, idx) => {
                          const medalIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                          return (
                            <div 
                              key={dish.menuItem.id || idx}
                              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-base font-black shrink-0">
                                  {medalIcons[idx]}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-black text-xs text-gray-900 truncate">
                                    {dish.menuItem.name}
                                  </div>
                                  <span className="text-[10px] font-bold text-[#fa8107] uppercase">
                                    {dish.menuItem.category}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0 pl-2">
                                <div className="text-xs font-black text-gray-900">
                                  {dish.quantity} vendu{dish.quantity > 1 ? 's' : ''}
                                </div>
                                <div className="text-[11px] text-gray-500 font-bold">
                                  {formatPrice(dish.totalRevenue)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Payment Breakdown & Regulations */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1dc4e9]/20 text-[#008ba3] flex items-center justify-center font-black">
                        <CreditCard size={16} />
                      </div>
                      <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight text-gray-900">
                        Mode d'Encaissement Exclusif
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#008ba3] font-bold bg-cyan-50 px-2.5 py-1 rounded-xl">
                      Wave Côte d'Ivoire (0% Frais)
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-teal-50 p-5 rounded-2xl border border-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1dc4e9] text-white flex items-center justify-center text-xl shadow-md">
                        🌊
                      </div>
                      <div>
                        <div className="font-black text-sm text-gray-900 uppercase">
                          Wave CI — Transfert & Scan QR
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                          <span>Compte marchand actif :</span>
                          <a 
                            href={WAVE_PAYMENT_URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-[#008ba3] font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>pay.wave.com</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-right bg-white px-5 py-3 rounded-xl border border-cyan-100 shadow-xs">
                      <div className="text-base font-black text-[#008ba3]">
                        {paymentBreakdown.wave.count} commande(s)
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        {paymentBreakdown.wave.percent}% des encaissements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 4 : RÉPERTOIRE CLIENTS & WHATSAPP MARKETING ---------------- */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                {/* 1. WhatsApp Mass Broadcast Campaign Module */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm sm:text-base uppercase tracking-tight text-gray-900 flex items-center gap-2">
                          <span>Diffusion WhatsApp de Masse</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                            Marketing VIP
                          </span>
                        </h4>
                        <p className="text-xs text-gray-500">
                          Rédigez et envoyez une offre promotionnelle ou une annonce à l'ensemble de vos {customersDirectory.length} clients enregistrés.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Copy Numbers Button */}
                      <button
                        onClick={handleCopyAllPhoneNumbers}
                        className={`px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                          copiedNumbers 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                        }`}
                        title="Copier les numéros de téléphone (+225) pour listes de diffusion WhatsApp Business"
                      >
                        {copiedNumbers ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedNumbers ? 'Numéros Copiés !' : 'Copier numéros (+225)'}</span>
                      </button>

                      {/* Export CSV */}
                      <button
                        onClick={handleExportCSV}
                        className="bg-gray-900 hover:bg-black text-white px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Exporter le répertoire complet en CSV"
                      >
                        <Download size={14} />
                        <span>Exporter CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Composition Area */}
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Écrivez votre message promotionnel ou informationnel..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium text-gray-900 outline-none focus:border-[#fa8107] focus:bg-white transition-all resize-none shadow-inner"
                      />
                      <span className="absolute right-3.5 bottom-3.5 text-[10px] text-gray-400 font-mono font-bold">
                        {broadcastMessage.length} car.
                      </span>
                    </div>

                    {/* Preset Templates */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-black text-gray-400 uppercase text-[10px] flex items-center gap-1">
                        <Sparkles size={11} className="text-[#fa8107]" /> Modèles rapides :
                      </span>
                      {[
                        { label: '🍕 Promo Pizzas', text: '🔥 Offre du Weekend : 1 Pizza achetée = 1 Boisson fraîche offerte chez Doux Goûts Resto ! Commandez vite au 07 47 00 23 88 🍕🥤' },
                        { label: '🛵 Livraison Gratuite', text: '🎉 Spécial Bingerville : Livraison offerte aujourd\'hui sur toutes vos commandes dès 8 000 F CFA ! Profitez-en sur notre menu en ligne 🛵💨' },
                        { label: '⭐ Nouveauté Menu', text: '✨ Découvrez nos nouveaux Chawarmas et Manaïches cuits au feu de bois chez Doux Goûts Resto ! Un pur régal à partager en famille.' }
                      ].map((tpl, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => setBroadcastMessage(tpl.text)}
                          className="bg-orange-50 hover:bg-orange-100 text-[#fa8107] border border-orange-200/80 px-2.5 py-1 rounded-xl font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>

                    {/* Action Bar for Broadcast */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">
                        Destinataires ciblés : <strong className="text-gray-900 font-black">{customersDirectory.length} clients</strong>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Interactive Step-by-Step Queue */}
                        <button
                          onClick={handleStartQueue}
                          disabled={customersDirectory.length === 0}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                        >
                          <PlayCircle size={15} />
                          <span>File d'envoi WhatsApp</span>
                        </button>

                        {/* Automated Background Broadcast (Server / Cloud API) */}
                        <button
                          onClick={handleSendAutomatedBroadcast}
                          disabled={isBroadcasting || customersDirectory.length === 0}
                          className="bg-[#fa8107] hover:bg-[#e07306] disabled:opacity-50 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
                        >
                          <Send size={14} className={isBroadcasting ? 'animate-bounce' : ''} />
                          <span>{isBroadcasting ? 'Diffusion en cours...' : 'Envoyer à tous (API)'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Broadcast Feedback Alert */}
                    {broadcastResult && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{broadcastResult}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Customer Directory Table & Search */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div>
                      <h4 className="font-black text-xs sm:text-sm uppercase tracking-tight text-gray-900 flex items-center gap-2">
                        <Users size={16} className="text-[#fa8107]" />
                        <span>Répertoire & Historique des Commandes</span>
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Liste automatique générée depuis les commandes réelles passées en ligne.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Rechercher par nom ou numéro..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-[#fa8107] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Customer Table */}
                  <div className="rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                            <th className="py-3 px-4">Nom du Client</th>
                            <th className="py-3 px-3">Téléphone</th>
                            <th className="py-3 px-3 text-center">Commandes</th>
                            <th className="py-3 px-3 text-right">Total Dépensé</th>
                            <th className="py-3 px-3">Dernière Commande</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                                <Users size={28} className="mx-auto text-gray-300 mb-2" />
                                Aucun contact trouvé dans le répertoire.
                              </td>
                            </tr>
                          ) : (
                            filteredCustomers.map((cust, idx) => {
                              const formattedLastDate = new Date(cust.lastOrderDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              });
                              const cleanPhone = formatPhoneForWhatsApp(cust.phone);

                              return (
                                <tr key={cust.phone || idx} className="hover:bg-orange-50/40 transition-colors">
                                  <td className="py-3.5 px-4">
                                    <div className="font-black text-gray-900 flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-orange-100 text-[#fa8107] font-black flex items-center justify-center text-[10px] shrink-0">
                                        {cust.name.slice(0, 2).toUpperCase()}
                                      </div>
                                      <span>{cust.name}</span>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-3 font-mono font-bold text-gray-700">
                                    <a 
                                      href={`tel:${cust.phone}`}
                                      className="hover:text-[#fa8107] flex items-center gap-1 transition-colors"
                                    >
                                      <Phone size={12} className="text-gray-400" />
                                      <span>{cust.phone}</span>
                                    </a>
                                  </td>

                                  <td className="py-3.5 px-3 text-center">
                                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full font-black text-[10px]">
                                      {cust.totalOrders}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-3 text-right font-black text-gray-900">
                                    {formatPrice(cust.totalSpent)}
                                  </td>

                                  <td className="py-3.5 px-3 text-gray-500 font-medium">
                                    {formattedLastDate}
                                  </td>

                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <a
                                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour ${cust.name}, merci pour votre fidélité chez Doux Goûts Resto Bingerville !`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Écrire sur WhatsApp"
                                        className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                      >
                                        <MessageSquare size={13} />
                                      </a>
                                      <a
                                        href={`tel:${cust.phone}`}
                                        title="Appeler le client"
                                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                      >
                                        <Phone size={13} />
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- INTERACTIVE QUEUE MODAL ---------------- */}
          {queueModalOpen && customersDirectory.length > 0 && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase text-gray-900">File d'Envoi WhatsApp</h4>
                      <span className="text-[11px] text-gray-500 font-bold">
                        Client {queueIndex + 1} sur {customersDirectory.length}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setQueueModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Current Customer Card */}
                {customersDirectory[queueIndex] && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-gray-900">
                        {customersDirectory[queueIndex].name}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        +{formatPhoneForWhatsApp(customersDirectory[queueIndex].phone)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-3 italic bg-white p-2.5 rounded-xl border border-gray-100">
                      "{broadcastMessage.replace(/\[Nom\]/g, customersDirectory[queueIndex].firstName || customersDirectory[queueIndex].name)}"
                    </p>
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(((queueIndex + 1) / customersDirectory.length) * 100)}%` }}
                  />
                </div>

                {/* Queue Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => setQueueIndex(prev => Math.max(0, prev - 1))}
                    disabled={queueIndex === 0}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    Précédent
                  </button>

                  <button
                    onClick={handleOpenCurrentQueueWhatsApp}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Envoyer WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      if (queueIndex < customersDirectory.length - 1) {
                        setQueueIndex(prev => prev + 1);
                      } else {
                        setQueueModalOpen(false);
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black text-white cursor-pointer"
                  >
                    {queueIndex < customersDirectory.length - 1 ? 'Suivant' : 'Terminer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
