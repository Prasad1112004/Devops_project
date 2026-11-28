const pool = require('../config/db');

// GET /api/dashboard/stats
exports.stats = async (req, res, next) => {
  try {
    const [[counts]] = await pool.query(`
      SELECT
        COUNT(*)                                              AS total,
        SUM(status = 'In Transit')                           AS in_transit,
        SUM(status = 'Out for Delivery')                     AS out_for_delivery,
        SUM(status = 'Delivered')                            AS delivered,
        SUM(status = 'Delayed')                             AS \`delayed\`,
        SUM(status = 'Pending')                              AS pending,
        SUM(status = 'Cancelled')                            AS cancelled,
        SUM(status NOT IN ('Delivered','Cancelled'))         AS active
      FROM orders
    `);

    const [[driverStats]] = await pool.query(`
      SELECT COUNT(*) AS total,
             SUM(status='Available') AS available,
             SUM(status='On Delivery') AS on_delivery
      FROM drivers
    `);

    const [dailyData] = await pool.query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS orders,
             SUM(status='Delivered') AS delivered
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day
    `);

    const [statusDist] = await pool.query(`
      SELECT status, COUNT(*) AS count FROM orders GROUP BY status
    `);

    res.json({ counts, drivers: driverStats, daily: dailyData, statusDist });
  } catch (err) { next(err); }
};

// GET /api/dashboard/notifications
exports.notifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// PATCH /api/dashboard/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read=TRUE WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
};
