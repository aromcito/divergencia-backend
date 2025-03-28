// db.js
const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'neurodivergencia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Exportar la conexión
module.exports = pool;