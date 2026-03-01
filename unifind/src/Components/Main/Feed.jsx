import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import Navbar from './Navbar';
import FeedItem from './FeedItem';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Feed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'lost', 'found', 'history'

  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '24h', '7d', '30d'

  const { token } = useAuth();
  const categories = ['All', 'Stationary', 'Mobile', 'Electronics', 'Jewelry', 'instruments', 'id cards', 'documents', 'keys', 'wallets', 'others'];

  useEffect(() => {
    const fetchFeedItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/feed`, {
          headers: { 'x-auth-token': token }
        });
        setFeedItems(response.data.reverse()); // Newest first
      } catch (error) {
        console.error('Error fetching feed items:', error);
        toast.error('Could not load feed.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedItems();
  }, [token]);

  const filteredItems = feedItems.filter(item => {
    // 1. Base Type/Status Filter
    if (filter === 'history' && item.status !== 'resolved') return false;
    if (filter !== 'history' && item.status === 'resolved') return false;
    if (filter === 'lost' && item.type !== 'lost') return false;
    if (filter === 'found' && item.type !== 'found') return false;

    // 2. Text Search Filter
    if (searchQuery && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // 3. Category Filter
    if (categoryFilter !== 'All' && !item.description.toLowerCase().includes(`[${categoryFilter.toLowerCase()}]`)) return false;

    // 4. Time Filter
    if (timeFilter !== 'all') {
      const itemDate = new Date(item.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (timeFilter === '24h' && diffDays > 1) return false;
      if (timeFilter === '7d' && diffDays > 7) return false;
      if (timeFilter === '30d' && diffDays > 30) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12">
      <Navbar />

      {/* Decorative blurred circles - Grayscale */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-zinc-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-zinc-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none animation-delay-4000"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500 mb-2">
              Community Live Feed
            </h1>
            <p className="text-gray-300">Stay updated on all lost and found activities around you.</p>
          </div>

          <div className="mt-6 md:mt-0 flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'all' ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('lost')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'lost' ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white'}`}
            >
              Lost
            </button>
            <button
              onClick={() => setFilter('found')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'found' ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white'}`}
            >
              Found
            </button>
            <div className="w-px h-6 bg-white/20 my-auto mx-2 hidden md:block"></div>
            <button
              onClick={() => setFilter('history')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filter === 'history' ? 'bg-zinc-800 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-zinc-700' : 'text-zinc-500 hover:text-white'}`}
            >
              History Archive
            </button>
          </div>
        </div>

        {/* Advanced Filter Ribbon */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500">🔍</span>
            <input
              type="text"
              placeholder="Search keywords, items, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto bg-black/50 border border-zinc-700/50 rounded-xl py-3 px-4 text-white focus:outline-none appearance-none"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>

          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="w-full md:w-auto bg-black/50 border border-zinc-700/50 rounded-xl py-3 px-4 text-white focus:outline-none appearance-none"
          >
            <option value="all">Any Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Past Week</option>
            <option value="30d">Past Month</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <FeedItem key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <span className="text-4xl mb-4 block">📭</span>
            <h3 className="text-2xl font-bold text-gray-200">No items found</h3>
            <p className="text-gray-400 mt-2">Looks like it's quiet right now...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
