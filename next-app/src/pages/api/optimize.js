import { optimizeRoute } from "../../lib/services/routingService";

export default async function handler(req, res) {
  console.log("Optimize API called:", req.method, req.body);

  if (req.method !== "POST") {
    console.warn("Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { depot, stops } = req.body;
  if (!depot || !Array.isArray(stops) || stops.length === 0) {
    console.warn("Missing depot or stops:", depot, stops);
    return res.status(400).json({ error: "Depot and stops required" });
  }

  try {
    console.log("Calling optimizeRoute with:", { depot, stops });
    const result = await optimizeRoute({ depot, stops });
    const distance = result.geometry?.distance || 0;
    const duration = result.geometry?.duration || 0;
    console.log("Optimization result:", { geometry: result.geometry, optimizedStops: result.optimizedStops, distance, duration });
    res.status(200).json({
      geometry: result.geometry,
      optimizedStops: result.optimizedStops,
      distance,
      duration,
    });
  } catch (error) {
    console.error("Optimization failed:", error.message, error.stack);
    res.status(400).json({ error: error.message });
  }
}