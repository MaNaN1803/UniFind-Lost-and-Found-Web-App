import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import Navbar from './Navbar';
import toast from "react-hot-toast";
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ClaimFoundItem = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualItemId, setManualItemId] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlItemId = searchParams.get('itemId');

  const finalItemId = urlItemId || manualItemId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !image || !finalItemId) {
      toast.error('Please provide an Item ID, description, and image proof.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);

    if (finalItemId) {
      formData.append('itemId', finalItemId);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/claimfounditem`, formData, {
        headers: {
          'x-auth-token': token
        },
      });
      toast.success("Claim Submitted! An admin or finder will review it soon.");
      navigate('/feed');
    } catch (error) {
      console.error('Error submitting claim:', error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to submit claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-400/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-3xl text-zinc-300">🤝</span>
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
              Claim a Found Item
            </h1>
            <p className="text-gray-300 mt-3 font-light text-sm">
              Provide evidence that the item belongs to you. Submit proof of purchase, a matching photo, or highly specific details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {urlItemId ? (
              <div className="bg-zinc-800/50 p-4 border border-zinc-600 rounded-xl flex items-center gap-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <h4 className="text-zinc-300 font-bold text-sm uppercase tracking-wider">Linked Item ID</h4>
                  <p className="text-white font-mono">{urlItemId}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Item ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={manualItemId}
                  onChange={(e) => setManualItemId(e.target.value)}
                  placeholder="Paste the unique ID of the item you are claiming"
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Proof / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why this item is yours. E.g. Mac address, wallpaper, serial number..."
                rows="4"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Upload Evidence Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-zinc-200 hover:file:bg-white/20 transition-all cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all flex justify-center items-center hover:-translate-y-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim Request'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ClaimFoundItem;
