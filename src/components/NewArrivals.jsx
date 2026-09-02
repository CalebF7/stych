import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function NewArrivals({ onViewAllClick, onQuickView }) {
  const { products } = useProducts();

  // Pick the top 4 items for the New Arrivals section
  const newArrivals = products.slice(0, 4);

  return (
    <section
      id="new-arrivals"
      style={{
        paddingTop: '80px',
        paddingBottom: '90px',
        background: '#09090B',
        position: 'relative'
      }}
    >
      <div className="stych-container">
        {/* Section Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '48px',
            position: 'relative'
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display"
            style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginBottom: '14px'
            }}
          >
            New Arrivals
          </motion.h2>

          {/* Minimalist Hairline Accent Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '48px',
              height: '1.5px',
              background: 'rgba(255, 255, 255, 0.35)',
              margin: '0 auto',
              transformOrigin: 'center'
            }}
          />
        </div>

        {/* Studio Product Grid (4-Col Desktop / 2-Col Mobile) */}
        <motion.div
          className="stych-product-grid"
          style={{ marginBottom: '60px' }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {newArrivals.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                onQuickView={onQuickView}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* View All Products CTA Button */}
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewAllClick}
            className="btn-dark-studio"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: '#000000',
              padding: '16px 42px'
            }}
          >
            <span>View All Products</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
