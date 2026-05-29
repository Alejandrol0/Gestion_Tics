import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coordinador from '../models/Coordinador.js';
import Usuario from '../models/Usuario.js';

dotenv.config({ path: '../.env' });

const listarCoordinadores = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar todos los coordinadores con sus datos de usuario
        const coordinadores = await Coordinador.find()
            .populate('usuario', 'nombre email');

        if (coordinadores.length === 0) {
            console.log('❌ No hay coordinadores en la base de datos');
            console.log('Primero debes crear coordinadores (como hicimos antes con María)');
        } else {
            console.log('📋 LISTA DE COORDINADORES DISPONIBLES:');
            console.log('======================================');
            coordinadores.forEach((coord, index) => {
                console.log(`\n${index + 1}. ${coord.usuario?.nombre}`);
                console.log(`   ID: ${coord._id}`);
                console.log(`   Email: ${coord.usuario?.email}`);
                console.log(`   Centro: ${coord.centro_formacion}`);
                console.log(`   Áreas: ${coord.areas_asignadas?.join(', ')}`);
            });
            console.log('\n======================================');
        }

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

listarCoordinadores();