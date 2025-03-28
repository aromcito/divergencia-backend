require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ¡Esta línea faltaba!
const path = require('path');

// Crear aplicación Express
const app = express();

// Configuración de middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'neurodivergencia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión a la base de datos
db.getConnection()
  .then(() => {
    console.log('✅ Conectado a la base de datos MySQL');
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err);
  });

// Importar routers
const { router: authRouter, authenticateToken } = require('./api/auth');
const especialidadesRouter = require('./api/especialidades');
const blogsRouter = require('./api/blogs');

// Configurar rutas API
app.use('/api/auth', authRouter);
app.use('/api/especialidades', especialidadesRouter);
app.use('/api/blogs', blogsRouter);

// Ruta de registro
app.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;
  const ROLES_PERMITIDOS = ['paciente', 'especialista'];

  // Validaciones
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Formato de correo inválido' });
  }

  if (rol && !ROLES_PERMITIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol no permitido' });
  }

  try {
    // Verificar usuario existente
    const [existingUser] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const rolFinal = rol || 'paciente';

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hashedPassword, rolFinal]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { nombre, email, rol: rolFinal }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta de login (corregida)
app.post('/login', async (req, res) => {
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Ruta protegida de ejemplo
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Bienvenido al dashboard',
    user: req.user 
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});