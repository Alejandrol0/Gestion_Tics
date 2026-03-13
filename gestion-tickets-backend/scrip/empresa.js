import mongoose from "mongoose";

// OPCIÓN A: Si quieres usar tu modelo externo, asegúrate de que el nombre sea EXACTO (mayúsculas/minúsculas)
// import Empresa from "../models/empresa.js"; 

// OPCIÓN B: Definir el esquema aquí mismo para evitar errores de importación durante la migración
const empresaSchema = new mongoose.Schema({
    Id_Empresa: Number,
    RazonSocial: String,
    Nit: String
});

// Si el modelo ya existe lo usa, si no, lo crea
const Empresa = mongoose.models.Empresa || mongoose.model("Empresa", empresaSchema);

const migrarEmpresas = async () => {
  try {
    console.log("⏳ Conectando a MongoDB...");
    await mongoose.connect("mongodb://127.0.0.1:27017/gestion_cursos");

    const datos = [
      { Id_Empresa: 1, RazonSocial: "IMPORTACIONES GOMEZ SUAREZ LTDA", Nit: "8000192059" },
      { Id_Empresa: 2, RazonSocial: "COMPAÑIA COMERCIAL DEL RISARALDA LTDA", Nit: "8001392331" },
      { Id_Empresa: 3, RazonSocial: "ACTIVIDADES TURISTICAS RECREACIONALES Y SOCIALES LTDA", Nit: "8002017564" },
      // ... agrega los que necesites
    ];

    console.log("🚀 Insertando datos...");
    await Empresa.insertMany(datos);

    console.log("✅ ¡Migración exitosa!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

migrarEmpresas();