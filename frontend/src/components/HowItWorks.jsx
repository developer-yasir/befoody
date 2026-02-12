import React from 'react';

const steps = [
    {
        icon: '🔍',
        title: 'Browse',
        description: 'Choose from hundreds of restaurants'
    },
    {
        icon: '🛒',
        title: 'Order',
        description: 'Add items to cart and checkout'
    },
    {
        icon: '🚀',
        title: 'Enjoy',
        description: 'Get it delivered to your doorstep'
    }
];

const HowItWorks = () => {
    return (
        <div className="py-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
                How It <span className="text-gradient">Works</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-4xl shadow-glow">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-heading font-bold mb-2">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HowItWorks;
