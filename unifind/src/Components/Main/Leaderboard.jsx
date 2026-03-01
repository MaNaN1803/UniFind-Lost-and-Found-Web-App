import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../apiConfig";
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

const Leaderboard = () => {
    const { token, user: authUser } = useAuth();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/user/leaderboard`, {
                    headers: { 'x-auth-token': token }
                });
                setLeaders(response.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchLeaderboard();
    }, [token]);

    const getBadge = (index, points) => {
        if (!points || points <= 0) return '🎖️ Samaritan';
        if (index === 0) return '🥇 Gold Finder';
        if (index === 1) return '🥈 Silver Finder';
        if (index === 2) return '🥉 Bronze Finder';
        if (index < 10) return '🏅 Top 10';
        return '🎖️ Samaritan';
    };

    const getRowStyle = (index, points) => {
        if (!points || points <= 0) return 'bg-white/5 border-white/10 hover:bg-white/10';
        if (index === 0) return 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
        if (index === 1) return 'bg-zinc-300/20 border-zinc-300/50 shadow-[0_0_15px_rgba(212,212,216,0.3)]';
        if (index === 2) return 'bg-amber-700/20 border-amber-700/50 shadow-[0_0_15px_rgba(180,83,9,0.3)]';
        return 'bg-white/5 border-white/10 hover:bg-white/10';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 font-sans overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 inline-block">
                        Top Samaritans 🏆
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Recognizing the students who keep our campus honest and helpful.
                    </p>
                </div>

                <div className="space-y-4">
                    {leaders.map((leader, index) => (
                        <div
                            key={leader._id}
                            className={`flex items-center gap-6 p-6 rounded-2xl border transition-all ${getRowStyle(index, leader.points)} ${leader._id === authUser._id ? 'ring-2 ring-white/50' : ''}`}
                        >
                            {/* Rank */}
                            <div className="flex-shrink-0 w-12 text-center text-3xl font-black text-white/50">
                                #{index + 1}
                            </div>

                            {/* Avatar */}
                            <img
                                src={leader.profilePicture || `https://robohash.org/${leader._id}?set=set4&bgset=bg1`}
                                alt={leader.firstName}
                                className="w-16 h-16 rounded-full border-2 border-white/20 object-cover bg-black"
                            />

                            {/* Info */}
                            <div className="flex-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {leader.firstName} {leader.lastName}
                                    {leader._id === authUser._id && <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                </h2>
                                <span className={`text-sm font-bold mt-1 inline-block ${(!leader.points || leader.points <= 0) ? 'text-zinc-500' : index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
                                    {getBadge(index, leader.points)}
                                </span>
                            </div>

                            {/* Score */}
                            <div className="flex-shrink-0 text-right">
                                <span className="block text-3xl font-black">{leader.points || 0}</span>
                                <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase">PTS</span>
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <span className="text-6xl mb-4 block">👻</span>
                            <h3 className="text-2xl font-bold mb-2">It's a Ghost Town</h3>
                            <p className="text-zinc-500">No one has earned any points yet. Be the first!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
