import React, { memo } from 'react';

const Testimonials = () => {
    const reviews = [
        {
            name: 'Sarah Jenkins',
            role: 'Food Blogger',
            content: 'Befoody has completely changed how I order food. The premium interface and lightning-fast delivery are unmatched.',
            avatar: 'https://i.pravatar.cc/150?u=sarah'
        },
        {
            name: 'Michael Chen',
            role: 'Software Engineer',
            content: 'The live tracking is incredibly accurate. I love knowing exactly when my burger will arrive at my doorstep.',
            avatar: 'https://i.pravatar.cc/150?u=michael'
        },
        {
            name: 'Elena Rodriguez',
            role: 'Designer',
            content: 'Beautifully designed app! It makes browsing local restaurants a joy. Highly recommended for foodies.',
            avatar: 'https://i.pravatar.cc/150?u=elena'
        }
    ];

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">What Our Foodies Say</h2>
                    <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group"
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-6 shadow-lg border-4 border-primary-50 ring-1 ring-primary-100 group-hover:scale-110 transition-transform duration-300">
                                <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex gap-1 mb-4 text-yellow-400">
                                {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
                            </div>
                            <p className="text-gray-600 font-medium italic mb-6 leading-relaxed">
                                "{review.content}"
                            </p>
                            <h4 className="font-black text-gray-900 leading-none">{review.name}</h4>
                            <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mt-2">{review.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default memo(Testimonials);
