import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Mail, MapPin, Send, Check, Sparkles, HelpCircle } from 'lucide-react';
import { FAQS, FAQ_CATEGORIES } from '../data/faqs';
import { STORE_CONFIG } from '../data/config';
import { useProducts } from '../context/ProductContext';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

export default function FAQPage() {
  const { storeConfig } = useProducts();
  const whatsappNum = storeConfig?.conciergeWhatsappNumber || storeConfig?.whatsappNumber || STORE_CONFIG.conciergeWhatsappNumber || STORE_CONFIG.whatsappNumber;
  const supportEmail = storeConfig?.supportEmail || STORE_CONFIG.supportEmail || 'concierge@stych.store';

  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Order & Sizing Inquiry',
    message: ''
  });
  const [messageSent, setMessageSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const filteredFaqs = FAQS.filter(
    (faq) => activeCategory === 'all' || faq.category === activeCategory
  );

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase.from('inquiries').insert({
        name: contactForm.name.trim(),
        email: contactForm.email.trim() || null,
        subject: contactForm.subject,
        message: contactForm.message.trim()
      });

      if (error) throw error;

      setMessageSent(true);
      try { confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } }); } catch (err) {}

      setTimeout(() => {
        setContactForm({ name: '', email: '', subject: 'Order & Sizing Inquiry', message: '' });
        setMessageSent(false);
      }, 4000);
    } catch (err) {
      setSubmitError('Failed to send message. Please try again or reach us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
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
      <div className="stych-container">
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#C5A880',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            Client Concierge & Support
          </span>

          <h1
            className="font-display tracking-tight-display"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '14px'
            }}
          >
            Frequently Asked Questions
          </h1>

          <p style={{ color: '#A1A1AA', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to know regarding Nigerian shipping timelines, garment care, and WhatsApp order fulfillment.
          </p>
        </div>

        {/* 2-Column Layout: FAQ Accordion Left & Contact Support Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '50px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Categorized FAQ Accordion */}
          <div>
            {/* Category Filter Pills */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '24px'
              }}
            >
              {FAQ_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setExpandedIndex(0);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#000000' : '#A1A1AA',
                      border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Accordion Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredFaqs.map((faq, idx) => {
                const isOpen = expandedIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: 'rgba(18, 18, 22, 0.65)',
                      border: isOpen ? '1px solid rgba(197, 168, 128, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'border 0.2s'
                    }}
                  >
                    <button
                      onClick={() => setExpandedIndex(isOpen ? -1 : idx)}
                      style={{
                        width: '100%',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        textAlign: 'left',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '0.94rem'
                      }}
                    >
                      <span>{faq.question}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ flexShrink: 0, color: isOpen ? '#C5A880' : '#71717A' }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            padding: '0 20px 20px',
                            color: '#A1A1AA',
                            fontSize: '0.88rem',
                            lineHeight: 1.65,
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            paddingTop: '14px'
                          }}
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Contact Concierge Form */}
          <div
            style={{
              background: 'rgba(18, 18, 22, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '36px 28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HelpCircle size={16} color="#C5A880" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C5A880' }}>
                Direct Concierge
              </span>
            </div>

            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
              Need custom assistance?
            </h2>

            <p style={{ color: '#A1A1AA', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Have questions about sizing recommendations or corporate bulk orders? Send a direct message or chat with our live WhatsApp concierge.
            </p>

            {/* Instant WhatsApp Quick Button */}
            <a
              href={`https://wa.me/${whatsappNum}?text=Hello%20STYCH%2C%20I%20have%20an%20inquiry`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#25D366',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '28px',
                boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)'
              }}
            >
              <MessageCircle size={18} />
              <span>Chat Live on WhatsApp</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Or Send Email Message
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Email Support Form */}
            {messageSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <Check size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                <span>Thank you! Your message has been received. Our concierge will reply within 4 hours.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ebuka John"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ebuka@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', display: 'block', marginBottom: '6px' }}>
                    Message *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us what you need..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '14px', fontSize: '0.9rem', width: '100%', marginTop: '6px', opacity: submitting ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {submitting ? (
                    <>
                      <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2.5px solid rgba(0,0,0,0.25)', borderTopColor: '#000', animation: 'spin 0.85s linear infinite' }} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Concierge Message</span>
                    </>
                  )}
                </button>
                {submitError && (
                  <p style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginTop: '4px' }}>
                    {submitError}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
