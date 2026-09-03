import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Truck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../data/config';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const dragStartY = useRef(null);

  if (!product) return null;

  const availableSizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  const uniqueImages = Array.from(
    new Set([product.images?.primary, product.images?.front].filter(Boolean))
  );

  const activeImage = uniqueImages[activeImageIndex] || uniqueImages[0];

  const handleAdd = () => {
    if (!product.inStock) return;
    addToCart(product, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  // Drag-to-close on mobile
  const handleDragStart = (e) => {
    dragStartY.current = e.touches?.[0]?.clientY ?? null;
  };
  const handleDragEnd = (e) => {
    if (dragStartY.current === null) return;
    const diff = (e.changedTouches?.[0]?.clientY ?? 0) - dragStartY.current;
    if (diff > 90) onClose();
    dragStartY.current = null;
  };

  return (
    <AnimatePresence>
      {/* ──────────── BACKDROP ──────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9989,
          background: 'rgba(5,5,8,0.82)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'
        }}
      />

      {/* ──────────── DESKTOP MODAL (centered, side-by-side) ──────────── */}
      <motion.div
        className="product-modal-desktop"
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', pointerEvents: 'none'
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            position: 'relative',
            width: '100%', maxWidth: '920px',
            maxHeight: '90vh', overflowY: 'auto',
            background: '#111114',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '28px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
            color: '#FFFFFF'
          }}
        >
          {/* Close */}
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}>
            <X size={18} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', padding: '36px' }}>
            {/* Image Column */}
            <div>
              <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '18px', overflow: 'hidden', background: '#EAEAE8', position: 'relative', marginBottom: '14px' }}>
                <img src={activeImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {product.badge && (
                  <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', color: '#C5A880', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {product.badge}
                  </span>
                )}
              </div>
              {uniqueImages.length > 1 && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {uniqueImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImageIndex(i)} style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', border: activeImageIndex === i ? '2px solid #C5A880' : '1px solid rgba(255,255,255,0.1)', background: '#1F1F24', padding: 0, cursor: 'pointer' }}>
                      <img src={img} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <ModalInfoPanel
              product={product}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              quantity={quantity}
              setQuantity={setQuantity}
              addedSuccess={addedSuccess}
              handleAdd={handleAdd}
              availableSizes={availableSizes}
            />
          </div>
        </div>
      </motion.div>

      {/* ──────────── MOBILE BOTTOM SHEET ──────────── */}
      <motion.div
        className="product-modal-mobile"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 9991,
          background: '#111114',
          borderRadius: '28px 28px 0 0',
          border: '1px solid rgba(255,255,255,0.14)',
          borderBottom: 'none',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.9)',
          color: '#FFFFFF',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'rgba(255,255,255,0.22)' }} />
        </div>

        {/* Close X */}
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={16} />
        </button>

        {/* Swipeable Image Gallery Row */}
        <div style={{ padding: '0 16px 14px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '18px', overflow: 'hidden', background: '#EAEAE8' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={activeImage}
                alt={product.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
            </AnimatePresence>

            {product.badge && (
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', color: '#C5A880', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.12)' }}>
                {product.badge}
              </span>
            )}

            {/* Prev/Next arrows on image */}
            {uniqueImages.length > 1 && (
              <>
                <button onClick={() => setActiveImageIndex(i => (i - 1 + uniqueImages.length) % uniqueImages.length)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => setActiveImageIndex(i => (i + 1) % uniqueImages.length)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={15} />
                </button>

                {/* Dot indicator */}
                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                  {uniqueImages.map((_, i) => (
                    <div key={i} style={{ width: i === activeImageIndex ? '18px' : '5px', height: '5px', borderRadius: '9999px', background: i === activeImageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)', transition: 'all 0.25s' }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '0 16px 16px', flex: 1, overflowY: 'auto' }}>
          {/* Category + Name + Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <img src="/assets/stych-monogram-white.jpg" alt="STYCH" style={{ width: '14px', height: '14px', borderRadius: '3px', objectFit: 'contain' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C5A880' }}>
              {product.category || 'STYCH Heavyweight'}
            </span>
          </div>

          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '8px' }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {formatCurrency(product.price)}
            </span>
            <span style={{ fontSize: '0.72rem', color: product.inStock ? '#10B981' : '#EF4444', fontWeight: 700 }}>
              {product.inStock ? '✓ In Stock' : '✕ Sold Out'}
            </span>
          </div>



          {/* Size Selection */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FFFFFF' }}>
              Size: <span style={{ color: '#C5A880' }}>{selectedSize}</span>
            </label>
          </div>

          {/* Size Chips — large touch targets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '18px' }}>
            {availableSizes.map(size => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    height: '48px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #C5A880' : '1px solid rgba(255,255,255,0.15)',
                    background: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#000000' : '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#71717A' }}>Qty:</span>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '2px' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>−</button>
                <span style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min((product.stockQuantity ?? 0) > 0 ? product.stockQuantity : 99, quantity + 1))} style={{ width: '40px', height: '40px', color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            {product.inStock && (product.stockQuantity ?? 0) > 0 && (
              <span style={{ fontSize: '0.72rem', color: (product.stockQuantity ?? 0) <= 5 ? '#F59E0B' : '#C5A880', fontWeight: 600 }}>
                {(product.stockQuantity ?? 0) <= 5 ? `⚡ Only ${product.stockQuantity} left!` : `${product.stockQuantity ?? 0} units available`}
              </span>
            )}
          </div>

          {/* Guarantees Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', color: '#71717A', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Truck size={13} color="#C5A880" /><span>24–48hr Dispatch</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><RefreshCw size={13} color="#C5A880" /><span>7-Day Exchange</span></div>
          </div>
        </div>

        {/* ── Sticky bottom Add to Bag bar ── */}
        <div style={{ padding: '12px 16px 28px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)', background: '#111114' }}>
          <button
            onClick={handleAdd}
            disabled={!product.inStock || (product.stockQuantity ?? 0) <= 0}
            style={{
              width: '100%',
              padding: '17px 24px',
              borderRadius: '14px',
              background: addedSuccess ? '#10B981' : (product.inStock && (product.stockQuantity ?? 0) > 0) ? '#FFFFFF' : '#3F3F46',
              color: addedSuccess ? '#FFFFFF' : (product.inStock && (product.stockQuantity ?? 0) > 0) ? '#000000' : '#A1A1AA',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: (product.inStock && (product.stockQuantity ?? 0) > 0) ? '0 8px 30px rgba(255,255,255,0.18)' : 'none',
              cursor: (product.inStock && (product.stockQuantity ?? 0) > 0) ? 'pointer' : 'not-allowed',
              border: 'none',
              transition: 'background 0.2s'
            }}
          >
            {addedSuccess ? (
              <><Check size={20} /><span>Added to Bag!</span></>
            ) : (product.inStock && (product.stockQuantity ?? 0) > 0) ? (
              <><ShoppingBag size={20} /><span>Add to Bag — {formatCurrency(product.price * quantity)}</span></>
            ) : (
              <span>Sold Out • Restock Soon</span>
            )}
          </button>
        </div>
      </motion.div>

      <style>{`
        /* Desktop: show modal, hide bottom sheet */
        .product-modal-desktop { display: flex !important; }
        .product-modal-mobile { display: none !important; }

        @media (max-width: 768px) {
          .product-modal-desktop { display: none !important; }
          .product-modal-mobile { display: flex !important; }
        }
      `}</style>
    </AnimatePresence>
  );
}

/* ── Shared info panel used by desktop modal ── */
function ModalInfoPanel({ product, selectedSize, setSelectedSize, quantity, setQuantity, addedSuccess, handleAdd, availableSizes }) {
  const stockQty = (product.stockQuantity ?? 0) > 0 ? product.stockQuantity : (product.inStock ? 99 : 0);
  const isAvailable = product.inStock && ((product.stockQuantity ?? 0) > 0 || product.inStock);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <img src="/assets/stych-monogram-white.jpg" alt="STYCH" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C5A880' }}>
            {product.category || 'STYCH Heavyweight'}
          </span>
        </div>

        <h2 className="font-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '10px' }}>
          {product.name}
        </h2>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '18px' }}>
          <span className="font-display" style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {formatCurrency(product.price)}
          </span>
          <span style={{ fontSize: '0.75rem', color: isAvailable ? (stockQty <= 5 ? '#F59E0B' : '#10B981') : '#EF4444', fontWeight: 600 }}>
            {isAvailable ? (stockQty <= 5 ? `⚡ Only ${stockQty} left in stock!` : `✓ In Stock (${stockQty} units available)`) : '✕ Sold Out • Restock Soon'}
          </span>
        </div>



        <p style={{ fontSize: '0.9rem', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
          {product.description}
        </p>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Select Size: <span style={{ color: '#C5A880' }}>{selectedSize}</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '22px' }}>
          {availableSizes.map(size => {
            const isSelected = selectedSize === size;
            return (
              <button key={size} onClick={() => setSelectedSize(size)}
                style={{ height: '46px', borderRadius: '10px', border: isSelected ? '2px solid #C5A880' : '1px solid rgba(255,255,255,0.15)', background: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.05)', color: isSelected ? '#000000' : '#FFFFFF', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                {size}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '38px', height: '38px', color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>−</button>
            <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{quantity}</span>
            <button onClick={() => setQuantity(Math.min(stockQty > 0 ? stockQty : 99, quantity + 1))} style={{ width: '38px', height: '38px', color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>+</button>
          </div>

          <button onClick={handleAdd} disabled={!isAvailable}
            style={{ flex: 1, padding: '16px 20px', fontSize: '0.92rem', fontWeight: 700, borderRadius: '12px', background: addedSuccess ? '#10B981' : isAvailable ? '#FFFFFF' : '#3F3F46', color: addedSuccess ? '#FFFFFF' : isAvailable ? '#000000' : '#A1A1AA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: isAvailable ? '0 8px 24px rgba(255,255,255,0.2)' : 'none', cursor: isAvailable ? 'pointer' : 'not-allowed', border: 'none', transition: 'background 0.2s' }}>
            {addedSuccess ? <><Check size={18} /><span>Added!</span></> : isAvailable ? <><ShoppingBag size={18} /><span>Add to Bag • {formatCurrency(product.price * quantity)}</span></> : <span>Sold Out</span>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: '#71717A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={15} color="#C5A880" /><span>24-48hr Dispatch</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={15} color="#C5A880" /><span>7-Day Exchange</span></div>
      </div>
    </div>
  );
}
