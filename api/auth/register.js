const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

module.exports = async (req, res) => {
  console.log('Register endpoint hit:', req.method, req.body);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  if (!pool) {
    console.error('Database pool is not initialized');
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
  
  const { phone, password, full_name, username, email, role } = req.body;
  console.log('Received data:', { phone, full_name, username, email, role });
  
  try {
    // Check if users table exists
    const [tables] = await pool.execute("SHOW TABLES LIKE 'users'");
    console.log('Users table check:', tables);
    
    if (tables.length === 0) {
      return res.status(500).json({ success: false, message: 'Users table does not exist' });
    }
    
    const [rows] = await pool.execute(
      'INSERT INTO users (phone, password, full_name, username, email, role) VALUES (?, ?, ?, ?, ?, ?)',
      [phone, password, full_name, username, email, role || 'citizen']
    );
    console.log('Insert result:', rows);
    
    const userId = rows.insertId;
    const token = jwt.sign({ id: userId, phone, role: role || 'citizen' }, JWT_SECRET);
    
    res.status(201).json({
      success: true,
      access_token: token,
      user: { id: String(userId), phone, full_name, username, role: role || 'citizen' }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    let message = error.message;
    
    // Handle specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (message.includes('phone')) {
        message = 'رقم الهاتف مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول.';
      } else if (message.includes('username')) {
        message = 'اسم المستخدم مسجل مسبقاً. يرجى اختيار اسم آخر.';
      } else {
        message = 'هذا الحساب مسجل مسبقاً.';
      }
    }
    
    res.status(400).json({ success: false, message, code: error.code });
  }
};
