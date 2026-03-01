import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const Profile = () => {
    const { token, user: authUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'claims', 'rewards'

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/user/me/full`, {
                headers: { 'x-auth-token': token }
            });
            setProfileData(response.data);
        } catch (err) {
            console.error("Failed to fetch profile data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchProfile();
    }, [token]);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            // 1. Upload new image file
            const uploadRes = await axios.post(`${API_BASE_URL}/api/upload/image`, formData);
            const imageUrl = uploadRes.data.imageUrl;

            // 2. Map new URL to User document
            await axios.put(`${API_BASE_URL}/api/user/me/avatar`, { imageUrl }, {
                headers: { 'x-auth-token': token }
            });

            // 3. Refresh Profile Data
            fetchProfile();

        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!profileData) return null;

    const { user, posts, claims, rewards } = profileData;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4">
                {/* Profile Header Widget */}
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none"></div>

                    <div className="relative group w-32 h-32 rounded-full border-4 border-zinc-700 overflow-hidden flex-shrink-0 z-10 cursor-pointer">
                        <img
                            src={user.profilePicture || `https://robohash.org/${user._id}?set=set4&bgset=bg1`}
                            alt={`${user.firstName}'s Avatar`}
                            className={`w-full h-full object-cover transition-all ${uploadingAvatar ? 'opacity-50 grayscale' : 'group-hover:opacity-50'}`}
                        />

                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-sm">
                            {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
                            />
                        </label>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h1 className="text-4xl font-black mb-2">{user.firstName} {user.lastName}</h1>
                        <p className="text-zinc-400 font-mono text-sm mb-4">{user.email} {user.phoneNumber ? `| ${user.phoneNumber}` : ''}</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl">
                                <span className="block text-2xl font-bold text-white">{posts.length}</span>
                                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Items Reported</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl">
                                <span className="block text-2xl font-bold text-white">{claims.length}</span>
                                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Claims Made</span>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-xl">
                                <span className="block text-2xl font-bold text-yellow-400">{user.points || 0}</span>
                                <span className="text-xs text-yellow-500/50 uppercase tracking-widest font-bold">Total Pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal QR Return Tag */}
                    <div className="relative z-10 hidden md:flex flex-col items-center bg-white/5 border border-white/10 p-4 rounded-2xl ml-auto">
                        <QRCodeSVG
                            value={`http://localhost:3000/scan/${user._id}`}
                            size={100}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            className="rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.4)] border-4 border-white mb-3"
                        />
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">My Return Tag</span>
                    </div>
                </div>

                {/* Dynamic Tabs */}
                <div className="flex border-b border-white/10 mb-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-8 py-4 font-bold text-sm tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('claims')}
                        className={`px-8 py-4 font-bold text-sm tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'claims' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        My Claims
                    </button>
                    <button
                        onClick={() => setActiveTab('rewards')}
                        className={`px-8 py-4 font-bold text-sm tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'rewards' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Reward Log
                    </button>
                </div>

                {/* Tab Content Maps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {activeTab === 'posts' && posts.map(item => (
                        <Link to={`/item/${item._id}`} key={item._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors block">
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg mb-4 inline-block ${item.type === 'lost' ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}>{item.type}</span>
                            <p className="text-zinc-300 line-clamp-2 mb-4">{item.description}</p>
                            <div className="text-xs text-zinc-500 flex justify-between">
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className={item.status === 'resolved' ? 'text-green-500 font-bold' : 'text-zinc-400'}>{item.status.toUpperCase()}</span>
                            </div>
                        </Link>
                    ))}

                    {activeTab === 'claims' && claims.map(claim => (
                        <Link to={`/item/${claim.itemId?._id}`} key={claim._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors block">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg ${claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    claim.status === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                        'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                    }`}>{claim.status}</span>
                                <span className="text-xs text-zinc-500">{new Date(claim.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-white text-sm mb-2">Claim ID: {claim._id.slice(-6)}</h4>
                            <p className="text-zinc-400 text-sm line-clamp-2">{claim.description}</p>
                        </Link>
                    ))}

                    {activeTab === 'rewards' && rewards.map(reward => (
                        <div key={reward._id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex flex-shrink-0 items-center justify-center text-xl">🏆</div>
                            <div>
                                <h4 className="text-yellow-500 font-bold">+{reward.pointsAwarded} PTS</h4>
                                <p className="text-sm text-zinc-300 mt-1">{reward.description}</p>
                                <p className="text-xs text-zinc-500 mt-2 font-mono">{new Date(reward.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}

                    {/* Empty States */}
                    {activeTab === 'posts' && posts.length === 0 && <div className="text-zinc-500 text-center col-span-3 py-12">No reports submitted yet.</div>}
                    {activeTab === 'claims' && claims.length === 0 && <div className="text-zinc-500 text-center col-span-3 py-12">No claims filed yet.</div>}
                    {activeTab === 'rewards' && rewards.length === 0 && <div className="text-zinc-500 text-center col-span-3 py-12">No rewards earned yet. Go find some items!</div>}

                </div>
            </div>
        </div>
    );
};

export default Profile;
