const express = require('express');
const router = express.Router();
const db = require('../api/db');
const { authenticateToken, isAdmin } = require('./auth');

// Obtener todas las especialidades
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM especialidades WHERE estado = "activo"');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear especialidad (solo admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { nombre, descripcion, imagen } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO especialidades (nombre, descripcion, imagen) VALUES (?, ?, ?)',
      [nombre, descripcion, imagen]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar especialidad (solo admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, imagen, estado } = req.body;

  try {
    await db.query(
      'UPDATE especialidades SET nombre = ?, descripcion = ?, imagen = ?, estado = ? WHERE id = ?',
      [nombre, descripcion, imagen, estado, id]
    );
    res.json({ message: 'Especialidad actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar especialidad (solo admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('UPDATE especialidades SET estado = "inactivo" WHERE id = ?', [id]);
    res.json({ message: 'Especialidad desactivada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;