import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import Navbar from './Navbar';
import toast from "react-hot-toast";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocationPicker from './LocationPicker';

const LostItem = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [categoryId, setCategoryId] = useState('All');
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const categories = ['Stationary', 'Mobile', 'Electronics', 'Jewelry', 'instruments', 'id cards', 'documents', 'keys', 'wallets', 'others'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !image) {
      toast.error('Please provide a description and an image.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', `[${categoryId}] ${description}`);
    if (location) {
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/lostitem/report-lost`, formData, {
        headers: {
          'x-auth-token': token
        },
      });
      toast.success("Lost Item Report Submitted Successfully!");
      navigate('/feed');
    } catch (error) {
      console.error('Error submitting lost item report:', error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pt-24 pb-12">
      <Navbar />

      {/* Decorative blurred circles - Grayscale */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-zinc-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-72 h-72 bg-zinc-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-400/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-3xl text-zinc-300">🔍</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
              Report a Lost Item
            </h1>
            <p className="text-gray-300 mt-3 font-light">
              Provide as many details as possible to help the community find your item.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all appearance-none"
              >
                {categories.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Black leather wallet with a gold zipper lost near the cafeteria..."
                rows="4"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all resize-none"
              />
            </div>

            <div className="z-0 relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">Pinpoint Location (Optional)</label>
              <LocationPicker location={location} setLocation={setLocation} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Upload Image</label>
              <div className="w-full relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-zinc-200 hover:file:bg-white/20 transition-all cursor-pointer"
                />
              </div>
              {image && (
                <div className="mt-4 p-2 bg-white/5 rounded-xl border border-white/10 inline-block">
                  <p className="text-sm text-zinc-300 flex items-center gap-2">
                    <span>✓</span> {image.name} selected
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-8 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all flex justify-center items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Broadcasting to Community...' : 'Submit Lost Item Report'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LostItem;
