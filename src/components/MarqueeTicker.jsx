import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export default function MarqueeTicker() {
  const tickerItems = [
    'BUILT FOR THE BOLD',
    'PREMIUM HEAVYWEIGHT COTTON',
    'DROP-SHOULDER BOXY SILHOUETTE',
    'NATIONWIDE DELIVERY IN NIGERIA',
    'LIMITED EDITION DROP 01',
    'RAW LUXURY MINIMALISM',
    'DOUBLE-STITCHED REINFORCED RIBBON',
    'STYCH COLLECTIONS'
  ];

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        background: '#0D0D10',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 0',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <div className="animate-marquee" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: idx % 2 === 0 ? '#FFFFFF' : '#A1A1AA'
              }}
            >
              {item}
            </span>
            <span
              style={{
                display: 'inline-block',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#C5A880'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
