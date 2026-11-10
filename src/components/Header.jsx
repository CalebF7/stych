import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header({ currentView, setCurrentView }) {
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'store', label: 'Store' },
    { id: 'faq', label: 'FAQ & Support' }
  ];

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: scrolled ? '10px' : '16px',
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 12px',
          pointerEvents: 'none',
          transition: 'top 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '1240px',
            borderRadius: '9999px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 10, 14, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* ── Mobile: Hamburger LEFT ── Desktop: hidden ── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: mobileMenuOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={18} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* ── Brand Logo (left on desktop, center on mobile) ── */}
          <button
            onClick={() => handleNavClick('home')}
            className="brand-logo-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <img
              src="/assets/stych-monogram-white.jpg"
              alt="STYCH Logo"
              style={{ height: '26px', width: '26px', borderRadius: '6px', objectFit: 'contain' }}
              className="navbar-brand-logo-image"
            />
            <span
              className="font-display"
              style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}
            >
              STYCH
            </span>
          </button>

          {/* ── Desktop Center Pill Nav ── */}
          <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 6px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#000000' : '#A1A1AA',
                    background: isActive ? '#FFFFFF' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(255,255,255,0.2)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s'
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Bag — always visible */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleNavClick('cart')}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currentView === 'cart' ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                color: currentView === 'cart' ? '#000000' : '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                padding: '7px 14px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={15} />
              <span>Bag</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                  style={{
                    background: currentView === 'cart' ? '#000000' : '#FFFFFF',
                    color: currentView === 'cart' ? '#FFFFFF' : '#000000',
                    width: '18px', height: '18px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, marginLeft: '2px'
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </header>

      {/* ── Mobile Full-Screen Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 997,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)'
              }}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: '72px',
                left: '12px',
                right: '12px',
                zIndex: 998,
                background: 'rgba(10, 10, 14, 0.98)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px',
                padding: '12px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.9)'
              }}
            >
              {/* Nav Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.05 }}
                    onClick={() => handleNavClick(link.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: currentView === link.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: currentView === link.id ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                      color: currentView === link.id ? '#FFFFFF' : '#A1A1AA',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={16} style={{ opacity: currentView === link.id ? 1 : 0.3 }} />
                  </motion.button>
                ))}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-owner-btn { display: flex !important; }
          .mobile-hamburger { display: none !important; }
          .brand-logo-btn { position: static; }
        }
        @media (max-width: 859px) {
          .desktop-nav { display: none !important; }
          .desktop-owner-btn { display: none !important; }
          .mobile-hamburger { display: flex !important; grid-column: 1; justify-self: start; }
          .navbar-brand-logo-image { display: none !important; }
          
          /* Centered STYCH title between hamburger and bag */
          .glass-nav {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            align-items: center !important;
            justify-content: stretch !important;
            padding: 8px 14px !important;
          }
          .brand-logo-btn {
            grid-column: 2;
            justify-self: center;
          }
          .header-right-actions {
            grid-column: 3;
            justify-self: end;
          }
        }
      `}</style>
    </>
  );
}
