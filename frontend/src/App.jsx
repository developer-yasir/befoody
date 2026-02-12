import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

import RestaurantDashboard from './pages/RestaurantDashboard';
import RiderDashboard from './pages/RiderDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/track-order/:id" element={<OrderTracking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="/rider-dashboard" element={<RiderDashboard />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
