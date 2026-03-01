import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { io } from "socket.io-client";
import toast from 'react-hot-toast';
import ReadOnlyMap from './ReadOnlyMap';

import API_BASE_URL from '../../apiConfig';

const socket = io(API_BASE_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
});

// Dynamic Rewards Logic
const calculateReward = (description) => {
    if (!description) return 10;
    const lowerDesc = description.toLowerCase();

    // Base scores by broad category recognition
    let score = 10;

    // Electronics carry a high base bounty (30 points)
    if (lowerDesc.includes('electronics') || lowerDesc.includes('laptop') || lowerDesc.includes('phone') || lowerDesc.includes('macbook') || lowerDesc.includes('ipad') || lowerDesc.includes('airpods') || lowerDesc.includes('headphones')) {
        score = 30;
        // Preciousness modifiers for high-value electronics
        if (lowerDesc.includes('pro') || lowerDesc.includes('max') || lowerDesc.includes('ultra') || lowerDesc.includes('gaming')) {
            score += 20; // Extra points for high-tier models
        }
    } else if (lowerDesc.includes('wallet') || lowerDesc.includes('purse') || lowerDesc.includes('cash') || lowerDesc.includes('card')) {
        score = 25; // High priority personal items
    } else if (lowerDesc.includes('keys') || lowerDesc.includes('glasses') || lowerDesc.includes('watch') || lowerDesc.includes('jewelry')) {
        score = 20; // Medium-high priority
    } else if (lowerDesc.includes('document') || lowerDesc.includes('id') || lowerDesc.includes('passport')) {
        score = 50; // Critical priority
    }

    return score;
};

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [item, setItem] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chat Invite Modal State
    const [chatModal, setChatModal] = useState({ isOpen: false, targetUserId: null, targetName: '', itemId: null });
    const [chatRoomId, setChatRoomId] = useState('');
    const [chatSenderName, setChatSenderName] = useState('');

    useEffect(() => {
        if (user?.firstName) setChatSenderName(user.firstName);
    }, [user]);

    const handleChatInviteSubmit = (e) => {
        e.preventDefault();
        if (!chatRoomId.trim() || !chatSenderName.trim()) {
            return toast.error("Please fill in both your Name and the Room ID.");
        }
        socket.emit("invite_to_chat", {
            targetUserId: chatModal.targetUserId,
            senderUserId: user?._id || user?.id,
            senderName: chatSenderName,
            roomId: chatRoomId,
            itemId: chatModal.itemId
        });
        toast.success(`Chat invitation sent to ${chatModal.targetName}!`);
        setChatModal({ isOpen: false, targetUserId: null, targetName: '', itemId: null });
        setChatRoomId('');
    };

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/feed/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setItem(response.data);

                // Fetch claims associated with this item
                const claimsResponse = await axios.get(`${API_BASE_URL}/api/claimfounditem/item/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                setClaims(claimsResponse.data);
            } catch (err) {
                console.error('Error fetching item details:', err);
                setError('Item not found or you do not have access.');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchItemDetails();
    }, [id, token]);

    const handleShare = async () => {
        const shareData = {
            title: `UniFind: ${item.type === 'lost' ? 'Lost' : 'Found'} Item Alert`,
            text: `Check out this ${item.type} item on UniFind: ${item.description}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Shared successfully!');
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback for desktop browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zinc-500"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-black text-white pt-24 pb-12">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 text-center mt-20">
                    <h1 className="text-4xl font-bold mb-4 text-red-500">Oops!</h1>
                    <p className="text-zinc-400 mb-8">{error || 'Something went wrong.'}</p>
                    <Link to="/feed" className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors">
                        Return to Feed
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/feed')}
                        className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors font-medium"
                    >
                        ← Back to Feed
                    </button>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md flex flex-col md:flex-row">

                    {/* Image Section */}
                    <div className="md:w-1/2 bg-black/60 relative flex items-center justify-center min-h-[400px]">
                        {item.imagePath ? (
                            <img
                                src={item.imagePath.startsWith('http') ? item.imagePath : `${API_BASE_URL}/${item.imagePath.replace(/\\/g, '/').startsWith('public/') ? item.imagePath.replace(/\\/g, '/').replace('public/', '') : item.imagePath.replace(/\\/g, '/')}`}
                                alt={item.description}
                                className="w-full h-full object-cover max-h-[600px]"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800"; }}
                            />
                        ) : (
                            <img
                                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800"
                                alt="Placholder"
                                className="w-full h-full object-cover max-h-[600px] opacity-50 grayscale"
                            />
                        )}

                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg backdrop-blur-md shadow-lg ${item.type === 'lost'
                                ? 'bg-zinc-800/80 text-zinc-200 border border-zinc-700'
                                : 'bg-white/80 text-black border border-white'
                                }`}>
                                {item.type}
                            </span>
                            <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg backdrop-blur-md shadow-lg ${item.status === 'resolved'
                                ? 'bg-zinc-800/50 text-zinc-500 border border-zinc-700'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                }`}>
                                {item.status || 'open'}
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                                {item.title || (item.type === 'lost' ? 'Lost Item Report' : 'Found Item Record')}
                            </h1>

                            <div className="flex items-center gap-2 mb-8 text-sm text-zinc-500 font-mono">
                                <span>ID: {item._id}</span>
                                <span>•</span>
                                <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Description</h3>
                                <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-lg bg-black/30 p-4 rounded-xl border border-white/5">
                                    {item.description}
                                </p>

                                {item.location && item.location.lat && item.location.lng && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="text-lg">📍</span> Location Marked
                                        </h3>
                                        <ReadOnlyMap location={item.location} />
                                    </div>
                                )}
                            </div>

                            {/* Status / Claim Context Block */}
                            <div className="mb-8 p-5 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
                                <h3 className="text-sm font-bold text-white mb-2">Item Status Context</h3>
                                {item.status === 'resolved' ? (
                                    <p className="text-zinc-400 text-sm">This item has been successfully resolved and returned to its owner.</p>
                                ) : item.type === 'found' ? (
                                    <p className="text-zinc-400 text-sm">Did you lose this? You can initiate a secure claim to prove ownership and coordinate pickup.</p>
                                ) : (
                                    <p className="text-zinc-400 text-sm">Have you seen this item on campus? Reach out to the reporter via Community Chat.</p>
                                )}
                            </div>

                            {/* Dynamic Reward Points Indicator */}
                            {item.status !== 'resolved' && (
                                <div className="mb-8 flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-4">
                                    <span className="text-2xl">🏆</span>
                                    <div>
                                        <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Potential Bounty</h4>
                                        <p className="text-zinc-300"><span className="font-extrabold text-white">{calculateReward(item.description)} pts</span> available for resolution</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/10 mt-auto">
                            {item.status !== 'resolved' && item.type === 'found' && (
                                <button
                                    onClick={() => navigate(`/claim-found-item?itemId=${item._id}`)}
                                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Initiate Secure Claim
                                </button>
                            )}

                            {item.status !== 'resolved' && item.type === 'lost' && (
                                <button
                                    onClick={() => navigate('/#chat')}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl border border-zinc-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                    Message Community
                                </button>
                            )}

                            {item.status === 'resolved' && (
                                <div className="w-full bg-zinc-900 text-zinc-500 font-bold py-4 rounded-xl border border-zinc-800 text-center cursor-not-allowed">
                                    ✓ Resolved & Inactive
                                </div>
                            )}

                            {/* Share Button Overlay */}
                            <button
                                onClick={handleShare}
                                className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20"
                            >
                                <span>🔗</span> Share Alert
                            </button>
                        </div>
                    </div>
                </div>

                {/* Claims Section */}
                {claims.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">Claim Requests ({claims.length})</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {claims.map((claim) => (
                                <div key={claim._id} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg flex gap-4 items-start">
                                    <div className="w-24 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700">
                                        {claim.imagePath ? (
                                            <img
                                                src={claim.imagePath.startsWith('http') ? claim.imagePath : `${API_BASE_URL}/${claim.imagePath.replace(/\\/g, '/')}`}
                                                alt="Claim Proof"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center border border-zinc-800">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-lg">
                                                {claim.createdBy ? `${claim.createdBy.firstName} ${claim.createdBy.lastName}` : 'Anonymous User'}
                                            </h4>
                                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg ${claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                claim.status === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                    'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                                }`}>
                                                {claim.status || 'pending'}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 text-sm mb-3">
                                            {new Date(claim.createdAt || Date.now()).toLocaleDateString()}
                                        </p>
                                        <p className="text-zinc-300 text-sm line-clamp-3 bg-black/30 p-3 rounded-lg border border-white/5">
                                            {claim.description}
                                        </p>

                                        {/* Invite to Chat Button (Visible to ALL authenticated users) */}
                                        {user && (
                                            <button
                                                onClick={() => {
                                                    setChatModal({
                                                        isOpen: true,
                                                        targetUserId: claim.createdBy._id,
                                                        targetName: claim.createdBy.firstName || 'User',
                                                        itemId: item._id
                                                    });
                                                }}
                                                className="mt-3 w-full bg-zinc-800 hover:bg-white hover:text-black text-white text-sm font-bold py-2 rounded-lg transition-colors border border-zinc-700 hover:border-white flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                </svg>
                                                Invite to Chat
                                            </button>
                                        )}

                                        {/* Secure Contact Info Box (Visible to ALL authenticated users once Approved) */}
                                        {(claim.status === 'approved' || user?.role === 'admin') && user && (
                                            <div className="mt-4 p-4 bg-black/50 border border-green-500/30 rounded-xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                                <h5 className="font-bold text-green-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-widest relative z-10">
                                                    <span className="text-lg">🔒</span> Secure Contact Info
                                                </h5>

                                                {user._id === claim.createdBy._id ? (
                                                    // Viewer is the Claimant, show Poster's info
                                                    <div className="text-sm text-zinc-300 space-y-2 relative z-10">
                                                        <p><span className="text-zinc-500 font-mono w-16 inline-block">NAME:</span> {item.createdBy?.firstName} {item.createdBy?.lastName}</p>
                                                        <p><span className="text-zinc-500 font-mono w-16 inline-block">EMAIL:</span> {item.createdBy?.email}</p>
                                                        <p>
                                                            <span className="text-zinc-500 font-mono w-16 inline-block">PHONE:</span>
                                                            <span className={claim.contactPhoneAccess !== 'approved' ? 'blur-[4px] select-none text-zinc-400' : 'text-green-300 font-medium'}>
                                                                {claim.contactPhoneAccess === 'approved' ? (item.createdBy?.phoneNumber || 'Not provided') : '+1 (555) 555-5555'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    // Viewer is the Poster, show Claimant's info
                                                    <div className="text-sm text-zinc-300 space-y-2 relative z-10">
                                                        <p><span className="text-zinc-500 font-mono w-16 inline-block">NAME:</span> {claim.createdBy.firstName} {claim.createdBy.lastName}</p>
                                                        <p><span className="text-zinc-500 font-mono w-16 inline-block">EMAIL:</span> {claim.createdBy.email}</p>
                                                        <p>
                                                            <span className="text-zinc-500 font-mono w-16 inline-block">PHONE:</span>
                                                            <span className={claim.contactPhoneAccess !== 'approved' ? 'blur-[4px] select-none text-zinc-400' : 'text-green-300 font-medium'}>
                                                                {claim.contactPhoneAccess === 'approved' ? (claim.createdBy.phoneNumber || 'Not provided') : '+1 (555) 555-5555'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Request Phone Access Toggle */}
                                                {claim.contactPhoneAccess !== 'approved' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            try {
                                                                await axios.put(`${API_BASE_URL}/api/claimfounditem/${claim._id}/request-phone`, {}, { headers: { 'x-auth-token': token } });
                                                                e.target.innerText = "Phone Access Requested ✓";
                                                                e.target.classList.replace("bg-zinc-800", "bg-green-900/50");
                                                                e.target.classList.replace("text-white", "text-green-400");
                                                                e.target.disabled = true;
                                                                toast.success("Phone access request forwarded to Administration.");
                                                            } catch (err) {
                                                                toast.error("Failed to request phone access.");
                                                            }
                                                        }}
                                                        disabled={claim.contactPhoneAccess === 'requested'}
                                                        className={`mt-4 w-full text-xs font-bold py-2 rounded-lg transition-colors border shadow-lg relative z-10 ${claim.contactPhoneAccess === 'requested' ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-zinc-800 text-white border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700'}`}
                                                    >
                                                        {claim.contactPhoneAccess === 'requested' ? 'Phone Access Requested ✓' : 'Request Private Phone Unblur'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Invite Modal Overlay */}
            {chatModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setChatModal({ isOpen: false, targetUserId: null, targetName: '', itemId: null })}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2">Invite to Chat</h3>
                        <p className="text-sm text-zinc-400 mb-6">Send a direct message invitation to {chatModal.targetName}. They will receive an email and in-app notification.</p>

                        <form onSubmit={handleChatInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Your Display Name</label>
                                <input
                                    type="text"
                                    value={chatSenderName}
                                    onChange={(e) => setChatSenderName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                    placeholder="e.g. John Doe / Admin"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Secret Room ID</label>
                                <input
                                    type="text"
                                    value={chatRoomId}
                                    onChange={(e) => setChatRoomId(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                                    placeholder="e.g. pickup-room-123"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            >
                                Send Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;
