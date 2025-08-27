// Routing optimization service using OSRM Trip API

import axios from 'axios';
import { Route, Stop } from '../../../models';

const MAPBOX_DIRECTIONS_API = process.env.MAPBOX_DIRECTIONS_API || 'https://api.mapbox.com/directions/v5/mapbox/driving';
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

/**
 * Optimize route using OSRM Trip service.
 * @param {Object} depot - { lat, lng }
 * @param {Array} stops - [{ id, lat, lng }]
 * @param {String} routeId - UUID of the route to update
 * @returns {Promise<{optimizedStops: Array, geometry: Object}>}
 */
async function optimizeRoute({ depot, stops, routeId }) {
  try { 
    // Mapbox expects coordinates as [lng,lat] pairs
    // Validate depot and stops

    console.log("Routing: Validating depot and stops");
    console.log("Routing: Depot coordinates:", depot);

    const validStops = stops.filter(
      stop => stop && stop.lat != null && stop.lng != null
    );
    console.log("Routing: Valid stops:", validStops);

    if (!depot || depot.lat == null || depot.lng == null) {
        throw new Error('Depot coordinates are missing or invalid');
    }
    if (validStops.length === 0) {
        throw new Error('No valid stops provided');
    }
 
    const coordinates = [
      [depot.lng, depot.lat],
      ...validStops.map(({ lng, lat }) => [lng, lat])
    ];

    // Build coordinates string for Mapbox API
    const coordsStr = coordinates.map(coord => coord.join(',')).join(';');
    const url = `${MAPBOX_DIRECTIONS_API}/${coordsStr}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=full&steps=false`;

    console.log('Mapbox Directions API URL:', url);

    const response = await axios.get(url);
    const data = response.data;
    console.log('Mapbox Directions API response:', JSON.stringify(data));

    if (!data.routes || !data.routes.length) {
      console.error('No routes returned from Mapbox:', JSON.stringify(data));
      throw new Error('No routes returned from Mapbox');
    }

    const route = data.routes[0];
    const geometry = route.geometry; // GeoJSON LineString

    // Mapbox does not optimize stop order, so keep input order
    const optimizedStops = stops.map((stop, idx) => ({
      id: stop.id,
      sequence_order: idx + 1,
      location: [stop.lng, stop.lat],
    }));

    // Save optimized geometry and stop sequence to DB
    await Route.update(
      { optimized_geometry: geometry },
      { where: { id: routeId } }
    );

    // Update stops sequence_order
    for (const stop of optimizedStops) {
      await Stop.update(
        { sequence_order: stop.sequence_order },
        { where: { id: stop.id } }
      );
    }

    return { optimizedStops, geometry };
  } catch (error) {
    // Error handling for routing failures
    console.error('Routing optimization failed:', error.message, error.stack);
    throw new Error('Routing optimization failed');
  }
}

export { optimizeRoute };