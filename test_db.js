const pool = require('./db');

module.exports = async (req, res) => {
  try {
    const [rows] = await pool.execute("SHOW TABLES");
    res.json({
      success: true,
      connected: true,
      tables: rows.map(r => Object.values(r)[0]),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      tip: "Check Aiven DB credentials in api/db.js"
    });
  }
};
