import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { STORE_CONFIG } from '../data/config';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

// storeConfig localStorage key — used as instant cache while Supabase loads
const CONFIG_STORAGE_KEY = 'stych_store_config_v3';

// Helper to clear obsolete store config keys from previous versions
try {
  localStorage.removeItem('stych_store_config_v2');
} catch (_err) {}

// ─── Helper: map Supabase row → app product shape ───────────────────────────
function rowToProduct(row) {
  const rawQty = row.images?.stockQuantity ?? (row.stock_quantity ?? (row.stockQuantity ?? (row.in_stock ? 15 : 0)));
  const inStock = Boolean(row.in_stock) && Number(rawQty) > 0;
  const stockQty = inStock ? Number(rawQty) : 0;

  return {
    id: row.id,
    slug: row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: row.name,
    price: Number(row.price),
    description: row.description || '',
    category: row.category || '',
    badge: row.badge || '',


    stockQuantity: stockQty,
    inStock: inStock,
    isNew: row.is_new ?? false,
    isFeatured: row.is_featured ?? true,
    sizes: row.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
    images: {
      primary: row.images?.primary || '/assets/product-motorsport-jersey.jpg',
      front: row.images?.front || '',
      back: row.images?.back || '',
      ...(typeof row.images === 'object' ? row.images : {})
    },
  };
}

// ─── Helper: map app product shape → Supabase row ───────────────────────────
function productToRow(product) {
  const rawQty = Number(product.stockQuantity ?? 0);
  const inStock = Boolean(product.inStock) && rawQty > 0;
  const stockQty = inStock ? rawQty : 0;

  const imagesObj = typeof product.images === 'object' && product.images !== null
    ? { ...product.images, stockQuantity: stockQty }
    : { primary: product.images || '/assets/product-motorsport-jersey.jpg', front: '', back: '', stockQuantity: stockQty };

  return {
    slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: product.name,
    price: Number(product.price),
    description: product.description || '',
    category: product.category || '',
    badge: product.badge || '',


    in_stock: inStock,
    is_new: product.isNew ?? false,
    is_featured: product.isFeatured ?? true,
    sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
    images: imagesObj,
  };
}

function timeoutPromise(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Supabase request timed out'));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Cache key for the real product list (NOT initial products — the owner's actual catalog)
const PRODUCT_CACHE_KEY = 'stych_products_db_cache_v2';

