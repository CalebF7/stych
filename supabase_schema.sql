-- ==============================================================================
-- STYCH LUXURY ATELIER — PRODUCTION SUPABASE SQL SCHEMA & RLS SECURITY POLICIES
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- This script sets up all 5 required tables, indexes, constraints, and Row-Level Security (RLS).
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: products
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT DEFAULT 'Heavyweight Boxy',
  badge TEXT DEFAULT 'NEW DROP',
  gsm TEXT DEFAULT '280 GSM',
  fit TEXT DEFAULT 'Boxy Drop-Shoulder',
  material TEXT DEFAULT '100% Heavyweight Cotton',
  description TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT true,
  sizes JSONB DEFAULT '["S", "M", "L", "XL", "XXL"]'::jsonb,
  images JSONB DEFAULT '{"primary": "/assets/product-motorsport-jersey.jpg", "front": "", "back": ""}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLE 2: store_settings
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  orders_whatsapp TEXT DEFAULT '2347035225025',
  concierge_whatsapp TEXT DEFAULT '2347035225025',
  support_email TEXT DEFAULT 'concierge@stych.store',
  free_shipping_threshold NUMERIC DEFAULT 80000,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default singleton row if not exists
INSERT INTO public.store_settings (id, orders_whatsapp, concierge_whatsapp, support_email, free_shipping_threshold)
VALUES ('global_config', '2347035225025', '2347035225025', 'concierge@stych.store', 80000)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- TABLE 3: inquiries (Customer Support & FAQ Messages)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  subject TEXT DEFAULT 'Order & Sizing Inquiry',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLE 4: newsletter_subscribers (VIP Drops Capsule List)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLE 5: orders (Zero-Lost-Orders System)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,
  customer_info JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  shipping_method JSONB,
  status TEXT DEFAULT 'pending_payment' NOT NULL CHECK (status IN ('pending_payment', 'payment_verified', 'processing', 'shipped', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_reference_code ON public.orders(reference_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.newsletter_subscribers(created_at DESC);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Enable RLS on all 5 tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES: products
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" 
  ON public.products 
  FOR SELECT 
  TO public 
  USING (true);

DROP POLICY IF EXISTS "Authenticated admins can insert products" ON public.products;
CREATE POLICY "Authenticated admins can insert products" 
  ON public.products 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can update products" ON public.products;
CREATE POLICY "Authenticated admins can update products" 
  ON public.products 
  FOR UPDATE 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Authenticated admins can delete products" ON public.products;
CREATE POLICY "Authenticated admins can delete products" 
  ON public.products 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- ------------------------------------------------------------------------------
-- POLICIES: store_settings
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" 
  ON public.store_settings 
  FOR SELECT 
  TO public 
  USING (true);

DROP POLICY IF EXISTS "Authenticated admins can manage store settings" ON public.store_settings;
CREATE POLICY "Authenticated admins can manage store settings" 
  ON public.store_settings 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- POLICIES: inquiries
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries" 
  ON public.inquiries 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can view and delete inquiries" ON public.inquiries;
CREATE POLICY "Authenticated admins can view and delete inquiries" 
  ON public.inquiries 
  FOR ALL 
  TO authenticated 
  USING (true);

-- ------------------------------------------------------------------------------
-- POLICIES: newsletter_subscribers
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Authenticated admins can view subscribers" 
  ON public.newsletter_subscribers 
  FOR ALL 
  TO authenticated 
  USING (true);

-- ------------------------------------------------------------------------------
-- POLICIES: orders
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" 
  ON public.orders 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can manage all orders" ON public.orders;
CREATE POLICY "Authenticated admins can manage all orders" 
  ON public.orders 
  FOR ALL 
  TO authenticated 
  USING (true);

-- ==============================================================================
-- STORAGE BUCKET: product-images
-- ==============================================================================
-- Insert the public bucket if not already created
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING (bucket_id = 'product-images');

-- Storage RLS: Only authenticated admin can upload/update/delete images
DROP POLICY IF EXISTS "Authenticated admin can upload product images" ON storage.objects;
CREATE POLICY "Authenticated admin can upload product images" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated admin can update product images" ON storage.objects;
CREATE POLICY "Authenticated admin can update product images" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated admin can delete product images" ON storage.objects;
CREATE POLICY "Authenticated admin can delete product images" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'product-images');
