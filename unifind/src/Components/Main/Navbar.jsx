import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../../apiConfig';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { t, i18n } = useTranslation();

  const changeLanguage = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('unifind_lang', newLang);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
          headers: { 'x-auth-token': token }
        });
        setNotifications(response.data);
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) { }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/read-all`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { }
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Floating Glass Pill Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full transition-all duration-300">
        <div className="px-6 py-3 flex justify-between items-center">

          {/* Logo Section */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
            <div className="relative">
              <img className="h-10 w-10 object-cover rounded-full mix-blend-screen group-hover:scale-105 transition-transform" src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=100&h=100" alt="UniFind Logo" />
              <div className="absolute inset-0 rounded-full border border-white/20"></div>
            </div>
            <span className="font-black text-xl tracking-tight text-white hidden sm:block">
              UniFind
            </span>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-4">

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                >
                  <span className="text-xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-4 w-80 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden z-[200]">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/40">
                      <h3 className="text-white font-bold tracking-wide">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm italic">
                          You're all caught up.
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.read) handleMarkAsRead(notif._id);
                            }}
                            className={`p-4 border-b border-zinc-800/50 hover:bg-white/5 transition-colors cursor-pointer ${notif.read ? 'opacity-50' : 'bg-white/5'}`}
                          >
                            <Link to={notif.link || '#'} className="block" onClick={() => setShowDropdown(false)}>
                              <p className={`text-sm leading-relaxed ${notif.read ? 'text-zinc-400' : 'text-zinc-100 font-medium'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-2 font-mono tracking-wider">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-black/50 border-t border-zinc-800 text-center">
                      <Link to="/notifications" onClick={() => setShowDropdown(false)} className="text-sm font-bold text-white hover:text-zinc-300 transition-colors uppercase tracking-widest block py-1">
                        View All
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar Mini */}
            {user && (
              <Link to="/profile" onClick={closeMenu} className="flex-shrink-0 relative group">
                <img
                  src={user.profilePicture || `https://robohash.org/${user._id}?set=set4&bgset=bg1`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-white/20 bg-black group-hover:border-white/50 group-hover:scale-105 transition-all"
                />
              </Link>
            )}

            {/* Universal Hamburger Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all group flex flex-col justify-center items-center gap-1.5 w-12 h-12"
            >
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

          </div>
        </div>
      </nav>

      {/* Full-Screen Overlay Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-2xl z-[90] transition-all duration-500 flex flex-col justify-center items-center ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className={`flex flex-col items-center gap-8 transition-all duration-700 delay-100 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>

          {user ? (
            <>
              {/* Profile Card in Menu */}
              <Link to="/profile" onClick={closeMenu} className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl flex items-center gap-4 transition-all pr-8 mb-4">
                <img src={user.profilePicture || `https://robohash.org/${user._id}?set=set4&bgset=bg1`} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-zinc-600 bg-black object-cover group-hover:scale-105 transition-transform" />
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-zinc-400 font-mono tracking-widest">{user.role}</p>
                </div>
              </Link>

              {/* Grid Links */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl px-6">
                <MenuCard to="/feed" icon="📡" title={t('Live Feed')} onClick={closeMenu} />
                <MenuCard to="/map" icon="🗺️" title={t('Campus Map')} onClick={closeMenu} />
                <MenuCard to="/post-lost-item" icon="🔍" title={t('Report Lost')} onClick={closeMenu} />
                <MenuCard to="/post-found-item" icon="✨" title={t('Report Found')} onClick={closeMenu} />
                <MenuCard to="/claim-found-item" icon="📝" title={t('Claims')} onClick={closeMenu} />
                <MenuCard to="/rewards" icon="★" title={t('Rewards')} onClick={closeMenu} color="text-yellow-500" />
                <MenuCard to="/leaderboard" icon="🏆" title={t('Top Finders')} onClick={closeMenu} color="text-yellow-400" />

                {user.role === 'admin' && (
                  <MenuCard to="/admin" icon="🛡️" title={t('Admin')} onClick={closeMenu} color="text-blue-400" />
                )}
              </div>

              {/* Universal Language Switcher inside Menu */}
              <select
                value={i18n.language}
                onChange={changeLanguage}
                className="mt-8 bg-white/5 border border-white/20 rounded-xl px-6 py-3 text-lg font-bold text-zinc-300 hover:text-white transition-colors outline-none text-center"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="hi">🇮🇳 हिन्दी</option>
              </select>

              <button
                onClick={() => { closeMenu(); logout(); }}
                className="mt-12 text-zinc-500 hover:text-red-400 text-sm font-bold tracking-widest uppercase transition-colors"
              >
                {t('Logout')}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-6 w-64">
              <h2 className="text-3xl font-black text-center mb-8">Ready to join?</h2>
              <Link to="/login" onClick={closeMenu} className="w-full py-4 bg-white text-black text-center font-bold rounded-2xl text-lg hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {t('Login')}
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

// Helper Component for Menu Items
const MenuCard = ({ to, icon, title, onClick, color = "text-white" }) => (
  <Link
    to={to}
    onClick={onClick}
    className="group bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
  >
    <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
    <span className={`font-bold text-sm sm:text-base tracking-wide ${color}`}>{title}</span>
  </Link>
);

export default Navbar;
