import React from 'react';
import { MessageCircle, ArrowUpRight, Home } from 'lucide-react';
import { STORE_CONFIG } from '../data/config';
import { useProducts } from '../context/ProductContext';

function TikTokIcon({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export default function Footer({ setCurrentView }) {
  const { storeConfig } = useProducts();
  const whatsappNum = storeConfig?.conciergeWhatsappNumber || storeConfig?.whatsappNumber || STORE_CONFIG.conciergeWhatsappNumber || STORE_CONFIG.whatsappNumber;

  const handleNav = (viewId) => {
    window.location.hash = `#/${viewId}`;
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavCategory = (categoryName) => {
    window.location.hash = `#/store?category=${encodeURIComponent(categoryName)}`;
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: '#050507',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '80px 0 40px',
        color: '#A1A1AA',
        position: 'relative'
      }}
    >
      <div className="stych-container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '40px',
            marginBottom: '60px'
          }}
        >
          {/* Brand Info Column */}
          <div style={{ maxWidth: '340px' }}>
            <button
              onClick={() => handleNav('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left'
              }}
              title="Return to Home"
            >
              <img
                src="/assets/stych-monogram-black.jpg"
                alt="STYCH Logo Black"
                style={{
                  height: '28px',
                  width: '28px',
                  borderRadius: '6px',
                  objectFit: 'contain',
                  background: '#FFFFFF'
                }}
              />
              <span className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                STYCH
              </span>
            </button>

            <p
              className="font-display"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#C5A880',
                textTransform: 'uppercase',
                marginBottom: '14px'
              }}
            >
              Built For The Bold
            </p>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#A1A1AA', marginBottom: '24px' }}>
              Independent luxury streetwear atelier. Heavyweight cotton, precision cuts, built in Lagos for the bold.
            </p>

            {/* Direct WhatsApp Concierge Link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={`https://wa.me/${whatsappNum}?text=Hello%20STYCH%2C%20I%20have%20an%20inquiry`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(37, 211, 102, 0.12)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#25D366',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  width: 'fit-content'
                }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp Concierge</span>
              </a>

              {/* TikTok Link */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={storeConfig?.socials?.tiktok || STORE_CONFIG.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  title="Follow STYCH on TikTok"
                >
                  <TikTokIcon size={15} color="#C5A880" />
                  <span>TikTok</span>
                </a>
              </div>

              {/* Mobile Quick Action Links */}
              <div className="footer-mobile-links" style={{ marginTop: '8px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C5A880', marginBottom: '10px' }}>
                  Quick Links
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleNav('store')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Shop All Drops</span>
                    <ArrowUpRight size={13} color="#C5A880" />
                  </button>

                  <button
                    onClick={() => handleNav('faq')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Client FAQ & Sizing</span>
                    <ArrowUpRight size={13} color="#C5A880" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Link Columns (Hidden on Mobile) */}
          <div className="footer-desktop-column">
            <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>
                <button onClick={() => handleNavCategory('Motorsport Jerseys')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Motorsport Jerseys
                </button>
              </li>
              <li>
                <button onClick={() => handleNavCategory('Graphic Heavyweight')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Graphic Heavyweight Tees
                </button>
              </li>
              <li>
                <button onClick={() => handleNavCategory('Heavyweight Boxy')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Boxy Drop-Shoulder Basics
                </button>
              </li>
              <li>
                <button onClick={() => handleNavCategory('Acid Wash & Vintage')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Mineral Acid Wash
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('store')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  All Garment Drops
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Brand & Craft */}
          <div className="footer-desktop-column">
            <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Navigation & Brand
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>
                <button onClick={() => handleNav('home')} style={{ color: '#C5A880', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}>
                  <Home size={14} />
                  <span>Back to Home</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('store')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Explore Atelier Store
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('story')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  The STYCH Manifesto
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Client FAQ & Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Services */}
          <div className="footer-desktop-column">
            <h4 style={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Concierge Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>
                <button onClick={() => handleNav('cart')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  View Shopping Bag
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Shipping Across Nigeria
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  7-Day Size Exchange
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} style={{ color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                  Bank Transfer / WhatsApp Payment
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div
          className="footer-subfooter"
          style={{
            paddingTop: '30px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.8rem',
            color: '#71717A'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => handleNav('home')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
              title="Return to Home"
            >
              <img
                src="/assets/stych-monogram-white.jpg"
                alt="SS"
                style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }}
              />
            </button>
            <span>© {new Date().getFullYear()} STYCH. All rights reserved. Built for the bold.</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => handleNav('home')}
              style={{ background: 'transparent', border: 'none', color: '#C5A880', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Home
            </button>
            <span>Lagos • Abuja • Global</span>
            <span>Heavyweight Standard</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-mobile-links {
          display: none;
        }

        @media (max-width: 768px) {
          .footer-desktop-column {
            display: none !important;
          }
          .footer-mobile-links {
            display: block !important;
          }
          .footer-subfooter {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            font-size: 0.72rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
