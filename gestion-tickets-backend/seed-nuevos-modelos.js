// seed-nuevos-modelos.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Municipio from './models/Municipio.js';
import TipoDoc from './models/TipoDoc.js';
import ProgramaEspecial from './models/ProgramaEspecial.js';
import Usuario from './models/Usuario.js';
import Coordinador from './models/Coordinador.js';

dotenv.config();

const seedNuevosModelos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // 1. TIPOS DE DOCUMENTO
        await TipoDoc.deleteMany({});
        const tiposDoc = await TipoDoc.create([
            { nombre: 'Cédula de Ciudadanía', abreviatura: 'CC', descripcion: 'Documento de identidad colombiano' },
            { nombre: 'Tarjeta de Identidad', abreviatura: 'TI', descripcion: 'Para menores de edad' },
            { nombre: 'Cédula de Extranjería', abreviatura: 'CE', descripcion: 'Para extranjeros residentes' },
            { nombre: 'Pasaporte', abreviatura: 'PA', descripcion: 'Pasaporte' },
            { nombre: 'Registro Civil', abreviatura: 'RC', descripcion: 'Registro civil de nacimiento' }
        ]);
        console.log(`✅ ${tiposDoc.length} tipos de documento creados`);

        // 2. MUNICIPIOS
        await Municipio.deleteMany({});
        const municipios = await Municipio.create([
            { nombre: 'Bogotá', departamento: 'Cundinamarca', codigo_dane: '11001', region: 'Andina' },
            { nombre: 'Medellín', departamento: 'Antioquia', codigo_dane: '05001', region: 'Andina' },
            { nombre: 'Cali', departamento: 'Valle del Cauca', codigo_dane: '76001', region: 'Pacífica' },
            { nombre: 'Barranquilla', departamento: 'Atlántico', codigo_dane: '08001', region: 'Caribe' },
            { nombre: 'Cartagena', departamento: 'Bolívar', codigo_dane: '13001', region: 'Caribe' },
            { nombre: 'Bucaramanga', departamento: 'Santander', codigo_dane: '68001', region: 'Andina' },
            { nombre: 'Pereira', departamento: 'Risaralda', codigo_dane: '66001', region: 'Andina' }
        ]);
        console.log(`✅ ${municipios.length} municipios creados`);

        // 3. PROGRAMAS ESPECIALES
        await ProgramaEspecial.deleteMany({});
        const programasEspeciales = await ProgramaEspecial.create([
            {
                nombre: 'Mujeres TIC',
                descripcion: 'Programa especial para mujeres en tecnología',
                empresa: {
                    nombre: 'MinTIC',
                    nit: '899999001',
                    convenio: 'CONV-MINTIC-2025-001'
                },
                fecha_inicio: new Date('2025-01-01'),
                fecha_fin: new Date('2025-12-31')
            },
            {
                nombre: 'Jóvenes Rurales',
                descripcion: 'Formación para jóvenes de zonas rurales',
                empresa: {
                    nombre: 'Ministerio de Agricultura',
                    nit: '899999002',
                    convenio: 'CONV-MINAGRI-2025-001'
                }
            },
            {
                nombre: 'Víctimas del Conflicto',
                descripcion: 'Programa especial para víctimas',
                empresa: {
                    nombre: 'Unidad de Víctimas',
                    nit: '899999003',
                    convenio: 'CONV-UV-2025-001'
                }
            }
        ]);
        console.log(`✅ ${programasEspeciales.length} programas especiales creados`);

        // 4. COORDINADORES (basado en usuarios existentes)
        const coordinadorUser = await Usuario.findOne({ role: 'coordinador' });
        if (coordinadorUser) {
            await Coordinador.deleteMany({});
            const coordinador = await Coordinador.create({
                usuario: coordinadorUser._id,
                centro_formacion: 'Centro de Tecnologías Digitales',
                regional: 'Distrito Capital',
                areas_asignadas: ['Desarrollo de Software', 'Bases de Datos'],
                activo: true
            });
            console.log(`✅ Coordinador creado: ${coordinadorUser.nombre}`);
        }

        console.log('\n=== DATOS CARGADOS EXITOSAMENTE ===');
        console.log(`Tipos Documento: ${tiposDoc.length}`);
        console.log(`Municipios: ${municipios.length}`);
        console.log(`Programas Especiales: ${programasEspeciales.length}`);
        console.log('=====================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedNuevosModelos();