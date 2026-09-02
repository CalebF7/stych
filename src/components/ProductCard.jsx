import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { formatCurrency } from '../data/config';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState('L');

  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  const handleQuickAdd = (e, size) => {
    e.stopPropagation();
    if (!product.inStock) return;
    setSelectedSize(size);
    addToCart(product, size, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView && onQuickView(product)}
      className="stych-product-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Studio Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4',
          backgroundColor: '#EAEAE8',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isHovered
            ? '0 16px 36px rgba(0, 0, 0, 0.35)'
            : '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Product Image */}
        <img
          src={product.images?.primary || '/assets/product-motorsport-jersey.jpg'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: !product.inStock ? 'grayscale(80%) opacity(0.7)' : 'none'
          }}
        />

        {/* Top Badges (Stock & Drop Tags) */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          {product.inStock ? (
            product.badge && (
              <span
                style={{
                  background: 'rgba(10, 10, 12, 0.88)',
                  backdropFilter: 'blur(10px)',
                  color: product.badge === 'LIMITED DROP' ? '#C5A880' : '#FFFFFF',
                  fontSize: 'clamp(0.55rem, 1.8vw, 0.62rem)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                {product.badge}
              </span>
            )
          ) : (
            <span
              style={{
                background: 'rgba(5, 5, 8, 0.85)',
                backdropFilter: 'blur(10px)',
                color: '#EF4444',
                fontSize: 'clamp(0.55rem, 1.8vw, 0.62rem)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(239, 68, 68, 0.35)'
              }}
            >
              Sold Out
            </span>
          )}
        </div>

        {/* Desktop Quick Action Overlay on Hover */}
        <div
          className="desktop-quick-overlay"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '14px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 3
          }}
        >
          {/* Quick Size Selection Chips */}
          {product.inStock && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                flexWrap: 'wrap'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  title={`Quick add size ${size}`}
                  style={{
                    minWidth: '28px',
                    height: '28px',
                    padding: '0 6px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#0A0A0A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  +{size}
                </button>
              ))}
            </div>
          )}

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Eye size={12} />
            <span>View Details</span>
          </button>
        </div>

        {/* Mobile-only: permanent glass pill inside image bottom */}
        <div
          className="mobile-card-glass-pill"
          style={{
            display: 'none', /* shown via CSS on mobile */
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,10,14,0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '9999px',
            padding: '6px 16px',
            whiteSpace: 'nowrap',
            zIndex: 4,
            alignItems: 'center',
            gap: '5px',
            pointerEvents: 'none'
          }}
        >
          <Eye size={11} color="#C5A880" />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#FFFFFF' }}>View Details</span>
        </div>
      </div>

      {/* Product Details (Compact & Studio Clean) */}
      <div style={{ padding: '2px 4px' }}>
        <h3
          style={{
            fontSize: 'clamp(0.78rem, 2.5vw, 0.88rem)',
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: '-0.01em',
            lineHeight: '1.2',
            minHeight: '2.4em', // Fix grid layout by giving exactly 2 lines height
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '4px'
          }}
        >
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <span
            className="font-display"
            style={{
              fontSize: 'clamp(0.85rem, 2.8vw, 0.96rem)',
              fontWeight: 800,
              color: '#F4F4F5',
              letterSpacing: '-0.02em'
            }}
          >
            {formatCurrency(product.price)}
          </span>
        </div>

      </div>

      <style>{`
        .mobile-card-glass-pill {
          display: none !important;
        }
        @media (max-width: 768px) {
          .desktop-quick-overlay {
            display: none !important;
          }
          .mobile-card-glass-pill {
            display: flex !important;
          }
          .mobile-only-details {
            display: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
