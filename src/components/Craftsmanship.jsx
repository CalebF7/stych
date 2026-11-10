import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function Craftsmanship() {
  const [activeFeature, setActiveFeature] = useState(0);
  const gridRef = useRef(null);

  const handleScroll = () => {
    const el = gridRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const totalScroll = el.scrollWidth - el.clientWidth;
    if (totalScroll <= 0) return;
    const scrollFraction = el.scrollLeft / totalScroll;
    const index = Math.min(3, Math.max(0, Math.round(scrollFraction * 3)));
    if (index !== activeFeature) {
      setActiveFeature(index);
    }
  };

  const scrollToFeature = (idx) => {
    setActiveFeature(idx);
    const el = gridRef.current;
    if (!el) return;
    const card = el.children[idx];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const pillars = [
    {
      id: 0,
      title: 'Heavyweight Fabric Density',
      spec: 'Fabric Weight & Texture',
      desc: 'Crafted from ultra-dense combed cotton and French terry interlock. Heavy enough to drape with precision without collapsing or feeling stiff.',
      highlights: ['Zero transparency', 'Substantial luxury drape', 'Premium tactile hand-feel']
    },
    {
      id: 1,
      title: 'Drop-Shoulder Boxy Silhouette',
      spec: 'Tailoring & Fit Architecture',
      desc: 'Relaxed shoulder seams, wider chest proportion, and a clean square hem that sits flat without bunching at the waist.',
      highlights: ['Wider streetwear chest ratio', 'Elongated sleeve break', 'Flattering unisex profile']
    },
    {
      id: 2,
      title: 'Double-Needle Collar Ribbing',
      spec: 'Neckline Construction',
      desc: 'Built with 1.25-inch tight 1x1 elastic ribbing and double-needle locked stitching. No bacon neck. No collar stretching. Ever.',
      highlights: ['Zero collar warping', 'Reinforced neck tape', 'Maintains crisp shape']
    },
    {
      id: 3,
      title: 'Pre-Shrunk & Silicone Washed',
      spec: 'Finishing & Longevity',
      desc: 'Every piece is treated with eco-friendly silicone enzyme washing to remove loose fibers and lock in garment dimensions before it reaches you.',
      highlights: ['Zero post-wash shrinkage', 'Anti-pilling surface', 'Deep color retention']
    }
  ];

  return (
    <section
      className="craftsmanship-section"
      style={{
        padding: '96px 0',
        background: '#0B0B0E',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Interlocking SS Monogram Background Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '-5%',
          transform: 'translateY(-50%)',
          width: '500px',
          height: '500px',
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: 'url(/assets/stych-monogram-white.jpg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="stych-container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <motion.div
          style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 52px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: '9999px',
              background: 'rgba(197, 168, 128, 0.08)',
              border: '1px solid rgba(197, 168, 128, 0.22)',
              color: '#C5A880',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            Garment Engineering
          </div>

          <h2
            className="font-display tracking-tight-display craftsmanship-heading"
            style={{
              fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15,
              marginBottom: '16px'
            }}
          >
            Built heavyweight. Stitched to endure.
          </h2>

          <p style={{ color: '#A1A1AA', fontSize: '0.98rem', lineHeight: 1.6 }}>
            Custom-milled combed cotton. Reinforced collar ribbing. Intentional proportions built to hold their shape wash after wash.
          </p>
        </motion.div>

        {/* 4 Feature Cards Grid — Clean 4-Column Desktop, 2-Col Tablet, Horizontal Snap on Mobile */}
        <motion.div
          ref={gridRef}
          onScroll={handleScroll}
          className="craftsmanship-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {pillars.map((item, idx) => {
            const isSelected = activeFeature === idx;

            return (
              <motion.div
                key={item.id}
                className="craftsmanship-card"
                variants={cardVariants}
                whileHover={{ y: -4 }}
                onClick={() => scrollToFeature(idx)}
                style={{
                  background: isSelected ? 'rgba(26, 26, 32, 0.85)' : 'rgba(18, 18, 22, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: isSelected
                    ? '1px solid rgba(197, 168, 128, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '28px 22px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  transition: 'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
                  boxShadow: isSelected
                    ? '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(197, 168, 128, 0.1)'
                    : '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Top Kicker: Spec Tag flush left, 01-04 index flush right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    width: '100%'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: isSelected ? '#C5A880' : '#8E8E93',
                      textAlign: 'left'
                    }}
                  >
                    {item.spec}
                  </span>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      fontFamily: "'Syne', sans-serif",
                      color: isSelected ? '#C5A880' : 'rgba(255, 255, 255, 0.25)'
                    }}
                  >
                    0{idx + 1}
                  </span>
                </div>

                {/* Card Title — Flush Left with shared baseline */}
                <h3
                  className="font-display craftsmanship-card-title"
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    lineHeight: 1.25,
                    textAlign: 'left'
                  }}
                >
                  {item.title}
                </h3>

                {/* Description — Flush Left */}
                <p
                  className="craftsmanship-card-desc"
                  style={{
                    color: '#9CA3AF',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}
                >
                  {item.desc}
                </p>

                {/* Highlights List — Flush Left Checkmarks & Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', textAlign: 'left' }}>
                  {item.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left' }}>
                      <CheckCircle2 size={13} color="#C5A880" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span style={{ fontSize: '0.8rem', color: '#D4D4D8', fontWeight: 500, lineHeight: 1.4, textAlign: 'left' }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile Swipe Indicators */}
        <div className="craftsmanship-mobile-dots">
          {pillars.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToFeature(idx)}
              style={{
                width: activeFeature === idx ? '22px' : '6px',
                height: '6px',
                borderRadius: '9999px',
                background: activeFeature === idx ? '#C5A880' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              aria-label={`Go to Garment Engineering slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .craftsmanship-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          width: 100%;
        }

        .craftsmanship-mobile-dots {
          display: none;
        }

        @media (min-width: 1025px) {
          .craftsmanship-card-title {
            min-height: 2.75rem;
          }
          .craftsmanship-card-desc {
            min-height: 4.6rem;
          }
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .craftsmanship-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .craftsmanship-card-title {
            min-height: auto;
          }
          .craftsmanship-card-desc {
            min-height: auto;
          }
        }

        @media (max-width: 768px) {
          .craftsmanship-section {
            padding: 56px 0 !important;
          }
          .craftsmanship-heading {
            font-size: clamp(1.4rem, 5.5vw, 1.85rem) !important;
          }
          .craftsmanship-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 14px !important;
            padding: 8px 16px 20px !important;
            margin: 0 -16px !important;
            scrollbar-width: none !important;
          }
          .craftsmanship-grid::-webkit-scrollbar {
            display: none !important;
          }
          .craftsmanship-card {
            min-width: 82vw !important;
            max-width: 320px !important;
            flex-shrink: 0 !important;
            scroll-snap-align: center !important;
            padding: 24px 20px !important;
          }
          .craftsmanship-card-title {
            min-height: auto;
            font-size: 1.12rem !important;
          }
          .craftsmanship-card-desc {
            min-height: auto;
            font-size: 0.82rem !important;
          }
          .craftsmanship-mobile-dots {
            display: flex !important;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
          }
        }
      `}</style>
    </section>
  );
}
