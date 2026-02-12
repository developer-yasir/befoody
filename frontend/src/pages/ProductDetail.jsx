import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProductData();
    }, [id]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/fooditems/${id}`);
            setProduct(res.data);

            // Fetch similar products in same category
            const similarRes = await api.get(`/api/fooditems?category=${res.data.category}`);
            // Filter out current product and take 4
            const others = similarRes.data.filter(p => p._id !== id).slice(0, 4);
            setSimilarProducts(others);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            addToast('Failed to load product details', 'error');
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        setAdding(true);
        // Add multiple based on quantity if the cart context supports it
        // If not, we'll just add one and maybe fix context later if needed
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }

        setTimeout(() => {
            addToast(`${quantity} x ${product.name} added to cart!`, 'success');
            setAdding(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 flex justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold">Loading delicious details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Product not found</h2>
                <Link to="/dishes" className="text-primary-600 font-bold">Back to all dishes</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold mb-8 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden mb-16">
                    <div className="flex flex-col lg:flex-row">
                        {/* Image Section */}
                        <div className="lg:w-1/2 p-4 lg:p-8">
                            <div className="relative rounded-[2.5rem] overflow-hidden aspect-square shadow-inner">
                                <img
                                    src={product.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                {product.isVegetarian && (
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-green-100 shadow-sm">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-black text-green-700 uppercase tracking-widest">Vegetarian</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                                    <span>{product.category}</span>
                                    <span>•</span>
                                    <span>{product.restaurantId?.name || 'Restaurant'}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4 leading-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                        <span className="text-yellow-500">★</span>
                                        <span className="text-sm font-black text-yellow-700">4.8</span>
                                    </div>
                                    <span className="text-gray-400 font-medium">100+ reviews</span>
                                </div>
                                <p className="text-gray-500 text-lg font-medium leading-relaxed mb-8">
                                    {product.description || "Indulge in our exquisite creation, prepared with the finest ingredients and a passion for flavor. Each bite is a journey through textures and tastes that will leave you craving more."}
                                </p>
                            </div>

                            <div className="mt-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Price</span>
                                        <span className="text-4xl font-black text-primary-600 tracking-tighter">${product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center bg-gray-50 rounded-2xl p-2 border border-gray-100">
                                        <button
                                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span className="w-12 text-center font-black text-gray-900 text-lg">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-primary-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={adding}
                                        className="bg-primary-600 text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary-500/30 hover:bg-primary-700 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                    >
                                        {adding ? (
                                            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        to={`/restaurants/${product.restaurantId?._id}`}
                                        className="bg-gray-900 text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-gray-900/20 hover:bg-black transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Explore Restaurant
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">You might also <span className="text-primary-600">like</span></h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {similarProducts.map((p) => (
                                <Link
                                    key={p._id}
                                    to={`/dishes/${p._id}`}
                                    className="group bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                                >
                                    <div className="aspect-square rounded-[2rem] overflow-hidden mb-4">
                                        <img
                                            src={p.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                            alt={p.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="font-black text-gray-900 group-hover:text-primary-600 transition-colors">{p.name}</h3>
                                    <p className="text-primary-600 font-black tracking-tight">${p.price.toFixed(2)}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
