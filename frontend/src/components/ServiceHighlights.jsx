import React, { memo } from 'react';

const ServiceHighlights = () => {
    const features = [
        {
            icon: '🚀',
            title: 'Fastest Delivery',
            description: 'Get your food delivered in under 30 minutes or it\'s free.',
            color: 'bg-orange-50'
        },
        {
            icon: '📍',
            title: 'Live Tracking',
            description: 'Know exactly where your order is with real-time GPS tracking.',
            color: 'bg-teal-50'
        },
        {
            icon: '⭐',
            title: 'Best Partners',
            description: 'We only partner with the top-rated restaurants in your city.',
            color: 'bg-purple-50'
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`p-8 rounded-3xl ${feature.color} border border-transparent hover:border-white hover:shadow-xl transition-all duration-300 group`}
                        >
                            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default memo(ServiceHighlights);
