import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function LookbookGrid({ onShopClick }) {
  const editorialShots = [
    {
      id: 1,
      image: '/assets/product-motorsport-jersey.jpg',
      title: 'Motorsport Interlock Series',
      caption: 'Lagos Island Editorial // Capsule 01',
      span: '2 / 2'
    },
    {
      id: 2,
      image: '/assets/product-pink-panther.jpg',
      title: 'Pink Panther Brush Art',
      caption: 'Graphic Heavyweight Drop',
      span: '1 / 2'
    },
    {
      id: 3,
      image: '/assets/product-motorsport-jersey.jpg',
      title: 'SS Monogram Architecture',
      caption: 'Interlocking 3D Silicone Print',
      span: '1 / 1'
    }
  ];

  return (
    <section
      style={{
        padding: '90px 0',
        background: '#070709',
        position: 'relative'
      }}
    >
      <div className="stych-container">
        {/* Section Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
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
              Editorial Lookbook
            </span>
            <h2
              className="font-display tracking-tight-display"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                color: '#FFFFFF'
              }}
            >
              Built for the streets of the world
            </h2>
          </div>

          <button
            onClick={onShopClick}
            className="btn-secondary"
            style={{ padding: '12px 24px', fontSize: '0.85rem' }}
          >
            <span>Explore All Looks</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Editorial Masonry Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}
        >
          {editorialShots.map((shot, idx) => (
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              style={{
                position: 'relative',
                height: '420px',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#141418',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <img
                src={shot.image}
                alt={shot.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.9) contrast(1.05)',
                  transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />

              {/* Gradient Scrim */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Bottom Caption Pill */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  right: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: '4px' }}>
                    {shot.caption}
                  </p>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {shot.title}
                  </h3>
                </div>

                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
