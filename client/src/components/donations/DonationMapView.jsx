import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { CATEGORIES } from '../../utils/constants';

// Fix for default Leaflet icon paths in Vite bundles
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function DonationMapView({ listings = [] }) {
  // Extract coordinates from listings
  const validListings = listings.filter((l) => {
    const coords = l.location?.coordinates || l.pickupLocation?.coordinates;
    return Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
  });

  // Calculate center of listings or fallback
  const defaultCenter = [12.9716, 77.5946]; // Bengaluru default
  const center =
    validListings.length > 0
      ? [
          validListings[0].location?.coordinates?.[1] || validListings[0].pickupLocation?.coordinates?.[1] || defaultCenter[0],
          validListings[0].location?.coordinates?.[0] || validListings[0].pickupLocation?.coordinates?.[0] || defaultCenter[1],
        ]
      : defaultCenter;

  return (
    <div className="w-full h-[520px] rounded-3xl overflow-hidden border border-surface-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validListings.map((listing) => {
          const coords = listing.location?.coordinates || listing.pickupLocation?.coordinates;
          const lat = coords[1];
          const lng = coords[0];
          const cat = CATEGORIES.find((c) => c.value === listing.category);

          return (
            <Marker key={listing._id} position={[lat, lng]} icon={customMarkerIcon}>
              <Popup className="foodbridge-popup">
                <div className="p-1 space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-surface-900 truncate">
                      {listing.title}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>

                  <p className="text-[11px] text-surface-500 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-100">
                    <span className="font-semibold text-primary-700">
                      {listing.quantity} {listing.unit}
                    </span>
                    <span className="text-surface-400 text-[10px]">
                      {cat?.icon} {cat?.label || listing.category}
                    </span>
                  </div>

                  <Link
                    to={`/donations/${listing._id}`}
                    className="block text-center btn-primary text-xs py-1.5 px-3 mt-2 font-bold"
                  >
                    View Details & Claim
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
