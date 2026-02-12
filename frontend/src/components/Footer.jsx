import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center">
                                <span className="text-xl">🍔</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter">Befoody</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Bringing the best restaurants in your city straight to your doorstep. Fast, fresh, and premium.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <a key={social} href={`#${social}`} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-500 transition-colors">
                                    <span className="sr-only">{social}</span>
                                    <div className="w-4 h-4 bg-white/20 rounded-sm"></div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link to="/restaurants" className="hover:text-white transition-colors">Browse Restaurants</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Register Restaurant</Link></li>
                            <li><Link to="/register?role=rider" className="hover:text-white transition-colors">Become a Rider</Link></li>
                            <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><a href="#help" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#safety" className="hover:text-white transition-colors">Safety Center</a></li>
                            <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Install App */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Install App</h4>
                        <p className="text-gray-400 text-sm mb-6">Available on iOS and Android. Download now for the best experience.</p>
                        <div className="space-y-3">
                            <div className="bg-white/10 p-3 rounded-xl border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all">
                                <div className="text-2xl">🍎</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase leading-none">Download on the</p>
                                    <p className="text-sm font-bold leading-none mt-1">App Store</p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-all">
                                <div className="text-2xl">🤖</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase leading-none">Get it on</p>
                                    <p className="text-sm font-bold leading-none mt-1">Google Play</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 text-center text-gray-500 text-xs">
                    <p>&copy; {new Date().getFullYear()} Befoody Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default memo(Footer);
