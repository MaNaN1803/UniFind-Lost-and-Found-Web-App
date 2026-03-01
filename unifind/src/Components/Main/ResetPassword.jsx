import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/password-reset/reset/${token}`, { password });
            toast.success(data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 pt-12">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full mix-blend-screen filter blur-[80px] opacity-10 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <span className="text-4xl block mb-4">🔓</span>
                    <h2 className="text-3xl font-black mb-2">Create New Password</h2>
                    <p className="text-zinc-400 text-sm">Please enter your strong new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? 'Updating...' : 'Save New Password'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <Link to="/login" className="text-zinc-400 hover:text-white font-medium transition-colors border-b border-transparent hover:border-white pb-1">
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
