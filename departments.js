const pool = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!pool) {
    return res.status(500).json({ success: false, message: 'Database not connected' });
  }

  try {
    // GET - List all departments
    if (req.method === 'GET') {
      const [rows] = await pool.execute('SELECT id, name, username, logo_uri, cover_uri, sector, created_at FROM departments ORDER BY created_at DESC');
      return res.json({ success: true, departments: rows });
    }

    // POST - Create new department
    if (req.method === 'POST') {
      const { name, username, password, logo_uri, cover_uri, sector } = req.body;
      
      if (!name || !username || !password) {
        return res.status(400).json({ success: false, message: 'Name, username and password are required' });
      }

      const [result] = await pool.execute(
        'INSERT INTO departments (name, username, password, logo_uri, cover_uri, sector) VALUES (?, ?, ?, ?, ?, ?)',
        [name, username, password, logo_uri || '', cover_uri || '', sector || '']
      );
      
      return res.status(201).json({ 
        success: true, 
        department: { 
          id: result.insertId, 
          name, 
          username, 
          logo_uri, 
          cover_uri, 
          sector 
        } 
      });
    }

    // PUT - Update department
    if (req.method === 'PUT') {
      const { id, name, username, password, logo_uri, cover_uri, sector } = req.body;
      
      if (!id) {
        return res.status(400).json({ success: false, message: 'Department ID is required' });
      }

      const updates = [];
      const values = [];
      
      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (username !== undefined) { updates.push('username = ?'); values.push(username); }
      if (password !== undefined) { updates.push('password = ?'); values.push(password); }
      if (logo_uri !== undefined) { updates.push('logo_uri = ?'); values.push(logo_uri); }
      if (cover_uri !== undefined) { updates.push('cover_uri = ?'); values.push(cover_uri); }
      if (sector !== undefined) { updates.push('sector = ?'); values.push(sector); }
      
      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }
      
      values.push(id);
      
      await pool.execute(
        `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return res.json({ success: true, message: 'Department updated' });
    }

    // DELETE - Remove department
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ success: false, message: 'Department ID is required' });
      }

      await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Department deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Departments API error:', error);
    return res.status(500).json({ success: false, message: error.message, code: error.code });
  }
};
