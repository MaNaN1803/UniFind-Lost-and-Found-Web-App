import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import Navbar from './Main/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'feed', or 'claims'

  useEffect(() => {
    // If we're somehow here without admin role, boot them out
    if (user && user.role !== 'admin') {
      navigate('/');
      toast.error('Unauthorized Access');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, feedRes, claimsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/users`, { headers: { 'x-auth-token': token } }),
          axios.get(`${API_BASE_URL}/api/feed`, { headers: { 'x-auth-token': token } }),
          axios.get(`${API_BASE_URL}/api/admin/claims`, { headers: { 'x-auth-token': token } })
        ]);
        setUsers(usersRes.data);
        setFeedItems(feedRes.data);
        setClaims(claimsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteFeedItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this Feed item?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/feed/${itemId}`, {
        headers: { 'x-auth-token': token }
      });
      setFeedItems(feedItems.filter(item => item._id !== itemId));
      toast.success('Feed item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete feed item');
    }
  };

  const handleDeleteClaim = async (claimId) => {
    if (!window.confirm("Are you sure you want to delete this Claim?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/claims/${claimId}`, {
        headers: { 'x-auth-token': token }
      });
      setClaims(claims.filter(claim => claim._id !== claimId));
      toast.success('Claim deleted successfully');
    } catch (error) {
      toast.error('Failed to delete claim');
    }
  };

  const handleUpdateClaimStatus = async (claimId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/claims/${claimId}/status`,
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
      setClaims(claims.map(claim => claim._id === claimId ? { ...claim, status: newStatus } : claim));
      toast.success(`Claim officially ${newStatus}`);
    } catch (error) {
      toast.error(`Failed to mark claim as ${newStatus}`);
    }
  };

  const handleApprovePhoneAccess = async (claimId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/claims/${claimId}/phone-access`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      setClaims(claims.map(claim => claim._id === claimId ? { ...claim, contactPhoneAccess: 'approved' } : claim));
      toast.success('Phone access approved');
    } catch (error) {
      toast.error('Failed to approve phone access');
    }
  };

  const awardPoints = async (userId, points, reason) => {
    try {
      await axios.post(`${API_BASE_URL}/api/rewards/award`,
        { userId, points, reason },
        { headers: { 'x-auth-token': token } }
      );
      toast.success(`Awarded ${points} points successfully`);
    } catch (error) {
      toast.error('Failed to award points');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 font-mono flex items-center gap-3">
              <span className="text-3xl text-zinc-300">🛡️</span> Admin Console
            </h1>
            <p className="text-gray-400 font-mono text-sm uppercase tracking-wider">System Management & Moderation</p>
          </div>

          <div className="mt-6 md:mt-0 flex gap-2 p-1 bg-black/50 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
            >
              Moderate Feed
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'claims' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
            >
              Manage Claims
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'text-gray-400 hover:text-white'}`}
            >
              📊 Analytics
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-white mb-2">{users.length}</div>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total Students</div>
                  </div>
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-white mb-2">{feedItems.length}</div>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Active Posts</div>
                  </div>
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-4xl font-black text-yellow-500 mb-2">{claims.filter(c => c.status === 'approved').length}</div>
                    <div className="text-sm font-bold text-yellow-500/50 uppercase tracking-widest">Successful Claims</div>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 h-[400px]">
                  <h3 className="text-center font-bold text-zinc-400 mb-4 tracking-wider uppercase">Item Distribution Ratio</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Lost Items', value: feedItems.filter(i => i.type === 'lost').length },
                          { name: 'Found Items', value: feedItems.filter(i => i.type === 'found').length }
                        ]}
                        cx="50%"
                        cy="45%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#ef4444" /> {/* Red for Lost */}
                        <Cell fill="#22c55e" /> {/* Green for Found */}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', color: 'white' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold text-center">Points</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                        <td className="p-4 text-gray-400">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.role === 'admin' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono text-zinc-300">{u.points || 0}</td>
                        <td className="p-4 flex gap-2 justify-end">
                          <button
                            onClick={() => awardPoints(u._id, 10, 'Admin Bonus')}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold transition-colors shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                          >
                            +10 Pts
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u.role === 'admin'}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Feed Tab */}
            {activeTab === 'feed' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Description</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {feedItems.map(item => (
                      <tr key={item._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${item.type === 'lost' ? 'bg-zinc-800 text-zinc-300' : 'bg-white/20 text-white'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300 max-w-sm truncate" title={item.description}>
                          {item.description}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${item.status === 'resolved' ? 'bg-zinc-800/50 text-zinc-500' : 'bg-white/10 text-zinc-200'}`}>
                            {item.status || 'open'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteFeedItem(item._id)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded text-xs font-bold transition-colors border border-white/5"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === 'claims' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/10 text-gray-300 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold">Claimant</th>
                      <th className="p-4 font-semibold">Description</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {claims.map(claim => (
                      <tr key={claim._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">
                          {claim.createdBy ? `${claim.createdBy.firstName} ${claim.createdBy.lastName}` : 'System User'}
                        </td>
                        <td className="p-4 text-gray-300 max-w-sm truncate" title={claim.description}>
                          {claim.description}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${claim.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {claim.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 flex gap-2 justify-end">
                          <a
                            href={`/item/${claim.itemId}`}
                            target="_blank" rel="noreferrer"
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                          >
                            View Item
                          </a>

                          {(!claim.status || claim.status === 'pending') && (
                            <>
                              <button
                                onClick={() => handleUpdateClaimStatus(claim._id, 'approved')}
                                className="bg-green-900/50 hover:bg-green-800 text-green-400 border border-green-800/50 px-3 py-1 rounded text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateClaimStatus(claim._id, 'rejected')}
                                className="bg-red-900/50 hover:bg-red-800 text-red-400 border border-red-800/50 px-3 py-1 rounded text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {claim.contactPhoneAccess === 'requested' && (
                            <button
                              onClick={() => handleApprovePhoneAccess(claim._id)}
                              className="bg-blue-900/50 hover:bg-blue-800 text-blue-400 border border-blue-800/50 px-3 py-1 rounded text-xs font-bold transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                            >
                              Approve Phone
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteClaim(claim._id)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded text-xs font-bold transition-colors border border-white/5"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
