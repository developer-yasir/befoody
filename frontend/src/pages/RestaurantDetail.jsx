import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const [restaurant, setRestaurant] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isFavorite, setIsFavorite] = useState(false);
    const [addingToCart, setAddingToCart] = useState(null);

    useEffect(() => {
        fetchRestaurantData();
    }, [id]);

    const fetchRestaurantData = async () => {
        try {
            const [restaurantRes, foodItemsRes] = await Promise.all([
                api.get(`/api/restaurants/${id}`),
                api.get(`/api/fooditems?restaurantId=${id}`)
            ]);
            setRestaurant(restaurantRes.data);
            setFoodItems(foodItemsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast('Failed to load restaurant data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        setAddingToCart(item._id);
        setTimeout(() => {
            addToCart({ ...item, restaurantId: restaurant._id, restaurantName: restaurant.name });
            addToast(`${item.name} added to cart!`, 'success');
            setAddingToCart(null);
        }, 300);
    };

    const categories = ['All', ...new Set(foodItems.map(item => item.category))];
    const filteredItems = selectedCategory === 'All'
        ? foodItems
        : foodItems.filter(item => item.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="skeleton h-64 rounded-2xl mb-8"></div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card">
                                <div className="skeleton h-48 mb-4 rounded-lg"></div>
                                <div className="skeleton-text mb-2"></div>
                                <div className="skeleton-text w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
                    <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
                        Browse Restaurants
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restaurant Header */}
            <div className="relative h-80 overflow-hidden">
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between">
                            <div className="text-white">
                                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
                                    {restaurant.name}
                                </h1>
                                <p className="text-lg md:text-xl mb-3 opacity-90">{restaurant.description}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {restaurant.cuisine.map((c, i) => (
                                        <span key={i} className="badge bg-white/20 backdrop-blur-sm text-white border border-white/30">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <span className="flex items-center gap-1">
                                        <span className="text-yellow-400 text-lg">⭐</span>
                                        <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
                                    </span>
                                    <span>🕐 {restaurant.deliveryTime} min</span>
                                    <span>📍 {restaurant.address}</span>
                                    {restaurant.deliveryFee === 0 ? (
                                        <span className="badge badge-success">FREE DELIVERY</span>
                                    ) : (
                                        <span>💰 ${restaurant.deliveryFee.toFixed(2)} delivery</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="btn bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
                            >
                                {isFavorite ? '❤️' : '🤍'} {isFavorite ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Tabs */}
                <div className="mb-8 sticky top-20 bg-gray-50 py-4 z-10">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`btn whitespace-nowrap ${selectedCategory === category
                                    ? 'btn-primary'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                        {selectedCategory === 'All' ? 'All Items' : selectedCategory}
                    </h2>

                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🍽️</div>
                            <p className="text-gray-600">No items in this category</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item, index) => (
                                <div
                                    key={item._id}
                                    className="card card-hover p-0 overflow-hidden animate-scale-in"
                                    style={{ animationDelay: `${index * 0.03}s` }}
                                >
                                    <div
                                        className="relative h-48 overflow-hidden group cursor-pointer"
                                        onClick={() => navigate(`/dishes/${item._id}`)}
                                    >
                                        <img
                                            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {item.isVegetarian && (
                                            <span className="absolute top-3 left-3 badge badge-success">
                                                🌱 Vegetarian
                                            </span>
                                        )}
                                        {item.isVegan && (
                                            <span className="absolute top-3 left-3 badge bg-green-600 text-white">
                                                🌿 Vegan
                                            </span>
                                        )}
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="badge badge-error text-lg">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3
                                            className="text-lg font-heading font-bold text-gray-900 mb-2 cursor-pointer hover:text-primary-500 transition-colors"
                                            onClick={() => navigate(`/dishes/${item._id}`)}
                                        >
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-primary-500">
                                                ${item.price.toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!item.isAvailable || addingToCart === item._id}
                                                className={`btn text-sm py-2 px-4 transition-all duration-300 ${addingToCart === item._id
                                                    ? 'btn-secondary scale-95'
                                                    : 'btn-primary hover:shadow-glow'
                                                    }`}
                                            >
                                                {addingToCart === item._id ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="animate-spin">⏳</span>
                                                        Adding...
                                                    </span>
                                                ) : item.isAvailable ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-lg">🛒</span>
                                                        Add to Cart
                                                    </span>
                                                ) : (
                                                    'Unavailable'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                        Customer Reviews
                    </h2>
                    <div className="card">
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">⭐</div>
                            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                            <button className="btn btn-primary mt-4">Write a Review</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;
