import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { CATEGORIES } from '../data/initialProducts';

export default function StorePage({ onQuickView }) {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      const params = new URLSearchParams(hash.slice(queryIdx));
      const cat = params.get('category');
      if (cat && CATEGORIES.includes(cat)) return cat;
    }
    return 'All Tees';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      const params = new URLSearchParams(hash.slice(queryIdx));
      return params.get('search') || '';
    }
    return '';
  });
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Sync category and search filters from URL on hash change
  React.useEffect(() => {
    const parseUrlParams = () => {
      const hash = window.location.hash;
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.slice(queryIdx));
        const cat = params.get('category');
        const q = params.get('search');
        if (cat && CATEGORIES.includes(cat)) {
          setSelectedCategory(cat);
        }
        if (q !== null) {
          setSearchQuery(q);
        }
      }
    };

    window.addEventListener('hashchange', parseUrlParams);
    return () => window.removeEventListener('hashchange', parseUrlParams);
  }, []);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newHash = cat === 'All Tees' ? '#/store' : `#/store?category=${encodeURIComponent(cat)}`;
    setTimeout(() => {
      window.location.hash = newHash;
    }, 0);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'All Tees' || item.category === selectedCategory;

        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStock = onlyInStock ? item.inStock : true;

        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // default featured
      });
  }, [products, selectedCategory, searchQuery, sortBy, onlyInStock]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#080808',
        paddingTop: '130px',
        paddingBottom: '100px'
      }}
    >
      <div className="stych-container">
        {/* Catalog Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#C5A880',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              The Atelier Catalog
            </span>

            <h1
              className="font-display tracking-tight-display"
              style={{
                fontSize: 'clamp(1.4rem, 4.5vw, 3.4rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                marginBottom: '14px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              Heavyweight Drops & Silhouettes
            </h1>

            <p style={{ color: '#A1A1AA', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Explore our complete collection of heavyweight t-shirts, motorsport jerseys, and graphic streetwear pieces.
            </p>
          </motion.div>
        </div>

        {/* Filter & Control Hub */}
        <div
          style={{
            background: 'rgba(18, 18, 22, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '18px 20px',
            marginBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Top Bar: Category Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none'
            }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#000000' : '#A1A1AA',
                    background: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 14px rgba(255, 255, 255, 0.2)' : 'none'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Search, Sort & Stock Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
              <Search
                size={16}
                color="#71717A"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search styles, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 38px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#71717A'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Controls Right: Sort & In-Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* In-stock Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: '#D4D4D8',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  style={{ accentColor: '#C5A880', width: '16px', height: '16px' }}
                />
                <span>In-Stock Only</span>
              </label>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpDown size={14} color="#71717A" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="featured" style={{ background: '#111114' }}>Featured Drops</option>
                  <option value="price-low" style={{ background: '#111114' }}>Price: Low to High</option>
                  <option value="price-high" style={{ background: '#111114' }}>Price: High to Low</option>
                  <option value="name" style={{ background: '#111114' }}>Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.82rem', color: '#71717A', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Garment' : 'Garments'}
          </span>
        </div>

        {/* Studio Product Grid (4-Col Desktop / 2-Col Mobile) */}
        {loading ? (
          /* Loading Skeleton */
          <div className="stych-product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '14px', width: '70%', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: '12px', width: '40%', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="stych-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '24px',
              border: '1px dashed rgba(255, 255, 255, 0.15)'
            }}
          >
            <p style={{ color: '#A1A1AA', fontSize: '1.1rem', marginBottom: '16px' }}>
              No garments found matching your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Tees');
                setSearchQuery('');
                setOnlyInStock(false);
              }}
              className="btn-secondary"
              style={{ padding: '12px 24px' }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
