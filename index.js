const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

let pool;
try {
  pool = require('./db');
} catch (e) {
  console.error("Critical DB Load Error:", e);
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

app.use(cors());
app.use(express.json());

// --- Health Checks (Robust Matching) ---

// This works if Vercel passes the full path /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", path: "api-health", timestamp: new Date().toISOString() });
});

// This works if Vercel passes the sub-path /health
app.get('/health', (req, res) => {
  res.json({ status: "ok", path: "health", timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ success: true, server: "Bader Node Engine" });
});

// --- Diagnostic Route ---
const handleTestDb = async (req, res) => {
  if (!pool) return res.status(500).json({ error: "Pool not loaded" });
  try {
    const [rows] = await pool.execute("SHOW TABLES");
    res.json({ success: true, connected: true, tables: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

app.get('/api/test-db', handleTestDb);
app.get('/test-db', handleTestDb);

// --- Auth Routes ---
const handleRegister = async (req, res) => {
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
};

app.post('/api/auth/register', handleRegister);
app.post('/auth/register', handleRegister);

// --- Login ---
const handleLogin = async (req, res) => {
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
};

app.post('/api/auth/login', handleLogin);
app.post('/auth/login', handleLogin);

module.exports = app;
