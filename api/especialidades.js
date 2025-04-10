const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('./db');
const fs = require('fs');
const path = 'C:/xampp/htdocs/divergencia/src/assets/img/especialidades';

// Crear el directorio si no existe
if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
}

// Configurar multer correctamente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage: storage });

// Rutas
router.post('/', upload.single('imagen'), async (req, res) => {
  console.log("Imagen recibida:", req.file); // ✅ Verificar si multer captura la imagen
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ninguna imagen' });
  }

  const { nombre, descripcion, estado } = req.body;
  const imagen = `${req.file.filename}`; // ✅ Ruta correcta

  try {
    const [result] = await db.query(
      'INSERT INTO especialidades (nombre, descripcion, estado, imagen) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, estado, imagen]
    );
    res.status(201).json({ id: result.insertId, message: 'Especialidad creada', imagen });
  } catch (err) {
    res.status(500).json({ message: 'Error interno', error: err });
  }
});

// **RUTA PARA OBTENER ESPECIALIDADES**
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, descripcion, estado, CONCAT("http://localhost:4000", imagen) AS image FROM especialidades'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno', error: err });
  }
});

router.put('/:id', upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, estado } = req.body;
  const imagen = req.file ? `/img/especialidades/${req.file.filename}` : null;

  try {
    await db.query(
      'UPDATE especialidades SET nombre = ?, descripcion = ?, estado = ?, imagen = ? WHERE id = ?',
      [nombre, descripcion, estado, imagen, req.params.id]
    );
    res.json({ message: 'Especialidad actualizada' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno', error: err });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM especialidades WHERE id = ?', [req.params.id]);
    res.json({ message: 'Especialidad eliminada' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno', error: err });
  }
});

module.exports = router;
