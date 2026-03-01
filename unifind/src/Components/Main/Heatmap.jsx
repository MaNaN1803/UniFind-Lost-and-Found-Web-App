import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../apiConfig";
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

const CenterMapOnData = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const lats = points.map(p => p.location.lat);
            const lngs = points.map(p => p.location.lng);
            const midLat = (Math.max(...lats) + Math.min(...lats)) / 2;
            const midLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
            map.flyTo([midLat, midLng], 15);
        }
    }, [points, map]);
    return null;
};

const Heatmap = () => {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [filterType, setFilterType] = useState('all'); // all, lost, found
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                // To save building a new route immediately, we reuse the generic feed endpoint 
                // but filter only valid location items locally for the prototype heatmap
                const response = await axios.get(`${API_BASE_URL}/api/feed`, {
                    headers: { 'x-auth-token': token }
                });

                const validLocations = response.data.filter(item => item.location && item.location.lat && item.location.lng && item.status === 'open');
                setItems(validLocations);
            } catch (err) {
                console.error("Failed to fetch map data");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchMapData();
    }, [token]);

    const displayedItems = filterType === 'all' ? items : items.filter(i => i.type === filterType);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col h-screen overflow-hidden">
            <Navbar />

            <div className="flex-1 mt-20 relative h-[calc(100vh-80px)]">
                {/* Floating Map Controls overlay */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-black/80 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-2xl flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === 'all' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                    >
                        Combined Heatmap
                    </button>
                    <button
                        onClick={() => setFilterType('lost')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-zinc-400 hover:text-red-400 hover:bg-white/5 border border-transparent'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Lost Zones
                    </button>
                    <button
                        onClick={() => setFilterType('found')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filterType === 'found' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-zinc-400 hover:text-green-400 hover:bg-white/5 border border-transparent'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Recovery Zones
                    </button>
                </div>

                {/* Map Container */}
                <div className="w-full h-full relative z-0">
                    <MapContainer
                        center={[40.7128, -74.0060]} // Default center fallback
                        zoom={13}
                        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                    >
                        <>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />

                            {displayedItems.length > 0 && <CenterMapOnData points={displayedItems} />}

                            {displayedItems.map(item => (
                                <CircleMarker
                                    key={item._id}
                                    center={[item.location.lat, item.location.lng]}
                                    pathOptions={{
                                        color: item.type === 'lost' ? '#ef4444' : '#22c55e',
                                        fillColor: item.type === 'lost' ? '#ef4444' : '#22c55e',
                                        fillOpacity: 0.4,
                                        weight: 0
                                    }}
                                    radius={25} // Large radius for organic heat-map merging
                                >
                                    <Popup className="unifind-popup">
                                        <div className="p-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest block mb-2 ${item.type === 'lost' ? 'text-red-500' : 'text-green-500'}`}>
                                                {item.type} Item
                                            </span>
                                            <p className="font-bold text-gray-800 text-sm mb-3 max-w-[200px] truncate">{item.description}</p>
                                            <Link to={`/item/${item._id}`} className="bg-black text-white text-xs px-4 py-2 rounded shadow block text-center mt-2 hover:bg-zinc-800 transition-colors">
                                                View Details
                                            </Link>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}

                            {/* Inner denser core for each item */}
                            {displayedItems.map(item => (
                                <CircleMarker
                                    key={`core-${item._id}`}
                                    center={[item.location.lat, item.location.lng]}
                                    pathOptions={{
                                        color: item.type === 'lost' ? '#ef4444' : '#22c55e',
                                        fillColor: item.type === 'lost' ? '#ef4444' : '#22c55e',
                                        fillOpacity: 0.9,
                                        weight: 2
                                    }}
                                    radius={6}
                                />
                            ))}
                        </>
                    </MapContainer>
                </div>
            </div>

            {/* Custom CSS for Leaflet Popup overrides to fit Dark Theme softly */}
            <style jsx="true">{`
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 8px;
                }
                .leaflet-popup-tip {
                    box-shadow: none;
                }
            `}</style>
        </div>
    );
};

export default Heatmap;
