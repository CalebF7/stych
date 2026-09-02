# STYCH // BUILT FOR THE BOLD
> Independent luxury streetwear atelier & high-performance e-commerce platform built with React, Vite, Framer Motion, and Supabase.

---

## ✦ Overview

**STYCH** is a luxury direct-to-consumer streetwear platform engineered for heavy-fabric garment drops, seamless multi-channel checkout (WhatsApp Concierge + Direct Payment), interactive lookbooks, and a full real-time Owner Operations & Inventory Management portal.

---

## ✦ Key Features

- **Editorial Luxury Storefront**: Arched fluid hero showcase, infinite luxury marquees, 280+ GSM fabric breakdowns, and dynamic drop catalog.
- **Zero-Lost-Orders System**: Dual checkout flow supporting direct WhatsApp Concierge reservations and instant bank transfers with unique order reference codes.
- **Real-Time Owner Control Center**: Full-featured admin suite for catalog management, dual-angle high-resolution image uploads via Supabase Cloud Storage, inventory tracking, order status management, and customer inquiry response.
- **Enterprise Security & RLS**: PostgreSQL Row-Level Security (RLS) policies, password hashing, parameterized PostgREST queries, and sanitization.
- **Responsive Mobile Overhaul**: 2×2 mobile executive KPI grid, horizontal touch-snapping garment engineering carousels, and smooth auto-moving community proof reviews.

---

## ✦ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite |
| **Styling & Design System** | Vanilla CSS + Dark Luxury Design Tokens |
| **Animations** | Framer Motion + Canvas Confetti |
| **Database & Auth** | Supabase (PostgreSQL + Auth + Storage) |
| **Icons** | Lucide React |
| **Hosting & CI/CD** | Vercel (Edge Network + HTTPS) |

---

## ✦ Project Structure

```text
├── public/                # Static assets, logos, and high-res photography
├── src/
│   ├── components/        # Reusable UI components (Hero, NewArrivals, Craftsmanship, Footer)
│   ├── context/           # Product and Cart state management
│   ├── data/              # Initial catalog data, FAQs, and store config
│   ├── lib/               # Supabase client and auth helpers
│   ├── pages/             # Route pages (HomePage, StorePage, CartPage, AdminPage, FAQPage)
│   ├── App.jsx            # Main app router and layout
│   └── index.css          # Core design tokens and responsive grid rules
├── supabase_schema.sql    # Complete PostgreSQL schema, tables, and RLS policies
├── vercel.json            # SPA routing rewrites and HTTP security headers
└── package.json           # Dependencies and build scripts
```

---

## ✦ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CalebF7/stych.git
   cd stych
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the local dev server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## ✦ License

Private / All rights reserved © STYCH. Built for the bold.
