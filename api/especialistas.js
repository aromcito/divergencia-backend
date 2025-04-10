const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('./db');
const fs = require('fs');
const path = 'C:/xampp/htdocs/divergencia/src/assets/img/especialistas';

// Crear directorio si no existe
if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
}

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});

const upload = multer({ storage });

// **Obtener solo los especialistas**
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id AS usuario_id, u.nombre, u.apellido, u.email, u.telefono, 
             e.id AS especialista_id, e.titulo_profesional, e.descripcion, 
             e.experiencia, e.formacion, e.ubicacion, e.precio_consulta, e.precio_consulta_online, 
             e.precio_consulta_online, e.moneda, e.porcentaje_aprobacion, 
             e.total_valoraciones, e.verificado, e.estado, e.imagen_perfil
      FROM usuarios u
      LEFT JOIN especialistas e ON u.id = e.usuario_id
      WHERE u.rol = 'especialista'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno', error: err });
  }
});


// **Actualizar información del especialista**
router.post('/', upload.single('imagen_perfil'), async (req, res) => {
  const { usuario_id, titulo_profesional, descripcion, experiencia, formacion, ubicacion, precio_consulta, precio_consulta_online, moneda, disponibilidad, idiomas, verificado, estado } = req.body;
  try {
    const imagen_perfil = req.file ? req.file.filename : null;

    const [result] = await db.query(`
      INSERT INTO especialistas (usuario_id, titulo_profesional, descripcion, experiencia, formacion, ubicacion, precio_consulta, precio_consulta_online, moneda, disponibilidad, idiomas, verificado, estado, imagen_perfil, creado_en)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [usuario_id, titulo_profesional, descripcion, experiencia, formacion, ubicacion, precio_consulta, precio_consulta_online, moneda, disponibilidad, idiomas, verificado, estado, imagen_perfil]);

    res.json({ message: 'Especialista creado correctamente', id: result.insertId });

  } catch (err) {
    console.error('Error en la inserción:', err);
    res.status(500).json({ message: 'Error interno', error: err });
  }
});

// **Obtener lista de usuarios especialistas**
router.get('/usuarios-especialistas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, apellido, email FROM usuarios WHERE rol = "especialista"');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno', error: err });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.id AS id,
        u.id AS usuario_id,
        CONCAT(u.nombre, ' ', u.apellido) AS DoctorName,
        e.titulo_profesional AS Role,
        e.descripcion,
        e.experiencia,
        e.formacion,
        e.ubicacion AS Location,
        e.precio_consulta AS Price,
        e.moneda,
        e.porcentaje_aprobacion AS percentage,
        e.total_valoraciones AS Feedback,
        CONCAT('http://localhost:4000/img/especialistas/', e.imagen_perfil) AS DoctorImg,
        'Psicología' AS Speciality, -- Ajusta según relación real
        'speciality-01.png' AS SpecialityImg -- Imagen dummy, reemplaza si tienes relación real
      FROM usuarios u
      LEFT JOIN especialistas e ON u.id = e.usuario_id
      WHERE u.rol = 'especialista'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno', error: err });
  }
});


module.exports = router;
