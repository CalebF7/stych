import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribing(true);
    setSubError('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase() });

      // ignore unique-constraint violation — already subscribed is fine
      if (error && !error.message.toLowerCase().includes('duplicate') && !error.code?.includes('23505')) {
        throw error;
      }

      setSubscribed(true);
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      } catch (_err) { }
    } catch (_err) {
      setSubError('Something went wrong. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section
      className="newsletter-section"
      style={{
        padding: '90px 0',
        background: '#09090C',
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="stych-container">
        <div
          className="newsletter-card"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at center, rgba(30, 30, 38, 0.6) 0%, rgba(12, 12, 16, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            padding: '50px 30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div
            className="newsletter-icon"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(197, 168, 128, 0.15)',
              border: '1px solid rgba(197, 168, 128, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C5A880',
              margin: '0 auto 20px'
            }}
          >
            <Sparkles size={20} />
          </div>

          <h2
            className="font-display tracking-tight-display newsletter-heading"
            style={{
              fontSize: 'clamp(1.7rem, 3vw, 2.3rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '12px'
            }}
          >
            Unlock Private Drop Access
          </h2>

          <p className="newsletter-desc" style={{ color: '#A1A1AA', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '30px' }}>
            Get private access to Drop 02 before public release. VIP members receive early WhatsApp reservations and member-only colorways.
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <Check size={18} />
              <span>You are on the VIP Drop list. Watch your inbox!</span>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                maxWidth: '380px',
                margin: '0 auto'
              }}
            >
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                />
              </div>

              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary newsletter-btn"
                style={{ padding: '14px 36px', width: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: subscribing ? 0.75 : 1 }}
              >
                {subscribing ? (
                  <>
                    <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2.5px solid rgba(0,0,0,0.25)', borderTopColor: '#000', animation: 'spin 0.85s linear infinite' }} />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join VIP</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              {subError && (
                <p style={{ color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
                  {subError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .newsletter-section {
            padding: 36px 0 !important;
          }
          .newsletter-card {
            padding: 24px 18px !important;
            border-radius: 20px !important;
          }
          .newsletter-icon {
            width: 36px !important;
            height: 36px !important;
            margin-bottom: 12px !important;
          }
          .newsletter-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .newsletter-heading {
            font-size: clamp(1.2rem, 5.2vw, 1.45rem) !important;
            margin-bottom: 8px !important;
          }
          .newsletter-desc {
            font-size: 0.82rem !important;
            line-height: 1.45 !important;
            margin-bottom: 18px !important;
          }
          .newsletter-input {
            padding: 10px 14px !important;
            font-size: 0.82rem !important;
          }
          .newsletter-btn {
            padding: 10px 24px !important;
            font-size: 0.82rem !important;
          }
        }
      `}</style>
    </section>
  );
}
