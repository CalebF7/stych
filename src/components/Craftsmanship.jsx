import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Feather, Sparkles, Scissors, CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function Craftsmanship() {
  const [activeFeature, setActiveFeature] = useState(0);

  const pillars = [
    {
      id: 0,
      icon: Layers,
      title: 'Heavyweight Fabric Density',
      spec: 'Fabric Weight & Texture',
      desc: 'Crafted from ultra-dense combed cotton and French terry interlock. Heavy enough to drape with precision without collapsing or feeling stiff.',
      highlights: ['Zero transparency', 'Substantial luxury drape', 'Premium tactile hand-feel']
    },
    {
      id: 1,
      icon: Scissors,
      title: 'Drop-Shoulder Boxy Silhouette',
      spec: 'Tailoring & Fit Architecture',
      desc: 'Relaxed shoulder seams, wider chest proportion, and a clean square hem that sits flat without bunching at the waist.',
      highlights: ['Wider streetwear chest ratio', 'Elongated sleeve break', 'Flattering unisex profile']
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: 'Double-Needle Collar Ribbing',
      spec: 'Neckline Construction',
      desc: 'Built with 1.25-inch tight 1x1 elastic ribbing and double-needle locked stitching. No bacon neck. No collar stretching. Ever.',
      highlights: ['Zero collar warping', 'Reinforced neck tape', 'Maintains crisp shape']
    },
    {
      id: 3,
      icon: Sparkles,
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
        padding: '100px 0',
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
          style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(197, 168, 128, 0.1)',
              border: '1px solid rgba(197, 168, 128, 0.25)',
              color: '#C5A880',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={13} />
            <span>Garment Engineering</span>
          </div>

          <h2
            className="font-display tracking-tight-display craftsmanship-heading"
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15,
              marginBottom: '16px'
            }}
          >
            Built heavyweight. Stitched to endure.
          </h2>

          <p style={{ color: '#A1A1AA', fontSize: '1rem', lineHeight: 1.6 }}>
            Custom-milled combed cotton. Reinforced collar ribbing. Intentional proportions built to hold their shape wash after wash.
          </p>
        </motion.div>

        {/* 4 Interactive Feature Cards Grid (Side-scrollable on mobile) */}
        <motion.div
          className="craftsmanship-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '20px'
          }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeFeature === idx;

            return (
              <motion.div
                key={item.id}
                className="craftsmanship-card"
                variants={cardVariants}
                whileHover={{ y: -6 }}
                onClick={() => setActiveFeature(idx)}
                style={{
                  background: isSelected ? 'rgba(26, 26, 32, 0.85)' : 'rgba(18, 18, 22, 0.55)',
                  backdropFilter: 'blur(16px)',
                  border: isSelected
                    ? '1px solid rgba(197, 168, 128, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '32px 26px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected
                    ? '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(197, 168, 128, 0.1)'
                    : '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Icon & Spec Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: isSelected ? 'rgba(197, 168, 128, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                      border: isSelected ? '1px solid #C5A880' : '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? '#C5A880' : '#FFFFFF',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#71717A'
                    }}
                  >
                    {item.spec}
                  </span>
                </div>

                {/* Card Title */}
                <h3
                  className="font-display"
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '12px',
                    lineHeight: 1.3
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: '#9CA3AF',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    marginBottom: '20px'
                  }}
                >
                  {item.desc}
                </p>

                {/* Highlights List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} color="#C5A880" />
                      <span style={{ fontSize: '0.8rem', color: '#D4D4D8', fontWeight: 500 }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .craftsmanship-section {
            padding: 60px 0 !important;
          }
          .craftsmanship-heading {
            font-size: clamp(1.5rem, 5.5vw, 2rem) !important;
          }
          .craftsmanship-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 16px !important;
            padding: 4px 16px 20px !important;
            margin: 0 -16px !important;
            scrollbar-width: none !important;
          }
          .craftsmanship-grid::-webkit-scrollbar {
            display: none !important;
          }
          .craftsmanship-card {
            min-width: 80vw !important;
            max-width: 80vw !important;
            flex-shrink: 0 !important;
            scroll-snap-align: center !important;
          }
        }
      `}</style>
    </section>
  );
}
