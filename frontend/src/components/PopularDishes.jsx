import React, { useState, useEffect, memo } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const PopularDishes = () => {
    const navigate = useNavigate();
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPopularDishes();
    }, []);

    const fetchPopularDishes = async () => {
        try {
            const res = await api.get('/api/fooditems');
            // Get random 6 dishes
            const shuffled = [...res.data].sort(() => 0.5 - Math.random());
            setDishes(shuffled.slice(0, 6));
        } catch (error) {
            console.error('Error fetching dishes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-10 w-48 bg-gray-100 rounded-lg mb-8 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-100 h-40 rounded-3xl mb-4"></div>
                            <div className="bg-gray-100 h-4 w-3/4 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (dishes.length === 0) return null;

    return (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Popular Dishes</h2>
                    <p className="text-gray-500 font-medium mt-2">Our customers' most loved choices</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {dishes.map((dish) => (
                    <div
                        key={dish._id}
                        onClick={() => navigate(`/dishes/${dish._id}`)}
                        className="group flex flex-col cursor-pointer"
                    >
                        <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2">
                            <img
                                src={dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                                alt={dish.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {dish.isVegetarian && (
                                <div className="absolute top-3 left-3 w-6 h-6 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest bg-primary-600 px-2 py-0.5 rounded">Order Now</span>
                            </div>
                        </div>
                        <h3 className="font-black text-gray-900 text-sm line-clamp-1 group-hover:text-primary-600 transition-colors leading-tight">
                            {dish.name}
                        </h3>
                        <p className="text-primary-600 font-black text-base mt-1 tracking-tight">${dish.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default memo(PopularDishes);
