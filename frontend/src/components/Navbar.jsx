import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout, isAdmin, isRestaurant } = useAuth();
    const { cartItems } = useCart();
    const location = useLocation();
    const isRider = user?.role === 'rider';
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileOpen(false);
    }, [location]);

    // Helper to determine logo destination
    const getDashboardLink = () => {
        if (isAdmin) return '/admin';
        if (isRestaurant) return '/restaurant-dashboard';
        if (isRider) return '/rider-dashboard';
        return '/';
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Restaurants', path: '/restaurants' },
    ];

    // Icons
    const CartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const MenuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );

    const CloseIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to={getDashboardLink()} className="flex items-center gap-2 group">
                        <span className="text-3xl transform group-hover:scale-110 transition-transform duration-200">🍔</span>
                        <span className="text-2xl font-heading font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
                            Befoody
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${isActive(link.path) ? 'text-primary-600' : 'text-gray-600 hover:text-primary-500'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Cart */}
                        {user && !isRestaurant && !isRider && !isAdmin && (
                            <Link to="/cart" className="relative group p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <span className={`text-gray-600 group-hover:text-primary-600 transition-colors`}>
                                    <CartIcon />
                                </span>
                                {cartItems.length > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-bounce-slow">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Auth Buttons / User Profile */}
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-4 py-1 rounded-full border border-gray-200 hover:border-primary-200 hover:shadow-sm transition-all bg-white"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700">
                                        <UserIcon />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-scale-in origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm text-gray-500">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                        </div>

                                        {(isAdmin || isRestaurant || isRider) && (
                                            <Link
                                                to={getDashboardLink()}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                                            >
                                                Dashboard
                                            </Link>
                                        )}

                                        {!isAdmin && !isRestaurant && !isRider && (
                                            <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                                My Orders
                                            </Link>
                                        )}

                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700">
                                            Settings
                                        </Link>

                                        <div className="border-t border-gray-50 mt-1">
                                            <button
                                                onClick={logout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary-600">
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary px-5 py-2.5 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all transform hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && !isRestaurant && !isRider && !isAdmin && (
                            <Link to="/cart" className="relative text-gray-600">
                                <CartIcon />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-primary-600 p-2"
                        >
                            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
                    <div className="px-4 pt-2 pb-6 space-y-1 shadow-inner">
                        {user && (
                            <div className="py-3 px-3 mb-2 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                    <UserIcon />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                            </div>
                        )}

                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`block px-3 py-3 rounded-lg text-base font-medium ${isActive(link.path)
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {(isAdmin || isRestaurant || isRider) && (
                            <Link
                                to={getDashboardLink()}
                                className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Dashboard
                            </Link>
                        )}

                        {!isAdmin && !isRestaurant && !isRider && user && (
                            <Link to="/orders" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50">
                                My Orders
                            </Link>
                        )}

                        {user ? (
                            <button
                                onClick={logout}
                                className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 mt-2"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <div className="pt-4 flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    className="block w-full text-center px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full text-center px-4 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-lg"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
