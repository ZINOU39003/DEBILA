const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  const { phone, password, full_name, username, email, role } = req.body;
  try {
    const [rows] = await pool.execute(
      'INSERT INTO users (phone, password, full_name, username, email, role) VALUES (?, ?, ?, ?, ?, ?)',
      [phone, password, full_name, username, email, role || 'citizen']
    );
    const userId = rows.insertId;
    const token = jwt.sign({ id: userId, phone, role: role || 'citizen' }, JWT_SECRET);
    
    res.status(201).json({
      success: true,
      access_token: token,
      user: { id: userId, phone, full_name, username, role: role || 'citizen' }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
