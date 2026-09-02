import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Trash2, ArrowRight, MessageCircle, Truck,
  ShieldCheck, Sparkles, Plus, Minus, ArrowLeft, Check,
  Copy, CheckCircle2, ExternalLink, PackageCheck, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { formatCurrency, generateWhatsAppOrderUrl, generateWhatsAppOrderMessage } from '../data/config';
import { supabase } from '../lib/supabase';

export default function CartPage({ setCurrentView }) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartSubtotal } = useCart();
  const { storeConfig } = useProducts();

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    state: 'Lagos',
    address: '',
    notes: ''
  });

  const [selectedShippingId, setSelectedShippingId] = useState('lagos-std');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Placed order confirmation state
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Shipping selection
  const shippingOptions = storeConfig.shippingRates || [];
  const activeShipping = shippingOptions.find((s) => s.id === selectedShippingId) || shippingOptions[0];

  // Free shipping calculation
  const isFreeShipping = cartSubtotal >= (storeConfig.freeShippingThreshold || 80000);
  const shippingCost = isFreeShipping ? 0 : activeShipping?.price || 0;
  const grandTotal = cartSubtotal + shippingCost;

  const freeShippingRemaining = Math.max(0, (storeConfig.freeShippingThreshold || 80000) - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / (storeConfig.freeShippingThreshold || 80000)) * 100);

  const handleWhatsAppCheckout = async (e) => {
    e.preventDefault();
    setFormError('');

    if (cartItems.length === 0) {
      setFormError('Your shopping bag is empty.');
      return;
    }

    if (!customer.fullName.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setFormError('Please provide your Full Name, WhatsApp Phone Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);

    // Generate unique recognizable Order Reference Code
    const referenceCode = `STYCH-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const targetWhatsapp = storeConfig.ordersWhatsappNumber || storeConfig.whatsappNumber;
    const shippingData = { ...activeShipping, price: shippingCost };

    // Construct WhatsApp message and direct URL
    const message = generateWhatsAppOrderMessage(
      cartItems,
      customer,
      grandTotal,
      shippingData,
      referenceCode
    );

    const url = generateWhatsAppOrderUrl(
      cartItems,
      {
        ...customer,
        whatsappTargetNumber: targetWhatsapp
      },
      grandTotal,
      shippingData,
      referenceCode
    );

    // 1. Zero-Lost-Orders: Persist to Supabase orders table
    try {
      const orderPayload = {
        reference_code: referenceCode,
        customer_info: {
          full_name: customer.fullName.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || null,
          address: customer.address.trim(),
          state: customer.state || 'Lagos',
          notes: customer.notes?.trim() || null
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          selectedSize: item.selectedSize,
          quantity: item.quantity,

          image: item.images?.primary || ''
        })),
        subtotal: cartSubtotal,
        shipping_fee: shippingCost,
        total_amount: grandTotal,
        shipping_method: {
          id: activeShipping.id,
          name: activeShipping.name,
          price: shippingCost
        },
        status: 'pending_payment',
        notes: customer.notes?.trim() || null
      };

      const { error: dbError } = await supabase.from('orders').insert([orderPayload]);
      if (dbError) {
        console.warn('Orders table write warning:', dbError.message);
      }
    } catch (err) {
      console.warn('Order database sync error (proceeding to WhatsApp):', err);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 75,
        origin: { y: 0.7 }
      });
    } catch (err) { }

    // Save placed order details in state
    const currentItems = [...cartItems];
    setPlacedOrder({
      referenceCode,
      items: currentItems,
      customer: { ...customer },
      grandTotal,
      shippingCost,
      activeShipping,
      whatsappUrl: url,
      orderMessage: message
    });

    // Clear cart so items don't linger
    clearCart();
    setIsSubmitting(false);
  };

  const handleCopyCode = () => {
    if (!placedOrder?.referenceCode) return;
    navigator.clipboard.writeText(placedOrder.referenceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMessage = () => {
    if (!placedOrder?.orderMessage) return;
    navigator.clipboard.writeText(placedOrder.orderMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#080808',
        paddingTop: '130px',
        paddingBottom: '100px'
      }}
    >
      {/* ── WhatsApp Redirection Polish Overlay ── */}
      {isSubmitting && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 5, 8, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            color: '#FFFFFF'
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '3px solid rgba(197, 168, 128, 0.2)',
              borderTopColor: '#C5A880',
              animation: 'spin 1s linear infinite'
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
              Creating Official STYCH Order
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A1A1AA' }}>
              Recording order reference & launching WhatsApp Concierge...
            </p>
          </div>
        </div>
      )}

      <div className="stych-container">
        {/* ── CASE 1: ORDER CONFIRMED VIEW ── */}
        {placedOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              background: 'rgba(18, 18, 22, 0.95)',
              border: '1px solid rgba(197, 168, 128, 0.35)',
              borderRadius: '28px',
              padding: '40px 32px',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(37, 211, 102, 0.15)',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#25D366',
                margin: '0 auto 20px'
              }}
            >
              <PackageCheck size={32} />
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#C5A880',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Order Logged & Created
            </span>

            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: '10px'
              }}
            >
              Thank You, {placedOrder.customer.fullName}!
            </h1>

            <p style={{ color: '#A1A1AA', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '28px' }}>
              Your order record is secured. To complete payment and receive your bank transfer invoice, continue on WhatsApp.
            </p>

            {/* Reference Code Box */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Order Reference Code
                </span>
                <p className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C5A880', marginTop: '2px' }}>
                  #{placedOrder.referenceCode}
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  background: copiedCode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: copiedCode ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: copiedCode ? '#10B981' : '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <a
                href={placedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#25D366',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={20} />
                <span>Open WhatsApp to Finalize Payment</span>
                <ExternalLink size={16} />
              </a>

              <button
                onClick={handleCopyMessage}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: copiedText ? '#10B981' : '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copiedText ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedText ? 'Order Text Copied to Clipboard!' : 'Copy Full Order Text (Fallback)'}</span>
              </button>
            </div>

            {/* Summary Breakdown */}
            <div
              style={{
                textAlign: 'left',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.88rem',
                color: '#A1A1AA'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Destination:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{placedOrder.customer.address}, {placedOrder.customer.state}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Option:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{placedOrder.activeShipping.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Total Amount:</span>
                <span className="font-display" style={{ fontWeight: 800, color: '#C5A880', fontSize: '1.25rem' }}>
                  {formatCurrency(placedOrder.grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPlacedOrder(null);
                setCurrentView('store');
              }}
              style={{
                marginTop: '32px',
                background: 'transparent',
                border: 'none',
                color: '#71717A',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
            >
              ← Back to Storefront
            </button>
          </motion.div>
        ) : cartItems.length > 0 ? (
          /* ── CASE 2: ACTIVE SHOPPING BAG VIEW ── */
          <div>
            {/* Cart Page Title */}
            <div style={{ marginBottom: '36px' }}>
              <button
                onClick={() => setCurrentView('store')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#A1A1AA',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  background: 'transparent',
                  marginBottom: '16px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
              >
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </button>

              <h1
                className="font-display tracking-tight-display"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                  fontWeight: 800,
                  color: '#FFFFFF'
                }}
              >
                Your Shopping Bag
              </h1>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '40px',
                alignItems: 'start'
              }}
            >
              {/* Left Column: Cart Items List */}
              <div>
                {/* Free Shipping Progress Bar */}
                <div
                  style={{
                    background: 'rgba(18, 18, 22, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '24px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={16} color="#C5A880" />
                      <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {isFreeShipping ? '🎉 You have unlocked Free Shipping!' : `Add ${formatCurrency(freeShippingRemaining)} more for Free Shipping`}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#A1A1AA', fontWeight: 600 }}>
                      {Math.round(freeShippingProgress)}%
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.6 }}
                      style={{
                        height: '100%',
                        background: isFreeShipping ? '#10B981' : '#C5A880',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cartItems.map((item) => (
                    <motion.div
                      layout
                      key={`${item.id}-${item.selectedSize}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        background: 'rgba(18, 18, 22, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '18px',
                        display: 'flex',
                        gap: '18px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: '84px',
                          height: '104px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: '#1F1F24',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={item.images?.primary || '/assets/product-motorsport-jersey.jpg'}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <h3
                              style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                marginBottom: '4px',
                                lineHeight: 1.3
                              }}
                            >
                              {item.name}
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#D4D4D8'
                                }}
                              >
                                Size: {item.selectedSize}
                              </span>

                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            style={{
                              color: '#71717A',
                              padding: '6px',
                              background: 'transparent',
                              borderRadius: '6px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '16px'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '2px'
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                              style={{ width: '28px', height: '28px', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Minus size={13} />
                            </button>
                            <span style={{ width: '26px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedSize, Math.min(item.stockQuantity ?? 0, item.quantity + 1))}
                              style={{ width: '28px', height: '28px', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column: Order Summary & WhatsApp Delivery Form */}
              <div
                style={{
                  background: 'rgba(18, 18, 22, 0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '24px',
                  padding: '30px 26px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}
              >
                <h2
                  className="font-display"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    marginBottom: '20px'
                  }}
                >
                  Order Summary & Checkout
                </h2>

                {/* Financial Calculation Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA', fontSize: '0.9rem' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatCurrency(cartSubtotal)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A1A1AA', fontSize: '0.9rem' }}>
                    <span>Shipping</span>
                    <span style={{ color: isFreeShipping ? '#10B981' : '#FFFFFF', fontWeight: 600 }}>
                      {isFreeShipping ? 'FREE' : formatCurrency(shippingCost)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '1.1rem'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Total Due</span>
                    <span className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C5A880' }}>
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Delivery Info Form */}
                <form onSubmit={handleWhatsAppCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Shipping Method Selector */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                      Select Delivery Option
                    </label>
                    <select
                      value={selectedShippingId}
                      onChange={(e) => setSelectedShippingId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      {shippingOptions.map((opt) => (
                        <option key={opt.id} value={opt.id} style={{ background: '#141418' }}>
                          {opt.name} — {isFreeShipping && opt.price > 0 ? 'FREE' : formatCurrency(opt.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde Adeleke"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A', display: 'block', marginBottom: '6px' }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                      Delivery Address & City *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. House 14, Admiralty Way, Lekki Phase 1, Lagos"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717A', display: 'block', marginBottom: '6px' }}>
                      Special Instructions / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call when outside"
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {formError && (
                    <p style={{ color: '#EF4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} />
                      <span>{formError}</span>
                    </p>
                  )}

                  {/* 1-Click WhatsApp Direct Order Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      borderRadius: '14px',
                      background: '#25D366',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.96rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginTop: '8px',
                      boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <MessageCircle size={20} />
                    <span>{isSubmitting ? 'Securing Order Record...' : 'Confirm Order via WhatsApp'}</span>
                  </motion.button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#71717A', marginTop: '16px' }}>
                  🔒 Zero-lost order security. Instant order reference & payment details sent directly to your WhatsApp.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── CASE 3: EMPTY BAG STATE ── */
          <div
            style={{
              textAlign: 'center',
              padding: '100px 20px',
              background: 'rgba(18, 18, 22, 0.6)',
              borderRadius: '28px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: '#71717A'
              }}
            >
              <ShoppingBag size={28} />
            </div>

            <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
              Your bag is currently empty
            </h2>

            <p style={{ color: '#A1A1AA', fontSize: '0.95rem', marginBottom: '28px' }}>
              Explore the latest heavyweight drops and add your favorite pieces.
            </p>

            <button
              onClick={() => setCurrentView('store')}
              className="btn-primary"
              style={{ padding: '16px 36px' }}
            >
              <span>Explore The Drops</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
