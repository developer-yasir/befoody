import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const Checkout = () => {
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isGuest, setIsGuest] = useState(!user);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate cart has items
            if (!cartItems || cartItems.length === 0) {
                alert('Your cart is empty');
                navigate('/cart');
                return;
            }

            // Get restaurant ID from first item
            const restaurantId = cartItems[0]?.restaurantId;
            if (!restaurantId) {
                alert('Invalid cart data. Please try adding items again.');
                clearCart();
                navigate('/restaurants');
                return;
            }

            // Validate address
            if (!address.street || !address.city || !address.state) {
                alert('Please fill in all address fields');
                setLoading(false);
                return;
            }

            // Validate guest info if not logged in
            if (!user && (!guestInfo.name || !guestInfo.email || !guestInfo.phone)) {
                alert('Please fill in your contact information');
                setLoading(false);
                return;
            }

            const orderData = {
                restaurantId,
                items: cartItems.map(item => ({
                    foodItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: getCartTotal() + 2.99,
                deliveryFee: 2.99,
                deliveryAddress: address,
                paymentMethod: 'cash',
                ...(!user && { guestInfo }) // Include guest info if not logged in
            };

            console.log('Placing order:', orderData);

            const response = await api.post('/api/orders', orderData);
            console.log('Order placed:', response.data);

            clearCart();
            alert('Order placed successfully! 🎉');

            if (user) {
                navigate('/orders');
            } else {
                navigate(`/track-order/${response.data._id}`);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            console.error('Error response:', error.response?.data);
            alert(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // State for checkout step: 'selection' | 'form'
    const [step, setStep] = useState(user ? 'form' : 'selection');

    // Update step if user logs in while on page
    React.useEffect(() => {
        if (user) {
            setStep('form');
        }
    }, [user]);

    const handleGuestCheckout = () => {
        setIsGuest(true);
        setStep('form');
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    // Render Selection Step
    if (step === 'selection') {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-heading font-bold text-gray-900">
                            Almost there! 🍔
                        </h2>
                        <p className="mt-2 text-gray-600">
                            How would you like to proceed with your order?
                        </p>
                    </div>

                    <div className="space-y-4 mt-8">
                        {/* Login Option */}
                        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/login', { state: { from: '/checkout' } })}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                                    🔑
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Login to Account</h3>
                                    <p className="text-sm text-gray-600">Save addresses & track orders</p>
                                </div>
                                <div className="ml-auto text-primary-500">→</div>
                            </div>
                        </div>

                        {/* Guest Option */}
                        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={handleGuestCheckout}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Continue as Guest</h3>
                                    <p className="text-sm text-gray-600">Quick checkout without account</p>
                                </div>
                                <div className="ml-auto text-secondary-500">→</div>
                            </div>
                        </div>

                        {/* Sign Up Option */}
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">
                                New here?{' '}
                                <span
                                    onClick={() => navigate('/register', { state: { from: '/checkout' } })}
                                    className="text-primary-600 font-semibold cursor-pointer hover:underline"
                                >
                                    Create an account
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-heading font-bold text-gray-900 mb-8">
                    <span className="text-gradient">Checkout</span>
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="card">
                            {/* Guest Information */}
                            {!user && (
                                <>
                                    <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        Your Information
                                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Guest</span>
                                    </h2>
                                    <div className="space-y-4 mb-8">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            required
                                            value={guestInfo.name}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                            className="input-field"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            value={guestInfo.email}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                            className="input-field"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            required
                                            value={guestInfo.phone}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Delivery Address */}
                            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                                Delivery Address
                            </h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    required
                                    value={address.street}
                                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                    className="input-field"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        required
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="input-field"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        required
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    required
                                    value={address.zipCode}
                                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full mt-6 text-lg py-4"
                            >
                                {loading ? 'Placing Order...' : `Place Order - $${(getCartTotal() + 2.99).toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-700">
                                            {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>$2.99</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-primary-500 pt-2 border-t">
                                    <span>Total</span>
                                    <span>${(getCartTotal() + 2.99).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="text-2xl">💵</span>
                                    <span>Cash on Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