export function ProductProvider({ children }) {
  // Initialize from the DB cache if available; otherwise show INITIAL_PRODUCTS while DB loads
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem(PRODUCT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_err) { }
    return INITIAL_PRODUCTS;
  });

  const [loading] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // Store config: initialise from localStorage cache immediately, then hydrate from Supabase
  const [storeConfig, setStoreConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...STORE_CONFIG,
          ...parsed,
          socials: {
            ...STORE_CONFIG.socials,
            ...(parsed.socials || {})
          }
        };
      }
    } catch (_err) { }
    return STORE_CONFIG;
  });

  // Persist cache locally whenever config changes
  useEffect(() => {
    try { localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(storeConfig)); } catch (_err) { }
  }, [storeConfig]);

  // Fetch live store settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'global_config')
          .single();

        if (!error && data) {
          const live = {
            ordersWhatsappNumber: data.orders_whatsapp,
            conciergeWhatsappNumber: data.concierge_whatsapp,
            whatsappNumber: data.orders_whatsapp,
            supportEmail: data.support_email,
            freeShippingThreshold: Number(data.free_shipping_threshold)
          };
          setStoreConfig(prev => ({ ...prev, ...live }));
        }
      } catch (err) {
        // Silently fall back to cached / default config
        console.warn('Could not fetch store settings:', err.message);
      }
    };
    fetchSettings();
  }, []);

  // ── Auto-sync products to localStorage cache on every change ─────────────
  // This ensures admin edits (add/update/delete) persist across page refreshes
  // even before a fresh Supabase fetch completes.
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      // Skip the initial render — we only want to cache user-triggered changes,
      // not the fallback INITIAL_PRODUCTS we loaded at startup.
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(products));
    } catch (_err) { }
  }, [products]);

  // ── Seed the database with INITIAL_PRODUCTS on first run ─────────────────
  // Defined BEFORE fetchProducts to avoid hoisting issues
  const seedDatabase = async () => {
    try {
      const rows = INITIAL_PRODUCTS.map(productToRow);
      const { data, error } = await supabase.from('products').insert(rows).select();
      if (!error && data) {
        const mapped = data.map(rowToProduct);
        setProducts(mapped);
        localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Seed failed:', err.message);
    }
  };

  // ── Fetch all products from Supabase ─────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await timeoutPromise(
        4000,
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.warn('Supabase fetch failed, showing cached/local products:', error.message);
        setDbReady(false);
      } else {
        setDbReady(true);
        if (data.length === 0) {
          await seedDatabase();
        } else {
          const mapped = data.map(rowToProduct);
          setProducts(mapped);
          // Cache the real products so next visit is instant
          try { localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(mapped)); } catch (_err) { }
        }
      }
    } catch (err) {
      console.warn('Supabase sync failed in background:', err.message || err);
      setDbReady(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // ── CRUD: Add product ─────────────────────────────────────────────────────
  const addProduct = async (productData) => {
    const rawQty = Number(productData.stockQuantity ?? 0);
    const inStock = rawQty > 0 && (productData.inStock ?? true);
    const stockQty = inStock ? rawQty : 0;

    const row = productToRow({
      ...productData,
      isNew: true,
      isFeatured: productData.isFeatured ?? true,
      inStock: inStock,
      stockQuantity: stockQty,
      sizes: productData.sizes?.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
      images: {
        primary: productData.imageUrl || productData.images?.primary || '/assets/product-motorsport-jersey.jpg',
        front: productData.secondaryImageUrl || productData.images?.front || '',
        back: productData.secondaryImageUrl || productData.images?.back || '',
        stockQuantity: stockQty
      },
    });

    if (dbReady) {
      const { data, error } = await supabase.from('products').insert([row]).select().single();
      if (!error && data) {
        const newProduct = rowToProduct(data);
        setProducts(prev => {
          const next = [newProduct, ...prev];
          try { localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(next)); } catch (_err) {}
          return next;
        });
        return newProduct;
      } else if (error) {
        console.error('Insert failed:', error.message);
      }
    }
    // Offline fallback
    const fallback = { id: `stych-${Date.now()}`, ...row, stockQuantity: stockQty, inStock: row.in_stock, isNew: row.is_new, isFeatured: row.is_featured };
    setProducts(prev => {
      const next = [fallback, ...prev];
      try { localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(next)); } catch (_err) {}
      return next;
    });
    return fallback;
  };

  // ── CRUD: Update product ──────────────────────────────────────────────────
  const updateProduct = async (id, updatedFields) => {
    let targetProduct = null;

    // Optimistic UI & localStorage cache update
    setProducts(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          targetProduct = { ...item, ...updatedFields };
          return targetProduct;
        }
        return item;
      });
      try { localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(next)); } catch (_err) {}
      return next;
    });

    if (dbReady && targetProduct) {
      const row = productToRow(targetProduct);
      // Construct partial payload using ONLY schema-valid DB columns (no unknown columns)
      const partial = {};
      if ('name' in updatedFields) partial.name = row.name;
      if ('price' in updatedFields) partial.price = row.price;
      if ('description' in updatedFields) partial.description = row.description;
      if ('category' in updatedFields) partial.category = row.category;
      if ('badge' in updatedFields) partial.badge = row.badge;

      if ('fit' in updatedFields) partial.fit = row.fit;
      if ('stockQuantity' in updatedFields || 'inStock' in updatedFields) {
        partial.in_stock = row.in_stock;
        partial.images = row.images;
      }
      if ('isNew' in updatedFields) partial.is_new = row.is_new;
      if ('isFeatured' in updatedFields) partial.is_featured = row.is_featured;
      if ('sizes' in updatedFields) partial.sizes = row.sizes;
      if ('images' in updatedFields) partial.images = row.images;

      const { error } = await supabase.from('products').update(partial).eq('id', id);
      if (error) {
        console.error('Supabase update failed:', error.message);
      }
    }
  };

  // ── CRUD: Delete product ──────────────────────────────────────────────────
  const deleteProduct = async (id) => {
    setProducts(prev => {
      const next = prev.filter(item => item.id !== id);
      try { localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(next)); } catch (_err) {}
      return next;
    });
    if (dbReady) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.error('Delete failed:', error.message);
    }
  };

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const toggleInStock = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    if (product.inStock) {
      // Toggle to Sold Out -> set inStock: false and stockQuantity: 0
      updateProduct(id, { inStock: false, stockQuantity: 0 });
    } else {
      // Toggle to In Stock -> set inStock: true. Default quantity to 15 if currently 0
      const nextStockQty = (product.stockQuantity ?? 0) <= 0 ? 15 : product.stockQuantity;
      updateProduct(id, { inStock: true, stockQuantity: nextStockQty });
    }
  };

  const toggleFeatured = (id) => {
    const product = products.find(p => p.id === id);
    if (product) updateProduct(id, { isFeatured: !product.isFeatured });
  };

  // ── Reset to defaults ─────────────────────────────────────────────────────
  const resetToDefaults = async () => {
    setStoreConfig(STORE_CONFIG);
    localStorage.removeItem(CONFIG_STORAGE_KEY);

    if (dbReady) {
      // Clear and re-seed the Supabase table
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await seedDatabase();
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  };

  const updateConfig = async (newConfig) => {
    // Optimistic local update immediately
    setStoreConfig(prev => ({ ...prev, ...newConfig }));

    // Persist to Supabase so all visitors see the new settings
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 'global_config',
          orders_whatsapp: newConfig.ordersWhatsappNumber ?? newConfig.whatsappNumber,
          concierge_whatsapp: newConfig.conciergeWhatsappNumber ?? newConfig.whatsappNumber,
          support_email: newConfig.supportEmail,
          free_shipping_threshold: newConfig.freeShippingThreshold,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) console.warn('Settings save failed:', error.message);
    } catch (err) {
      console.warn('Settings save error:', err.message);
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      dbReady,
      storeConfig,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleInStock,
      toggleFeatured,
      resetToDefaults,
      updateConfig,
      refreshProducts: fetchProducts,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components, react-refresh/only-export-components
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
