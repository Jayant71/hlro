"use client";
import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

type Depot = {
  lat: number;
  lng: number;
};

type Stop = {
  lat?: number;
  lng?: number;
  address: string;
  sequence_order?: number;
};

type MapProps = {
  depot: Depot | null;
  stops: Stop[];
  routeGeometry: { coordinates: [number, number][] } | null;
  onMapClick?: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

export default function MapComponent({ depot, stops, routeGeometry, onMapClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const mapCenter: [number, number] =
    depot && typeof depot.lat === "number" && typeof depot.lng === "number"
      ? [depot.lng, depot.lat]
      : stops.length > 0 && typeof stops[0].lat === "number" && typeof stops[0].lng === "number"
      ? [stops[0].lng!, stops[0].lat!]
      : DEFAULT_CENTER;

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: mapCenter,
      zoom: 13,
    });

    mapRef.current = map;

    // Add click event listener for map clicks
    if (onMapClick) {
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onMapClick(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapClick]);

  // Update markers when depot or stops change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers (both default and custom)
    const markers = document.querySelectorAll('.mapboxgl-marker, .custom-marker');
    markers.forEach(marker => marker.remove());

    // Add depot marker
    if (depot && depot.lat && depot.lng) {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([depot.lng, depot.lat])
        .setPopup(new mapboxgl.Popup().setText("Depot"))
        .addTo(map);
    }

    // Add stop markers with numbering
    stops.forEach((stop, idx) => {
      if (stop.lat && stop.lng) {
        // Create custom numbered marker
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.backgroundColor = idx === 0 ? '#22c55e' : (idx === stops.length - 1 ? '#ef4444' : '#3b82f6');
        markerElement.style.width = '30px';
        markerElement.style.height = '30px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.display = 'flex';
        markerElement.style.alignItems = 'center';
        markerElement.style.justifyContent = 'center';
        markerElement.style.color = 'white';
        markerElement.style.fontWeight = 'bold';
        markerElement.style.fontSize = '14px';
        markerElement.style.border = '2px solid white';
        markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        // Add number (1-based index)
        markerElement.textContent = (idx + 1).toString();
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([stop.lng, stop.lat])
          .setPopup(new mapboxgl.Popup().setText(
            idx === 0 ? 'START: Depot' :
            idx === stops.length - 1 ? `END: Stop ${idx + 1}` :
            `Stop ${idx + 1}: ${stop.address}`
          ))
          .addTo(map);
        
        // Ensure the marker is visible by setting z-index
        const markerElementContainer = marker.getElement();
        if (markerElementContainer) {
          markerElementContainer.style.zIndex = '1000';
        }
      }
    });
  }, [depot, stops]);

  // Update route when routeGeometry changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeGeometry || routeGeometry.coordinates.length <= 1) return;

    const updateRoute = () => {
      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeGeometry.coordinates,
          },
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0074D9", "line-width": 4 },
      });
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      map.once("load", updateRoute);
    }
  }, [routeGeometry]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}