# 🇩🇰 Cafe Vitus — Restaurant Management, POS & QR Menu System

Modern, ultra-luxury Next-Gen QR Menu, Live Ordering, Table POS & Restaurant Management System (KDS & Admin Panel) designed for **Cafe Vitus (Snekkersten Havn, Denmark)**.

---

## 🌟 Key Features

### 📱 1. Customer (QR Menu & Live Ordering)
- **Instant Table Detection:** Automatically detects table from URL query params (`/?table=5`) or QR scan and locks the table session.
- **Michelin-Grade UI:** 3D card tilt with specular glare, interactive canvas particles, and dark/light mode toggle.
- **Customizations:** Single & multiple selections (Milk choices, bread types, protein add-ons, syrups, kitchen notes).
- **Live Waiter Calling:** One-tap waiter alerts (Bill, Water/Napkins, Question, Special Request).
- **Live Order Tracking:** Step-by-step progress tracking (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Delivered`).
- **TripAdvisor Review Prompt:** Direct 5-star rating integration with TripAdvisor.

### 🖥️ 2. Restaurant POS & Kitchen (KDS)
- **Table POS (`/admin/tables`):** Floor map with real-time table statuses (Empty, Occupied, Waiter Called, Pending Approval).
- **Two-Step Anti-Fraud Approval:** Waiter can approve valid orders (`Godkend til Køkken`) or reject fake remote orders (`Afvis`).
- **Kitchen Display System (`/admin/kitchen`):** Real-time Kanban board with elapsed order timers (>10m yellow, >15m red alert) and Web Audio chime sound alerts.
- **Menu Management (`/admin/menu`):** Full CRUD for items and categories with instant stock toggle.
- **Table QR Code Generator (`/admin/qr-codes`):** Custom branded table QR codes with instant print & PNG download.
- **Stock & Inventory (`/admin/stock`):** Real-time raw ingredient tracking with critical stock alerts.
- **Income & Expenses (`/admin/expenses`):** Financial ledger with net profit/loss calculation and Recharts visual breakdown.
- **Coupons & Loyalty (`/admin/coupons`):** Percentage & fixed discount promo codes with usage limits.
- **Reports & Analytics (`/admin/reports`):** Daily/weekly revenue charts, peak hours analysis, and top-selling dishes.

### 🌐 3. Localization & Multi-Language
- **Currency:** Danish Krone (**DKK / kr**)
- **Languages:** Danish (Dansk - DA, Default) & English (EN)
- **Storage Resilience:** Cloud Firestore real-time sync with automatic `localStorage` + `BroadcastChannel` offline fallback.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (.env)
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Default Admin PIN
- Default Staff PIN: **`1234`**

---

© 2026 Cafe Vitus • Snekkersten Havn, Denmark. All rights reserved.
