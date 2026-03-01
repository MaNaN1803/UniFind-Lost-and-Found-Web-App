import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Rewards = () => {
    const [rewardsData, setRewardsData] = useState({ points: 0, history: [] });
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL} /api/rewards / me`, {
                    headers: { 'x-auth-token': token }
                });
                setRewardsData(response.data);
            } catch (error) {
                console.error('Error fetching rewards:', error);
                toast.error('Could not load your rewards data.');
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, [token]);

    return (
        <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12">
            <Navbar />

            <div className="fixed top-20 right-10 w-72 h-72 bg-zinc-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">

                {/* Total Points Header */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                    <div>
                        <h1 className="text-3xl font-extrabold mb-2">My Community Rewards</h1>
                        <p className="text-gray-300">Earn points by actively helping the community find lost items!</p>
                    </div>
                    <div className="mt-6 md:mt-0 bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:scale-105 transition-all">
                        <p className="text-zinc-600 font-bold uppercase text-sm mb-1 tracking-widest">Total Balance</p>
                        <h2 className="text-5xl font-black text-black drop-shadow-md">
                            {loading ? '...' : rewardsData.points} <span className="text-2xl">pts</span>
                        </h2>
                    </div>
                </div>

                {/* History Area */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500 mb-6">Reward History</h3>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : rewardsData.history.length > 0 ? (
                        <div className="space-y-4">
                            {rewardsData.history.map(item => (
                                <div key={item._id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 hover:border-white/30 rounded-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-zinc-300 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                                            ★
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-200">{item.description}</h4>
                                            <p className="text-sm text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-white">
                                        +{item.pointsAwarded}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <span className="text-5xl opacity-50 mb-4 block">🏆</span>
                            <p className="text-gray-400">You haven't earned any rewards yet. Start by reporting a found item!</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Rewards;
