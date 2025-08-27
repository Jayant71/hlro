// Geocoding Service using self-hosted Nominatim
import fetch from 'node-fetch';

const MAPBOX_GEOCODING_API = process.env.MAPBOX_GEOCODING_API || 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

let lastRequestTime = 0;
const cache = new Map();

/**
 * Simple in-memory cache with TTL
 */
function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setToCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
}

/**

/**
 * Converts address to coordinates using Nominatim
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    console.error("Geocoding: Invalid address input:", address);
    throw new Error('Invalid address');
  }

  const cacheKey = address.trim().toLowerCase();
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    limit: '1'
  });

  let response;
  try {
    const url = `${MAPBOX_GEOCODING_API}/${encodeURIComponent(address)}.json?${params.toString()}`;
    console.log("Geocoding: Fetching from Mapbox:", url);
    response = await fetch(url);
    console.log("Geocoding: Response status:", response.status);
  } catch (err) {
    console.error("Geocoding: Fetch error:", err, err.stack);
    throw new Error('Failed to connect to geocoding service');
  }

  if (!response.ok) {
    console.error("Geocoding: Service error status:", response.status);
    throw new Error(`Geocoding service error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Geocoding: Response data:", data);
  if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
    console.error("Geocoding: Address not found for:", address);
    throw new Error('Address not found');
  }

  const feature = data.features[0];
  if (!feature.center || feature.center.length < 2) {
    console.error("Geocoding: Invalid response for:", address, feature);
    throw new Error('Invalid response from geocoding service');
  }

  console.log("Geocoding: Found coordinates:", feature.center);
  const [lng, lat] = feature.center;

  const result = { lat, lng };
  console.log("Geocoding: Caching result:", cacheKey, result);
  setToCache(cacheKey, result);
  return result;
}

/**
 * Converts coordinates to address using Mapbox reverse geocoding
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{address: string}>}
 */
async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    console.error("Reverse Geocoding: Invalid coordinates:", lat, lng);
    throw new Error('Invalid coordinates');
  }

  const cacheKey = `reverse_${lat}_${lng}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    types: 'address,poi,place',
    limit: '1'
  });

  let response;
  try {
    const url = `${MAPBOX_GEOCODING_API}/${lng},${lat}.json?${params.toString()}`;
    console.log("Reverse Geocoding: Fetching from Mapbox:", url);
    response = await fetch(url);
    console.log("Reverse Geocoding: Response status:", response.status);
  } catch (err) {
    console.error("Reverse Geocoding: Fetch error:", err, err.stack);
    throw new Error('Failed to connect to reverse geocoding service');
  }

  if (!response.ok) {
    console.error("Reverse Geocoding: Service error status:", response.status);
    throw new Error(`Reverse geocoding service error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Reverse Geocoding: Response data:", data);
  
  if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
    console.error("Reverse Geocoding: No address found for coordinates:", lat, lng);
    throw new Error('Address not found for coordinates');
  }

  const feature = data.features[0];
  const address = feature.place_name || feature.text || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  
  console.log("Reverse Geocoding: Found address:", address);
  const result = { address };
  
  console.log("Reverse Geocoding: Caching result:", cacheKey, result);
  setToCache(cacheKey, result);
  return result;
}

export { geocodeAddress, reverseGeocode };