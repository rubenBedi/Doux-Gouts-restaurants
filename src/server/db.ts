/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ALL_MENU_ITEMS, DEFAULT_PROMO_CODES } from '../constants';
import { Order, OrderStatus, PaymentStatus, PromoCode, InventoryItem } from '../types';

// Store DB in local project directory
const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'doux_gouts.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      customer_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL,
      delivery_zone_json TEXT NOT NULL,
      discount_amount INTEGER NOT NULL,
      promo_code TEXT,
      vat_amount INTEGER NOT NULL,
      tip_amount INTEGER NOT NULL,
      cutlery_needed INTEGER NOT NULL,
      total INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      order_status TEXT NOT NULL,
      estimated_delivery_time TEXT NOT NULL,
      stripe_pi TEXT,
      paypal_order_id TEXT,
      notes TEXT
    )
  `);

  // 2. Promo codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      code TEXT PRIMARY KEY,
      discount_type TEXT NOT NULL,
      value INTEGER NOT NULL,
      min_order INTEGER NOT NULL,
      valid_until TEXT NOT NULL,
      is_active INTEGER NOT NULL,
      description TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0
    )
  `);

  // 3. Inventory table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      menu_item_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL,
      is_in_stock INTEGER NOT NULL,
      low_stock_threshold INTEGER NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // 4. Subscriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  // 5. Table reservations
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      guests INTEGER DEFAULT 2,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT NOT NULL
    )
  `);

  // Clear promo codes table
  db.exec('DELETE FROM promo_codes');

  // Seed inventory for menu items if empty
  const countInventory = db.prepare('SELECT count(*) as count FROM inventory').get() as { count: number };
  if (countInventory.count === 0) {
    const insertInv = db.prepare(`
      INSERT INTO inventory (id, menu_item_id, name, stock_quantity, is_in_stock, low_stock_threshold, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertInvMany = db.transaction(() => {
      for (const item of ALL_MENU_ITEMS) {
        insertInv.run(
          `inv_${item.id}`,
          item.id,
          item.name,
          Math.floor(25 + Math.random() * 30), // Stock between 25 and 55 portions
          1,
          5,
          item.category
        );
      }
    });
    insertInvMany();
  }

  // Seed 2 initial sample orders for rich admin dashboard experience if empty
  const countOrders = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
  if (countOrders.count === 0) {
    const sampleOrder1: Order = {
      id: 'ord_init_101',
      reference: 'DG-8842',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      customer: {
        firstName: 'Kouassi',
        lastName: 'Jean-Marc',
        email: 'jm.kouassi@gmail.com',
        phone: '+225 07 88 12 34 56',
        address: 'Villa 45, Cité Addoha',
        district: 'Bingerville',
        landmark: 'En face de la pharmacie principale',
        deliveryNotes: 'Appeler à la barrière svp',
        isBillingSameAsDelivery: true
      },
      items: [
        {
          cartItemId: 'item_1',
          menuItem: ALL_MENU_ITEMS[0], // Peperoni
          quantity: 2,
          selectedOptions: [
            { groupId: 'pizza_extras', groupName: 'Suppléments', optionId: 'extra_cheese', optionName: 'Double Mozzarella', extraPrice: 1000 }
          ],
          unitPrice: 5000,
          totalPrice: 10000
        },
        {
          cartItemId: 'item_2',
          menuItem: ALL_MENU_ITEMS.find(i => i.id === 'ch1') || ALL_MENU_ITEMS[0],
          quantity: 1,
          selectedOptions: [],
          unitPrice: 3000,
          totalPrice: 3000
        }
      ],
      subtotal: 13000,
      deliveryFee: 1000,
      deliveryZone: {
        id: 'bingerville_centre',
        name: 'Bingerville Centre / Cité Addoha',
        description: 'Livraison express moto à Bingerville',
        fee: 1000,
        estimatedMinutes: '25-35 min'
      },
      discountAmount: 0,
      vatAmount: 2340,
      tipAmount: 500,
      cutleryNeeded: true,
      total: 14500,
      paymentMethod: 'wave_ci',
      paymentStatus: 'succeeded',
      orderStatus: 'in_delivery',
      estimatedDeliveryTime: '30-40 min',
      notes: 'Commande réglée via Wave CI'
    };

    const sampleOrder2: Order = {
      id: 'ord_init_102',
      reference: 'DG-8843',
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      customer: {
        firstName: 'Aïcha',
        lastName: 'Touré',
        email: 'aicha.toure@yahoo.fr',
        phone: '+225 05 44 99 21 00',
        address: 'Immeuble Palmier, Apt 3B',
        district: 'Riviera Palmeraie',
        landmark: 'Non loin du carrefour Guiraud',
        isBillingSameAsDelivery: true
      },
      items: [
        {
          cartItemId: 'item_3',
          menuItem: ALL_MENU_ITEMS.find(i => i.id === 'l1') || ALL_MENU_ITEMS[0], // Tchep Viande
          quantity: 2,
          selectedOptions: [],
          unitPrice: 4500,
          totalPrice: 9000
        }
      ],
      subtotal: 9000,
      deliveryFee: 2000,
      deliveryZone: {
        id: 'riviera_palmeraie',
        name: 'Riviera Palmeraie',
        description: 'Livraison secteur Cocody Est',
        fee: 2000,
        estimatedMinutes: '35-50 min'
      },
      discountAmount: 0,
      vatAmount: 1620,
      tipAmount: 0,
      cutleryNeeded: false,
      total: 11000,
      paymentMethod: 'wave_ci',
      paymentStatus: 'succeeded',
      orderStatus: 'in_kitchen',
      estimatedDeliveryTime: '40-50 min',
      notes: 'Règlement Wave CI confirmé'
    };

    saveOrder(sampleOrder1);
    saveOrder(sampleOrder2);
  }
}

