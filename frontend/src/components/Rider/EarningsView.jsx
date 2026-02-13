import React, { useEffect, useState } from 'react';
import { getEarnings } from '../../services/riderService';

const EarningsView = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('weekly'); // 'daily' or 'weekly'

    useEffect(() => {
        const loadEarnings = async () => {
            try {
                const earningsData = await getEarnings();
                setData(earningsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadEarnings();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );

    if (!data) return (
        <div className="p-8 text-center text-red-500">
            <p className="font-bold">Failed to load earnings data</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-primary-600 font-bold underline">Retry</button>
        </div>
    );

    const maxAmount = Math.max(...(data.chart?.map(d => d.amount) || [0]), 100);

    return (
        <div className="pb-24 px-6 md:px-10 pt-8 md:pt-12">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Earnings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Total Balance Card */}
                <div className="lg:col-span-1 bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div className="relative z-10">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
                        <h2 className="text-5xl font-black mb-8">{formatCurrency(data.totalEarnings)}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Today</p>
                                <p className="text-lg font-bold text-green-400">+{formatCurrency(data.today?.amount)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">This Week</p>
                                <p className="text-lg font-bold text-blue-400">+{formatCurrency(data.week?.amount)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                    <button className="relative z-10 mt-8 bg-white/10 hover:bg-white/20 transition-all border border-white/10 py-4 rounded-2xl font-bold text-sm">
                        Withdraw Funds
                    </button>
                </div>

                {/* Analytics Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Activity</h3>
                            <p className="text-sm text-gray-400 font-medium">Daily earnings analysis</p>
                        </div>
                        <div className="bg-gray-100 p-1.5 rounded-xl flex text-xs font-bold">
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-6 py-2 rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400'}`}
                            >
                                Weekly
                            </button>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-56 gap-3 md:gap-6">
                        {data.chart?.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                                <div className="w-full bg-gray-50 rounded-2xl relative group-hover:bg-primary-50 transition-colors cursor-pointer" style={{ height: '100%' }}>
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-primary-500 rounded-2xl transition-all duration-1000 group-hover:bg-primary-600 shadow-lg shadow-primary-500/20"
                                        style={{ height: `${(day.amount / maxAmount) * 100}%` }}
                                    ></div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-10 shadow-2xl">
                                        {formatCurrency(day.amount)}
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Payouts */}
            <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6 px-1">Recent Payouts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.recentPayouts?.map(payout => (
                        <div key={payout.id} className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-3xl shadow-inner border border-green-100/50">🏦</div>
                                <div>
                                    <p className="text-lg font-black text-gray-900">Bank Transfer</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-gray-900">{formatCurrency(payout.amount)}</p>
                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-100">{payout.status}</span>
                            </div>
                        </div>
                    ))}
                    {(!data.recentPayouts || data.recentPayouts.length === 0) && (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <span className="text-4xl mb-4 block">💰</span>
                            <p className="text-gray-400 font-bold">No recent payouts to display</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EarningsView;
