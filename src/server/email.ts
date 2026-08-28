/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from '../types';
import { formatPrice, RESTAURANT_PHONE, RESTAURANT_ADDRESS } from '../constants';

export interface EmailDispatchResult {
  success: boolean;
  messageId: string;
  recipient: string;
  subject: string;
  sentAt: string;
}

/**
 * Sends or simulates an elegant order confirmation email to the customer
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<EmailDispatchResult> {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
        <strong>${item.quantity}x ${item.menuItem.name}</strong>
        ${item.selectedOptions?.length ? `<br/><span style="font-size: 11px; color: #777;">${item.selectedOptions.map(o => o.optionName).join(', ')}</span>` : ''}
        ${item.specialInstructions ? `<br/><span style="font-size: 11px; color: #fa8107; font-style: italic;">Note: ${item.specialInstructions}</span>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold;">
        ${formatPrice(item.totalPrice)}
      </td>
    </tr>
  `).join('');

  const emailSubject = `Confirmation de votre commande #${order.reference} | Doux Goûts Resto`;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background-color: #fa8107; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
          .content { padding: 30px; }
          .badge { display: inline-block; background: #e6f7ec; color: #027a48; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
          .totals { margin-top: 20px; border-top: 2px solid #eee; padding-top: 15px; }
          .footer { background: #111; color: #999; padding: 20px; text-align: center; font-size: 12px; }
          .button { display: inline-block; background: #fa8107; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Doux Goûts Resto</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Excellence des saveurs à Bingerville</p>
          </div>
          <div class="content">
            <span class="badge">Commande confirmée & En préparation</span>
            <h2>Merci ${order.customer.firstName} !</h2>
            <p>Nous avons bien reçu votre commande <strong>#${order.reference}</strong> d'un montant de <strong>${formatPrice(order.total)}</strong>.</p>
            <p>Notre équipe en cuisine s'active déjà pour vous régaler !</p>

            <table class="table">
              <thead>
                <tr style="background: #fafafa;">
                  <th style="padding: 10px; text-align: left;">Article</th>
                  <th style="padding: 10px; text-align: right;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>Sous-total:</span> <strong>${formatPrice(order.subtotal)}</strong>
              </p>
              ${order.discountAmount > 0 ? `
              <p style="margin: 4px 0; color: #027a48; display: flex; justify-content: space-between;">
                <span>Réduction (${order.promoCode}):</span> <strong>-${formatPrice(order.discountAmount)}</strong>
              </p>` : ''}
              <p style="margin: 4px 0; display: flex; justify-content: space-between;">
                <span>Livraison (${order.deliveryZone.name}):</span> <strong>${order.deliveryFee === 0 ? 'Offerte' : formatPrice(order.deliveryFee)}</strong>
              </p>
              <p style="margin: 8px 0; font-size: 18px; color: #fa8107; font-weight: bold; border-top: 1px dashed #ddd; padding-top: 8px; display: flex; justify-content: space-between;">
                <span>Total Payé:</span> <span>${formatPrice(order.total)}</span>
              </p>
            </div>

            <div style="background: #fdf6f0; border-left: 4px solid #fa8107; padding: 15px; border-radius: 8px; margin-top: 25px;">
              <h4 style="margin: 0 0 5px 0; color: #fa8107;">Adresse & Contact Livraison :</h4>
              <p style="margin: 0; font-size: 13px;">
                ${order.customer.address}, ${order.customer.district}<br/>
                ${order.customer.landmark ? `Repère: ${order.customer.landmark}<br/>` : ''}
                Tél : ${order.customer.phone}
              </p>
            </div>
          </div>
          <div class="footer">
            <p>${RESTAURANT_ADDRESS} | Tél: ${RESTAURANT_PHONE}</p>
            <p>© 2026 Doux Goûts Resto — Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(`[EMAIL DISPATCH] Sent confirmation email to ${order.customer.email} for order #${order.reference}`);

  return {
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(2, 11)}`,
    recipient: order.customer.email,
    subject: emailSubject,
    sentAt: new Date().toISOString()
  };
}
