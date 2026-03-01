import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MapEvents = ({ position, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        }
    });

    return position ? <Marker position={position} /> : null;
};

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 15);
    }, [center, map]);
    return null;
};

const LocationPicker = ({ location, setLocation }) => {
    const [defaultCenter, setDefaultCenter] = useState([40.7128, -74.0060]); // NYC fallback
    const [position, setPosition] = useState(location || null);
    const [geoLoading, setGeoLoading] = useState(true);

    useEffect(() => {
        if (navigator.geolocation && !location) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setDefaultCenter([pos.coords.latitude, pos.coords.longitude]);
                    setGeoLoading(false);
                },
                (err) => {
                    console.log("Geolocation permission denied or failed.");
                    setGeoLoading(false);
                },
                { timeout: 5000 }
            );
        } else {
            setGeoLoading(false);
        }
    }, [location]);

    useEffect(() => {
        if (location) setPosition(location);
    }, [location]);

    const handleLocationSelect = (latlng) => {
        setPosition(latlng);
        setLocation(latlng);
    };

    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 relative z-0">
            {geoLoading && (
                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur z-50 flex items-center justify-center">
                    <span className="text-sm font-bold animate-pulse text-zinc-400">Locating your position...</span>
                </div>
            )}
            <MapContainer
                center={position || defaultCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
            >
                <RecenterMap center={position || defaultCenter} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <MapEvents
                    position={position}
                    onLocationSelect={handleLocationSelect}
                />
            </MapContainer>

            {!position && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-black/80 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-none">
                    Click the map to drop a pin
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
