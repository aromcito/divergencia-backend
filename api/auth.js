const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('./db');
const { logToFile } = require('./logger'); // <- asegúrate que la ruta sea correcta
require('dotenv').config();

// === Middleware de autenticación ===
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

// === Middleware para verificar admin ===
const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  next();
};

// === Endpoint protegido ===
router.get('/check', authenticateToken, async (req, res) => {
  logToFile(`🔒 Verificando token de usuario con ID ${req.user.id}`);
  try {
    const [user] = await db.query(
      'SELECT id, email, rol FROM usuarios WHERE id = ?', 
      [req.user.id]
    );

    if (!user) {
      logToFile('⚠️ Usuario no encontrado en /check');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    logToFile(`✅ Usuario autenticado: ${user.email} (${user.rol})`);
    res.json({
      isAuthenticated: true,
      role: user.rol,
      email: user.email
    });
  } catch (error) {
    logToFile(`💥 Error en /check: ${error.message}`);
    console.error('Error en /check:', error);
    res.status(500).json({ error: 'Error al verificar autenticación' });
  }
});


// Dentro de auth.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


module.exports = {
  authenticateToken,
  isAdmin,
  router
};
