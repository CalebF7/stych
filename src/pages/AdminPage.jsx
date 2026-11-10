import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, Plus, Trash2, Edit3, Check, X, Shield, Star,
  RefreshCw, Phone, Sparkles, Image, Save,
  AlertCircle, Mail, User, KeyRound, CheckCircle2, PackageCheck,
  Copy, ChevronDown, ChevronUp, Search, Fingerprint
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatCurrency } from '../data/config';
import { CATEGORIES } from '../data/initialProducts';
import { supabase } from '../lib/supabase';
import {
  isBiometricsSupported,
  getSavedBiometricInfo,
  registerBiometrics,
  verifyBiometrics,
  removeBiometrics
} from '../lib/webauthn';

// ─── Shared Input Style ──────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  color: '#FFFFFF',
  fontSize: '0.9rem',
  outline: 'none'
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#A1A1AA',
  display: 'block',
  marginBottom: '6px'
};

// ─── Custom Branded Confirm Modal ───────────────────────────
function ConfirmModal({ message, subtext, confirmLabel, confirmColor, onConfirm, onCancel, isLoading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(16px)', padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'rgba(18, 18, 22, 0.98)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '20px',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9)'
        }}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: confirmColor === 'red' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(197, 168, 128, 0.15)',
          border: confirmColor === 'red' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(197, 168, 128, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          {confirmColor === 'red' ? (
            <Trash2 size={20} color="#EF4444" />
          ) : (
            <Lock size={20} color="#C5A880" />
          )}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>{message}</h3>
        {subtext && <p style={{ fontSize: '0.84rem', color: '#A1A1AA', marginBottom: '24px', lineHeight: 1.5 }}>{subtext}</p>}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '11px 24px', borderRadius: '9999px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem',
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1
            }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '11px 24px', borderRadius: '9999px',
              background: confirmColor === 'red' ? '#EF4444' : '#C5A880',
              color: '#000000', fontWeight: 700, fontSize: '0.85rem',
              boxShadow: confirmColor === 'red' ? '0 6px 18px rgba(239,68,68,0.35)' : '0 6px 18px rgba(197,168,128,0.35)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.75 : 1
            }}
          >
            {isLoading && <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000000', animation: 'spin 0.85s linear infinite' }} />}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Upload Slot Sub-component (must be top-level, not inside render) ────────
function UploadSlot({ slot, label, url, isUploading, onChange, onFileUpload }) {
  return (
    <div style={{ flex: 1, minWidth: '220px' }}>
      <p style={{ ...labelStyle, marginBottom: '8px' }}>{label}</p>
      <div
        style={{
          position: 'relative',
          border: `2px dashed ${isUploading ? 'rgba(197, 168, 128, 0.6)' : url ? 'rgba(16, 185, 129, 0.45)' : 'rgba(197, 168, 128, 0.35)'}`,
          borderRadius: '14px', padding: '16px', textAlign: 'center',
          background: isUploading ? 'rgba(197, 168, 128, 0.06)' : url ? 'rgba(16, 185, 129, 0.05)' : 'rgba(197, 168, 128, 0.04)',
          cursor: isUploading ? 'not-allowed' : 'pointer', minHeight: '140px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onClick={() => !isUploading && document.getElementById(`upload-${slot}`).click()}
      >
        <input
          id={`upload-${slot}`}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => onFileUpload(slot, e)}
        />

        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '3px solid rgba(197, 168, 128, 0.2)',
              borderTopColor: '#C5A880',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '0.75rem', color: '#C5A880', fontWeight: 600 }}>Uploading to Cloud...</p>
          </div>
        ) : url ? (
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(slot, ''); }}
              title="Remove image"
              style={{
                position: 'absolute', top: '-8px', right: '-8px',
                width: '26px', height: '26px', borderRadius: '50%',
                background: '#EF4444', color: '#FFFFFF', border: '2px solid #121216',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 10
              }}
            >
              <X size={14} />
            </button>
            <img
              src={url}
              alt="Preview"
              style={{ width: '84px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', boxShadow: '0 6px 14px rgba(0,0,0,0.4)' }}
            />
            <p style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>Uploaded ✓ • Tap to change</p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(197, 168, 128, 0.12)', border: '1px solid rgba(197, 168, 128, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
            }}>
              <Image size={20} color="#C5A880" />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '2px' }}>Upload Picture</p>
            <p style={{ fontSize: '0.68rem', color: '#71717A' }}>JPEG, PNG or WebP • Max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dual Image Upload Component — Supabase Storage ─────────
