const pool = require('../config/db');

// Simple nearest-neighbor route optimization
function nearestNeighbor(stops) {
  if (!stops || stops.length <= 2) return stops;
  const visited = new Array(stops.length).fill(false);
  const route = [stops[0]];
  visited[0] = true;
  for (let step = 1; step < stops.length; step++) {
    const last = route[route.length - 1];
    let best = -1, bestDist = Infinity;
    for (let i = 0; i < stops.length; i++) {
      if (visited[i]) continue;
      const d = haversine(last.lat, last.lng, stops[i].lat, stops[i].lng);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    visited[best] = true;
    route.push({ ...stops[best], distance_from_prev_km: Math.round(bestDist * 10) / 10 });
  }
  return route;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// POST /api/routes/optimize
exports.optimize = async (req, res, next) => {
  try {
    const { stops } = req.body;
    if (!Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ error: 'Provide at least 2 stops with lat/lng' });
    }
    for (const s of stops) {
      if (typeof s.lat !== 'number' || typeof s.lng !== 'number') {
        return res.status(400).json({ error: 'Each stop must have numeric lat and lng' });
      }
    }
    const optimized = nearestNeighbor(stops);
    const totalDist = optimized.slice(1).reduce((sum, s) => sum + (s.distance_from_prev_km || 0), 0);
    res.json({
      optimized_route: optimized,
      total_distance_km: Math.round(totalDist * 10) / 10,
      estimated_hours: Math.round(totalDist / 50 * 10) / 10, // assume avg 50 km/h
      note: 'Route optimized using nearest-neighbor algorithm (simulated)',
    });
  } catch (err) { next(err); }
};

// GET /api/routes — list saved routes for the user's orders
exports.list = async (req, res, next) => {
  try {
    const [routes] = await pool.query(`
      SELECT r.id, r.order_id, r.total_distance_km, r.estimated_duration_min, r.status,
             o.tracking_id, o.pickup_city, o.delivery_city
      FROM routes r
      JOIN orders o ON o.id = r.order_id
      ORDER BY r.created_at DESC
      LIMIT 20
    `);
    res.json(routes);
  } catch (err) { next(err); }
};
