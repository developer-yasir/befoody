import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import OrderTimeline from '../components/OrderTimeline';

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/api/orders/track/${id}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Order not found or server error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-600 mb-6">{error || "We couldn't find the order you're looking for."}</p>
                <Link to="/" className="btn btn-primary">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                        Order <span className="text-gradient">Tracking</span>
                    </h1>
                    <p className="text-gray-600">
                        Order #{order._id.slice(-6).toUpperCase()} • {order.restaurant?.name}
                    </p>
                </div>

                {/* Status Card */}
                <div className="card mb-6">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <OrderTimeline currentStatus={order.status} />
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Order Items</h3>
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>
                                        <span className="font-semibold">{item.quantity}x</span> {item.name}
                                    </span>
                                    <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg text-primary-600">
                            <span>Total</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Delivery Details</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide">Deliver To</p>
                                <p className="font-medium text-gray-900">
                                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide">Restaurant</p>
                                <p className="font-medium text-gray-900">{order.restaurant?.name}</p>
                                <p className="text-gray-600">{order.restaurant?.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-4">
                        Save this link to track your order status:
                        <br />
                        <span className="font-mono bg-white px-2 py-1 rounded border mt-1 inline-block select-all">
                            {window.location.href}
                        </span>
                    </p>
                    <Link to="/" className="btn btn-outline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
