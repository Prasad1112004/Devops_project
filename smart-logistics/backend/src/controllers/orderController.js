const pool = require('../config/db');
const crypto = require('crypto');

function genTrackingId() {
  return 'LT' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

function paginate(req) {
  const page  = Math.max(1, parseInt(req.query.page  || '1'));
  const limit = Math.min(100, parseInt(req.query.limit || '20'));
  return { offset: (page - 1) * limit, limit, page };
}

// GET /api/orders
exports.list = async (req, res, next) => {
  try {
    const { offset, limit, page } = paginate(req);
    const { status, search, driver_id } = req.query;

    let where = ['1=1'];
    const params = [];

    if (status)    { where.push('o.status = ?');         params.push(status); }
    if (driver_id) { where.push('o.driver_id = ?');      params.push(driver_id); }
    if (search)    {
      where.push('(o.tracking_id LIKE ? OR uc.name LIKE ? OR o.delivery_city LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    // Role filter: Drivers see their own; Customers see their own
    if (req.user.role === 'Driver') {
      const [[driver]] = await pool.query('SELECT id FROM drivers WHERE user_id=?',[req.user.id]);
      if (driver) { where.push('o.driver_id = ?'); params.push(driver.id); }
    } else if (req.user.role === 'Customer') {
      const [[cust]] = await pool.query('SELECT id FROM customers WHERE user_id=?',[req.user.id]);
      if (cust) { where.push('o.customer_id = ?'); params.push(cust.id); }
    }

    const whereStr = where.join(' AND ');
    const sql = `
      SELECT o.id, o.tracking_id, o.status, o.priority,
             o.pickup_city, o.delivery_city, o.weight_kg, o.distance_km,
             o.estimated_eta, o.actual_delivery, o.created_at,
             uc.name AS customer_name,
             ud.name AS driver_name
      FROM orders o
      LEFT JOIN customers c  ON c.id  = o.customer_id
      LEFT JOIN users uc     ON uc.id = c.user_id
      LEFT JOIN drivers d    ON d.id  = o.driver_id
      LEFT JOIN users ud     ON ud.id = d.user_id
      WHERE ${whereStr}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [...params, limit, offset]);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o
       LEFT JOIN customers c ON c.id=o.customer_id
       LEFT JOIN users uc ON uc.id=c.user_id
       WHERE ${whereStr}`, params
    );

    res.json({ data: rows, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
exports.get = async (req, res, next) => {
  try {
    const [[order]] = await pool.query(`
      SELECT o.*, uc.name AS customer_name, uc.email AS customer_email,
             ud.name AS driver_name, ud.phone AS driver_phone,
             v.plate_number, v.type AS vehicle_type
      FROM orders o
      LEFT JOIN customers c ON c.id=o.customer_id
      LEFT JOIN users uc ON uc.id=c.user_id
      LEFT JOIN drivers d ON d.id=o.driver_id
      LEFT JOIN users ud ON ud.id=d.user_id
      LEFT JOIN vehicles v ON v.id=o.vehicle_id
      WHERE o.id=?`, [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items]  = await pool.query('SELECT * FROM order_items WHERE order_id=?', [order.id]);
    const [events] = await pool.query(
      'SELECT * FROM tracking_events WHERE order_id=? ORDER BY created_at ASC', [order.id]
    );
    res.json({ ...order, items, events });
  } catch (err) { next(err); }
};

// POST /api/orders
exports.create = async (req, res, next) => {
  try {
    const {
      pickup_address, pickup_city, pickup_lat, pickup_lng,
      delivery_address, delivery_city, delivery_lat, delivery_lng,
      weight_kg, priority, notes, items = []
    } = req.body;

    const [[cust]] = await pool.query('SELECT id FROM customers WHERE user_id=?',[req.user.id]);
    if (!cust) return res.status(400).json({ error: 'Customer profile not found' });

    const tracking_id = genTrackingId();
    const dist = Math.round(Math.random() * 500 + 10); // placeholder; use real geocoding
    const days  = priority === 'Express' ? 1 : priority === 'Overnight' ? 0 : 3;
    const eta   = new Date(Date.now() + days * 86400000);

    const [r] = await pool.query(
      `INSERT INTO orders
       (tracking_id, customer_id, status, priority,
        pickup_address, pickup_city, pickup_lat, pickup_lng,
        delivery_address, delivery_city, delivery_lat, delivery_lng,
        weight_kg, distance_km, estimated_eta, notes)
       VALUES (?,?,  'Pending',?,  ?,?,?,?,  ?,?,?,?,  ?,?,?,?)`,
      [tracking_id, cust.id, priority || 'Standard',
       pickup_address, pickup_city || '', pickup_lat || null, pickup_lng || null,
       delivery_address, delivery_city || '', delivery_lat || null, delivery_lng || null,
       weight_kg || null, dist, eta, notes || null]
    );
    const orderId = r.insertId;

    // Insert items
    for (const it of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, description, quantity, weight_kg) VALUES (?,?,?,?)',
        [orderId, it.description, it.quantity || 1, it.weight_kg || null]
      );
    }

    // Initial tracking event
    await pool.query(
      'INSERT INTO tracking_events (order_id, status, note, created_by) VALUES (?,?,?,?)',
      [orderId, 'Order Created', 'Your order has been placed.', req.user.id]
    );

    res.status(201).json({ id: orderId, tracking_id });
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, location, lat, lng } = req.body;
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id=?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const updates = { status };
    if (status === 'Delivered') updates.actual_delivery = new Date();
    await pool.query('UPDATE orders SET ? WHERE id=?', [updates, order.id]);

    await pool.query(
      'INSERT INTO tracking_events (order_id, status, note, lat, lng, location, created_by) VALUES (?,?,?,?,?,?,?)',
      [order.id, status, note || null, lat || null, lng || null, location || null, req.user.id]
    );

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, order_id, title, message, type)
       SELECT c.user_id, ?, ?, ?, ?
       FROM customers c WHERE c.id = ?`,
      [order.id, `Order ${status}`, `Your order ${order.tracking_id} is now: ${status}.`,
       status === 'Delivered' ? 'success' : status === 'Delayed' ? 'warning' : 'info',
       order.customer_id]
    );

    res.json({ ok: true });
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/assign
exports.assign = async (req, res, next) => {
  try {
    const { driver_id, vehicle_id } = req.body;
    await pool.query(
      `UPDATE orders SET driver_id=?, vehicle_id=?, status='Assigned' WHERE id=?`,
      [driver_id, vehicle_id || null, req.params.id]
    );
    await pool.query(
      `INSERT INTO tracking_events (order_id, status, note, created_by) VALUES (?,?,?,?)`,
      [req.params.id, 'Assigned', 'Driver assigned to your order.', req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// DELETE /api/orders/:id  (cancel)
exports.cancel = async (req, res, next) => {
  try {
    await pool.query(`UPDATE orders SET status='Cancelled' WHERE id=?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// GET /api/orders/track/:trackingId  (public)
exports.track = async (req, res, next) => {
  try {
    const [[order]] = await pool.query(
      `SELECT o.tracking_id, o.status, o.priority,
              o.pickup_city, o.delivery_city,
              o.estimated_eta, o.actual_delivery, o.distance_km
       FROM orders o WHERE o.tracking_id=?`,
      [req.params.trackingId.toUpperCase()]
    );
    if (!order) return res.status(404).json({ error: 'Tracking ID not found' });
    const [events] = await pool.query(
      'SELECT status, note, location, lat, lng, created_at FROM tracking_events WHERE order_id=(SELECT id FROM orders WHERE tracking_id=?) ORDER BY created_at ASC',
      [req.params.trackingId.toUpperCase()]
    );
    res.json({ ...order, events });
  } catch (err) { next(err); }
};
