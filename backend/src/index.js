import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import './models/index.js';
import empresaRoutes from './routes/empresaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import ofertaRoutes from './routes/ofertaRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos (PDFs subidos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ofertas', ofertaRoutes);
app.use('/api/empresas', empresaRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));