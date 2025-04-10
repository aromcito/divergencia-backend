const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Promisificar funciones de filesystem
const mkdir = util.promisify(fs.mkdir);
const access = util.promisify(fs.access);
const appendFile = util.promisify(fs.appendFile);

// Configuración robusta de logs
const setupLoggingSystem = async () => {
  const logsDir = path.join(__dirname, '../logs');
  const logPath = path.join(logsDir, 'blogs-requests.log');

  try {
    // Verificar si existe el directorio
    await access(logsDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        // Crear directorio si no existe
        await mkdir(logsDir, { recursive: true });
        console.log(`📂 Directorio de logs creado: ${logsDir}`);
      } catch (mkdirErr) {
        console.error('❌ Error crítico creando directorio de logs:', mkdirErr);
        throw mkdirErr;
      }
    } else {
      throw err;
    }
  }

  // Verificar si podemos escribir en el archivo
  try {
    await appendFile(logPath, '');
    console.log(`📝 Sistema de logs inicializado en: ${logPath}`);
  } catch (err) {
    console.error('⚠️ Advertencia: No se pudo acceder al archivo de logs:', err);
    throw err;
  }
};

// Función mejorada de logging
const logAction = async (action, data = {}) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${action} - ${JSON.stringify(data)}\n`;
  const logPath = path.join(__dirname, '../logs/blogs-requests.log');

  try {
    // Intento principal de escritura
    await appendFile(logPath, logMessage);
    console.log('🔵 ' + logMessage.trim()); // Log en consola con formato
  } catch (err) {
    // Fallback 1: Intentar en directorio temporal
    const tempLogPath = path.join(require('os').tmpdir(), 'divergencia-blogs.log');
    try {
      await appendFile(tempLogPath, logMessage);
      console.error(`⚠️ Logs redirigidos a archivo temporal: ${tempLogPath}`);
      console.log('🟠 ' + logMessage.trim());
    } catch (tempErr) {
      // Fallback 2: Solo consola
      console.error('❌ Error crítico en sistema de logs:', err);
      console.log('🔴 ' + logMessage.trim());
    }
  }
};

// Inicializar el sistema de logs al arrancar
let loggingReady = false;
setupLoggingSystem()
  .then(() => {
    loggingReady = true;
    logAction('Sistema de logs inicializado correctamente');
  })
  .catch(err => {
    console.error('❌ Error inicializando sistema de logs:', err);
    loggingReady = false;
  });

// Middleware para verificar estado de logs
const checkLogging = (req, res, next) => {
  if (!loggingReady) {
    console.warn('⚠️ Sistema de logs no disponible para la petición:', req.method, req.path);
  }
  next();
};

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/blogs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Crear un blog con logs detallados
router.post('/', checkLogging, upload.single('imagen'), async (req, res) => {
  try {
    await logAction('POST /api/blogs recibido', {
      headers: req.headers,
      body: req.body,
      hasFile: !!req.file
    });

    // Validar campos requeridos
    const { titulo, contenido, estado, usuario_id } = req.body;
    const requiredFields = { titulo, contenido, usuario_id };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const errorMsg = `Faltan campos requeridos: ${missingFields.join(', ')}`;
      await logAction('Error de validación', { error: errorMsg, requestBody: req.body });
      return res.status(400).json({ 
        success: false,
        error: errorMsg,
        details: {
          received: {
            titulo: !!titulo,
            contenido: !!contenido,
            usuario_id: !!usuario_id
          }
        }
      });
    }

    // Procesar la imagen
    const imagen = req.file ? req.file.filename : null;
    await logAction('Datos a insertar', {
      titulo,
      contenido: contenido.length > 50 ? contenido.substring(0, 50) + '...' : contenido,
      estado: estado || 'activo',
      usuario_id,
      imagen
    });

    // Insertar en la base de datos
    const [result] = await db.query(
      'INSERT INTO blogs (titulo, contenido, imagen, estado, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [titulo, contenido, imagen, estado || 'activo', usuario_id]
    );

    if (!result.insertId) {
      await logAction('Inserción fallida - sin insertId', { result });
      return res.status(500).json({ 
        success: false,
        error: 'No se pudo crear el blog - sin ID retornado'
      });
    }

    await logAction('Blog creado exitosamente', { insertId: result.insertId });
    
    return res.status(201).json({ 
      success: true,
      id: result.insertId,
      message: 'Blog creado exitosamente'
    });

  } catch (err) {
    await logAction('Error en POST /api/blogs', { 
      error: err.message,
      stack: err.stack,
      body: req.body
    });

    const statusCode = err.code === 'ER_NO_SUCH_TABLE' ? 500 : 400;
    
    return res.status(statusCode).json({
      success: false,
      error: 'Error al crear el blog',
      details: {
        message: err.message,
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }
});

// Obtener todos los blogs (públicos)
router.get('/', checkLogging, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT b.*, u.nombre as autor 
      FROM blogs b 
      JOIN usuarios u ON b.usuario_id = u.id 
      WHERE b.estado = 'activo' 
      ORDER BY b.fecha_publicacion DESC
    `);
    
    await logAction('GET /api/blogs exitoso', { count: results.length });
    res.json(results);
  } catch (err) {
    await logAction('Error en GET /api/blogs', { error: err.message });
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener blogs',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Obtener un blog específico
router.get('/:id', checkLogging, async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query(`
      SELECT b.*, u.nombre as autor 
      FROM blogs b 
      JOIN usuarios u ON b.usuario_id = u.id 
      WHERE b.id = ?
    `, [id]);
    
    if (results.length === 0) {
      await logAction('Blog no encontrado', { blogId: id });
      return res.status(404).json({ 
        success: false,
        error: 'Blog no encontrado'
      });
    }

    await logAction('GET /api/blogs/' + id + ' exitoso');
    res.json(results[0]);
  } catch (err) {
    await logAction('Error en GET /api/blogs/' + req.params.id, { error: err.message });
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener el blog',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Actualizar un blog
router.put('/:id', checkLogging, upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, estado } = req.body;
    const imagen = req.file ? req.file.filename : req.body.imagen;

    await logAction('PUT /api/blogs/' + id + ' recibido', {
      body: req.body,
      hasFile: !!req.file
    });

    // Obtener blog actual
    const [blogResults] = await db.query(
      'SELECT usuario_id, imagen FROM blogs WHERE id = ?', 
      [id]
    );
    
    if (blogResults.length === 0) {
      await logAction('Blog no encontrado para actualizar', { blogId: id });
      return res.status(404).json({ 
        success: false,
        error: 'Blog no encontrado'
      });
    }

    const blog = blogResults[0];
    
    // Eliminar imagen anterior si existe
    if (req.file && blog.imagen) {
      const imagePath = path.join(__dirname, '../uploads/blogs', blog.imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        await logAction('Imagen anterior eliminada', { image: blog.imagen });
      }
    }
    
    // Actualizar blog
    await db.query(
      'UPDATE blogs SET titulo = ?, contenido = ?, imagen = ?, estado = ? WHERE id = ?',
      [titulo, contenido, imagen, estado, id]
    );
    
    await logAction('Blog actualizado exitosamente', { blogId: id });
    res.json({ 
      success: true,
      message: 'Blog actualizado correctamente'
    });
  } catch (err) {
    await logAction('Error en PUT /api/blogs/' + req.params.id, { 
      error: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar el blog',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Eliminar un blog
router.delete('/:id', checkLogging, async (req, res) => {
  try {
    const { id } = req.params;

    await logAction('DELETE /api/blogs/' + id + ' recibido');

    // Obtener blog
    const [blogResults] = await db.query(
      'SELECT imagen FROM blogs WHERE id = ?', 
      [id]
    );
    
    if (blogResults.length === 0) {
      await logAction('Blog no encontrado para eliminar', { blogId: id });
      return res.status(404).json({ 
        success: false,
        error: 'Blog no encontrado'
      });
    }

    const blog = blogResults[0];
    
    // Eliminar imagen asociada si existe
    if (blog.imagen) {
      const imagePath = path.join(__dirname, '../uploads/blogs', blog.imagen);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        await logAction('Imagen de blog eliminada', { image: blog.imagen });
      }
    }
    
    // Eliminar blog
    await db.query('DELETE FROM blogs WHERE id = ?', [id]);
    
    await logAction('Blog eliminado exitosamente', { blogId: id });
    res.json({ 
      success: true,
      message: 'Blog eliminado correctamente'
    });
  } catch (err) {
    await logAction('Error en DELETE /api/blogs/' + req.params.id, { 
      error: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar el blog',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;