import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import cursoRoutes from './routes/cursoRoutes.js';
import coordinadorRoutes from './routes/coordinadorRoutes.js'; // 👈 NUEVA

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/coordinadores', coordinadorRoutes); // 👈 NUEVA

app.get('/', (req, res) => {
    res.send('API de Gestión de Cursos funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});