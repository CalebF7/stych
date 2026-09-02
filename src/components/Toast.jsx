import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toast, setToast } = useCart();

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            maxWidth: '380px',
            width: 'calc(100vw - 40px)',
            background: 'rgba(18, 18, 22, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.08)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#FFFFFF'
          }}
        >
          {toast.item?.images?.primary ? (
            <img
              src={toast.item.images.primary}
              alt="Item"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#1F1F24'
              }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShoppingBag size={18} color="#FFFFFF" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A1A1AA', fontWeight: 600 }}>
                Bag Updated
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#F4F4F5', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => setToast({ visible: false, message: '', item: null })}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#71717A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
              background: 'transparent'
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
