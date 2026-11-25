const pool = require('../config/db');

// GET /api/drivers
exports.list = async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
    const offset = Math.max(parseInt(req.query.offset) || 0,  0);
    const [rows] = await pool.query(`
      SELECT d.id, u.name, u.email, u.phone, d.license_no AS license_plate,
             d.status, d.rating, d.total_deliveries,
             v.plate_number, v.type AS vehicle_type, v.status AS vehicle_status
      FROM drivers d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN vehicles v ON v.id = d.vehicle_id
      ORDER BY d.status, u.name
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM drivers d JOIN users u ON u.id = d.user_id');
    res.json({ data: rows, total, limit, offset });
  } catch (err) { next(err); }
};

// GET /api/drivers/:id
exports.get = async (req, res, next) => {
  try {
    const [[driver]] = await pool.query(`
      SELECT d.*, u.name, u.email, u.phone,
             v.plate_number, v.type AS vehicle_type
      FROM drivers d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN vehicles v ON v.id = d.vehicle_id
      WHERE d.id = ?`, [req.params.id]);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const [orders] = await pool.query(`
      SELECT id, tracking_id, status, delivery_city, estimated_eta
      FROM orders WHERE driver_id=? AND status NOT IN ('Delivered','Cancelled')
      ORDER BY created_at DESC`, [driver.id]);

    res.json({ ...driver, active_orders: orders });
  } catch (err) { next(err); }
};

// PATCH /api/drivers/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE drivers SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// GET /api/vehicles
exports.listVehicles = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles ORDER BY status, type');
    res.json(rows);
  } catch (err) { next(err); }
};
