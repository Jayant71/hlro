import { geocodeAddress, reverseGeocode } from "../../lib/services/geocodingService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if it's a reverse geocode request (has lat/lng)
  if (req.body.lat !== undefined && req.body.lng !== undefined) {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }
    try {
      const result = await reverseGeocode(lat, lng);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  // Regular geocode request (has address)
  else if (req.body.address) {
    const { address } = req.body;
    if (typeof address !== "string") {
      return res.status(400).json({ error: "Invalid address" });
    }
    try {
      const result = await geocodeAddress(address);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    return res.status(400).json({ error: "Either address or lat/lng must be provided" });
  }
}