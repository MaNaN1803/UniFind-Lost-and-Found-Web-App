import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Typed from 'typed.js';
import io from "socket.io-client";
import Chat from './Chat';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Navbar from './Navbar';

import API_BASE_URL from '../../apiConfig';

const socket = io.connect(API_BASE_URL);

const Main = () => {
  const { logout, user } = useAuth();
  const typedTextRef = useRef(null);

  useEffect(() => {
    const options = {
      strings: ['Welcome To UniFind', 'Lost It. List It. Find It.'],
      typeSpeed: 60,
      backSpeed: 30,
      showCursor: true,
      loop: true
    };

    const typed = new Typed(typedTextRef.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { room, username });
      setRoom(room);
      setShowChat(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-600 selection:text-white">
      <Navbar />

      {/* SECTION 1: Dynamic Hero Section with Graph Grid Background */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex items-center justify-center min-h-screen bg-graph-grid bg-black overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-700/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black z-0"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-zinc-600/50 bg-zinc-800/30 backdrop-blur-sm">
            <span className="text-zinc-300 text-sm font-semibold tracking-wide uppercase">Connecting Campus Communities</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-tight">
            <span ref={typedTextRef} className="bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-600"></span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            A seamless, community-driven platform engineered to recover what you've lost and return what you've found. Join thousands making a difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/post-lost-item" className="group relative px-8 py-4 bg-white hover:bg-zinc-200 text-black rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">I Lost Something <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
            </Link>
            <Link to="/post-found-item" className="group relative px-8 py-4 bg-transparent border-2 border-zinc-600 hover:border-white text-zinc-300 hover:text-white rounded-full font-bold text-lg transition-all overflow-hidden backdrop-blur-sm">
              <span className="relative z-10">I Found Something</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: Impact / Stats Section */}
      <div className="py-20 bg-black border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-800">
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">4,200+</div>
              <div className="text-zinc-500 font-medium uppercase tracking-widest text-sm">Items Recovered</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">12k</div>
              <div className="text-zinc-500 font-medium uppercase tracking-widest text-sm">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">95%</div>
              <div className="text-zinc-500 font-medium uppercase tracking-widest text-sm">Return Rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">24h</div>
              <div className="text-zinc-500 font-medium uppercase tracking-widest text-sm">Avg Recovery Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: How It Works */}
      <div className="py-28 bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">How It Works</h2>
            <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-lg">A simple, effective process designed to reunited you with your belongings instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-black border-2 border-zinc-700 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl">
                📝
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">1. Report</h3>
              <p className="text-zinc-400 leading-relaxed px-4">Instantly broadcast details of your lost or found item to the entire campus network.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-black border-2 border-zinc-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl shadow-zinc-800/50">
                🔍
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">2. Match</h3>
              <p className="text-zinc-400 leading-relaxed px-4">Our live feed categorizes items. Browse securely or chat with finders natively.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-zinc-100 border-2 border-white rounded-full flex items-center justify-center text-3xl mb-6 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                🤝
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">3. Claim</h3>
              <p className="text-zinc-400 leading-relaxed px-4">Provide proof of ownership, meet up safely, and retrieve your valuables.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Core Services */}
      <div className="py-28 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">Core Services</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-zinc-500 to-zinc-700 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-zinc-900/50 backdrop-blur-lg border border-white/5 rounded-3xl p-10 hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg">
                📱
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Lost Items</h3>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Post detailed descriptions of misplaced belongings. Alerts are pushed community-wide immediately.
              </p>
              <Link to="/post-lost-item" className="text-white font-bold inline-flex items-center group-hover:underline">
                Report Now <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group bg-zinc-900/50 backdrop-blur-lg border border-white/5 rounded-3xl p-10 hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-lg">
                ✨
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Found Items</h3>
              <p className="text-zinc-400 leading-relaxed mb-8">
                Found something? Be a hero. Share it anonymously here to reunite it with its owner and earn platform points.
              </p>
              <Link to="/post-found-item" className="text-white font-bold inline-flex items-center group-hover:underline">
                Upload Found Item <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group bg-white backdrop-blur-lg border border-white rounded-3xl p-10 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 text-3xl shadow-sm">
                🛡️
              </div>
              <h3 className="text-3xl font-bold text-black mb-4">Secure Claims</h3>
              <p className="text-zinc-600 leading-relaxed mb-8">
                Browse the feed natively. If you spot your item, initiate a secure, verified claim process immediately.
              </p>
              <Link to="/claim-found-item" className="text-black font-black inline-flex items-center group-hover:underline">
                View Claims <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Testimonials */}
      <div className="py-28 bg-zinc-950 relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">Community Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-black border border-zinc-800 p-8 rounded-3xl">
              <div className="flex gap-1 mb-4 text-zinc-300">★★★★★</div>
              <p className="text-lg text-zinc-400 italic mb-6">"I lost my hard drive containing my entire thesis perfectly before midterms. Posted on UniFind, and literally within two hours, someone from the library reached out."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold">AS</div>
                <div>
                  <h4 className="font-bold text-white">Alex S.</h4>
                  <p className="text-sm text-zinc-500">Computer Science</p>
                </div>
              </div>
            </div>
            <div className="bg-black border border-zinc-800 p-8 rounded-3xl">
              <div className="flex gap-1 mb-4 text-zinc-300">★★★★★</div>
              <p className="text-lg text-zinc-400 italic mb-6">"I found a wallet near the cafeteria. Instead of dropping it into the abyss of campus security, I listed it. The dude verified his IDs and we met up. So much faster."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold">MD</div>
                <div>
                  <h4 className="font-bold text-white">Marcus D.</h4>
                  <p className="text-sm text-zinc-500">Business Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Community Chat Teaser */}
      <div className="py-28 bg-black relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
            {/* Ambient gradients inside box */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

            <div className="lg:w-1/2 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight flex flex-wrap items-center gap-x-3 gap-y-2">
                <span>Coordinate returns in</span>
                <span className="bg-white text-black text-3xl md:text-4xl px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">Real-Time.</span>
              </h2>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                Found a match? Use our end-to-end community chat rooms to anonymously and safely arrange handoffs before revealing personal information.
              </p>
              <div className="space-y-4 max-w-md">
                <input
                  className="w-full bg-black border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all"
                  type="text"
                  placeholder="Enter a temporary display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="w-full bg-black border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all"
                  type="text"
                  placeholder="Enter room ID (e.g., 'campus-hub')"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
                <button
                  onClick={joinRoom}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Launch Chat Interface
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 w-full relative z-10">
              {showChat ? (
                <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl border border-zinc-700 bg-black">
                  <Chat
                    socket={socket}
                    username={username}
                    room={room}
                    onLeave={() => {
                      setShowChat(false);
                      setRoom("");
                      setUsername("");
                    }}
                  />
                </div>
              ) : (
                <div className="h-[500px] w-full bg-black/50 border border-zinc-800 rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4 opacity-50">💬</div>
                    <p className="text-zinc-500 font-medium">Chat interface will appear here.<br />Enter credentials to connect.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: Footer & CTA */}
      <footer className="bg-black pt-20 pb-10 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pre-footer CTA */}
          <div className="bg-zinc-900 rounded-3xl p-12 text-center mb-16 border border-zinc-800">
            <h3 className="text-3xl font-black text-white mb-4">Ready to help out?</h3>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">Every item reported found is a mini-catastrophe averted for someone else. Join the platform and start racking up community rewards.</p>
            <Link to="/signup" className="inline-block bg-white text-black text-lg font-bold px-10 py-4 rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-1">
              Create an Account
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-black text-xl">U</span>
                </div>
                <span className="font-bold text-2xl text-white tracking-tight">UniFind</span>
              </div>
              <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
                Empowering modern campuses to streamline lost and found logistics through transparency and community effort.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">PLATFORM</h4>
              <ul className="space-y-4">
                <li><Link to="/post-lost-item" className="text-zinc-500 hover:text-white transition-colors">Report Lost Item</Link></li>
                <li><Link to="/post-found-item" className="text-zinc-500 hover:text-white transition-colors">Report Found Item</Link></li>
                <li><Link to="/feed" className="text-zinc-500 hover:text-white transition-colors">Live Feed</Link></li>
                <li><Link to="/rewards" className="text-zinc-500 hover:text-white transition-colors">Rewards Engine</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">LEGAL</h4>
              <ul className="space-y-4">
                <li><a href="#!" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#!" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#!" className="text-zinc-500 hover:text-white transition-colors">Moderation Rules</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-600">
            <p>© {new Date().getFullYear()} UniFind Software. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;
