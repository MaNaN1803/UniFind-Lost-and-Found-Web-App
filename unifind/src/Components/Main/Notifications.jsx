import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllNotifications = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/notifications/all`, {
                    headers: { 'x-auth-token': token }
                });
                setNotifications(response.data);
            } catch (err) {
                console.error("Failed to fetch notification history");
                toast.error("Could not load notifications");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchAllNotifications();
    }, [token]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
                headers: { 'x-auth-token': token }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear your entire notification history? This cannot be undone.")) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/notifications/clear`, {
                headers: { 'x-auth-token': token }
            });
            setNotifications([]);
            toast.success("Notification history cleared!");
        } catch (err) {
            toast.error("Failed to clear notifications");
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'chat_invite': return '💬';
            case 'claim_approved': return '✅';
            case 'claim_rejected': return '❌';
            case 'claim_request': return '📝';
            default: return '🔔';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Navbar />
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zinc-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 z-10 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors font-medium mb-4"
                        >
                            ← Back
                        </button>
                        <h1 className="text-4xl font-black text-white">Notification History</h1>
                        <p className="text-zinc-400 mt-2">Manage all your account alerts and chat invitations.</p>
                    </div>

                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-6 rounded-xl border border-red-500/20 transition-all flex items-center gap-2"
                        >
                            🗑️ Clear History
                        </button>
                    )}
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                    {notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="text-5xl mb-4 opacity-30">📭</div>
                            <h3 className="text-xl font-bold text-zinc-300 mb-2">You're all caught up!</h3>
                            <p className="text-zinc-500">There are no existing notifications in your history.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`p-6 flex flex-col sm:flex-row items-start gap-4 transition-colors ${notif.read ? 'bg-transparent opacity-75' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0 border border-white/10">
                                        {getIconForType(notif.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className={`text-lg ${notif.read ? 'text-zinc-300' : 'text-white font-bold'}`}>
                                                {notif.message}
                                            </p>
                                            {!notif.read && (
                                                <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 ml-4 mt-2"></span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                                            <span className="text-zinc-500 font-mono">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </span>

                                            {notif.link && (
                                                <Link
                                                    to={notif.link}
                                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                                >
                                                    View Details ↗
                                                </Link>
                                            )}

                                            {!notif.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif._id)}
                                                    className="text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
