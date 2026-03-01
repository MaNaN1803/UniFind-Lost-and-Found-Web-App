import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from '../../apiConfig';
import { useNavigate } from "react-router-dom";
import "./Chat.css";

function Chat({ socket, username, room, onLeave }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const [meetupData, setMeetupData] = useState({ date: '', time: '', location: 'Campus Police Station' });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const safeZones = [
    "Campus Police Station",
    "Student Union Lobby",
    "Main Library Entrance",
    "Dining Hall Administration"
  ];

  const handleLeaveRoom = () => {
    // Notify server we are leaving
    socket.emit("leave_room", room);

    // Check if we are mounted in a modal/overlay (onLeave provided by parent)
    if (onLeave) {
      onLeave();
    } else {
      // Fallback navigation if loaded via direct /chat Route
      navigate("/");
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: preview locally before sending, but here we upload directly to server.
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Assuming server port is 8080 and handles this newly created route
      const res = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const imageUrl = res.data.imageUrl;

      const messageData = {
        room: room,
        author: username,
        message: "", // Empty string because it's an image
        imageUrl: imageUrl,
        time: new Date(Date.now()).getHours() + ":" + String(new Date(Date.now()).getMinutes()).padStart(2, '0'),
      };

      socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setSelectedImage(null);

    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        imageUrl: null,
        meetupDetails: null,
        time: new Date(Date.now()).getHours() + ":" + String(new Date(Date.now()).getMinutes()).padStart(2, '0'),
      };

      socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]); // Add own message immediately
      setCurrentMessage("");
    }
  };

  const sendMeetupProposal = () => {
    if (!meetupData.date || !meetupData.time) return;

    const messageData = {
      room: room,
      author: username,
      message: "Proposing a Safe Handoff Meetup",
      imageUrl: null,
      meetupDetails: meetupData,
      time: new Date(Date.now()).getHours() + ":" + String(new Date(Date.now()).getMinutes()).padStart(2, '0'),
    };

    socket.emit("send_message", messageData);
    setMessageList((list) => [...list, messageData]);
    setShowMeetupForm(false);
  };

  const handleMeetupResponse = (msgIndex, accepted) => {
    // Basic optimistic UI update for the demo prototype
    const newList = [...messageList];
    newList[msgIndex].meetupDetails.status = accepted ? 'Accepted' : 'Declined';
    setMessageList(newList);

    // Notify room
    const responseMsg = {
      room, author: username,
      message: `${accepted ? '✅ Accepted' : '❌ Declined'} the meetup proposal for ${newList[msgIndex].meetupDetails.date}.`,
      time: new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2, '0')
    };
    socket.emit("send_message", responseMsg);
    setMessageList((list) => [...list, responseMsg]);
  };

  useEffect(() => {
    const handleReceive = (data) => {
      // Small check to prevent dupes if server echoes back to sender
      if (data.author !== username) {
        setMessageList((list) => [...list, data]);
      }
    };

    const handleRoomUsersUpdate = (users) => {
      setRoomUsers(users);
    };

    socket.on("receive_message", handleReceive);
    socket.on("room_users_update", handleRoomUsersUpdate);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("room_users_update", handleRoomUsersUpdate);
    };
  }, [socket, username]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">#{room ? room.charAt(0).toUpperCase() : '?'}</div>
          <div>
            <p className="font-bold">Room: {room}</p>
            <p style={{ fontSize: '12px', color: '#8696a0', fontWeight: 'normal', lineHeight: '1', marginTop: '4px' }}>
              <span className="text-green-500 font-bold mr-1">●</span>
              {roomUsers.length} Online {roomUsers.length > 0 && `- ${roomUsers.map(u => u.username).join(', ')}`}
            </p>
          </div>
        </div>

        {/* Restart / Leave Chat Button */}
        <button
          onClick={handleLeaveRoom}
          className="leave-room-btn"
          title="Leave Room"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3z"></path>
            <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
          </svg>
        </button>
      </div>

      <div className="chat-body">
        <div className="message-container">
          {messageList.map((messageContent, index) => (
            <div className="message" key={index} id={username === messageContent.author ? "you" : "other"}>
              <div className="message-content">
                {username !== messageContent.author && (
                  <span className="message-sender-name">{messageContent.author}</span>
                )}

                {/* Render Standard Content */}
                {messageContent.imageUrl && (
                  <img src={messageContent.imageUrl} alt="attachment" className="message-image" />
                )}

                {messageContent.message && !messageContent.meetupDetails && (
                  <p className="message-text">{messageContent.message}</p>
                )}

                {/* Render Meetup Proposal Block */}
                {messageContent.meetupDetails && (
                  <div className="bg-black/20 border border-white/10 rounded-xl p-3 mt-2 mb-1 w-full max-w-[250px]">
                    <div className="flex items-center gap-2 mb-2 text-white font-bold border-b border-white/10 pb-2">
                      <span>📅</span> Safe Handoff
                    </div>
                    <div className="text-xs text-zinc-300 space-y-1 mb-3">
                      <p><strong className="text-zinc-400">Date:</strong> {messageContent.meetupDetails.date}</p>
                      <p><strong className="text-zinc-400">Time:</strong> {messageContent.meetupDetails.time}</p>
                      <p><strong className="text-zinc-400">Where:</strong> {messageContent.meetupDetails.location}</p>
                    </div>

                    {messageContent.meetupDetails.status ? (
                      <div className={`text-xs font-bold text-center py-1 rounded ${messageContent.meetupDetails.status === 'Accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                        {messageContent.meetupDetails.status}
                      </div>
                    ) : username !== messageContent.author ? (
                      <div className="flex gap-2 w-full mt-2">
                        <button onClick={() => handleMeetupResponse(index, true)} className="flex-1 bg-green-500 text-black text-xs font-bold py-1.5 rounded hover:bg-green-400 transition-colors">Accept</button>
                        <button onClick={() => handleMeetupResponse(index, false)} className="flex-1 bg-red-500 text-white text-xs font-bold py-1.5 rounded hover:bg-red-400 transition-colors">Decline</button>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 text-center italic">Waiting for response...</div>
                    )}
                  </div>
                )}

                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  {/* Read receipt tick mark for 'you' */}
                  {username === messageContent.author && (
                    <svg viewBox="0 0 16 15" width="16" height="15" fill="#53bdeb" style={{ marginLeft: '4px', marginTop: '10px' }}>
                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-footer relative">
        {/* Meetup Proposal Popover */}
        {showMeetupForm && (
          <div className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-72 shadow-2xl z-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2"><span>📅</span> Propose Handoff</h4>
              <button onClick={() => setShowMeetupForm(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <input type="date" value={meetupData.date} onChange={e => setMeetupData({ ...meetupData, date: e.target.value })} className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-green-500" />
              <input type="time" value={meetupData.time} onChange={e => setMeetupData({ ...meetupData, time: e.target.value })} className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-green-500" />
              <select value={meetupData.location} onChange={e => setMeetupData({ ...meetupData, location: e.target.value })} className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-green-500">
                {safeZones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
              </select>
              <button onClick={sendMeetupProposal} disabled={!meetupData.date || !meetupData.time} className="w-full bg-green-500 text-black font-bold py-2 rounded shadow hover:bg-green-400 disabled:opacity-50 transition-colors">
                Send Proposal
              </button>
            </div>
          </div>
        )}

        {/* Schedule Icon */}
        <button onClick={() => setShowMeetupForm(!showMeetupForm)} className="chat-upload-label mr-2 hover:text-white transition-colors" title="Schedule Safe Meetup">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
          </svg>
        </button>

        {/* Attachment Icon Wrapper handling file upload */}
        <label className="chat-upload-label">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.699-1.143-1.143-2.664-1.774-4.259-1.74s-3.09.735-4.223 1.868l-9.3 9.3c-.307.307-.8.307-1.106 0s-.307-.8 0-1.106l9.3-9.3c1.437-1.437 3.398-2.223 5.435-2.268 2.036-.044 4.026.666 5.483 2.123 1.026 1.026 1.65 2.308 1.755 3.593.109 1.334-.372 2.618-1.355 3.601l-9.549 9.548c-1.42 1.42-3.3 2.203-5.31 2.203s-3.89-.784-5.311-2.204a7.485 7.485 0 0 1-2.203-5.311 7.483 7.483 0 0 1 2.203-5.31l9.692-9.692c.571-.571 1.492-.571 2.063 0s.571 1.492 0 2.063l-9.692 9.692c-.307.307-.8.307-1.106 0s-.307-.8 0-1.106l9.692-9.692c1.185-1.185 3.091-1.185 4.276 0s1.185 3.091 0 4.276l-9.692 9.692c-1.127 1.127-2.628 1.748-4.223 1.748s-3.096-.621-4.223-1.748a5.95 5.95 0 0 1-1.75-4.225 5.952 5.952 0 0 1 1.75-4.224l9.3-9.3c.307-.307.8-.307 1.106 0s.307.8 0 1.106l-9.3 9.3c-.836.836-1.3 1.95-1.3 3.132s.464 2.296 1.3 3.132z"></path>
          </svg>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </label>

        <div className="input-wrapper">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type a message"
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
        </div>

        {/* Send Button */}
        <button onClick={sendMessage}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;
