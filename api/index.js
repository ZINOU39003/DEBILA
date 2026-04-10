const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

app.use(cors());
app.use(express.json());

// --- Health Check ---
app.get('/api', (req, res) => {
  res.json({ success: true, message: "Bader Node.js API is running" });
});

// --- Authentication ---
app.post('/api/auth/register', async (req, res) => {
  const { phone, password, full_name, username, email, role } = req.body;
  try {
    const [rows] = await pool.execute(
      'INSERT INTO users (phone, password, full_name, username, email, role) VALUES (?, ?, ?, ?, ?, ?)',
      [phone.trim(), password, full_name.trim(), username?.trim() || null, email?.trim() || null, role || 'citizen']
    );
    const userId = rows.insertId;
    const token = jwt.sign({ id: userId, phone, role: role || 'citizen' }, JWT_SECRET);
    res.status(201).json({
      success: true,
      access_token: token,
      user: { id: userId, phone, full_name, username, role: role || 'citizen' }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'خطأ في التسجيل: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE (phone = ? OR username = ?) AND password = ?',
      [phone, phone, password]
    );
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }
    const user = users[0];
    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET);
    res.json({
      success: true,
      access_token: token,
      user: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// --- Complaints ---
app.get('/api/complaints', async (req, res) => {
  const { reporter_id } = req.query;
  try {
    let query = 'SELECT * FROM complaints';
    let params = [];
    if (reporter_id) {
      query += ' WHERE reporter_id = ?';
      params.push(reporter_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    const complaints = rows.map(r => ({
      ...r,
      media_urls: typeof r.media_urls === 'string' ? JSON.parse(r.media_urls) : (r.media_urls || []),
      history: [],
      messages: []
    }));
    res.json({ success: true, data: { items: complaints } });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/complaints/:id/messages', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM messages WHERE complaint_id = ? ORDER BY created_at ASC', [id]);
    res.json({ success: true, data: { items: rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/complaints/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { sender_id, sender_name, sender_role, text } = req.body;
  try {
    await pool.execute(
      'INSERT INTO messages (complaint_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)',
      [id, sender_id, sender_name, sender_role, text]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
