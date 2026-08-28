/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Serverless handler for Vercel / Netlify Functions: Stripe PaymentIntent
 */

import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'xof', orderReference, customerEmail } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
      const isZeroDecimal = ['xof', 'xaf', 'clp', 'jpy'].includes(currency.toLowerCase());
      const stripeAmount = isZeroDecimal ? Math.round(amount) : Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: currency.toLowerCase(),
        receipt_email: customerEmail,
        description: `Commande Doux Goûts Resto #${orderReference || 'DG-LIVE'}`,
        metadata: { orderReference: orderReference || '' },
        automatic_payment_methods: { enabled: true },
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        mode: 'live_or_test_key',
        currency,
        amount
      });
    }

    // Fallback test simulation
    const mockId = `pi_mock_${Date.now()}`;
    return res.status(200).json({
      clientSecret: `${mockId}_secret_test`,
      paymentIntentId: mockId,
      mode: 'interactive_demo_mode',
      currency,
      amount
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
