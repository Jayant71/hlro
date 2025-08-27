import { Route, Stop, Depot, User } from '../../../../models';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Create new route
    const { depotId, stops, route_date, userId } = req.body;
    if (!depotId || !Array.isArray(stops) || !route_date || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const route = await Route.create({ depotId, route_date, userId });
      const stopRecords = await Promise.all(
        stops.map((stop, idx) =>
          Stop.create({
            address: stop.address,
            sequence_order: idx + 1,
            status: stop.status || 'pending',
            routeId: route.id,
          })
        )
      );
      res.status(201).json({ route, stops: stopRecords });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    // Fetch all routes with stops
    try {
      const routes = await Route.findAll({
        include: [
          { model: Depot },
          { model: Stop, order: [['sequence_order', 'ASC']] },
          { model: User },
        ],
      });
      res.status(200).json({ routes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
