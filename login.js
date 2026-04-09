const pool = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  const { phone, password } = req.body;
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE (phone = ? OR username = ?) AND password = ?',
      [phone, phone, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
