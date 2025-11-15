import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { MapPin, Loader2, ExternalLink, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (type) => {
  const color = type === "lost" ? "#ef4444" : "#10b981";
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 4px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: bounce 1s ease-in-out infinite;
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-size: 20px;
        ">
          📍
        </div>
      </div>
      <style>
        @keyframes bounce {
          0%, 100% { transform: rotate(-45deg) translateY(0); }
          50% { transform: rotate(-45deg) translateY(-5px); }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Parse location to coordinates (simple geocoding simulation)
const getCoordinates = (location) => {
  // In production, use a real geocoding API
  // For demo, using random coordinates around a central point
  const baseCoords = { lat: 40.7128, lng: -74.0060 }; // New York as example
  const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    lat: baseCoords.lat + (hash % 100) / 1000 - 0.05,
    lng: baseCoords.lng + ((hash * 7) % 100) / 1000 - 0.05
  };
};

export default function MapView({ items, isLoading }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 rounded-2xl bg-gradient-to-br from-cyan-100/50 to-teal-100/50"
      >
        <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-cyan-900">Loading Map...</h3>
        <p className="text-cyan-700">Plotting item locations</p>
      </motion.div>
    );
  }

  const itemsWithCoords = items.map(item => ({
    ...item,
    coords: getCoordinates(item.location)
  }));

  // Calculate center of all markers
  const center = itemsWithCoords.length > 0
    ? {
        lat: itemsWithCoords.reduce((sum, item) => sum + item.coords.lat, 0) / itemsWithCoords.length,
        lng: itemsWithCoords.reduce((sum, item) => sum + item.coords.lng, 0) / itemsWithCoords.length
      }
    : { lat: 40.7128, lng: -74.0060 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Map Container */}
      <Card className="overflow-hidden border-2 border-cyan-200 shadow-xl shadow-cyan-500/20">
        <CardContent className="p-0">
          <div className="h-[600px] rounded-lg overflow-hidden relative">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {itemsWithCoords.map((item) => (
                <Marker
                  key={item.id}
                  position={[item.coords.lat, item.coords.lng]}
                  icon={createCustomIcon(item.type)}
                  eventHandlers={{
                    click: () => setSelectedItem(item),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm">{item.title}</h3>
                        <Badge
                          className={`text-xs ${
                            item.type === "lost"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </div>
                      <Link to={`${createPageUrl("ItemDetail")}?id=${item.id}`}>
                        <Button size="sm" className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-xs">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-cyan-200">
              <p className="text-xs font-semibold mb-2 text-gray-700">Legend</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Lost Items</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Found Items</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-cyan-200">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">
                    {items.filter(i => i.type === "lost").length}
                  </p>
                  <p className="text-xs text-gray-600">Lost</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {items.filter(i => i.type === "found").length}
                  </p>
                  <p className="text-xs text-gray-600">Found</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Image */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-100 to-teal-100 flex-shrink-0">
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{selectedItem.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            selectedItem.type === "lost"
                              ? "bg-red-500"
                              : "bg-green-500"
                          } text-white`}
                        >
                          {selectedItem.type}
                        </Badge>
                        {selectedItem.reward_offered && (
                          <Badge className="bg-amber-500 text-white gap-1">
                            <Award className="w-3 h-3" />
                            Reward
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Link to={`${createPageUrl("ItemDetail")}?id=${selectedItem.id}`}>
                      <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 gap-2">
                        View Full Details
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  <p className="text-gray-700 mb-4">{selectedItem.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                        {selectedItem.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Date Reported</p>
                      <p className="font-medium">
                        {format(new Date(selectedItem.date_reported), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}