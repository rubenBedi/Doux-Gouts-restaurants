/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { 
  saveOrder, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus, 
  getPromoCode, 
  incrementPromoUsage, 
  getAllInventory, 
  updateStock, 
  saveReservation 
} from './db';
import { sendOrderConfirmationEmail } from './email';
import { Order, PromoCode } from '../types';

export const apiRouter = Router();

// Lazy Stripe initialization to prevent crashes when STRIPE_SECRET_KEY is omitted
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

// ----------------- HEALTH CHECK -----------------
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    restaurant: 'Doux Goûts Resto',
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    time: new Date().toISOString()
  });
});

// ----------------- STRIPE PAYMENT INTENT -----------------
apiRouter.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'xof', orderReference, customerEmail, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    const stripe = getStripe();

    if (stripe) {
      const isZeroDecimal = ['xof', 'xaf', 'clp', 'jpy', 'krw'].includes(currency.toLowerCase());
      const stripeAmount = isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: currency.toLowerCase(),
        receipt_email: customerEmail,
        description: `Commande Doux Goûts Resto #${orderReference || 'DG-LIVE'}`,
        metadata: {
          orderReference: orderReference || '',
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        mode: 'live_or_test_key',
        currency,
        amount
      });
    } else {
      // Fallback simulated client secret when running without live Stripe secret
      const mockPiId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const mockSecret = `${mockPiId}_secret_${Math.random().toString(36).substring(2, 12)}`;

      return res.json({
        clientSecret: mockSecret,
        paymentIntentId: mockPiId,
        mode: 'interactive_demo_mode',
        message: 'Stripe Secret Key non configurée dans .env : Mode simulation sécurisé actif pour les tests.',
        currency,
        amount
      });
    }
  } catch (error: any) {
    console.error('Erreur création Stripe PaymentIntent:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l\'initialisation du paiement Stripe' });
  }
});

// ----------------- STRIPE WEBHOOKS -----------------
apiRouter.post('/webhooks/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  let event: any;

  if (stripe && webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // Body parsed as json
    event = req.body;
  }

  // Handle event
  switch (event?.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const orderRef = paymentIntent.metadata?.orderReference;
      if (orderRef) {
        const order = updateOrderStatus(orderRef, 'in_kitchen', 'succeeded');
        if (order) {
          await sendOrderConfirmationEmail(order);
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const orderRef = paymentIntent.metadata?.orderReference;
      if (orderRef) {
        updateOrderStatus(orderRef, 'pending', 'failed');
      }
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderRef = session.client_reference_id || session.metadata?.orderReference;
      if (orderRef) {
        const order = updateOrderStatus(orderRef, 'in_kitchen', 'succeeded');
        if (order) {
          await sendOrderConfirmationEmail(order);
        }
      }
      break;
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event?.type}`);
  }

  res.json({ received: true });
});

// ----------------- PAYPAL WEBHOOK -----------------
apiRouter.post('/webhooks/paypal', async (req: Request, res: Response) => {
  const event = req.body;
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const customId = event.resource?.custom_id;
    if (customId) {
      const order = updateOrderStatus(customId, 'in_kitchen', 'succeeded');
      if (order) {
        await sendOrderConfirmationEmail(order);
      }
    }
  }
  res.json({ received: true });
});

// ----------------- ORDERS API -----------------
apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const orderData: Partial<Order> = req.body;

    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide' });
    }
    if (!orderData.customer?.firstName || !orderData.customer?.phone) {
      return res.status(400).json({ error: 'Les coordonnées client sont incomplètes' });
    }

    const reference = orderData.reference || `DG-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const fullOrder: Order = {
      id: orderData.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reference,
      createdAt: now,
      updatedAt: now,
      customer: orderData.customer,
      items: orderData.items,
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee ?? 1000,
      deliveryZone: orderData.deliveryZone || {
        id: 'bingerville_centre',
        name: 'Bingerville',
        description: 'Livraison',
        fee: 1000,
        estimatedMinutes: '30 min'
      },
      discountAmount: orderData.discountAmount || 0,
      promoCode: orderData.promoCode,
      vatAmount: orderData.vatAmount || 0,
      tipAmount: orderData.tipAmount || 0,
      cutleryNeeded: Boolean(orderData.cutleryNeeded),
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'wave_ci',
      paymentStatus: orderData.paymentStatus || 'pending',
      orderStatus: orderData.orderStatus || 'confirmed',
      estimatedDeliveryTime: orderData.estimatedDeliveryTime || '30-45 min',
      stripePaymentIntentId: orderData.stripePaymentIntentId,
      paypalOrderId: orderData.paypalOrderId,
      notes: orderData.notes
    };

    const saved = saveOrder(fullOrder);

    // Track promo usage
    if (fullOrder.promoCode) {
      incrementPromoUsage(fullOrder.promoCode);
    }

    // Trigger confirmation email
    try {
      await sendOrderConfirmationEmail(saved);
    } catch (e) {
      console.warn('Email dispatch notice:', e);
    }

    res.status(201).json({
      success: true,
      order: saved,
      message: 'Commande enregistrée avec succès !'
    });
  } catch (error: any) {
    console.error('Erreur enregistrement commande:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  const orders = getAllOrders();
  res.json({ orders, count: orders.length });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }
  res.json({ order });
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status, paymentStatus } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Statut manquant' });
  }

  const updated = updateOrderStatus(req.params.id, status, paymentStatus);
  if (!updated) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }

  res.json({ success: true, order: updated });
});