// ----------------- ORDER REPOSITORY -----------------

export function saveOrder(order: Order): Order {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO orders (
      id, reference, created_at, updated_at, customer_json, items_json,
      subtotal, delivery_fee, delivery_zone_json, discount_amount, promo_code,
      vat_amount, tip_amount, cutlery_needed, total, payment_method,
      payment_status, order_status, estimated_delivery_time, stripe_pi, paypal_order_id, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    order.id,
    order.reference,
    order.createdAt,
    order.updatedAt,
    JSON.stringify(order.customer),
    JSON.stringify(order.items),
    order.subtotal,
    order.deliveryFee,
    JSON.stringify(order.deliveryZone),
    order.discountAmount,
    order.promoCode || null,
    order.vatAmount,
    order.tipAmount,
    order.cutleryNeeded ? 1 : 0,
    order.total,
    order.paymentMethod,
    order.paymentStatus,
    order.orderStatus,
    order.estimatedDeliveryTime,
    order.stripePaymentIntentId || null,
    order.paypalOrderId || null,
    order.notes || null
  );

  // Decrement inventory
  if (order.items && order.items.length > 0) {
    const updateStockStmt = db.prepare(`
      UPDATE inventory 
      SET stock_quantity = MAX(0, stock_quantity - ?),
          is_in_stock = CASE WHEN stock_quantity - ? > 0 THEN 1 ELSE 0 END
      WHERE menu_item_id = ?
    `);

    for (const item of order.items) {
      if (item.menuItem?.id) {
        try {
          updateStockStmt.run(item.quantity, item.quantity, item.menuItem.id);
        } catch (e) {
          console.error('Failed to update stock for item', item.menuItem.id, e);
        }
      }
    }
  }

  return order;
}

export function getOrderById(idOrRef: string): Order | null {
  const row = db.prepare(`
    SELECT * FROM orders WHERE id = ? OR reference = ? OR stripe_pi = ? OR paypal_order_id = ?
  `).get(idOrRef, idOrRef, idOrRef, idOrRef) as any;

  if (!row) return null;
  return mapOrderRow(row);
}

export function getAllOrders(): Order[] {
  const rows = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`).all() as any[];
  return rows.map(mapOrderRow);
}

export function updateOrderStatus(idOrRef: string, status: OrderStatus, paymentStatus?: PaymentStatus): Order | null {
  const existing = getOrderById(idOrRef);
  if (!existing) return null;

  const newUpdatedAt = new Date().toISOString();
  const newPaymentStatus = paymentStatus || existing.paymentStatus;

  db.prepare(`
    UPDATE orders 
    SET order_status = ?, payment_status = ?, updated_at = ?
    WHERE id = ? OR reference = ?
  `).run(status, newPaymentStatus, newUpdatedAt, existing.id, existing.reference);

  return getOrderById(existing.id);
}

function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    reference: row.reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: JSON.parse(row.customer_json || '{}'),
    items: JSON.parse(row.items_json || '[]'),
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    deliveryZone: JSON.parse(row.delivery_zone_json || '{}'),
    discountAmount: row.discount_amount,
    promoCode: row.promo_code || undefined,
    vatAmount: row.vat_amount,
    tipAmount: row.tip_amount,
    cutleryNeeded: Boolean(row.cutlery_needed),
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    estimatedDeliveryTime: row.estimated_delivery_time,
    stripePaymentIntentId: row.stripe_pi || undefined,
    paypalOrderId: row.paypal_order_id || undefined,
    notes: row.notes || undefined,
  };
}

// ----------------- PROMO CODES REPOSITORY -----------------

export function getPromoCode(code: string): PromoCode | null {
  const row = db.prepare(`SELECT * FROM promo_codes WHERE UPPER(code) = UPPER(?) AND is_active = 1`).get(code) as any;
  if (!row) return null;

  return {
    code: row.code,
    discountType: row.discount_type,
    value: row.value,
    minOrder: row.min_order,
    validUntil: row.valid_until,
    isActive: Boolean(row.is_active),
    description: row.description,
  };
}

export function incrementPromoUsage(code: string) {
  db.prepare(`UPDATE promo_codes SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER(?)`).run(code);
}

// ----------------- INVENTORY REPOSITORY -----------------

export function getAllInventory(): InventoryItem[] {
  const rows = db.prepare(`SELECT * FROM inventory ORDER BY name ASC`).all() as any[];
  return rows.map(r => ({
    id: r.id,
    menuItemId: r.menu_item_id,
    name: r.name,
    stockQuantity: r.stock_quantity,
    isInStock: Boolean(r.is_in_stock),
    lowStockThreshold: r.low_stock_threshold,
    category: r.category
  }));
}

export function updateStock(menuItemId: string, newStock: number): boolean {
  const stmt = db.prepare(`
    UPDATE inventory 
    SET stock_quantity = ?, is_in_stock = ?
    WHERE menu_item_id = ?
  `);
  stmt.run(newStock, newStock > 0 ? 1 : 0, menuItemId);
  return true;
}

// ----------------- RESERVATIONS REPOSITORY -----------------

export function saveReservation(data: { name: string; phone: string; date: string; time?: string; guests?: number }) {
  const id = 'res_' + Math.random().toString(36).substring(2, 9);
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO reservations (id, name, phone, date, time, guests, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `).run(id, data.name, data.phone, data.date, data.time || '20:00', data.guests || 2, createdAt);
  return { id, ...data, status: 'confirmed', createdAt };
}
