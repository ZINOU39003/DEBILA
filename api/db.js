const mysql = require('mysql2/promise');

// Aiven MySQL Credentials (from previous turn)
const pool = mysql.createPool({
  host: "mysql-159b2565-zinou.i.aivencloud.com",
  port: 27815,
  user: "avnadmin",
  password: "AVNS_I5yYt0o7M0oY7g6fWw8",
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: false // Required for Aiven SSL
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
