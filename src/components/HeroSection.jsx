import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Truck } from 'lucide-react';
import HeroArchedCarousel from './HeroArchedCarousel';

export default function HeroSection({ onShopClick, onExploreClick, onSelectProduct }) {
  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: '130px',
        paddingBottom: '60px',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(55, 55, 65, 0.45), rgba(8, 8, 8, 1) 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      {/* Background Subtle Luxury Grid Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(197, 168, 128, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}
      />

      <div className="stych-container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Minimalist Glowing Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-flex', marginBottom: '24px' }}
        >
          <div
            className="glass-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              color: '#F4F4F5',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(197, 168, 128, 0.15)'
            }}
          >
            <span>Built For The Bold</span>
          </div>
        </motion.div>

        {/* Editorial Statement Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display tracking-tight-display hero-main-heading"
          style={{
            fontSize: 'clamp(1.5rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#FFFFFF',
            maxWidth: '920px',
            margin: '0 auto 20px',
            textTransform: 'none',
            wordBreak: 'break-word'
          }}
        >
          Heavyweight Streetwear. Made in Lagos.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
            color: '#A1A1AA',
            maxWidth: '640px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}
        >
          Drop 01 is live. Oversized boxy cuts, custom-milled cotton, built to maintain structure for life.
        </motion.p>

        {/* Dual Call-to-Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hero-cta-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}
        >
          <button
            onClick={onShopClick}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '0.95rem' }}
          >
            <span>Shop The Drop</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreClick}
            className="btn-secondary"
            style={{ padding: '16px 32px', fontSize: '0.95rem' }}
          >
            <span>Explore Collection</span>
          </button>
        </motion.div>

        {/* Auto-Moving Arched Lookbook Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroArchedCarousel onSelectProduct={onSelectProduct} />
        </motion.div>

        {/* Luxury Micro-Specs Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hero-specs-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
            marginTop: '36px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717A', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <ShieldCheck size={16} color="#C5A880" />
            <span>Premium Heavyweight Cotton</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717A', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Truck size={16} color="#C5A880" />
            <span>Nationwide Nigeria Shipping</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717A', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <Zap size={16} color="#C5A880" />
            <span>Direct WhatsApp Concierge</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            padding-top: 100px !important;
            padding-bottom: 40px !important;
            min-height: auto !important;
          }
          .hero-specs-bar {
            display: none !important;
          }
          .hero-cta-row {
            gap: 10px !important;
          }
          .hero-cta-row button {
            padding: 13px 24px !important;
            font-size: 0.88rem !important;
          }
        }
      `}</style>
    </section>
  );
}
