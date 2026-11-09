import React, { useState, useEffect } from 'react';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ProductModal from './components/ProductModal';

// Pages
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CartPage from './pages/CartPage';
import FAQPage from './pages/FAQPage';
import AdminPage from './pages/AdminPage';
function AppContent() {
  const [currentView, setCurrentView] = useState(() => {
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
    const hash = window.location.hash.replace(/^#\/?/, '');
    const cleanHash = hash.split('?')[0];
    const baseView = cleanHash.split('/')[0];

    // If launched from home screen standalone PWA without explicit customer view, default to admin
    if (isStandalone && (!baseView || baseView === 'home')) {
      return 'admin';
    }

    const validViews = ['home', 'store', 'story', 'faq', 'cart', 'admin'];
    return validViews.includes(baseView) ? baseView : 'home';
  });
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Parse hash on load and popstate/hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '');
      const cleanHash = currentHash.split('?')[0];
      const parts = cleanHash.split('/');
      const view = parts[0];
      const isProductOpen = parts[1] === 'product';

      const validViews = ['home', 'store', 'story', 'faq', 'cart', 'admin'];
      if (validViews.includes(view)) {
        setCurrentView(view);
        if (isProductOpen && !activeModalProduct) {
          const queryString = currentHash.includes('?') ? `?${currentHash.split('?')[1]}` : '';
          window.location.hash = `#/${view}${queryString}`;
        } else if (!isProductOpen && activeModalProduct) {
          setActiveModalProduct(null);
        }
      } else if (!window.location.hash) {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) {
          window.location.hash = '#/admin';
        } else {
          window.location.hash = '#/home';
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeModalProduct]);

  // Sync state changes to browser URL hash & remember admin PWA target
  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#\/?/, '');
    const currentBaseView = currentHash.split('?')[0].split('/')[0];
    if (currentBaseView !== currentView) {
      window.location.hash = `#/${currentView}`;
    }
    if (currentView === 'admin') {
      try { localStorage.setItem('stych_pwa_target', 'admin'); } catch (e) { }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleOpenAdmin = () => {
    setCurrentView('admin');
  };

  const handleQuickView = (product) => {
    setActiveModalProduct(product);
    window.location.hash = `#/${currentView}/product`;
  };

  const handleCloseModal = () => {
    setActiveModalProduct(null);
    const currentHash = window.location.hash.replace(/^#\/?/, '');
    if (currentHash.split('/')[1] === 'product') {
      window.history.back();
    }
  };

  // Lock body scroll when product modal is open
  useEffect(() => {
    if (activeModalProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalProduct]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080808' }}>
      {/* 1. Frosted Glass Floating Navbar */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          openAdminLogin={handleOpenAdmin}
        />
      )}

      {/* 2. Dynamic View Content */}
      <div style={{ flex: 1 }}>
        {currentView === 'home' && (
          <HomePage
            setCurrentView={setCurrentView}
            onQuickView={handleQuickView}
          />
        )}

        {currentView === 'store' && (
          <StorePage
            onQuickView={handleQuickView}
          />
        )}

        {currentView === 'story' && (
          <div style={{ paddingTop: '100px' }}>
            <HomePage
              setCurrentView={setCurrentView}
              onQuickView={handleQuickView}
            />
          </div>
        )}

        {currentView === 'cart' && (
          <CartPage
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'faq' && (
          <FAQPage />
        )}

        {currentView === 'admin' && (
          <AdminPage
            setCurrentView={setCurrentView}
          />
        )}
      </div>

      {/* 3. Global Luxury Brand Footer */}
      {currentView !== 'admin' && (
        <Footer setCurrentView={setCurrentView} />
      )}

      {/* 4. Global Quick View Product Modal */}
      {activeModalProduct && (
        <ProductModal
          product={activeModalProduct}
          onClose={handleCloseModal}
        />
      )}

      {/* 5. Global Cart Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ProductProvider>
  );
}
