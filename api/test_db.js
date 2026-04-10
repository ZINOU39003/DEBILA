const pool = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!pool) {
    return res.status(500).json({
      success: false,
      error: 'Database pool not initialized',
      tip: 'Check database configuration'
    });
  }

  try {
    // Get list of tables
    const [tables] = await pool.execute("SHOW TABLES");
    const tableNames = tables.map(r => Object.values(r)[0]);

    // Check users table
    let usersCount = 0;
    let departmentsCount = 0;

    if (tableNames.includes('users')) {
      const [usersResult] = await pool.execute("SELECT COUNT(*) as count FROM users");
      usersCount = usersResult[0].count;
    }

    if (tableNames.includes('departments')) {
      const [deptsResult] = await pool.execute("SELECT COUNT(*) as count FROM departments");
      departmentsCount = deptsResult[0].count;
    }

    // Get database name
    const [dbResult] = await pool.execute("SELECT DATABASE() as db");
    const dbName = dbResult[0].db;

    res.json({
      success: true,
      connected: true,
      database: dbName,
      tables: tableNames,
      counts: {
        users: usersCount,
        departments: departmentsCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DB Test Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      tip: "Check Aiven DB credentials in api/db.js"
    });
  }
};
