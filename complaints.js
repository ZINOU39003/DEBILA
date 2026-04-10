const pool = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- GET: Fetch Complaints ---
  if (req.method === 'GET') {
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
        history: [], // Logic for history can be added if needed
        messages: []
      }));
      return res.json({ success: true, data: { items: complaints } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- POST: Create Complaint ---
  if (req.method === 'POST') {
    const { id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls } = req.body;
    try {
      await pool.execute(
        'INSERT INTO complaints (id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, JSON.stringify(media_urls || [])]
      );
      return res.status(201).json({ success: true, data: { id } });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- PATCH: Update Status ---
  if (req.method === 'PATCH') {
     // For simplicity, we can handle status updates here if we update the frontend URL
     const { id, status, note } = req.body;
     try {
       await pool.execute('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
       return res.json({ success: true });
     } catch (error) {
       return res.status(500).json({ success: false, message: error.message });
     }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
};
