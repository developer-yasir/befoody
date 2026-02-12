import React, { memo } from 'react';

const Collections = () => {
    const collections = [
        {
            title: 'Breakfast Specials',
            count: '12 Places',
            image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            color: 'from-orange-500/80'
        },
        {
            title: 'Late Night Cravings',
            count: '8 Places',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            color: 'from-blue-500/80'
        },
        {
            title: 'Healthy Bites',
            count: '15 Places',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            color: 'from-green-500/80'
        },
        {
            title: 'Sweet Tooth',
            count: '10 Places',
            image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            color: 'from-pink-500/80'
        }
    ];

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Collections</h2>
                        <p className="text-gray-500 font-medium mt-2">Explore curated lists of top restaurants</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {collections.map((item, index) => (
                        <div
                            key={index}
                            className="group relative h-80 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${item.color} to-transparent opacity-60`}></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-xl font-black text-white leading-tight mb-1">{item.title}</h3>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{item.count} →</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default memo(Collections);
