// eliminar-indice-definitivo.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const eliminarIndice = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;
        
        // 1. Ver índices actuales
        console.log('\n📊 Índices actuales:');
        const indices = await db.collection('cursos').indexes();
        indices.forEach(idx => {
            console.log(`   - ${idx.name}:`, JSON.stringify(idx.key));
        });

        // 2. Eliminar el índice problemático si existe
        const indiceProblematico = indices.find(idx => idx.name === 'link_inscripciones_1');
        
        if (indiceProblematico) {
            console.log('\n🗑️ Eliminando índice link_inscripciones_1...');
            await db.collection('cursos').dropIndex('link_inscripciones_1');
            console.log('✅ Índice eliminado');
        } else {
            console.log('\n⚠️ El índice link_inscripciones_1 no existe');
        }

        // 3. Verificar que se eliminó
        console.log('\n📊 Índices después de la eliminación:');
        const indicesFinal = await db.collection('cursos').indexes();
        indicesFinal.forEach(idx => {
            console.log(`   - ${idx.name}:`, JSON.stringify(idx.key));
        });

        // 4. Opcional: Eliminar todos los cursos para empezar limpio
        const { deletedCount } = await db.collection('cursos').deleteMany({});
        console.log(`\n🗑️ ${deletedCount} cursos eliminados`);

        console.log('\n✅ Proceso completado. Ahora reinicia el servidor.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

eliminarIndice();