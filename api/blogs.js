const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken } = require('./auth'); // Importar el middleware de autenticación

// Crear un blog
router.post('/blogs', (req, res) => {
  const { titulo, contenido, usuario_id, imagen } = req.body;
  const query = 'INSERT INTO blogs (titulo, contenido, usuario_id, imagen) VALUES (?, ?, ?, ?)';
  db.query(query, [titulo, contenido, usuario_id, imagen], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId });
  });
});

// Obtener todos los blogs (solo aprobados para usuarios básicos)
router.get('/blogs', authenticateToken, (req, res) => {
  const { rol } = req.user; // Ahora req.user está definido
  const query = rol === 'admin' ? 'SELECT * FROM blogs' : 'SELECT * FROM blogs WHERE estado = "aprobado"';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Aprobar un blog (solo admin)
router.put('/blogs/:id/aprobar', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE blogs SET estado = "aprobado" WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Blog aprobado' });
  });
});

// Eliminar un blog (solo admin)
router.delete('/blogs/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM blogs WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Blog eliminado' });
  });
});

// Exportar el router
module.exports = router;