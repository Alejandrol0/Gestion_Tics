# crear-modelos-faltantes.ps1
Write-Host "=== CREANDO MODELOS FALTANTES ===" -ForegroundColor Cyan

$modelosFaltantes = @(
    @{
        nombre = "Municipio.js"
        contenido = @"
import mongoose from 'mongoose';

const municipioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    departamento: { type: String, required: true },
    codigo_dane: { type: String, unique: true },
    region: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Municipio', municipioSchema);
"@
    },
    @{
        nombre = "ProgramaEspecial.js"
        contenido = @"
import mongoose from 'mongoose';

const programaEspecialSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    empresa: {
        nombre: String,
        nit: String,
        convenio: String
    },
    fecha_inicio: Date,
    fecha_fin: Date,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ProgramaEspecial', programaEspecialSchema);
"@
    },
    @{
        nombre = "Caracterizacion.js"
        contenido = @"
import mongoose from 'mongoose';

const caracterizacionSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    tipo_documento: { type: mongoose.Schema.Types.ObjectId, ref: 'TipoDoc' },
    numero_documento: { type: String, unique: true, sparse: true },
    fecha_nacimiento: Date,
    genero: { type: String, enum: ['Masculino', 'Femenino', 'Otro', 'No especifica'] },
    telefono: String,
    direccion: String,
    municipio: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipio' },
    nivel_educativo: { type: String, enum: ['Primaria', 'Secundaria', 'Técnico', 'Tecnólogo', 'Profesional', 'Postgrado'] },
    ocupacion: String,
    empresa_donde_labora: String,
    estrato: { type: Number, min: 1, max: 6 },
    discapacidad: String,
    poblacion_vulnerable: String,
    sisben: String
}, { timestamps: true });

export default mongoose.model('Caracterizacion', caracterizacionSchema);
"@
    },
    @{
        nombre = "Inscripcion.js"
        contenido = @"
import mongoose from 'mongoose';

const inscripcionSchema = new mongoose.Schema({
    curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
    aprendiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha_inscripcion: { type: Date, default: Date.now },
    estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'rechazada'], default: 'pendiente' },
    caracterizacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Caracterizacion' },
    asistencia: [{
        fecha: Date,
        presente: Boolean,
        justificacion: String
    }],
    calificacion: { type: Number, min: 0, max: 100 },
    certificado_generado: { type: Boolean, default: false },
    link_inscripcion: String,
    observaciones: String
}, { timestamps: true });

inscripcionSchema.index({ curso: 1, aprendiz: 1 }, { unique: true });

export default mongoose.model('Inscripcion', inscripcionSchema);
"@
    },
    @{
        nombre = "Coordinador.js"
        contenido = @"
import mongoose from 'mongoose';

const coordinadorSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    centro_formacion: { type: String, required: true },
    regional: String,
    areas_asignadas: [{ type: String }],
    cursos_supervisados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }],
    activo: { type: Boolean, default: true },
    fecha_asignacion: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Coordinador', coordinadorSchema);
"@
    },
    @{
        nombre = "TipoDoc.js"
        contenido = @"
import mongoose from 'mongoose';

const tipoDocSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    abreviatura: { type: String, required: true, unique: true },
    descripcion: String,
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('TipoDoc', tipoDocSchema);
"@
    }
)

foreach ($modelo in $modelosFaltantes) {
    $ruta = "models/$($modelo.nombre)"
    $modelo.contenido | Out-File -FilePath $ruta -Encoding utf8 -Force
    Write-Host "✅ Creado: $($modelo.nombre)" -ForegroundColor Green
}

Write-Host "`n📁 Archivos en /models AHORA:" -ForegroundColor Cyan
Get-ChildItem -Path models -Name | Sort-Object | ForEach-Object { Write-Host "   - $_" }

Write-Host "`n✅ MODELOS CREADOS EXITOSAMENTE" -ForegroundColor Green