// ----------------- PROMO CODES API -----------------
apiRouter.post('/promo/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Code promo manquant' });
  }

  const promo = getPromoCode(code);
  if (!promo) {
    return res.status(404).json({ valid: false, message: 'Code promo invalide ou expiré' });
  }

  if (subtotal < promo.minOrder) {
    return res.status(400).json({ 
      valid: false, 
      message: `Ce code nécessite un panier minimum de ${promo.minOrder.toLocaleString()} F` 
    });
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round((subtotal * promo.value) / 100);
  } else if (promo.discountType === 'fixed') {
    discount = promo.value;
  } else if (promo.discountType === 'free_shipping') {
    discount = 0; // handled on shipping fee
  }

  res.json({
    valid: true,
    promo,
    discount,
    message: `Code appliqué : ${promo.description}`
  });
});

// ----------------- INVENTORY API -----------------
apiRouter.get('/inventory', (req: Request, res: Response) => {
  const items = getAllInventory();
  res.json({ inventory: items });
});

apiRouter.patch('/inventory/:id', (req: Request, res: Response) => {
  const { stockQuantity } = req.body;
  updateStock(req.params.id, stockQuantity);
  res.json({ success: true, menuItemId: req.params.id, stockQuantity });
});

// ----------------- SUBSCRIPTIONS API -----------------
apiRouter.post('/subscriptions/subscribe', (req: Request, res: Response) => {
  const { planId, customer, paymentMethod } = req.body;
  const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  res.json({
    success: true,
    subscriptionId: subId,
    planId,
    customer,
    paymentMethod,
    status: 'active',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Abonnement Pass Gourmand activé avec succès !'
  });
});

// ----------------- MARKETING / WHATSAPP BROADCAST API -----------------
apiRouter.post('/marketing/whatsapp-broadcast', (req: Request, res: Response) => {
  const { message, recipients } = req.body;

  if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Message ou destinataires invalides.' });
  }

  // Simulated WhatsApp Cloud API / Twilio WhatsApp sender
  console.log(`[WhatsApp Broadcast] Sending to ${recipients.length} recipients: "${message.substring(0, 50)}..."`);
  
  res.json({
    success: true,
    recipientsCount: recipients.length,
    timestamp: new Date().toISOString(),
    broadcastId: `wapp_bc_${Date.now()}`,
    status: 'sent',
    message: `Diffusion WhatsApp programmée et envoyée à ${recipients.length} clients avec succès !`
  });
});

// ----------------- RESERVATIONS API -----------------
apiRouter.post('/reservations', (req: Request, res: Response) => {
  const { name, phone, date, time, guests } = req.body;
  if (!name || !phone || !date) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const reservation = saveReservation({ name, phone, date, time, guests });
  res.status(201).json({ success: true, reservation });
});
