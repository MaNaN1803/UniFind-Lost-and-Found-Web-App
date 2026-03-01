import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { io } from "socket.io-client";
import Main from "./Components/Main";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Chat from "./Components/Main/Chat";
import LostItem from "./Components/Main/LostItem";
import FoundItem from "./Components/Main/FoundItem";
import ClaimFoundItem from "./Components/Main/ClaimFoundItem";
import Card from "./Components/Main/Card";
import FoundItemsList from "./Components/Main/FoundItemsList";
import Feed from "./Components/Main/Feed";
import Rewards from "./Components/Main/Rewards";
import ItemDetail from "./Components/Main/ItemDetail"; // Import new detail component
import Admin from "./Components/Admin"; // Import the Admin component
import Profile from "./Components/Main/Profile";
import Notifications from "./Components/Main/Notifications";
import ForgotPassword from "./Components/Main/ForgotPassword";
import ResetPassword from "./Components/Main/ResetPassword";
import Heatmap from "./Components/Main/Heatmap"; // Import the Heatmap component
import ScanHandler from "./Components/Main/ScanHandler"; // Import QR Scanner
import Leaderboard from "./Components/Main/Leaderboard"; // Import Leaderboard

import { useAuth } from "./context/AuthContext";
import API_BASE_URL from './apiConfig';

const socket = io(API_BASE_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

function App() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      // Register user socket for direct messages/notifications
      socket.emit("register_user", user._id);
    }

    const handleChatInvite = (data) => {
      toast.success(
        (t) => (
          <div>
            <b>{data.senderName}</b> wants to chat about Item: <br />
            <span className="text-xs text-zinc-500 block mb-1">{data.itemId}</span>
            <span className="text-sm font-mono text-green-400 block mb-3 border border-green-500/20 bg-green-500/10 p-1 rounded inline-block">Room: {data.roomId}</span>
            <br />
            <button
              onClick={() => {
                navigate('/#chat');
                toast.dismiss(t.id);
              }}
              className="bg-black text-white text-xs px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors"
            >
              Open Chat Widget ↗
            </button>
          </div>
        ),
        { duration: 10000, position: 'bottom-right' }
      );
    };

    socket.on("chat_invitation", handleChatInvite);

    return () => {
      socket.off("chat_invitation", handleChatInvite);
    };
  }, [user]);

  return (
    <>
      <Toaster />
      <Routes>
        {/* Protected Routes */}
        {token ? (
          <>
            <Route path="/" element={<Main />} />
            {user?.role === 'admin' && <Route path="/admin" element={<Admin />} />}
            <Route path="/chat" element={<Chat />} />
            <Route path="/post-lost-item" element={<LostItem />} />
            <Route path="/post-found-item" element={<FoundItem />} />
            <Route path="/claim-found-item" element={<ClaimFoundItem />} />
            <Route path="/found-items-list" element={<FoundItemsList />} />
            <Route path="/card" element={<Card />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/map" element={<Heatmap />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </>
        ) : (
          <Route path="*" element={<Navigate replace to="/login" />} />
        )}

        {/* Public Routes */}
        <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={!token ? <ResetPassword /> : <Navigate to="/" />} />

        {/* QR Anonymous Scanning Route */}
        <Route path="/scan/:targetId" element={<ScanHandler />} />
      </Routes>
    </>
  );
}

export default App;
