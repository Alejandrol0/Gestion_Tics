// obtener-ids.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './models/index.js';

dotenv.config();

const obtenerIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Programas de formación
        const ProgramaFormacion = mongoose.model('ProgramaFormacion');
        const programas = await ProgramaFormacion.find();
        console.log('📚 PROGRAMAS DE FORMACIÓN:');
        programas.forEach(p => {
            console.log(`   ID: ${p._id} - ${p.nombre}`);
        });

        // Modalidades
        const Modalidad = mongoose.model('Modalidad');
        const modalidades = await Modalidad.find();
        console.log('\n🎯 MODALIDADES:');
        modalidades.forEach(m => {
            console.log(`   ID: ${m._id} - ${m.nombre}`);
        });

        // Tipos de programa
        const TipoPrograma = mongoose.model('TipoPrograma');
        const tiposPrograma = await TipoPrograma.find();
        console.log('\n🏷️ TIPOS DE PROGRAMA:');
        tiposPrograma.forEach(t => {
            console.log(`   ID: ${t._id} - ${t.nombre}`);
        });

        // Tipos de oferta
        const TipoOferta = mongoose.model('TipoOferta');
        const tiposOferta = await TipoOferta.find();
        console.log('\n🎫 TIPOS DE OFERTA:');
        tiposOferta.forEach(t => {
            console.log(`   ID: ${t._id} - ${t.nombre}`);
        });

        // Programas especiales
        const ProgramaEspecial = mongoose.model('ProgramaEspecial');
        const programasEspeciales = await ProgramaEspecial.find();
        console.log('\n🌟 PROGRAMAS ESPECIALES:');
        programasEspeciales.forEach(pe => {
            console.log(`   ID: ${pe._id} - ${pe.nombre}`);
        });

        // Municipios
        const Municipio = mongoose.model('Municipio');
        const municipios = await Municipio.find();
        console.log('\n🏙️ MUNICIPIOS:');
        municipios.forEach(m => {
            console.log(`   ID: ${m._id} - ${m.nombre}, ${m.departamento}`);
        });

        // Coordinadores
        const Coordinador = mongoose.model('Coordinador');
        const coordinadores = await Coordinador.find().populate('usuario', 'nombre email');
        console.log('\n👨‍🏫 COORDINADORES:');
        coordinadores.forEach(c => {
            console.log(`   ID: ${c._id} - ${c.usuario?.nombre} (${c.centro_formacion})`);
        });

        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

obtenerIds();