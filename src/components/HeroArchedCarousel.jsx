import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatCurrency } from '../data/config';

export default function HeroArchedCarousel({ onSelectProduct }) {
  const { products } = useProducts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(null);

  const inStockProducts = products.filter((p) => p.inStock);
  const pool = inStockProducts.length >= 3 ? inStockProducts : products;
  const displayItems = pool.slice(0, 5);

  // Preload display item images to eliminate any gray flicker
  useEffect(() => {
    displayItems.forEach((item) => {
      const src = item.images?.primary;
      if (src) {
        const img = new window.Image();
        img.src = src;
      }
    });
  }, [displayItems]);

  useEffect(() => {
    if (isPaused || displayItems.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayItems.length);
    }, 3000);
    return () => clearInterval(autoPlayRef.current);
  }, [isPaused, displayItems.length]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % displayItems.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? handleNext() : handlePrev();
    }
    touchStartX.current = null;
    setTimeout(() => setIsPaused(false), 2000);
  };

  if (!displayItems || displayItems.length === 0) return null;

  const activeItem = displayItems[activeIndex];

  return (
    <div
      style={{ position: 'relative', width: '100%', marginTop: '36px', paddingBottom: '20px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── DESKTOP: Multi-card arched fan ── */}
      <div
        className="arched-carousel-desktop"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          minHeight: '460px'
        }}
      >
        {displayItems.map((item, index) => {
          const isActive = index === activeIndex;
          const isAdjacent =
            index === (activeIndex - 1 + displayItems.length) % displayItems.length ||
            index === (activeIndex + 1) % displayItems.length;

          return (
            <motion.div
              key={item.id}
              onClick={() => {
                if (isActive) { if (onSelectProduct) onSelectProduct(item); }
                else setActiveIndex(index);
              }}
              initial={false}
              animate={{
                scale: isActive ? 1.06 : isAdjacent ? 0.94 : 0.86,
                opacity: isActive ? 1 : isAdjacent ? 0.75 : 0.4,
                y: isActive ? -8 : 0,
                zIndex: isActive ? 10 : isAdjacent ? 5 : 1
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                flex: isActive ? '0 0 290px' : '0 0 210px',
                height: isActive ? '440px' : '390px',
                borderRadius: '140px 140px 24px 24px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#141416',
                border: isActive ? '2px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isActive ? '0 24px 50px rgba(0,0,0,0.85), 0 0 30px rgba(197,168,128,0.2)' : '0 10px 25px rgba(0,0,0,0.5)',
                transition: 'border 0.3s'
              }}
            >
              <img
                src={item.images?.primary || '/assets/product-motorsport-jersey.jpg'}
                alt={item.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
                  filter: isActive ? 'brightness(0.95) contrast(1.05)' : 'brightness(0.7) contrast(1.05)',
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
              <div style={{ position: 'absolute', inset: 0, background: isActive ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)' : 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 2 }}>
                <img src="/assets/stych-monogram-white.jpg" alt="STYCH" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              </div>
              {isActive && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '28px', zIndex: 10, pointerEvents: 'none' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ pointerEvents: 'auto', background: 'rgba(10,10,14,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '10px 22px', textAlign: 'center', boxShadow: '0 16px 36px rgba(0,0,0,0.85), 0 0 20px rgba(197,168,128,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                  >
                    <span className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{formatCurrency(item.price)}</span>
                    <span style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C5A880', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>View Details</span><Eye size={11} />
                    </span>
                  </motion.div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Desktop Nav Arrows */}
        <button onClick={handlePrev} aria-label="Previous" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(18,18,22,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.7)', cursor: 'pointer' }}>
          <ArrowLeft size={17} />
        </button>
        <button onClick={handleNext} aria-label="Next" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(18,18,22,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.7)', cursor: 'pointer' }}>
          <ArrowRight size={17} />
        </button>
      </div>

      {/* ── MOBILE: Single large portrait card with swipe ── */}
      <div className="arched-carousel-mobile" style={{ display: 'none', flexDirection: 'column', alignItems: 'center' }}>
        {/* Large Portrait Card */}
        <div style={{ position: 'relative', width: '82vw', maxWidth: '320px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                height: '72vw',
                maxHeight: '400px',
                minHeight: '280px',
                borderRadius: '120px 120px 20px 20px',
                overflow: 'hidden',
                background: '#141416',
                border: '2px solid rgba(255,255,255,0.35)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 40px rgba(197,168,128,0.15)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => onSelectProduct && onSelectProduct(activeItem)}
            >
              <img
                src={activeItem?.images?.primary || '/assets/product-motorsport-jersey.jpg'}
                alt={activeItem?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.3) 100%)' }} />

              {/* Monogram */}
              <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/assets/stych-monogram-white.jpg" alt="STYCH" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </div>

              {/* Bottom Price + View Details Pill — matches desktop active card style */}
              <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,10,14,0.90)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '10px 24px', textAlign: 'center', boxShadow: '0 16px 36px rgba(0,0,0,0.85), 0 0 20px rgba(197,168,128,0.2)', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', pointerEvents: 'none' }}>
                <span className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {formatCurrency(activeItem?.price)}
                </span>
                <span style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C5A880', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>View Details</span>
                  <Eye size={11} />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left / Right Tap Zones */}
          <button onClick={handlePrev} aria-label="Previous" style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(18,18,22,0.85)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNext} aria-label="Next" style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(18,18,22,0.85)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Slide Counter + Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <span style={{ fontSize: '0.7rem', color: '#71717A', fontWeight: 700, letterSpacing: '0.1em', fontVariantNumeric: 'tabular-nums' }}>
            {String(activeIndex + 1).padStart(2, '0')} / {String(displayItems.length).padStart(2, '0')}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {displayItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: i === activeIndex ? '24px' : '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  background: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  padding: 0,
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Dots */}
      <div className="arched-carousel-dots-desktop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
        {displayItems.map((_, dotIdx) => (
          <button
            key={dotIdx}
            onClick={() => setActiveIndex(dotIdx)}
            aria-label={`Slide ${dotIdx + 1}`}
            style={{
              width: dotIdx === activeIndex ? '28px' : '8px',
              height: '8px',
              borderRadius: '9999px',
              background: dotIdx === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              padding: 0, cursor: 'pointer'
            }}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .arched-carousel-desktop { display: none !important; }
          .arched-carousel-mobile { display: flex !important; }
          .arched-carousel-dots-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
