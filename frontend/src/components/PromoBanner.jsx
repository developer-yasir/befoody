import React, { useState, useEffect } from 'react';

const promoBanners = [
    {
        id: 1,
        title: '50% OFF First Order',
        subtitle: 'Use code: FIRST50',
        bgColor: 'from-orange-500 to-red-500',
        icon: '🎉'
    },
    {
        id: 2,
        title: 'Free Delivery',
        subtitle: 'On orders above $20',
        bgColor: 'from-blue-500 to-purple-500',
        icon: '🚚'
    },
    {
        id: 3,
        title: 'Weekend Special',
        subtitle: 'Get 30% off on all orders',
        bgColor: 'from-green-500 to-teal-500',
        icon: '⭐'
    }
];

const PromoBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % promoBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl h-48 md:h-56">
            {promoBanners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-all duration-500 ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                        }`}
                >
                    <div className={`h-full bg-gradient-to-r ${banner.bgColor} p-8 flex items-center justify-between text-white`}>
                        <div>
                            <div className="text-5xl mb-2">{banner.icon}</div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-2">{banner.title}</h3>
                            <p className="text-lg md:text-xl opacity-90">{banner.subtitle}</p>
                        </div>
                        <button className="hidden md:block btn bg-white text-gray-900 hover:bg-gray-100">
                            Order Now
                        </button>
                    </div>
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {promoBanners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PromoBanner;
