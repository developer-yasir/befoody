import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const PopularDishes = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularDishes();
    }, []);

    const fetchPopularDishes = async () => {
        try {
            const res = await api.get('/api/fooditems');
            // Get random 6 dishes
            const shuffled = res.data.sort(() => 0.5 - Math.random());
            setDishes(shuffled.slice(0, 6));
        } catch (error) {
            console.error('Error fetching dishes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                    Popular <span className="text-gradient">Dishes</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton h-48 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                Popular <span className="text-gradient">Dishes</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dishes.map((dish) => (
                    <Link
                        key={dish._id}
                        to={`/restaurants/${dish.restaurantId}`}
                        className="card card-hover p-0 overflow-hidden group"
                    >
                        <div className="relative h-32 overflow-hidden">
                            <img
                                src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                                alt={dish.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {dish.isVegetarian && (
                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    🌱 Veg
                                </span>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{dish.name}</h3>
                            <p className="text-primary-500 font-bold text-lg">${dish.price.toFixed(2)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PopularDishes;
