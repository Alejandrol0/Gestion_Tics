// llenar-tablas.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import './models/index.js';

dotenv.config();

const llenarTablas = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        // 1. 📋 TIPOS DE DOCUMENTO
        const TipoDoc = mongoose.model('TipoDoc');
        await TipoDoc.deleteMany({});
        const tiposDoc = await TipoDoc.create([
            { nombre: 'Cédula de Ciudadanía', abreviatura: 'CC', descripcion: 'Documento de identidad colombiano' },
            { nombre: 'Tarjeta de Identidad', abreviatura: 'TI', descripcion: 'Para menores de edad' },
            { nombre: 'Cédula de Extranjería', abreviatura: 'CE', descripcion: 'Para extranjeros residentes' },
            { nombre: 'Pasaporte', abreviatura: 'PA', descripcion: 'Pasaporte' },
            { nombre: 'Registro Civil', abreviatura: 'RC', descripcion: 'Registro civil de nacimiento' }
        ]);
        console.log(`✅ Tipos de documento: ${tiposDoc.length}`);

        // 2. 🏙️ MUNICIPIOS
        const Municipio = mongoose.model('Municipio');
        await Municipio.deleteMany({});
        const municipios = await Municipio.create([
            { nombre: 'Bogotá', departamento: 'Cundinamarca', codigo_dane: '11001', region: 'Andina' },
            { nombre: 'Medellín', departamento: 'Antioquia', codigo_dane: '05001', region: 'Andina' },
            { nombre: 'Cali', departamento: 'Valle del Cauca', codigo_dane: '76001', region: 'Pacífica' },
            { nombre: 'Barranquilla', departamento: 'Atlántico', codigo_dane: '08001', region: 'Caribe' },
            { nombre: 'Cartagena', departamento: 'Bolívar', codigo_dane: '13001', region: 'Caribe' },
            { nombre: 'Bucaramanga', departamento: 'Santander', codigo_dane: '68001', region: 'Andina' },
            { nombre: 'Pereira', departamento: 'Risaralda', codigo_dane: '66001', region: 'Andina' },
            { nombre: 'Manizales', departamento: 'Caldas', codigo_dane: '17001', region: 'Andina' },
            { nombre: 'Cúcuta', departamento: 'Norte de Santander', codigo_dane: '54001', region: 'Andina' },
            { nombre: 'Santa Marta', departamento: 'Magdalena', codigo_dane: '47001', region: 'Caribe' }
        ]);
        console.log(`✅ Municipios: ${municipios.length}`);

        // 3. 📚 PROGRAMAS DE FORMACIÓN
        const ProgramaFormacion = mongoose.model('ProgramaFormacion');
        await ProgramaFormacion.deleteMany({});
        const programas = await ProgramaFormacion.create([
            { 
                nombre: 'Análisis y Desarrollo de Software', 
                codigo: 'ADSO-2025',
                descripcion: 'Programa para formar desarrolladores de software full stack',
                duracion_horas: 2400,
                version: '1.0'
            },
            { 
                nombre: 'Desarrollo Web', 
                codigo: 'DWEB-2025',
                descripcion: 'Especialización en desarrollo web frontend y backend',
                duracion_horas: 1200,
                version: '2.0'
            },
            { 
                nombre: 'Programación de Software', 
                codigo: 'PROG-2025',
                descripcion: 'Fundamentos de programación y lógica',
                duracion_horas: 800,
                version: '1.5'
            },
            { 
                nombre: 'Bases de Datos', 
                codigo: 'BD-2025',
                descripcion: 'Diseño y administración de bases de datos',
                duracion_horas: 600,
                version: '1.0'
            }
        ]);
        console.log(`✅ Programas de formación: ${programas.length}`);

        // 4. 🎯 MODALIDADES
        const Modalidad = mongoose.model('Modalidad');
        await Modalidad.deleteMany({});
        const modalidades = await Modalidad.create([
            { nombre: 'Presencial', descripcion: 'Clases en instalaciones del SENA' },
            { nombre: 'Virtual', descripcion: 'Formación a través de plataforma virtual' },
            { nombre: 'Mixta', descripcion: 'Combinación de presencial y virtual' },
            { nombre: 'Distancia', descripcion: 'Formación con material autónomo' }
        ]);
        console.log(`✅ Modalidades: ${modalidades.length}`);

        // 5. 🏷️ TIPOS DE PROGRAMA
        const TipoPrograma = mongoose.model('TipoPrograma');
        await TipoPrograma.deleteMany({});
        const tiposPrograma = await TipoPrograma.create([
            { nombre: 'Técnico', nivel: 'Profesional', descripcion: 'Programa técnico laboral' },
            { nombre: 'Tecnólogo', nivel: 'Profesional', descripcion: 'Programa tecnológico' },
            { nombre: 'Complementario', nivel: 'Complementario', descripcion: 'Curso complementario' },
            { nombre: 'Especialización', nivel: 'Postgrado', descripcion: 'Especialización tecnológica' }
        ]);
        console.log(`✅ Tipos de programa: ${tiposPrograma.length}`);

        // 6. 🎫 TIPOS DE OFERTA
        const TipoOferta = mongoose.model('TipoOferta');
        await TipoOferta.deleteMany({});
        const tiposOferta = await TipoOferta.create([
            { nombre: 'Pública', descripcion: 'Abierta al público general' },
            { nombre: 'Cerrada', descripcion: 'Solo para grupos específicos' },
            { nombre: 'Empresarial', descripcion: 'Para empresas en convenio' },
            { nombre: 'Intersectorial', descripcion: 'Entre varios sectores' }
        ]);
        console.log(`✅ Tipos de oferta: ${tiposOferta.length}`);

        // 7. 🌟 PROGRAMAS ESPECIALES
        const ProgramaEspecial = mongoose.model('ProgramaEspecial');
        await ProgramaEspecial.deleteMany({});
        const programasEspeciales = await ProgramaEspecial.create([
            {
                nombre: 'Mujeres TIC',
                descripcion: 'Programa especial para mujeres en tecnología',
                empresa: {
                    nombre: 'MinTIC',
                    nit: '899999001-1',
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
                    nit: '899999002-2',
                    convenio: 'CONV-MINAGRI-2025-001'
                },
                fecha_inicio: new Date('2025-02-01'),
                fecha_fin: new Date('2025-11-30')
            },
            {
                nombre: 'Víctimas del Conflicto',
                descripcion: 'Programa especial para víctimas',
                empresa: {
                    nombre: 'Unidad de Víctimas',
                    nit: '899999003-3',
                    convenio: 'CONV-UV-2025-001'
                }
            }
        ]);
        console.log(`✅ Programas especiales: ${programasEspeciales.length}`);

        // 8. 👥 USUARIOS (con contraseña hasheada)
        const Usuario = mongoose.model('Usuario');
        await Usuario.deleteMany({});
        
        // Hashear contraseñas
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);
        
        const usuarios = await Usuario.create([
            { 
                nombre: 'Juan Instructor', 
                email: 'instructor@test.com', 
                password: passwordHash,
                role: 'instructor'
            },
            { 
                nombre: 'María Coordinadora', 
                email: 'coordinador@test.com', 
                password: passwordHash,
                role: 'coordinador'
            },
            { 
                nombre: 'Pedro Aprendiz', 
                email: 'aprendiz@test.com', 
                password: passwordHash,
                role: 'aprendiz'
            },
            { 
                nombre: 'Carlos Funcionario', 
                email: 'funcionario@test.com', 
                password: passwordHash,
                role: 'funcionario'
            },
            { 
                nombre: 'Ana Instructora', 
                email: 'ana.instructora@test.com', 
                password: passwordHash,
                role: 'instructor'
            },
            { 
                nombre: 'Luis Coordinador', 
                email: 'luis.coordinador@test.com', 
                password: passwordHash,
                role: 'coordinador'
            }
        ]);
        console.log(`✅ Usuarios: ${usuarios.length}`);

        // 9. 👨‍🏫 COORDINADORES (basado en usuarios)
        const Coordinador = mongoose.model('Coordinador');
        await Coordinador.deleteMany({});
        
        const coordinadorUser = await Usuario.findOne({ role: 'coordinador', email: 'coordinador@test.com' });
        const coordinadorUser2 = await Usuario.findOne({ role: 'coordinador', email: 'luis.coordinador@test.com' });
        
        const coordinadores = await Coordinador.create([
            {
                usuario: coordinadorUser._id,
                centro_formacion: 'Centro de Tecnologías Digitales',
                regional: 'Distrito Capital',
                areas_asignadas: ['Desarrollo de Software', 'Bases de Datos', 'Programación Web'],
                activo: true
            },
            {
                usuario: coordinadorUser2._id,
                centro_formacion: 'Centro de Innovación Tecnológica',
                regional: 'Antioquia',
                areas_asignadas: ['Redes', 'Seguridad Informática'],
                activo: true
            }
        ]);
        console.log(`✅ Coordinadores: ${coordinadores.length}`);

        // 10. 📊 CURSOS (ejemplos)
        const Curso = mongoose.model('Curso');
        await Curso.deleteMany({});
        
        const instructorUser = await Usuario.findOne({ role: 'instructor', email: 'instructor@test.com' });
        const programa1 = programas[0];
        const modalidad1 = modalidades[0];
        const tipoPrograma1 = tiposPrograma[0];
        const tipoOferta1 = tiposOferta[0];
        const municipio1 = municipios[0];
        
        const cursos = await Curso.create([
            {
                programa_formacion: programa1._id,
                modalidad: modalidad1._id,
                tipo_programa: tipoPrograma1._id,
                tipo_oferta: tipoOferta1._id,
                cupo_maximo: 25,
                cupos_disponibles: 25,
                ambiente: {
                    nombre: 'Laboratorio 101',
                    tipo: 'Laboratorio',
                    capacidad: 25,
                    recursos: ['Computadores', 'Proyector', 'Pizarrón']
                },
                fechas: {
                    inicio_inscripciones: new Date('2025-03-01'),
                    fin_inscripciones: new Date('2025-03-15'),
                    inicio_curso: new Date('2025-04-01'),
                    fin_curso: new Date('2025-06-30')
                },
                ubicacion: {
                    direccion: 'Calle 123 #45-67',
                    ciudad: 'Bogotá',
                    municipio: municipio1._id,
                    sala: 'Sala 301'
                },
                empresa_solicitante: {
                    nombre: 'Empresa ABC',
                    nit: '123456789-0',
                    contacto: 'Juan Pérez',
                    email: 'juan@empresa.com',
                    telefono: '3001234567'
                },
                subsector_economico: {
                    nombre: 'Tecnología',
                    codigo: 'TEC-001'
                },
                horario: {
                    dias: ['Lunes', 'Miércoles', 'Viernes'],
                    hora_inicio: '18:00',
                    hora_fin: '21:00',
                    jornada: 'noche'
                },
                coordinador_asignado: coordinadorUser._id,
                creado_por: instructorUser._id,
                estado: 'activa'
            }
        ]);
        console.log(`✅ Cursos: ${cursos.length}`);

        // 11. 📋 RESUMEN
        console.log('\n=== 📊 RESUMEN DE DATOS CARGADOS ===');
        console.log(`📋 Tipos de documento: ${tiposDoc.length}`);
        console.log(`🏙️ Municipios: ${municipios.length}`);
        console.log(`📚 Programas de formación: ${programas.length}`);
        console.log(`🎯 Modalidades: ${modalidades.length}`);
        console.log(`🏷️ Tipos de programa: ${tiposPrograma.length}`);
        console.log(`🎫 Tipos de oferta: ${tiposOferta.length}`);
        console.log(`🌟 Programas especiales: ${programasEspeciales.length}`);
        console.log(`👥 Usuarios: ${usuarios.length}`);
        console.log(`👨‍🏫 Coordinadores: ${coordinadores.length}`);
        console.log(`📊 Cursos: ${cursos.length}`);
        console.log('=====================================\n');

        console.log('🔑 CREDENCIALES DE ACCESO:');
        console.log('Instructor: instructor@test.com / password123');
        console.log('Coordinador: coordinador@test.com / password123');
        console.log('Aprendiz: aprendiz@test.com / password123');
        console.log('Funcionario: funcionario@test.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

llenarTablas();