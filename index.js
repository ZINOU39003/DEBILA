const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

let pool;
try {
  pool = require('./db');
} catch (e) {
  console.error("DB Import Error:", e);
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

app.use(cors());
app.use(express.json());

// Top-level error capturing for Vercel debugging
app.use((req, res, next) => {
  if (!pool) {
    return res.status(500).json({ error: "Database pool failed to initialize. Check logs or credentials." });
  }
  next();
});

// --- Health Check ---
app.get('/api', (req, res) => {
  res.json({ success: true, message: "Bader Smart Portal API (Node.js) is running.", pool_initialized: !!pool });
});

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", engine: "node-js", timestamp: new Date().toISOString() });
});

// --- Diagnostic Route ---
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.execute("SHOW TABLES LIKE 'users'");
    res.json({
      success: true,
      status: "connected",
      users_table: rows.length > 0 ? "exists" : "missing"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// ... (remaining auth and complaints routes) ...
// (I will keep them for now but ensure they are inside the export)

app.post('/api/auth/register', async (req, res) => {
  const { phone, password, full_name, username, email, role } = req.body;
  try {
    const [rows] = await pool.execute(
      'INSERT INTO users (phone, password, full_name, username, email, role) VALUES (?, ?, ?, ?, ?, ?)',
      [phone, password, full_name, username, email, role || 'citizen']
    );
    const userId = rows.insertId;
    const token = jwt.sign({ id: userId, phone, role: role || 'citizen' }, JWT_SECRET);
    res.status(201).json({ success: true, access_token: token, user: { id: userId, phone, full_name, username, role: role || 'citizen' } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE (phone = ? OR username = ?) AND password = ?', [phone, phone, password]);
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = users[0];
    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET);
    res.json({ success: true, access_token: token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/complaints', async (req, res) => {
  const { reporter_id } = req.query;
  try {
    let q = 'SELECT * FROM complaints';
    let p = [];
    if (reporter_id) { q += ' WHERE reporter_id = ?'; p.push(reporter_id); }
    const [rows] = await pool.execute(q, p);
    res.json({ success: true, data: { items: rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls } = req.body;
  try {
    await pool.execute(
      'INSERT INTO complaints (id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, JSON.stringify(media_urls || [])]
    );
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
