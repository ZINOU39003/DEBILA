const pool = require('./db');

module.exports = async (req, res) => {
  // --- GET: Fetch Messages ---
  if (req.method === 'GET') {
    const { id } = req.query; // From rewrite or direct
    const complaintId = id || req.url.split('/')[3]; // Backup path parsing
    
    try {
      const [rows] = await pool.execute('SELECT * FROM messages WHERE complaint_id = ? ORDER BY created_at ASC', [complaintId]);
      return res.json({ success: true, data: { items: rows } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- POST: Send Message ---
  if (req.method === 'POST') {
    const complaintId = req.query.id || req.url.split('/')[3];
    const { sender_id, sender_name, sender_role, text } = req.body;
    try {
      await pool.execute(
        'INSERT INTO messages (complaint_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)',
        [complaintId, sender_id, sender_name, sender_role, text]
      );
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
};
