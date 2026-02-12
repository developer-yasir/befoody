import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const promoCodes = {
    'FIRST50': { discount: 0.5, description: '50% off first order' },
    'SAVE20': { discount: 0.2, description: '20% off' },
    'FREEDEL': { deliveryDiscount: true, description: 'Free delivery' }
};

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99;
    const discount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0;
    const finalDeliveryFee = appliedPromo?.deliveryDiscount ? 0 : deliveryFee;
    const total = subtotal - discount + finalDeliveryFee;

    const handleApplyPromo = () => {
        const code = promoCode.toUpperCase();
        if (promoCodes[code]) {
            setAppliedPromo({ code, ...promoCodes[code] });
            setPromoError('');
        } else {
            setPromoError('Invalid promo code');
            setAppliedPromo(null);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        setPromoError('');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="text-8xl mb-6">🛒</div>
                    <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-600 mb-8">Add some delicious items to get started!</p>
                    <button onClick={() => navigate('/restaurants')} className="btn btn-primary text-lg">
                        Browse Restaurants
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                        Shopping <span className="text-gradient">Cart</span>
                    </h1>
                    <p className="text-gray-600">{cartItems.length} items in your cart</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item, index) => (
                            <div
                                key={`${item._id}-${index}`}
                                className="card p-4 animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex gap-4">
                                    <img
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                                        alt={item.name}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-heading font-bold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-600">{item.restaurantName}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-xl font-bold text-primary-500">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="btn btn-ghost text-red-600 hover:bg-red-50 w-full"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
                                Order Summary
                            </h2>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Promo Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        value={promoCode}
                                        onChange={(e) => {
                                            setPromoCode(e.target.value.toUpperCase());
                                            setPromoError('');
                                        }}
                                        disabled={!!appliedPromo}
                                        className={`input-field flex-1 ${promoError ? 'input-error' : ''}`}
                                    />
                                    {appliedPromo ? (
                                        <button onClick={handleRemovePromo} className="btn btn-outline">
                                            Remove
                                        </button>
                                    ) : (
                                        <button onClick={handleApplyPromo} className="btn btn-primary">
                                            Apply
                                        </button>
                                    )}
                                </div>
                                {promoError && (
                                    <p className="text-red-500 text-sm mt-1">{promoError}</p>
                                )}
                                {appliedPromo && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 text-sm font-semibold">
                                            ✓ {appliedPromo.description} applied!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span className={appliedPromo?.deliveryDiscount ? 'line-through text-gray-400' : ''}>
                                        ${deliveryFee.toFixed(2)}
                                    </span>
                                </div>
                                {appliedPromo?.deliveryDiscount && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Delivery Discount</span>
                                        <span>-${deliveryFee.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-primary-500">
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn btn-primary w-full text-lg py-4"
                            >
                                Proceed to Checkout
                            </button>

                            {/* Suggested Promo Codes */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Available Offers:</p>
                                <div className="space-y-2">
                                    {Object.entries(promoCodes).map(([code, info]) => (
                                        <div key={code} className="text-xs bg-gray-50 p-2 rounded">
                                            <span className="font-mono font-bold text-primary-500">{code}</span>
                                            <span className="text-gray-600"> - {info.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
