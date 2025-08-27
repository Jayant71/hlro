"use client";
import nextDynamic from "next/dynamic";
const DynamicMap = nextDynamic(() => import("./MapComponent"), { ssr: false });
export const dynamic = "force-dynamic";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

type Stop = {
  id?: string;
  address: string;
  lat?: number;
  lng?: number;
  sequence_order?: number;
  status?: string;
};

type Depot = {
  id?: string;
  lat: number;
  lng: number;
};

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center

export default function RouteManagementPage() {
  const [depot, setDepot] = useState<Depot | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<{ coordinates: [number, number][] } | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [estimates, setEstimates] = useState<{ distance: number; duration: number } | null>(null);
  const [newStopAddress, setNewStopAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Handle map click to add stop at clicked location
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Reverse geocode to get address from coordinates
      const { data } = await axios.post("/api/geocode", { lat, lng });
      const address = data.address || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      
      setStops([
        ...stops,
        {
          id: uuidv4(),
          address,
          lat,
          lng,
          status: "pending",
        },
      ]);
    } catch {
      // If reverse geocoding fails, use coordinates as address
      setStops([
        ...stops,
        {
          id: uuidv4(),
          address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lng,
          status: "pending",
        },
      ]);
    }
  };

  // Add stop with address validation
  const handleAddStop = async () => {
    if (!newStopAddress.trim()) return;
    setError(null);
    try {
      const { data } = await axios.post("/api/geocode", { address: newStopAddress });
      setStops([
        ...stops,
        {
          id: uuidv4(),
          address: newStopAddress,
          lat: data.lat,
          lng: data.lng,
          status: "pending",
        },
      ]);
      setNewStopAddress("");
    } catch {
      setError("Address validation failed");
    }
  };

  // Remove stop
  const handleRemoveStop = (idx: number) => {
    setStops(stops.filter((_, i) => i !== idx));
  };

  // Reorder stops
  const handleMoveStop = (from: number, to: number) => {
    if (to < 0 || to >= stops.length) return;
    const updated = [...stops];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStops(updated);
  };

  // Set depot location (by address)
  const handleSetDepot = async (address: string) => {
    setError(null);
    try {
      const { data } = await axios.post("/api/geocode", { address });
      console.log("Geocoding result:", data);
      setDepot({ lat: data.lat, lng: data.lng });
      console.log("Depot set to:", { lat: data.lat, lng: data.lng });
      console.log("Depot state after set (from data):", { lat: data.lat, lng: data.lng });
      console.log("Depot state after set (from depot variable):", depot?.lat, depot?.lng);
    } catch {
      setError("Depot address validation failed");
    }
  };

  // Optimize route
  const handleOptimizeRoute = async () => {
    if (!depot || stops.length === 0) return;

    // Logging for depot and stops
    console.log('Depot:', depot);
    console.log('Stops:', stops);

    // Validate depot coordinates
    if (
      typeof depot.lat !== 'number' ||
      typeof depot.lng !== 'number' ||
      isNaN(depot.lat) ||
      isNaN(depot.lng)
    ) {
      setError('Depot coordinates must be valid numbers');
      return;
    }

    setOptimizing(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/optimize", {
        depot,
        stops: stops.map(({ id, address, lat, lng, sequence_order, status }) => ({
          id,
          address,
          lat,
          lng,
          sequence_order,
          status,
        })),
      });
      setRouteGeometry(data.geometry);
      setEstimates({ distance: data.distance, duration: data.duration });
      // Update stops order
      setStops(
        data.optimizedStops.map((stop: Stop) => ({
          ...stops.find((s) => s.id === stop.id),
          sequence_order: stop.sequence_order,
        }))
      );
    } catch {
      setError("Route optimization failed");
    }
    setOptimizing(false);
  };

  // Map center
  const mapCenter =
    depot && depot.lat && depot.lng
      ? [depot.lat, depot.lng]
      : stops.length > 0 && stops[0].lat && stops[0].lng
      ? [stops[0].lat, stops[0].lng]
      : DEFAULT_CENTER;

  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Map as background */}
      <div className="absolute inset-0">
        <DynamicMap
          depot={depot}
          stops={stops}
          routeGeometry={routeGeometry}
          onMapClick={handleMapClick}
        />
      </div>
      {/* Overlay: Route Management */}
      <div className="absolute top-6 right-6 z-10">
        <button
          className="bg-gray-800 text-white px-3 py-1 rounded shadow mb-2"
          onClick={() => setShowOverlay((v) => !v)}
        >
          {showOverlay ? "Hide Route Management" : "Show Route Management"}
        </button>
        {showOverlay && (
          <div className="w-[350px] max-h-[80vh] overflow-y-auto bg-white bg-opacity-95 rounded-lg shadow-lg p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold">Route Management</h2>
            {/* Depot input */}
            <div>
              <label className="block font-medium mb-1">Depot Address</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="Enter depot address"
                onBlur={(e) => handleSetDepot(e.target.value)}
              />
            </div>
            {/* Stop management */}
            <div>
              <label className="block font-medium mb-1">Stops</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="Enter stop address"
                  value={newStopAddress}
                  onChange={(e) => setNewStopAddress(e.target.value)}
                />
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleAddStop}>
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {stops.map((stop, idx) => (
                  <li key={stop.id ?? idx} className="flex items-center gap-2">
                    <span className="flex-1">{stop.address}</span>
                    <button className="text-xs px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleRemoveStop(idx)}>
                      Remove
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-gray-300 rounded"
                      onClick={() => handleMoveStop(idx, idx - 1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-gray-300 rounded"
                      onClick={() => handleMoveStop(idx, idx + 1)}
                      disabled={idx === stops.length - 1}
                    >
                      ↓
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Optimization */}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
              onClick={handleOptimizeRoute}
              disabled={optimizing || !depot || stops.length === 0}
            >
              {optimizing ? "Optimizing..." : "Optimize Route"}
            </button>
            {/* Estimates */}
            {estimates && (
              <div className="mt-2">
                <div>
                  <span className="font-medium">Estimated Distance:</span> {estimates.distance} km
                </div>
                <div>
                  <span className="font-medium">Estimated Time:</span> {Math.round(estimates.duration / 60)} min
                </div>
              </div>
            )}
            {/* Error */}
            {error && <div className="text-red-600">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}