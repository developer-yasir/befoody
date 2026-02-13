import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout, isAdmin, isRestaurant, isRider } = useAuth();
    const { cartItems } = useCart();
    const location = useLocation();

    // Debug logging
    useEffect(() => {
        console.log('Navbar Debug:', { user, isAdmin, isRestaurant, isRider });
    }, [user, isAdmin, isRestaurant, isRider]);

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileOpen(false);
    }, [location]);

    const getDashboardLink = () => {
        if (isAdmin) return '/admin';
        if (isRestaurant) return '/restaurant-dashboard';
        if (isRider) return '/rider-dashboard';
        return '/';
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Home', path: '/', roles: ['guest', 'user'] },
        { name: 'Restaurants', path: '/restaurants', roles: ['guest', 'user'] },
        { name: 'Dishes', path: '/dishes', roles: ['guest', 'user'] },
        { name: 'Dashboard', path: getDashboardLink(), roles: ['admin', 'restaurant', 'rider'] },
    ];

    const currentRole = user?.role || 'guest';
    // If rider, show NO links in main navigation (they only get the profile dropdown)
    const displayLinks = currentRole === 'rider' ? [] : navLinks.filter(link => link.roles.includes(currentRole));

    const CartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    const UserIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const isHomePage = location.pathname === '/';
    const showSolidNav = scrolled || !isHomePage;

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${showSolidNav ? 'py-3 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'py-5 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <Link to={getDashboardLink()} className="flex items-center gap-3 group">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-1 bg-white transform group-hover:scale-105 transition-all duration-300">
                            <img src={logo} alt="Befoody" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-2xl font-heading font-black tracking-tighter leading-none transition-colors duration-300 ${showSolidNav ? 'text-gray-900' : 'text-gray-900 md:text-white'}`}>
                                Befoody
                            </span>
                            <span className="text-[10px] font-bold tracking-widest text-primary-500 uppercase leading-none mt-0.5">
                                Premium Delivery
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {displayLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative text-sm font-bold tracking-tight transition-all duration-300 hover:text-primary-500 group ${isActive(link.path)
                                    ? 'text-primary-600'
                                    : showSolidNav ? 'text-gray-600' : 'text-white'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${isActive(link.path) ? 'w-full' : ''}`}></span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 md:gap-5">
                        {/* Cart (Visible for customers/guests) */}
                        {(!user || (!isRestaurant && !isRider && !isAdmin)) && (
                            <Link to="/cart" className="relative group p-2.5 rounded-xl hover:bg-primary-50/50 transition-all">
                                <div className={`transition-colors duration-300 ${showSolidNav ? 'text-gray-700' : 'text-gray-700 md:text-white'}`}>
                                    <CartIcon />
                                </div>
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* User Profile (Desktop) */}
                        <div className="hidden md:block">
                            {user ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className={`flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl border transition-all duration-300 group ${showSolidNav
                                            ? 'bg-white border-gray-100 hover:border-primary-200 hover:shadow-md'
                                            : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                            <UserIcon />
                                        </div>
                                        <span className={`text-sm font-bold truncate max-w-[120px] ${showSolidNav ? 'text-gray-700' : 'text-white'}`}>
                                            {user.name}
                                        </span>
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''} ${showSolidNav ? 'text-gray-400' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-scale-in origin-top-right overflow-hidden">
                                            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
                                                <p className="text-sm font-black text-gray-900 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                {/* Rider Dashboard link removed from dropdown as they stay on dashboard */}
                                                {isAdmin || isRestaurant ? (
                                                    <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                                        <span>📊</span> Dashboard
                                                    </Link>
                                                ) : null}

                                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                                                    <span>⚙️</span> Account Settings
                                                </Link>
                                            </div>
                                            <div className="p-2 pt-0">
                                                <button onClick={logout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                    <span>🚪</span> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className={`text-sm font-bold transition-colors ${showSolidNav ? 'text-gray-600 hover:text-primary-600' : 'text-white/80 hover:text-white'}`}>
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="relative h-11 flex items-center px-8 rounded-2xl bg-primary-600 text-white text-sm font-black shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2.5 rounded-xl transition-all ${showSolidNav
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                                }`}
                        >
                            {mobileMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-20 z-40 md:hidden animate-fade-in">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="absolute left-4 right-4 bg-white rounded-3xl shadow-2xl overflow-hidden mt-4 border border-gray-100 animate-slide-up">
                        <div className="p-6 space-y-4">
                            {user && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                        <UserIcon />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 leading-none">{user.name}</p>
                                        <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mt-1.5">{user.role}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {displayLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center px-4 py-4 rounded-2xl text-base font-black transition-all ${isActive(link.path)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setMobileMenuOpen(false)} // Close mobile menu on link click
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {user && !isAdmin && !isRestaurant && ( // Add specific links for non-admin/restaurant users
                                    user?.role === 'rider' ? (
                                        <Link
                                            to="/rider-dashboard"
                                            className="flex items-center px-4 py-4 rounded-2xl text-base font-black text-gray-700 hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <span className="text-lg mr-2">🚴</span>
                                            Rider Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/orders"
                                            className="flex items-center px-4 py-4 rounded-2xl text-base font-black text-gray-700 hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <span className="text-lg mr-2">🥡</span>
                                            My Orders
                                        </Link>
                                    )
                                )}
                            </div>

                            {user ? (
                                <>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-black text-gray-700 hover:bg-gray-50">
                                        <span>⚙️</span> Settings
                                    </Link>
                                    <button onClick={logout} className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-2xl text-base font-black text-red-600 hover:bg-red-50">
                                        <span>🚪</span> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Link to="/login" className="flex items-center justify-center h-14 rounded-2xl border border-gray-200 text-gray-700 font-black hover:bg-gray-50">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="flex items-center justify-center h-14 rounded-2xl bg-primary-600 text-white font-black shadow-lg shadow-primary-500/20">
                                        Join Us
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default memo(Navbar);
