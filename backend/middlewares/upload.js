const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta uploads existe
const uploadDir = path.join(__dirname, '../uploads/documentos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrar archivos según el campo
const fileFilter = (req, file, cb) => {
  // Para firma digital: permitir imágenes (PNG, JPG, JPEG) y también PDF
  if (file.fieldname === 'firma_digital_pdf') {
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf' // por si también se permite PDF
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('La firma digital debe ser una imagen (PNG, JPG) o PDF'), false);
    }
  }
  // Para carta: solo PDF
  else if (file.fieldname === 'carta_pdf') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('La carta debe ser un archivo PDF'), false);
    }
  }
  // Para otros campos (Excel, etc.) permitir PDF, Excel
  else {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o Excel'), false);
    }
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Exportar directamente el objeto upload
module.exports = upload;