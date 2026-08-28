/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Serverless handler for Vercel / Netlify Functions: Stripe Webhook Interceptor
 */

import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  let event: any = req.body;

  if (stripeKey && webhookSecret && sig) {
    try {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Handle events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('[Serverless Webhook] Payment Intent succeeded:', paymentIntent.id, paymentIntent.metadata?.orderReference);
    // Realtime update logic & email trigger
  }

  return res.status(200).json({ received: true });
}
