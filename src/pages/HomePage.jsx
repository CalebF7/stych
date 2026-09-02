import React from 'react';
import HeroSection from '../components/HeroSection';
import MarqueeTicker from '../components/MarqueeTicker';
import NewArrivals from '../components/NewArrivals';
import Craftsmanship from '../components/Craftsmanship';
import BrandStory from '../components/BrandStory';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

export default function HomePage({ setCurrentView, onQuickView }) {
  const scrollToNewArrivals = () => {
    const el = document.getElementById('new-arrivals');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('store');
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#080808' }}>
      {/* 1. Dark Luxury Editorial Hero & Auto-Moving Arched Carousel */}
      <HeroSection
        onShopClick={scrollToNewArrivals}
        onExploreClick={() => setCurrentView('store')}
        onSelectProduct={onQuickView}
      />

      {/* 2. Infinite Luxury Marquee Ticker */}
      <MarqueeTicker />

      {/* 3. New Arrivals Studio Hanger Grid */}
      <NewArrivals
        onViewAllClick={() => {
          setCurrentView('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickView={onQuickView}
      />

      {/* 4. Interactive Craftsmanship & Fabric Breakdown */}
      <Craftsmanship />

      {/* 5. The STYCH Philosophy / Brand Story */}
      <BrandStory onShopClick={() => setCurrentView('store')} />

      {/* 6. Verified Customer Reviews & Community Proof */}
      <Testimonials />

      {/* 7. VIP Private Drop Access */}
      <Newsletter />
    </main>
  );
}
