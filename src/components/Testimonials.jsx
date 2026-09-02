import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      author: 'Tobi A.',
      location: 'Victoria Island, Lagos',
      rating: 5,
      item: 'Motorsport Jersey Polo (Black/Cream)',
      content: 'The weight on this Motorsport jersey is crazy. Heavy interlock cotton that actually holds its boxy shape all day. The SS monogram on the back turns heads every time I step out.'
    },
    {
      id: 2,
      author: 'David O.',
      location: 'Maitama, Abuja',
      rating: 5,
      item: 'Pink Panther Graphic Tee (Size XL)',
      content: 'Boxy cut is spot on. Drop shoulders with wide sleeves that don\'t look sloppy. Ordered on WhatsApp, got bank details in 2 minutes, arrived in Abuja under 48 hours. 10/10.'
    },
    {
      id: 3,
      author: 'Chidera N.',
      location: 'Port Harcourt',
      rating: 5,
      item: '705 Club Minimalist Tee',
      content: 'Washed it 4 times already and zero collar warping or shrinking. The collar ribbing is thick and stays sharp. STYCH is really built different.'
    }
  ];

  const renderCard = (rev, keyPrefix = '') => (
    <div
      key={`${keyPrefix}-${rev.id}`}
      className="testimonial-card-item"
      style={{
        background: 'rgba(18, 18, 22, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '28px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '18px'
      }}
    >
      <div>
        {/* 5 Stars */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {[...Array(rev.rating)].map((_, i) => (
            <Star key={i} size={14} fill="#C5A880" color="#C5A880" />
          ))}
        </div>

        <p style={{ color: '#E4E4E7', fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '14px' }}>
          "{rev.content}"
        </p>
      </div>

      <div
        style={{
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF' }}>
              {rev.author}
            </span>
            <CheckCircle2 size={13} color="#10B981" />
          </div>
          <span style={{ fontSize: '0.72rem', color: '#71717A' }}>
            {rev.location}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.66rem',
            color: '#C5A880',
            background: 'rgba(197, 168, 128, 0.1)',
            padding: '3px 7px',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          Verified Buyer
        </span>
      </div>
    </div>
  );

  return (
    <section
      style={{
        padding: '80px 0',
        background: '#070709',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden'
      }}
    >
      <div className="stych-container">
        <motion.div
          style={{ textAlign: 'center', marginBottom: '44px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#C5A880',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            Community Proof
          </span>

          <h2
            className="font-display tracking-tight-display"
            style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontWeight: 800,
              color: '#FFFFFF'
            }}
          >
            Endorsed by the bold
          </h2>
        </motion.div>

        {/* Desktop 3-Card Grid */}
        <motion.div
          className="testimonials-desktop-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '24px'
          }}
        >
          {reviews.map((rev) => (
            <motion.div key={rev.id} variants={cardVariants}>
              {renderCard(rev, 'desktop')}
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Auto-Moving Side Scroll Track */}
        <div className="testimonials-mobile-auto-track">
          <div className="testimonials-marquee-content">
            {reviews.map((rev) => renderCard(rev, 'm1'))}
            {reviews.map((rev) => renderCard(rev, 'm2'))}
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-mobile-auto-track {
          display: none;
        }

        @media (max-width: 768px) {
          .testimonials-desktop-grid {
            display: none !important;
          }
          .testimonials-mobile-auto-track {
            display: block !important;
            overflow: hidden !important;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            margin-right: calc(-50vw + 50%);
            padding: 8px 0 16px;
            mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          }
          .testimonials-marquee-content {
            display: flex !important;
            gap: 14px;
            width: max-content;
            animation: testimonialsMarquee 22s linear infinite;
          }
          .testimonials-marquee-content:hover,
          .testimonials-marquee-content:active {
            animation-play-state: paused;
          }
          .testimonial-card-item {
            width: 78vw !important;
            max-width: 300px !important;
            flex-shrink: 0 !important;
          }
        }

        @keyframes testimonialsMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 7px));
          }
        }
      `}</style>
    </section>
  );
}
