export const STORE_CONFIG = {
  brandName: 'STYCH',
  tagline: 'BUILT FOR THE BOLD',
  subtitle: 'Luxury Heavyweight Streetwear & Precision Minimalist Apparel',
  establishedYear: '2026',
  currency: '₦',
  currencyCode: 'NGN',
  
  // Separate WhatsApp numbers for Orders and Concierge Support
  ordersWhatsappNumber: '2347035225025',
  conciergeWhatsappNumber: '2347035225025',
  whatsappNumber: '2347035225025',
  supportEmail: 'concierge@stych.store',
  
  // Delivery configuration across Nigeria
  shippingRates: [
    { id: 'lagos-std', name: 'Lagos Standard (24–48 hrs)', price: 2500, state: 'Lagos' },
    { id: 'lagos-exp', name: 'Lagos Express (Same Day)', price: 4500, state: 'Lagos' },
    { id: 'nationwide', name: 'Nationwide Delivery (Abuja, PH, Ibadan, etc. 2–4 days)', price: 5000, state: 'Other' },
    { id: 'pickup', name: 'Studio Pickup (Lekki Phase 1, Lagos)', price: 0, state: 'Pickup' }
  ],
  freeShippingThreshold: 80000,

  // Social & contact info
  socials: {
    instagram: 'https://instagram.com/stych_official',
    tiktok: 'https://www.tiktok.com/@stych.collections',
    twitter: 'https://twitter.com/stych_brand',
    email: 'concierge@stych.store',
    address: 'Lekki Phase 1, Lagos, Nigeria'
  }
};

/**
 * Format currency amount cleanly to ₦XX,XXX format
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = Number(amount) || 0;
  }
  return `₦${amount.toLocaleString('en-NG')}`;
}

/**
 * Generate formatted WhatsApp Direct Order Message Text
 */
export function generateWhatsAppOrderMessage(cartItems, customerDetails, totalAmount, shippingMethod, orderReference) {
  const itemsList = cartItems
    .map((item, idx) => `  ${idx + 1}. *${item.name}* (Size: ${item.selectedSize}) × ${item.quantity} — ${formatCurrency(item.price * item.quantity)}`)
    .join('\n');

  const refHeader = orderReference ? `\nORDER REF: *#${orderReference}*\n` : '';

  return `STYCH OFFICIAL ORDER // BUILT FOR THE BOLD
${refHeader}
Hello STYCH Concierge, I have placed an order on your website and would like to finalize payment:

ORDER ITEMS:
${itemsList}

FINANCIAL SUMMARY:
- Subtotal: ${formatCurrency(cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0))}
- Shipping (${shippingMethod?.name || 'Standard'}): ${formatCurrency(shippingMethod?.price || 0)}
- TOTAL PAYABLE: ${formatCurrency(totalAmount)}

CUSTOMER DETAILS:
- Full Name: ${customerDetails.fullName || 'Not specified'}
- Phone: ${customerDetails.phone || 'Not specified'}
- Email: ${customerDetails.email || 'Not specified'}
- Delivery Address: ${customerDetails.address || 'Not specified'}, ${customerDetails.state || 'Lagos'}
${customerDetails.notes ? `- Special Instructions: ${customerDetails.notes}\n` : ''}
Please share your verified bank account transfer details to confirm this order. Thank you.`;
}

/**
 * Generate formatted WhatsApp Direct Order URL
 */
export function generateWhatsAppOrderUrl(cartItems, customerDetails, totalAmount, shippingMethod, orderReference) {
  const number = customerDetails.whatsappTargetNumber || STORE_CONFIG.whatsappNumber;
  const cleanNumber = number.replace(/[^0-9]/g, '');
  const message = generateWhatsAppOrderMessage(cartItems, customerDetails, totalAmount, shippingMethod, orderReference);

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
