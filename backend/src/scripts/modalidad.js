import mongoose from "mongoose";

// Definimos el esquema localmente para asegurar una migración limpia
const modalidadSchema = new mongoose.Schema({
    id_modalidad: Number,
    nombre: String
});

// Usamos el modelo existente o lo creamos
const Modalidad = mongoose.models.Modalidad || mongoose.model("Modalidad", modalidadSchema);

const migrarModalidades = async () => {
  try {
    console.log("⏳ Conectando a MongoDB...");
    // Conexión a tu base de datos gestion_cursos
    await mongoose.connect("mongodb://127.0.0.1:27017/gestion_cursos");

    const datos = [
      { id_modalidad: 1, nombre: "PRESENCIAL" },
      { id_modalidad: 2, nombre: "VIRTUAL" },
      { id_modalidad: 3, nombre: "A DISTANCIA" },
      { id_modalidad: 4, nombre: "COMBINADA (HÍBRIDA)" }
    ];

    console.log("🚀 Insertando modalidades...");
    
    // Opcional: Limpia la colección antes de insertar para evitar duplicados
    await Modalidad.deleteMany({}); 
    
    await Modalidad.insertMany(datos);

    console.log("✅ ¡Modalidades migradas correctamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en la migración de modalidades:", error);
    process.exit(1);
  }
};

migrarModalidades();