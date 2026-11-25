const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'Customer' } = req.body;
    const [[existing]] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE name = ?', [role]);
    if (!roleRow) return res.status(400).json({ error: 'Invalid role' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role_id, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, roleRow.id, phone || null]
    );
    const userId = result.insertId;

    if (role === 'Customer') {
      await pool.query('INSERT INTO customers (user_id) VALUES (?)', [userId]);
    } else if (role === 'Driver') {
      await pool.query(
        'INSERT INTO drivers (user_id, license_no, status) VALUES (?, ?, ?)',
        [userId, 'PENDING-' + userId, 'available']
      );
    }

    const [[user]] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
      [userId]
    );
    res.status(201).json({ token: sign(user), user });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [[user]] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.phone, u.is_active, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?`,
      [email]
    );
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'Account deactivated' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    delete user.password;
    res.json({ token: sign(user), user });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const [[user]] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, r.name AS role, u.created_at
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
      [req.user.id]
    );
    res.json(user);
  } catch (err) { next(err); }
};
