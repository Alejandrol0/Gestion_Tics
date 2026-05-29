import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

// Cargar variables de entorno lo antes posible
dotenv.config();

// Importar modelos para registrarlos en Mongoose
import './models/index.js';

import usuarioRoutes from './routes/usuarioRoutes.js';
import ofertaRoutes from './routes/ofertaRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ofertas', ofertaRoutes);

// Conexión DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));