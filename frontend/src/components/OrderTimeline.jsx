import React from 'react';

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready_for_pickup', label: 'Ready', icon: '📦' },
    { key: 'out_for_delivery', label: 'On the Way', icon: '🚴' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
];

const OrderTimeline = ({ currentStatus }) => {
    const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);

    return (
        <div className="py-6">
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                        style={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={step.key} className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${isCompleted
                                            ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow scale-110'
                                            : 'bg-gray-200'
                                        } ${isCurrent ? 'animate-pulse-slow' : ''}`}
                                >
                                    {step.icon}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-semibold text-center ${isCompleted ? 'text-primary-500' : 'text-gray-500'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderTimeline;
