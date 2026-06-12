const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ofertaRoutes = require('./routes/ofertaRoutes');
const datosRoutes = require('./routes/datosRoutes');
const inscripcionRoutes = require('./routes/inscripcionRoutes');
const coordinadorRoutes = require('./routes/coordinadorRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');

const ofertasFuncionarioRoutes = require('./routes/ofertasFuncionarioRoutes');
const cedulaRoutes = require('./routes/CedulaRoute');


const app = express();

// Configuración CORS mejorada - SIN usar '*' problemático
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Middleware manual para OPTIONS (reemplaza app.options('*', cors()))
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/ofertas', ofertaRoutes);
app.use('/api', datosRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/coordinadores', coordinadorRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/solicitudes', solicitudRoutes);

app.use('/api/ofertas-funcionario', ofertasFuncionarioRoutes);
app.use('/api/cedula', cedulaRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API Gestionytics funcionando 🚀' });
});

// Manejo de errores 404 (correcto, sin '*')
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

module.exports = app;