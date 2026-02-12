import React, { memo } from 'react';
import heroBg from '../assets/hero_bg.png';

const Hero = ({ searchTerm, setSearchTerm, handleSearch }) => {
    const popularKeywords = ['Pizza', 'Burger', 'Sushi', 'Desserts', 'Healthy'];

    return (
        <div className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="Delicious food background"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-white/100 backdrop-blur-[2px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <div className="animate-fade-in-up">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md border border-primary-500/30">
                        Premium Food Experience
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                        Flavor Delivered <br />
                        <span className="text-primary-500">Fast & Fresh.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Discover the best restaurants in your city and get your favorite meals delivered straight to your door.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <form onSubmit={handleSearch} className="relative flex items-center bg-white p-2 rounded-2xl shadow-2xl">
                            <div className="pl-4 pr-2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="What are you craving today?"
                                className="flex-1 py-4 text-lg font-bold text-gray-800 placeholder-gray-400 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-black transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/30"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Popular Keywords */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in delay-500">
                        <span className="text-white/60 text-sm font-bold pt-1.5">Popular:</span>
                        {popularKeywords.map((word) => (
                            <button
                                key={word}
                                onClick={() => setSearchTerm(word)}
                                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all backdrop-blur-md"
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce flex flex-col items-center gap-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-primary-500 to-transparent"></div>
            </div>
        </div>
    );
};

export default memo(Hero);