function DualImageUpload({ primaryUrl, secondaryUrl, onChange }) {
  const [uploading, setUploading] = useState({ primary: false, secondary: false });
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError('');
    setUploading(prev => ({ ...prev, [slot]: true }));

    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2);
      const filename = `${slot}-${ts}-${rand}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(filename, file, { cacheControl: '31536000', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      onChange(slot, urlData.publicUrl);
    } catch (err) {
      console.warn('Storage upload error:', err.message);
      setUploadError(`Storage upload failed: ${err.message || 'Please check your connection and try again'}.`);
    } finally {
      setUploading(prev => ({ ...prev, [slot]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {uploadError && (
        <p style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.25)' }}>
          ⚠ {uploadError}
        </p>
      )}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <UploadSlot slot="primary" label="Photo 1 — Main Drop (Required) *" url={primaryUrl} isUploading={uploading.primary} onChange={onChange} onFileUpload={handleFileUpload} />
        <UploadSlot slot="secondary" label="Photo 2 — Alternate Angle (Optional)" url={secondaryUrl} isUploading={uploading.secondary} onChange={onChange} onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}

// ─── Edit Product Panel ──────────────────────────────────────
function EditPanel({ product, onSave, onCancel, updateProduct }) {
  const initialStock = Boolean(product.inStock) && Number(product.stockQuantity ?? 0) > 0 ? Number(product.stockQuantity) : 0;
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price || '',
    category: product.category || 'Heavyweight Boxy',
    badge: product.badge || 'NEW DROP',

    fit: product.fit || 'Boxy Drop-Shoulder',
    description: product.description || '',
    primaryUrl: product.images?.primary || '',
    secondaryUrl: product.images?.front !== product.images?.primary ? product.images?.front : '',
    sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
    stockQuantity: initialStock,
    inStock: initialStock > 0,
    isFeatured: product.isFeatured ?? false
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleSizeToggle = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.primaryUrl) {
      setErrorMessage('Please provide at least Photo 1 (Main Drop Image).');
      return;
    }

    const stockQty = form.stockQuantity === '' ? 0 : Math.max(0, Number(form.stockQuantity ?? 0));
    const inStock = stockQty > 0;

    updateProduct(product.id, {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      badge: form.badge,

      fit: form.fit,
      description: form.description,
      sizes: form.sizes,
      stockQuantity: stockQty,
      inStock: inStock,
      isFeatured: form.isFeatured,
      images: {
        primary: form.primaryUrl,
        front: form.secondaryUrl || '',
        back: form.secondaryUrl || ''
      }
    });
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '720px', margin: '0 auto',
        background: 'rgba(18, 18, 22, 0.95)',
        border: '1px solid rgba(197, 168, 128, 0.3)',
        borderRadius: '24px', padding: '36px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C5A880' }}>Editing Garment</span>
          <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>{product.name}</h2>
        </div>
        <button onClick={onCancel} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', display: 'flex', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={labelStyle}>Product Name *</label>
          <input style={inputStyle} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Price in ₦ NGN *</label>
            <input type="number" style={inputStyle} required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Available Stock Quantity (Units) *</label>
            <input
              type="number" min="0" style={inputStyle} required
              value={form.stockQuantity}
              onChange={e => {
                const val = e.target.value === '' ? '' : (parseInt(e.target.value) || 0);
                setForm(prev => ({
                  ...prev,
                  stockQuantity: val,
                  inStock: typeof val === 'number' ? val > 0 : prev.inStock
                }));
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c !== 'All Tees').map(cat => <option key={cat} value={cat} style={{ background: '#141418' }}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Drop Badge Tag</label>
          <input type="text" placeholder="e.g. LIMITED DROP, BESTSELLER" style={inputStyle} value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
        </div>

        <div>
          <label style={labelStyle}>Garment Photos (Upload from Device)</label>
          <DualImageUpload
            primaryUrl={form.primaryUrl}
            secondaryUrl={form.secondaryUrl}
            onChange={(slot, url) => {
              setErrorMessage('');
              setForm(prev => ({
                ...prev,
                [slot === 'primary' ? 'primaryUrl' : 'secondaryUrl']: url
              }));
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Available Sizes</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
              const isChecked = form.sizes.includes(size);
              return (
                <button key={size} type="button" onClick={() => handleSizeToggle(size)}
                  style={{
                    minWidth: '46px', height: '42px', borderRadius: '8px',
                    border: isChecked ? '2px solid #C5A880' : '1px solid rgba(255,255,255,0.15)',
                    background: isChecked ? 'rgba(197,168,128,0.2)' : 'rgba(255,255,255,0.04)',
                    color: isChecked ? '#C5A880' : '#71717A', fontWeight: 700, fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}>{size}</button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description / Cut Story</label>
          <textarea rows={3} style={{ ...inputStyle, resize: 'none' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#FFFFFF', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.stockQuantity > 0}
              onChange={e => {
                const checked = e.target.checked;
                setForm(prev => ({
                  ...prev,
                  inStock: checked,
                  stockQuantity: checked ? (Number(prev.stockQuantity) > 0 ? prev.stockQuantity : 15) : 0
                }));
              }}
            />
            In Stock
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#FFFFFF', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured on Homepage
          </label>
        </div>

        {errorMessage && (
          <p style={{ color: '#EF4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
          <button type="button" onClick={onCancel}
            style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', fontSize: '0.95rem' }}>
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────
export default function AdminPage({ setCurrentView: _setCurrentView }) {
  const { products, storeConfig, addProduct, updateProduct, deleteProduct, toggleInStock, toggleFeatured, resetToDefaults, updateConfig } = useProducts();

  // Supabase Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('stych_admin_tab_authenticated') === 'true'
  );
  const [authChecking] = useState(false);

  // Auth Form State
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register' | 'check_email'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);

  // Biometrics (Face ID & Fingerprint) State
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsReason, setBiometricsReason] = useState('');
  const [savedBiometrics, setSavedBiometrics] = useState(null);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricMsg, setBiometricMsg] = useState({ text: '', type: '' });
  const [showBioPrompt, setShowBioPrompt] = useState(false);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'add' | 'inquiries' | 'subscribers' | 'settings'
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Orders State — live from Supabase
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
    } catch (err) {
      console.warn('Could not fetch orders:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
      if (error) throw error;
    } catch (err) {
      console.warn('Status update failed:', err.message);
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (err) {
      console.warn('Delete order failed:', err.message);
    }
  };

  // Inquiries State — live from Supabase
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setInquiries(data);
    } catch (err) {
      console.warn('Could not fetch inquiries:', err.message);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleDeleteInquiry = async (id) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
    try {
      await supabase.from('inquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete inquiry failed:', err.message);
    }
  };

  // VIP Subscribers State — live from Supabase
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [copiedSubscribers, setCopiedSubscribers] = useState(false);

  // Confirm modals state — declared before effects so setLockConfirm is available
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [lockConfirm, setLockConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setSubscribers(data);
    } catch (err) {
      console.warn('Could not fetch subscribers:', err.message);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const handleCopyAllSubscribers = () => {
    if (subscribers.length === 0) return;
    const emails = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedSubscribers(true);
    setTimeout(() => setCopiedSubscribers(false), 2200);
  };

  // Tab-isolated session management: state is initialized lazily above from sessionStorage.
  // This effect only listens for real-time Supabase auth events.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        sessionStorage.setItem('stych_admin_tab_authenticated', 'true');
        setIsAuthenticated(true);
        setCurrentUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('stych_admin_tab_authenticated');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize WebAuthn platform biometrics (Face ID / Fingerprint)
  useEffect(() => {
    async function initBiometrics() {
      try {
        const check = await isBiometricsSupported();
        setBiometricsAvailable(check.supported);
        if (!check.supported && check.reason) {
          setBiometricsReason(check.reason);
        }
        const saved = getSavedBiometricInfo();
        setSavedBiometrics(saved);
      } catch (err) {
        console.warn('Biometric detection error:', err);
      }
    }
    initBiometrics();
  }, []);

  // Fetch initial collections when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchOrders();
        fetchInquiries();
        fetchSubscribers();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Handle mobile browser back button while inside Admin Portal
  useEffect(() => {
    if (!isAuthenticated) return;

    window.history.pushState({ adminView: true }, '');
    const handlePopState = () => {
      setLockConfirm(true);
      window.history.pushState({ adminView: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Edit panel state
  const [editingProduct, setEditingProduct] = useState(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: 'Heavyweight Boxy', badge: 'NEW DROP',
    fit: 'Boxy Drop-Shoulder', material: '100% Heavyweight Cotton',
    description: '', primaryUrl: '', secondaryUrl: '', stockQuantity: 0,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], isFeatured: true, inStock: true
  });

  const [createErrorMessage, setCreateErrorMessage] = useState('');

  const blankNewProduct = {
    name: '', price: '', category: 'Heavyweight Boxy', badge: 'NEW DROP',
    fit: 'Boxy Drop-Shoulder', material: '100% Heavyweight Cotton',
    description: '', primaryUrl: '', secondaryUrl: '', stockQuantity: 0,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], isFeatured: true, inStock: true
  };

  // Settings form with TWO separate WhatsApp numbers + Support Email
  const [settingsForm, setSettingsForm] = useState({
    ordersWhatsappNumber: storeConfig.ordersWhatsappNumber || storeConfig.whatsappNumber || '2347035225025',
    conciergeWhatsappNumber: storeConfig.conciergeWhatsappNumber || storeConfig.whatsappNumber || '2347035225025',
    supportEmail: storeConfig.supportEmail || 'concierge@stych.store',
    freeShippingThreshold: storeConfig.freeShippingThreshold || 80000
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password change in settings
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordUpdateMsg, setPasswordUpdateMsg] = useState({ text: '', type: '' });
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Client inquiry email reply helpers
  const [replyCopiedId, setReplyCopiedId] = useState(null);

  const handleReplyEmail = (inq) => {
    if (!inq.email) return;
    try {
      navigator.clipboard.writeText(inq.email);
    } catch (_err) { }
    setReplyCopiedId(inq.id);
    setTimeout(() => setReplyCopiedId(null), 4000);

    const subject = encodeURIComponent(`STYCH Support Reply: ${inq.subject || 'Your Inquiry'}`);
    window.location.href = `mailto:${inq.email}?subject=${subject}`;
  };

  const handleCopyClientEmailOnly = (email, id) => {
    if (!email) return;
    try {
      navigator.clipboard.writeText(email);
    } catch (_err) { }
    setReplyCopiedId(id);
    setTimeout(() => setReplyCopiedId(null), 3000);
  };

  // ── Auth Handlers ──────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMessage('');
    setAuthLoading(true);

    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setAuthError('Your email address has not been confirmed yet. Please check your inbox for the activation link.');
            return;
          }
          throw error;
        }
        if (data.session) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          const saved = getSavedBiometricInfo();
          if (!saved && biometricsAvailable) {
            setShowBioPrompt(true);
          }
        }
      } else if (authMode === 'register') {
        if (authPassword !== authConfirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (authPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { full_name: authName.trim() }
          }
        });

        if (error) throw error;

        if (data.session) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
          setAuthSuccessMessage('Administrator account created and signed in successfully!');
        } else {
          setAuthMode('check_email');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
      setAuthPassword('');
      setAuthConfirmPassword('');
    }
  };

  const handleResendVerification = async () => {
    if (!authEmail.trim()) {
      setAuthError('Email address is required to resend verification link.');
      return;
    }
    setResendingEmail(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: authEmail.trim()
      });
      if (error) throw error;
      setAuthSuccessMessage('A fresh verification link has been sent to your email.');
    } catch (err) {
      setAuthError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResendingEmail(false);
    }
  };

  // ── Biometric Authentication Handlers ───────────────────────
  const handleBiometricLogin = async () => {
    setAuthError('');
    setAuthSuccessMessage('');
    setBiometricLoading(true);

    try {
      const result = await verifyBiometrics();
      if (result && result.success) {
        sessionStorage.setItem('stych_admin_tab_authenticated', 'true');
        setIsAuthenticated(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser({
            email: result.email || 'admin@stych.store',
            user_metadata: { full_name: 'Store Administrator' }
          });
        }
      }
    } catch (err) {
      console.warn('Biometric login notice:', err);
      if (err.name === 'NotAllowedError') {
        setAuthError('Face ID prompt was cancelled or timed out. Please try again or use your password.');
      } else {
        setAuthError(err.message || 'Biometric authentication was not completed.');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleRegisterBiometrics = async () => {
    setBiometricMsg({ text: '', type: '' });
    setBiometricLoading(true);

    try {
      const targetEmail = currentUser?.email || authEmail.trim() || 'admin@stych.store';
      const record = await registerBiometrics(targetEmail);
      setSavedBiometrics(record);
      setBiometricMsg({
        text: `Device biometric sensor paired successfully! Fast unlock is now active.`,
        type: 'success'
      });
      setShowBioPrompt(false);
    } catch (err) {
      console.warn('Biometric setup error:', err);
      if (err.name === 'NotAllowedError') {
        setBiometricMsg({
          text: 'Biometric authorization was cancelled.',
          type: 'error'
        });
      } else {
        setBiometricMsg({
          text: err.message || 'Could not complete biometric setup.',
          type: 'error'
        });
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleSignInWithBiometricLink = async (e) => {
    if (e) e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please fill in your admin email and password below, then click to pair Face ID.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword
      });

      if (error) throw error;

      if (data.session) {
        sessionStorage.setItem('stych_admin_tab_authenticated', 'true');
        setIsAuthenticated(true);
        setCurrentUser(data.user);

        // Immediate prompt for hardware biometric pairing
        try {
          const record = await registerBiometrics(data.user.email);
          setSavedBiometrics(record);
        } catch (bioErr) {
          console.warn('Sensor pairing cancelled or deferred:', bioErr);
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
      setAuthPassword('');
      setAuthConfirmPassword('');
    }
  };

  const handleRemoveBiometrics = () => {
    removeBiometrics();
    setSavedBiometrics(null);
    setBiometricMsg({
      text: 'Biometric authorization unlinked from this device.',
      type: 'success'
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      sessionStorage.removeItem('stych_admin_tab_authenticated');
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLockConfirm(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setAuthName('');
      setAuthError('');
      setAuthSuccessMessage('');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordUpdateMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setPasswordUpdating(true);
    setPasswordUpdateMsg({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.updateUser({ password: newPasswordInput });
      if (error) throw error;
      setPasswordUpdateMsg({ text: 'Password updated successfully!', type: 'success' });
      setNewPasswordInput('');
    } catch (err) {
      setPasswordUpdateMsg({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSizeToggle = (size) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) return;
    if (!newProduct.primaryUrl) {
      setCreateErrorMessage('Please upload Photo 1 (Main Drop Image) from your device.');
      return;
    }

    const stockQty = newProduct.stockQuantity === '' ? 0 : Number(newProduct.stockQuantity ?? 0);

    await addProduct({
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      badge: newProduct.badge,

      fit: newProduct.fit,
      material: newProduct.material,
      description: newProduct.description || 'Premium luxury heavyweight cotton crafted for the bold.',
      imageUrl: newProduct.primaryUrl,
      secondaryImageUrl: newProduct.secondaryUrl || newProduct.primaryUrl,
      sizes: newProduct.sizes,
      isFeatured: newProduct.isFeatured,
      stockQuantity: stockQty,
      inStock: stockQty > 0 && newProduct.inStock
    });

    setNewProduct(blankNewProduct);
    setCreateErrorMessage('');
    setActiveTab('inventory');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateConfig({
      ordersWhatsappNumber: settingsForm.ordersWhatsappNumber.replace(/[^0-9]/g, ''),
      conciergeWhatsappNumber: settingsForm.conciergeWhatsappNumber.replace(/[^0-9]/g, ''),
      whatsappNumber: settingsForm.ordersWhatsappNumber.replace(/[^0-9]/g, ''),
      supportEmail: settingsForm.supportEmail,
      freeShippingThreshold: Number(settingsForm.freeShippingThreshold)
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // ── Initial Loading Splash ──
  if (authChecking) {
    return (
      <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '3px solid rgba(197, 168, 128, 0.2)', borderTopColor: '#C5A880',
          animation: 'spin 1s linear infinite'
        }} />
      </main>
    );
  }

  // ── Secure Supabase Auth Portal (Sign In & Registration) ───
  if (!isAuthenticated) {
    return (
      <main
        className="admin-login-portal-wrapper"
        style={{
          minHeight: '100dvh',
          background: '#080808',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          overflowX: 'hidden',
          touchAction: 'pan-y'
        }}
      >
        <div
          className="admin-login-portal-card"
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'rgba(18, 18, 22, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            padding: '36px 26px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(197, 168, 128, 0.15)', border: '1px solid rgba(197, 168, 128, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C5A880', margin: '0 auto 20px' }}>
            {authMode === 'check_email' ? <Mail size={24} /> : <Lock size={24} />}
          </div>

          <h1 className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            {authMode === 'check_email' ? 'Confirm Your Email' : 'STYCH Owner Portal'}
          </h1>

          <p style={{ color: '#A1A1AA', fontSize: '0.82rem', marginBottom: '22px', lineHeight: 1.5 }}>
            {authMode === 'check_email'
              ? `We have dispatched an activation link to ${authEmail || 'your email'}. Please click the link in your inbox to confirm your account.`
              : authMode === 'signin'
                ? 'Secure administrator access to manage inventory, catalog drops, and store operations.'
                : 'Register your official administrator account for this store.'}
          </p>

          {/* Mode Switcher Pills */}
          {authMode !== 'check_email' ? (
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '9999px', marginBottom: '22px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                  setAuthSuccessMessage('');
                  setAuthPassword('');
                  setAuthConfirmPassword('');
                  setAuthEmail('');
                }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                  background: authMode === 'signin' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'signin' ? '#000000' : '#A1A1AA',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthSuccessMessage('');
                  setAuthPassword('');
                  setAuthConfirmPassword('');
                  setAuthEmail('');
                  setAuthName('');
                }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                  background: authMode === 'register' ? '#C5A880' : 'transparent',
                  color: authMode === 'register' ? '#000000' : '#A1A1AA',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
              >
                Create Account
              </button>
            </div>
          ) : null}

          {/* ── Check Email State Screen ── */}
          {authMode === 'check_email' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '18px', background: 'rgba(197, 168, 128, 0.08)', borderRadius: '14px', border: '1px solid rgba(197, 168, 128, 0.25)', textAlign: 'left' }}>
                <p style={{ fontSize: '0.84rem', color: '#FFFFFF', fontWeight: 600, marginBottom: '6px' }}>
                  Next Steps:
                </p>
                <ol style={{ fontSize: '0.8rem', color: '#A1A1AA', paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>Open your email inbox (and check Spam/Junk folder).</li>
                  <li>Click the <strong>"Confirm your signup"</strong> link.</li>
                  <li>Return to this page and Sign In with your password.</li>
                </ol>
              </div>

              {authSuccessMessage && (
                <p style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  <span>{authSuccessMessage}</span>
                </p>
              )}

              {authError && (
                <p style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{authError}</span>
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                  setAuthSuccessMessage('');
                  setAuthPassword('');
                  setAuthConfirmPassword('');
                  setAuthEmail('');
                }}
                className="btn-primary"
                style={{ padding: '14px', width: '100%', fontSize: '0.92rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <span>I've Confirmed, Proceed to Sign In</span>
                <Unlock size={16} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '4px', fontSize: '0.78rem' }}>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  style={{ color: '#C5A880', fontWeight: 600, background: 'transparent', cursor: 'pointer' }}
                >
                  {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          ) : (
            /* ── Sign In / Register Form ── */
            <>
              {authMode === 'signin' && savedBiometrics && (
                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={biometricLoading}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: '1px solid rgba(197, 168, 128, 0.35)',
                      color: '#D4D4D8',
                      fontWeight: 500,
                      fontSize: '0.84rem',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '9px',
                      cursor: biometricLoading ? 'wait' : 'pointer',
                      transition: 'border-color 0.18s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.6)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.35)'; }}
                  >
                    {biometricLoading ? (
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%',
                        border: '2px solid rgba(197, 168, 128, 0.25)', borderTopColor: '#C5A880',
                        animation: 'spin 0.85s linear infinite'
                      }} />
                    ) : (
                      <Fingerprint size={15} color="#C5A880" />
                    )}
                    <span>{biometricLoading ? 'Verifying...' : `Unlock with ${savedBiometrics.platform || 'Face ID'}`}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      or continue with password
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                </div>
              )}

              {authMode === 'signin' && !savedBiometrics && biometricsAvailable && (
                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleSignInWithBiometricLink}
                    disabled={authLoading || biometricLoading}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      background: 'transparent',
                      border: '1px solid rgba(197, 168, 128, 0.35)',
                      color: '#D4D4D8',
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '9px',
                      cursor: (authLoading || biometricLoading) ? 'wait' : 'pointer',
                      transition: 'border-color 0.18s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.6)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.35)'; }}
                  >
                    <Fingerprint size={15} color="#C5A880" />
                    <span>Pair Face ID / Sensor with Account</span>
                  </button>
                </div>
              )}

              {authMode === 'signin' && !biometricsAvailable && biometricsReason && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  <Fingerprint size={16} color="#71717A" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.74rem', color: '#71717A', lineHeight: 1.4, textAlign: 'left' }}>
                    {biometricsReason}
                  </span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                {authMode === 'register' && (
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="#71717A" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text" required placeholder="e.g. STYCH Atelier"
                        autoComplete="off"
                        value={authName} onChange={e => setAuthName(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '40px' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Admin Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#71717A" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email" required placeholder="admin@stych.store"
                      autoComplete="off"
                      value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} color="#71717A" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password" required placeholder="••••••••"
                      autoComplete={authMode === 'register' ? 'new-password' : 'off'}
                      value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label style={labelStyle}>Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} color="#71717A" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="password" required placeholder="••••••••"
                        autoComplete="new-password"
                        value={authConfirmPassword} onChange={e => setAuthConfirmPassword(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '40px' }}
                      />
                    </div>
                  </div>
                )}

                {authError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px' }}>
                    <p style={{ color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} />
                      <span>{authError}</span>
                    </p>
                    {authError.toLowerCase().includes('not been confirmed') && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        style={{ marginTop: '8px', color: '#C5A880', fontSize: '0.78rem', fontWeight: 700, background: 'transparent', cursor: 'pointer', textAlign: 'left', display: 'block' }}
                      >
                        {resendingEmail ? 'Sending...' : 'Click here to resend activation link ➔'}
                      </button>
                    )}
                  </div>
                )}

                {authSuccessMessage && (
                  <p style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <CheckCircle2 size={14} />
                    <span>{authSuccessMessage}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary"
                  style={{
                    padding: '14px 20px',
                    width: '100%',
                    fontSize: '0.88rem',
                    marginTop: '6px',
                    opacity: authLoading ? 0.75 : 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {authLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2.5px solid rgba(0, 0, 0, 0.25)',
                        borderTopColor: '#000000',
                        animation: 'spin 0.85s linear infinite',
                        flexShrink: 0
                      }} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {authMode === 'signin' ? 'Sign In to Portal' : 'Create Admin Account'}
                      </span>
                      <Unlock size={15} style={{ flexShrink: 0 }} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .admin-login-portal-wrapper {
              padding: 16px !important;
            }
            .admin-login-portal-card {
              padding: 28px 18px !important;
              border-radius: 20px !important;
            }
            .admin-login-portal-card input {
              font-size: 16px !important;
            }
          }
        `}</style>
      </main>
    );
  }

  // Counts & Calculations
  const inStockCount = products.filter(p => p.inStock).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending_payment').length;

  // Filtered Orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const matchesSearch =
      (order.reference_code || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (order.customer_info?.full_name || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (order.customer_info?.phone || '').includes(orderSearchQuery);
    return matchesStatus && matchesSearch;
  });

  // Filtered Subscribers
  const filteredSubscribers = subscribers.filter(sub =>
    (sub.email || '').toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  return (
    <main className="admin-dashboard-main" style={{ minHeight: '100vh', background: '#080808', paddingTop: '110px', paddingBottom: '100px' }}>
      {/* ── Custom Confirm Modals ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <ConfirmModal
            message="Remove this drop from your catalog?"
            subtext={`"${deleteConfirm.name}" will be permanently removed from your store and landing page.`}
            confirmLabel="Yes, Remove Drop"
            confirmColor="red"
            onConfirm={() => { deleteProduct(deleteConfirm.id); setDeleteConfirm(null); }}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
        {orderToDelete && (
          <ConfirmModal
            message={`Delete Order #${orderToDelete.reference_code}?`}
            subtext={`Order record for "${orderToDelete.customer_info?.full_name || 'Customer'}" will be permanently removed.`}
            confirmLabel="Yes, Delete Order"
            confirmColor="red"
            onConfirm={() => { handleDeleteOrder(orderToDelete.id); setOrderToDelete(null); }}
            onCancel={() => setOrderToDelete(null)}
          />
        )}
        {lockConfirm && (
          <ConfirmModal
            message="Sign Out & Lock Owner Portal?"
            subtext={`You will be safely signed out (${currentUser?.email || 'Admin'}). You will need your password to log in again.`}
            confirmLabel="Sign Out"
            confirmColor="gold"
            isLoading={isSigningOut}
            onConfirm={handleSignOut}
            onCancel={() => setLockConfirm(false)}
          />
        )}
        {resetConfirm && (
          <ConfirmModal
            message="Reset catalog to factory presets?"
            subtext="All added products and custom settings will be cleared and the original factory drops restored."
            confirmLabel="Yes, Factory Reset"
            confirmColor="red"
            onConfirm={() => { resetToDefaults(); setResetConfirm(false); }}
            onCancel={() => setResetConfirm(false)}
          />
        )}
        {showBioPrompt && !savedBiometrics && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(16px)', padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                background: 'rgba(18, 18, 22, 0.98)',
                border: '1px solid rgba(197, 168, 128, 0.35)',
                borderRadius: '20px',
                padding: '32px 26px',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 30px 80px rgba(0,0,0,0.9)'
              }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(197, 168, 128, 0.15)',
                border: '1px solid rgba(197, 168, 128, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#C5A880'
              }}>
                <Fingerprint size={24} />
              </div>
              <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Enable Face ID / Quick Unlock?
              </h3>
              <p style={{ color: '#A1A1AA', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '22px' }}>
                Pair this device to bypass entering your password and unlock your STYCH Owner Portal instantly with one tap.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBioPrompt(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#A1A1AA', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  onClick={handleRegisterBiometrics}
                  disabled={biometricLoading}
                  className="btn-primary"
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Fingerprint size={16} />
                  <span>{biometricLoading ? 'Pairing...' : 'Enable Now'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="stych-container">
        {/* Top Header */}
        <div className="admin-dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Shield size={16} color="#C5A880" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C5A880' }}>Owner Control Center</span>
            </div>
            <h1 className="font-display admin-page-heading" style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#FFFFFF' }}>Inventory & Operations Manager</h1>
          </div>
          <div>
            <button
              onClick={() => setLockConfirm(true)}
              style={{ padding: '10px 18px', borderRadius: '9999px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#EF4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign Out / Exit
            </button>
          </div>
        </div>

        {/* Stats Bar (2x2 on Mobile, 4-Col Desktop) */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px', marginBottom: '32px' }}>
          {/* Orders Stat Card */}
          <div
            onClick={() => setActiveTab('orders')}
            className="admin-stat-card"
            style={{
              background: 'rgba(18,18,22,0.7)',
              border: activeTab === 'orders' ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '18px',
              cursor: 'pointer',
              transition: 'border 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span className="admin-stat-label" style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Total Orders
              </span>
              {pendingOrdersCount > 0 && (
                <span className="admin-stat-badge" style={{ background: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.35)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                  {pendingOrdersCount} Pending
                </span>
              )}
            </div>
            <p className="font-display admin-stat-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3B82F6', marginTop: '4px' }}>
              {orders.length}
            </p>
          </div>

          {/* In Stock Card */}
          <div
            className="admin-stat-card"
            style={{
              background: 'rgba(18,18,22,0.7)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <span className="admin-stat-label" style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              In-Stock Tees
            </span>
            <p className="font-display admin-stat-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
              {inStockCount}
            </p>
          </div>

          {/* Client Messages Card */}
          <div
            onClick={() => setActiveTab('inquiries')}
            className="admin-stat-card"
            style={{
              background: 'rgba(18,18,22,0.7)',
              border: activeTab === 'inquiries' ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '18px',
              cursor: 'pointer',
              transition: 'border 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span className="admin-stat-label" style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Client Messages
              </span>
              {inquiries.length > 0 && (
                <span className="admin-stat-badge" style={{ background: 'rgba(197, 168, 128, 0.15)', color: '#C5A880', border: '1px solid rgba(197, 168, 128, 0.3)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                  {inquiries.length} New
                </span>
              )}
            </div>
            <p className="font-display admin-stat-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#C5A880', marginTop: '4px' }}>
              {inquiries.length}
            </p>
          </div>

          {/* VIP Subscribers Card */}
          <div
            onClick={() => setActiveTab('subscribers')}
            className="admin-stat-card"
            style={{
              background: 'rgba(18,18,22,0.7)',
              border: activeTab === 'subscribers' ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '18px',
              cursor: 'pointer',
              transition: 'border 0.2s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <span className="admin-stat-label" style={{ fontSize: '0.72rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              VIP Drops List
            </span>
            <p className="font-display admin-stat-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#A855F7', marginTop: '4px' }}>
              {subscribers.length}
            </p>
          </div>
        </div>

        {/* Tab Navigation with Badge Indicators */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {[
            { id: 'inventory', label: `Inventory (${products.length})` },
            {
              id: 'orders',
              label: `Orders (${orders.length})`,
              icon: <PackageCheck size={15} />,
              badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Pending` : null,
              badgeColor: '#F59E0B'
            },
            { id: 'add', label: 'Add New T-Shirt', icon: <Plus size={15} /> },
            {
              id: 'inquiries',
              label: 'Inquiries',
              icon: <Mail size={15} />,
              badge: inquiries.length > 0 ? inquiries.length : null,
              badgeColor: '#C5A880'
            },
            {
              id: 'subscribers',
              label: `VIP List (${subscribers.length})`,
              icon: <Sparkles size={15} />
            },
            { id: 'settings', label: 'Store Settings & Phone Numbers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditingProduct(null); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700,
                background: activeTab === tab.id ? (tab.id === 'add' ? '#C5A880' : '#FFFFFF') : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#000000' : '#A1A1AA',
                border: tab.id === 'add' ? '1px solid rgba(197,168,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: activeTab === tab.id ? '#000000' : (tab.badgeColor || '#C5A880'),
                  color: activeTab === tab.id ? '#FFFFFF' : '#000000',
                  marginLeft: '2px'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Inventory Table & Mobile Cards ── */}
        {activeTab === 'inventory' && !editingProduct && (
          <div>
            {/* Desktop Table View */}
            <div className="admin-desktop-table" style={{ background: 'rgba(18,18,22,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <th style={{ padding: '12px 14px' }}>Product</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Price (₦)</th>
                    <th style={{ padding: '12px 14px' }}>Stock Status</th>
                    <th style={{ padding: '12px 14px' }}>Featured</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img src={item.images?.primary || '/assets/product-motorsport-jersey.jpg'} alt={item.name}
                            style={{ width: '46px', height: '56px', borderRadius: '8px', objectFit: 'cover', background: '#141418' }} />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>{item.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#71717A' }}>{item.category} • {item.sizes?.join(', ')}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.85rem', color: '#A1A1AA' }}>{item.category}</td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>{formatCurrency(item.price)}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => {
                            if (!item.inStock || (item.stockQuantity ?? 0) <= 0) {
                              setEditingProduct(item);
                            } else {
                              toggleInStock(item.id);
                            }
                          }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                              background: item.inStock && (item.stockQuantity ?? 0) > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              border: item.inStock && (item.stockQuantity ?? 0) > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                              color: item.inStock && (item.stockQuantity ?? 0) > 0 ? '#10B981' : '#EF4444',
                              cursor: 'pointer'
                            }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.inStock && (item.stockQuantity ?? 0) > 0 ? '#10B981' : '#EF4444' }} />
                            <span>{item.inStock && (item.stockQuantity ?? 0) > 0 ? 'In Stock' : 'Sold Out'}</span>
                          </button>
                          <span style={{ fontSize: '0.78rem', color: '#A1A1AA', fontWeight: 600 }}>
                            ({item.inStock && (item.stockQuantity ?? 0) > 0 ? item.stockQuantity : 0} units)
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button onClick={() => toggleFeatured(item.id)} title="Toggle homepage spotlight"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.isFeatured ? 'rgba(197,168,128,0.2)' : 'rgba(255,255,255,0.05)', border: item.isFeatured ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.1)', color: item.isFeatured ? '#C5A880' : '#71717A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Star size={16} fill={item.isFeatured ? '#C5A880' : 'none'} />
                        </button>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingProduct(item)}
                            style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(197,168,128,0.1)', border: '1px solid rgba(197,168,128,0.25)', color: '#C5A880', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: item.id, name: item.name })}
                            style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="admin-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '14px' }}>
              {products.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(18,18,22,0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={item.images?.primary || '/assets/product-motorsport-jersey.jpg'} alt={item.name}
                      style={{ width: '56px', height: '68px', borderRadius: '8px', objectFit: 'cover', background: '#141418' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '2px' }}>{item.category}</p>
                      <p style={{ fontWeight: 800, fontSize: '0.98rem', color: '#C5A880', marginTop: '4px' }}>{formatCurrency(item.price)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => {
                        if (!item.inStock || (item.stockQuantity ?? 0) <= 0) {
                          setEditingProduct(item);
                        } else {
                          toggleInStock(item.id);
                        }
                      }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                          background: item.inStock && (item.stockQuantity ?? 0) > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          border: item.inStock && (item.stockQuantity ?? 0) > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                          color: item.inStock && (item.stockQuantity ?? 0) > 0 ? '#10B981' : '#EF4444',
                          cursor: 'pointer'
                        }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.inStock && (item.stockQuantity ?? 0) > 0 ? '#10B981' : '#EF4444' }} />
                        <span>{item.inStock && (item.stockQuantity ?? 0) > 0 ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                      <span style={{ fontSize: '0.74rem', color: '#A1A1AA', fontWeight: 600 }}>
                        ({item.inStock && (item.stockQuantity ?? 0) > 0 ? item.stockQuantity : 0} units)
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => toggleFeatured(item.id)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', background: item.isFeatured ? 'rgba(197,168,128,0.2)' : 'rgba(255,255,255,0.05)', border: item.isFeatured ? '1px solid #C5A880' : '1px solid rgba(255,255,255,0.1)', color: item.isFeatured ? '#C5A880' : '#71717A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Star size={15} fill={item.isFeatured ? '#C5A880' : 'none'} />
                      </button>
                      <button onClick={() => setEditingProduct(item)}
                        style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(197,168,128,0.1)', border: '1px solid rgba(197,168,128,0.25)', color: '#C5A880', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => setDeleteConfirm({ id: item.id, name: item.name })}
                        style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Inline Edit Panel ── */}
        {activeTab === 'inventory' && editingProduct && (
          <EditPanel
            product={editingProduct}
            updateProduct={updateProduct}
            onSave={() => setEditingProduct(null)}
            onCancel={() => setEditingProduct(null)}
          />
        )}

        {/* ── TAB 2: Orders & Payments Management ── */}
        {activeTab === 'orders' && (
          <div style={{ background: 'rgba(18,18,22,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px' }}>
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>Customer Orders & Payments ({orders.length})</h2>
                <p style={{ color: '#71717A', fontSize: '0.82rem' }}>All direct orders logged via checkout, including WhatsApp reference codes and payment states.</p>
              </div>

              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} style={{ animation: ordersLoading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending_payment', label: 'Pending Payment' },
                  { id: 'payment_verified', label: 'Payment Verified' },
                  { id: 'shipped', label: 'Shipped' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderStatusFilter(tab.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                      background: orderStatusFilter === tab.id ? '#C5A880' : 'rgba(255,255,255,0.05)',
                      color: orderStatusFilter === tab.id ? '#000000' : '#A1A1AA',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Order Search Box */}
              <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px', maxWidth: '320px' }}>
                <Search size={14} color="#71717A" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search code, name, phone..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px 8px 34px', fontSize: '0.8rem', borderRadius: '9999px' }}
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
                <PackageCheck size={36} color="#3F3F46" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#A1A1AA' }}>No orders found</p>
                <p style={{ fontSize: '0.8rem', color: '#71717A', marginTop: '4px' }}>When customers initiate WhatsApp orders, records will be secured here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  const customerPhone = (order.customer_info?.phone || '').replace(/[^0-9]/g, '');
                  const waCustomerUrl = `https://wa.me/${customerPhone}?text=Hello%20${encodeURIComponent(order.customer_info?.full_name || 'Customer')}%2C%20this%20is%20STYCH%20Atelier%20regarding%20your%20Order%20%23${encodeURIComponent(order.reference_code)}`;

                  const statusColors = {
                    pending_payment: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B', label: 'Pending Payment' },
                    payment_verified: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981', label: 'Payment Verified' },
                    shipped: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#3B82F6', label: 'Shipped' },
                    completed: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', text: '#A855F7', label: 'Completed' },
                    cancelled: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444', label: 'Cancelled' }
                  };
                  const currentStatusMeta = statusColors[order.status] || statusColors.pending_payment;

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.035)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '18px 20px',
                        transition: 'border 0.2s'
                      }}
                    >
                      <div className="admin-order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'monospace, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#C5A880', letterSpacing: '0.04em', wordBreak: 'break-all' }}>
                              #{order.reference_code}
                            </span>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 10px',
                              borderRadius: '9999px',
                              background: currentStatusMeta.bg,
                              border: `1px solid ${currentStatusMeta.border}`,
                              color: currentStatusMeta.text,
                              whiteSpace: 'nowrap'
                            }}>
                              {currentStatusMeta.label}
                            </span>
                          </div>

                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: '6px', wordBreak: 'break-word' }}>
                            {order.customer_info?.full_name} • <span style={{ color: '#A1A1AA', fontWeight: 500 }}>{order.customer_info?.phone}</span>
                          </h4>

                          <p style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '2px', wordBreak: 'break-word' }}>
                            {order.customer_info?.address}, {order.customer_info?.state}
                          </p>
                        </div>

                        {/* Right / Mobile Bottom: Total & Status Selector */}
                        <div className="admin-order-actions" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                            {formatCurrency(order.total_amount)}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <select
                              value={order.status}
                              onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: '#141418',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#FFFFFF',
                                fontSize: '0.76rem',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="pending_payment">Pending Payment</option>
                              <option value="payment_verified">Payment Verified</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            <a
                              href={waCustomerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                padding: '6px 12px', borderRadius: '8px',
                                background: '#25D366', color: '#000000',
                                fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none'
                              }}
                            >
                              <Phone size={12} />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => setOrderToDelete(order)}
                              style={{ padding: '6px 8px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', cursor: 'pointer' }}
                              title="Delete Order"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Items List */}
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#C5A880', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span>{isExpanded ? 'Hide Garments' : `View ${order.items?.length || 0} Garments in Order`}</span>
                        </button>

                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', padding: '12px', background: 'rgba(0,0,0,0.35)', borderRadius: '10px' }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#D4D4D8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {item.image && (
                                    <img src={item.image} alt={item.name} style={{ width: '28px', height: '34px', borderRadius: '4px', objectFit: 'cover' }} />
                                  )}
                                  <span>{item.name} (Size: <strong>{item.selectedSize}</strong>) × {item.quantity}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#71717A', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', marginTop: '4px' }}>
                              <span>Shipping: {order.shipping_method?.name || 'Standard'}</span>
                              <span>{formatCurrency(order.shipping_fee || 0)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Add New Product ── */}
        {activeTab === 'add' && (
          <div style={{ maxWidth: '720px', margin: '0 auto', background: 'rgba(18,18,22,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>Add New T-Shirt Drop</h2>
            <p style={{ color: '#A1A1AA', fontSize: '0.85rem', marginBottom: '28px' }}>Upload photos from your device to immediately publish a new garment to your catalog.</p>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>T-Shirt Name *</label>
                <input type="text" required placeholder="e.g. STYCH Cyber Monogram Tee" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Price in ₦ NGN *</label>
                  <input type="number" required placeholder="e.g. 28500" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Available Stock (Units) *</label>
                  <input type="number" min="0" required placeholder="0" value={newProduct.stockQuantity} onChange={e => setNewProduct({ ...newProduct, stockQuantity: e.target.value === '' ? '' : (parseInt(e.target.value) || 0) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ ...inputStyle }}>
                    {CATEGORIES.filter(c => c !== 'All Tees').map(cat => <option key={cat} value={cat} style={{ background: '#141418' }}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Drop Badge Tag</label>
                <input type="text" placeholder="e.g. LIMITED DROP, BESTSELLER" value={newProduct.badge} onChange={e => setNewProduct({ ...newProduct, badge: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Garment Photos (Upload from Device) *</label>
                <DualImageUpload
                  primaryUrl={newProduct.primaryUrl}
                  secondaryUrl={newProduct.secondaryUrl}
                  onChange={(slot, url) => {
                    setCreateErrorMessage('');
                    setNewProduct(prev => ({
                      ...prev,
                      [slot === 'primary' ? 'primaryUrl' : 'secondaryUrl']: url
                    }));
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Available Sizes</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const isChecked = newProduct.sizes.includes(size);
                    return (
                      <button key={size} type="button" onClick={() => handleSizeToggle(size)}
                        style={{ width: '46px', height: '42px', borderRadius: '8px', border: isChecked ? '2px solid #C5A880' : '1px solid rgba(255,255,255,0.15)', background: isChecked ? 'rgba(197,168,128,0.2)' : 'rgba(255,255,255,0.04)', color: isChecked ? '#C5A880' : '#71717A', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description / Story</label>
                <textarea rows={3} placeholder="Describe the cut, artwork, and character of this garment..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ ...inputStyle, resize: 'none' }} />
              </div>

              {createErrorMessage && (
                <p style={{ color: '#EF4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={15} />
                  <span>{createErrorMessage}</span>
                </p>
              )}

              <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1rem', width: '100%', marginTop: '10px' }}>
                <Plus size={18} />
                <span>Publish Drop to Store</span>
              </button>
            </form>
          </div>
        )}

        {/* ── TAB 4: Client Inquiries Inbox ── */}
        {activeTab === 'inquiries' && (
          <div style={{ background: 'rgba(18,18,22,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>Client Support Messages ({inquiries.length})</h2>
                <p style={{ color: '#71717A', fontSize: '0.82rem' }}>Messages submitted via the contact form on your FAQ & Support page.</p>
              </div>

              <button
                onClick={fetchInquiries}
                disabled={inquiriesLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} style={{ animation: inquiriesLoading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh Messages</span>
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
                <Mail size={36} color="#3F3F46" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#A1A1AA' }}>No customer messages yet</p>
                <p style={{ fontSize: '0.8rem', color: '#71717A', marginTop: '4px' }}>When visitors send inquiries from the FAQ page, they will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#C5A880', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {inq.subject || 'Inquiry'}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                          {inq.name} <span style={{ fontSize: '0.8rem', color: '#A1A1AA', fontWeight: 400 }}>({inq.email})</span>
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#71717A' }}>
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ''}
                        </span>
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', cursor: 'pointer' }}
                          title="Delete message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#D4D4D8', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: '10px' }}>
                      "{inq.message}"
                    </p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {inq.email && (
                        <>
                          <button
                            onClick={() => handleReplyEmail(inq)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px',
                              background: '#C5A880', color: '#000000',
                              fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer'
                            }}
                          >
                            <Mail size={13} />
                            <span>Reply via Email App</span>
                          </button>

                          <button
                            onClick={() => handleCopyClientEmailOnly(inq.email, inq.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px',
                              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            {replyCopiedId === inq.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                            <span>{replyCopiedId === inq.id ? 'Email Copied!' : 'Copy Client Email'}</span>
                          </button>
                        </>
                      )}
                      {replyCopiedId === inq.id && (
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} />
                          <span>Client email copied to clipboard ({inq.email})</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: VIP Drops List ── */}
        {activeTab === 'subscribers' && (
          <div style={{ background: 'rgba(18,18,22,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>VIP Capsule Subscribers ({subscribers.length})</h2>
                <p style={{ color: '#71717A', fontSize: '0.82rem' }}>High-intent buyers registered for private t-shirt drop passwords and capsule launches.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopyAllSubscribers}
                  disabled={subscribers.length === 0}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '9999px',
                    background: copiedSubscribers ? 'rgba(16, 185, 129, 0.2)' : 'rgba(197, 168, 128, 0.15)',
                    border: copiedSubscribers ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(197, 168, 128, 0.35)',
                    color: copiedSubscribers ? '#10B981' : '#C5A880',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {copiedSubscribers ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSubscribers ? 'Copied All Emails!' : 'Copy All Emails (CSV)'}</span>
                </button>

                <button
                  onClick={fetchSubscribers}
                  disabled={subscribersLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '9999px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} style={{ animation: subscribersLoading ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Subscriber Search */}
            <div style={{ marginBottom: '20px', maxWidth: '360px', position: 'relative' }}>
              <Search size={14} color="#71717A" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search subscriber emails..."
                value={subscriberSearch}
                onChange={e => setSubscriberSearch(e.target.value)}
                style={{ ...inputStyle, padding: '8px 12px 8px 34px', fontSize: '0.82rem', borderRadius: '9999px' }}
              />
            </div>

            {filteredSubscribers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
                <Sparkles size={36} color="#3F3F46" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#A1A1AA' }}>No subscribers found</p>
                <p style={{ fontSize: '0.8rem', color: '#71717A', marginTop: '4px' }}>When visitors join the VIP drop list on the landing page, their emails will appear here.</p>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#71717A', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <th style={{ padding: '12px 18px' }}>Subscriber Email</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((sub, idx) => (
                      <tr key={sub.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 18px', color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 600 }}>
                          {sub.email}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right', color: '#71717A', fontSize: '0.8rem' }}>
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: Store Settings & Separate Phone Numbers ── */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '680px', margin: '0 auto', background: 'rgba(18,18,22,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>Store Settings & Contact Channels</h2>
            <p style={{ color: '#A1A1AA', fontSize: '0.85rem', marginBottom: '28px' }}>Configure separate WhatsApp numbers for Orders and Concierge Support, plus your brand email.</p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* WhatsApp Orders Number */}
              <div>
                <label style={labelStyle}>1. WhatsApp Direct Orders Phone Number (with Country Code) *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#25D366" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" required placeholder="e.g. 2347035225025" value={settingsForm.ordersWhatsappNumber} onChange={e => setSettingsForm({ ...settingsForm, ordersWhatsappNumber: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '44px' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '6px' }}>
                  All 1-click purchases from the Shopping Bag checkout will be sent directly to this number.
                </p>
              </div>

              {/* WhatsApp Concierge Support Number */}
              <div>
                <label style={labelStyle}>2. WhatsApp Concierge & Client Inquiries Phone Number (with Country Code) *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#C5A880" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" required placeholder="e.g. 2347035225025" value={settingsForm.conciergeWhatsappNumber} onChange={e => setSettingsForm({ ...settingsForm, conciergeWhatsappNumber: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '44px' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '6px' }}>
                  Used for general inquiries on the FAQ page and the WhatsApp concierge button in the website footer.
                </p>
              </div>

              {/* Support Email */}
              <div>
                <label style={labelStyle}>3. Official Support Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#A1A1AA" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" required placeholder="e.g. concierge@stych.store" value={settingsForm.supportEmail} onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '44px' }} />
                </div>
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label style={labelStyle}>4. Free Shipping Minimum Cart Value (₦ NGN)</label>
                <input type="number" required placeholder="e.g. 80000" value={settingsForm.freeShippingThreshold} onChange={e => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })} style={inputStyle} />
              </div>

              {/* Administrator Account & Password Management */}
              <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C5A880', display: 'block', marginBottom: '8px' }}>
                  Authenticated Administrator Profile
                </span>
                <p style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 600, marginBottom: '2px' }}>
                  {currentUser?.user_metadata?.full_name || 'Store Administrator'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '14px' }}>
                  Email: {currentUser?.email || 'N/A'}
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                  <label style={{ ...labelStyle, marginBottom: '6px' }}>Update Admin Password</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="password"
                      placeholder="Enter new strong password"
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    />
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      disabled={passwordUpdating}
                      style={{
                        padding: '10px 18px', borderRadius: '10px',
                        background: 'rgba(197, 168, 128, 0.15)', border: '1px solid rgba(197, 168, 128, 0.35)',
                        color: '#C5A880', fontWeight: 700, fontSize: '0.82rem',
                        cursor: passwordUpdating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {passwordUpdating ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                  {passwordUpdateMsg.text && (
                    <p style={{ fontSize: '0.78rem', marginTop: '8px', fontWeight: 600, color: passwordUpdateMsg.type === 'success' ? '#10B981' : '#EF4444' }}>
                      {passwordUpdateMsg.text}
                    </p>
                  )}
                </div>

                {/* ── Biometric Fast Unlock (Face ID / Touch ID / Fingerprint) ── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Fingerprint size={16} color="#C5A880" />
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Device Biometrics (Face ID & Fingerprint)</label>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#A1A1AA', marginBottom: '12px', lineHeight: 1.5 }}>
                    Pair this phone or computer's native biometric sensor to bypass password prompts on future visits.
                  </p>

                  {savedBiometrics ? (
                    <div style={{
                      padding: '14px 16px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                            <CheckCircle2 size={15} />
                            <span>Linked ({savedBiometrics.platform || 'Platform Sensor'})</span>
                          </p>
                          <p style={{ fontSize: '0.74rem', color: '#A1A1AA', marginTop: '4px', margin: 0 }}>
                            Admin: <strong style={{ color: '#FFFFFF' }}>{savedBiometrics.email}</strong>
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleBiometricLogin}
                            disabled={biometricLoading}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: 'rgba(197, 168, 128, 0.15)',
                              border: '1px solid rgba(197, 168, 128, 0.35)',
                              color: '#C5A880',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: biometricLoading ? 'wait' : 'pointer'
                            }}
                          >
                            Test Sensor
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveBiometrics}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#EF4444',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Unlink Device
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                          No biometric device linked
                        </p>
                        <p style={{ fontSize: '0.74rem', color: '#71717A', marginTop: '2px', margin: 0 }}>
                          {biometricsAvailable ? 'Sensor available on this device.' : 'Supported in HTTPS/PWA mode.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRegisterBiometrics}
                        disabled={biometricLoading}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(197, 168, 128, 0.4)',
                          color: '#C5A880',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: biometricLoading ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Fingerprint size={16} />
                        <span>{biometricLoading ? 'Configuring Sensor...' : 'Enable Face ID / Fingerprint'}</span>
                      </button>
                    </div>
                  )}

                  {biometricMsg.text && (
                    <p style={{
                      fontSize: '0.78rem',
                      marginTop: '8px',
                      fontWeight: 600,
                      color: biometricMsg.type === 'success' ? '#10B981' : '#EF4444'
                    }}>
                      {biometricMsg.text}
                    </p>
                  )}
                </div>
              </div>

              {settingsSaved && (
                <p style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /><span>All settings and contact phone numbers updated and saved!</span>
                </p>
              )}

              <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '0.95rem', width: '100%' }}>
                <span>Save Store Configuration</span>
              </button>
            </form>

            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#EF4444', marginBottom: '8px', fontWeight: 700 }}>Factory Reset Area</h3>
              <p style={{ fontSize: '0.8rem', color: '#71717A', marginBottom: '14px' }}>Restore catalog back to original factory presets (Motorsport Jersey, Pink Panther Tee, etc.).</p>
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                style={{ padding: '10px 20px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <RefreshCw size={14} />
                <span>Reset to Default Drops</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-dashboard-main {
            padding-top: 66px !important;
            padding-bottom: 50px !important;
          }
          .admin-dashboard-header {
            margin-bottom: 20px !important;
            gap: 12px !important;
          }
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            margin-bottom: 22px !important;
          }
          .admin-stat-card {
            padding: 12px 14px !important;
            border-radius: 14px !important;
          }
          .admin-stat-label {
            font-size: 0.65rem !important;
            letter-spacing: 0.04em !important;
          }
          .admin-stat-badge {
            font-size: 0.6rem !important;
            padding: 1px 6px !important;
          }
          .admin-stat-num {
            font-size: 1.45rem !important;
            margin-top: 2px !important;
          }
          .admin-desktop-table {
            display: none !important;
          }
          .admin-mobile-cards {
            display: flex !important;
          }
        }
      `}</style>
    </main>
  );
}
