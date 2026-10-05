import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import MenuPage from './pages/customer/MenuPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import AdminLayout from './pages/admin/AdminLayout';
import TablesPage from './pages/admin/TablesPage';
import KitchenPage from './pages/admin/KitchenPage';
import MenuManagementPage from './pages/admin/MenuManagementPage';
import QRCodePage from './pages/admin/QRCodePage';
import StockPage from './pages/admin/StockPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import CouponsPage from './pages/admin/CouponsPage';
import ReportsPage from './pages/admin/ReportsPage';
import ReservationsPage from './pages/admin/ReservationsPage';
import StaffRosterPage from './pages/admin/StaffRosterPage';
import AttendancePage from './pages/admin/AttendancePage';
import FoodSafetyPage from './pages/admin/FoodSafetyPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Toaster
                position="top-center"
                richColors
                closeButton
                expand={false}
                toastOptions={{
                  className: 'font-sans',
                  style: {
                    fontFamily: "'Inter', sans-serif",
                  },
                }}
              />
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<MenuPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<TablesPage />} />
                  <Route path="tables" element={<TablesPage />} />
                  <Route path="reservations" element={<ReservationsPage />} />
                  <Route path="kitchen" element={<KitchenPage />} />
                  <Route path="staff" element={<StaffRosterPage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="egenkontrol" element={<FoodSafetyPage />} />
                  <Route path="menu" element={<MenuManagementPage />} />
                  <Route path="qr-codes" element={<QRCodePage />} />
                  <Route path="stock" element={<StockPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="coupons" element={<CouponsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
