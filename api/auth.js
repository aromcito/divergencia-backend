const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../api/db');
require('dotenv').config();

// Middleware de autenticación
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

// Middleware para verificar admin
const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  next();
};

// Endpoint para verificar autenticación
router.get('/check', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.query(
      'SELECT id, email, rol FROM usuarios WHERE id = ?', 
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      isAuthenticated: true,
      role: user.rol,
      email: user.email
    });
  } catch (error) {
    console.error('Error en /check:', error);
    res.status(500).json({ error: 'Error al verificar autenticación' });
  }
});

module.exports = {
  router,
  authenticateToken,
  isAdmin
};