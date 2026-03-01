import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Chat from './Chat';
import { useAuth } from '../../context/AuthContext';
import io from "socket.io-client";
import API_BASE_URL from '../../apiConfig';

const socket = io.connect(API_BASE_URL);

const ScanHandler = () => {
    const { targetId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.firstName || "");
    const [showChat, setShowChat] = useState(false);
    const [room] = useState(`return-${targetId}-${Math.floor(Math.random() * 10000)}`);

    const joinRoom = () => {
        if (username !== "") {
            socket.emit("join_room", { room, username });

            // Notify the target user that someone scanned their tag
            socket.emit("invite_to_chat", {
                targetUserId: targetId,
                senderName: username,
                itemId: "QR Return Tag Scan",
                roomId: room
            });

            setShowChat(true);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col pt-24 pb-12">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full mix-blend-screen filter blur-[70px] opacity-20 pointer-events-none"></div>

                    <div className="w-20 h-20 bg-black border border-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        📱
                    </div>

                    <h1 className="text-3xl font-black mb-2">QR Tag Scanned</h1>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        You've scanned a UniFind Return Tag. Thank you for helping out! Please enter a temporary display name to securely chat with the owner to arrange a return.
                    </p>

                    {!showChat ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Your Name (e.g. Helpful Student)"
                                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition-all text-center"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button
                                onClick={joinRoom}
                                disabled={!username}
                                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg ${username ? 'bg-green-500 text-black hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:-translate-y-1' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                            >
                                Contact Owner Now
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full text-zinc-500 hover:text-white font-bold py-3 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="h-[500px] w-full mt-6 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 bg-black text-left">
                            <Chat
                                socket={socket}
                                username={username}
                                room={room}
                                onLeave={() => {
                                    setShowChat(false);
                                    navigate('/');
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScanHandler;
