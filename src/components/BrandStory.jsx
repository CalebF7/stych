import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Award, Compass, Shield } from 'lucide-react';

const sectionVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function BrandStory({ onShopClick }) {
  return (
    <section
      id="philosophy"
      className="brand-story-section"
      style={{
        padding: '110px 0',
        background: '#09090C',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        className="stych-container"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div
          className="brand-story-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '60px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Brand Manifesto */}
          <motion.div variants={fadeUp}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#D4D4D8',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}
            >
              <Award size={13} color="#C5A880" />
              <span>The STYCH Philosophy</span>
            </div>

            <h2
              className="font-display tracking-tight-display brand-story-heading"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3.2rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                marginBottom: '24px'
              }}
            >
              BUILT FOR THE BOLD.
              <br />
              <span style={{ color: '#C5A880' }}>DEFINED BY CRAFT.</span>
            </h2>

            <p
              style={{
                color: '#A1A1AA',
                fontSize: '1.02rem',
                lineHeight: 1.7,
                marginBottom: '20px'
              }}
            >
              Built in Lagos for those who demand substance over hype. Every STYCH piece is engineered around a simple rule: heavyweight density, dropped shoulder cuts, and zero fabric shrinkage. Fashion fades. Structure remains.
            </p>

            <p
              style={{
                color: '#71717A',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                marginBottom: '36px'
              }}
            >
              Every tee that leaves our studio is crafted from custom-milled cotton, pre-shrunk to lock in silhouette dimensions, and finished with double-needle collar ribbing that never loses its crisp posture.
            </p>

            {/* Stat Counters */}
            <div
              className="brand-story-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                paddingTop: '28px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '36px'
              }}
            >
              <div>
                <span className="font-display brand-story-stat-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', display: 'block' }}>
                  100%
                </span>
                <span style={{ fontSize: '0.75rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Combed Cotton
                </span>
              </div>

              <div>
                <span className="font-display brand-story-stat-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', display: 'block' }}>
                  Pre-Shrunk
                </span>
                <span style={{ fontSize: '0.75rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Zero Shrinkage
                </span>
              </div>

              <div>
                <span className="font-display brand-story-stat-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C5A880', display: 'block' }}>
                  7-Day
                </span>
                <span style={{ fontSize: '0.75rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Size Exchange
                </span>
              </div>
            </div>

            <button
              onClick={onShopClick}
              className="btn-primary"
              style={{ padding: '14px 32px' }}
            >
              <span>Shop The Collection</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right Column: Visual Frame with Monogram */}
          <motion.div
            className="brand-story-visual-card"
            variants={fadeUp}
            style={{
              position: 'relative',
              borderRadius: '28px',
              overflow: 'hidden',
              background: '#121216',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            {/* Monogram Seal Display */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(197, 168, 128, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px',
                boxShadow: '0 0 40px rgba(197, 168, 128, 0.15)'
              }}
            >
              <img
                src="/assets/stych-monogram-white.jpg"
                alt="SS Monogram"
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>

            <img
              src="/assets/stych-logo.jpg"
              alt="STYCH"
              style={{
                height: '36px',
                width: 'auto',
                objectFit: 'contain',
                marginBottom: '16px'
              }}
            />

            <p
              className="font-display"
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#C5A880',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              Built For The Bold
            </p>

            <p style={{ fontSize: '0.85rem', color: '#A1A1AA', maxWidth: '320px', lineHeight: 1.5 }}>
              Lagos Flagship Atelier • Global Streetwear Standard • Luxury Cotton
            </p>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .brand-story-section {
            padding: 60px 0 !important;
          }
          .brand-story-grid {
            gap: 36px !important;
          }
          .brand-story-heading {
            font-size: clamp(1.6rem, 6vw, 2.2rem) !important;
          }
          .brand-story-stat-num {
            font-size: 1.35rem !important;
          }
          .brand-story-stats {
            gap: 10px !important;
          }
          .brand-story-visual-card {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
