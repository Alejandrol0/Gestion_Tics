const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Función para buscar un archivo recursivamente en una carpeta
function buscarArchivo(nombreArchivo, directorio) {
  const archivos = fs.readdirSync(directorio);
  for (const archivo of archivos) {
    const rutaCompleta = path.join(directorio, archivo);
    const stats = fs.statSync(rutaCompleta);
    if (stats.isDirectory()) {
      const encontrado = buscarArchivo(nombreArchivo, rutaCompleta);
      if (encontrado) return encontrado;
    } else if (archivo === nombreArchivo) {
      return rutaCompleta;
    }
  }
  return null;
}

const fusionarPDFs = async (archivosPDF, ofertaId) => {
  try {
    console.log('🔍 ===== INICIANDO FUSIÓN DE PDFs =====');
    console.log('📊 Total de archivos a fusionar:', archivosPDF.length);
    
    const pdfFusionado = await PDFDocument.create();
    let pdfsProcesados = 0;
    let pdfsFallidos = [];
    
    // Directorio base donde buscar (carpeta uploads)
    const baseDir = path.join(__dirname, '../uploads');
    
    for (const archivo of archivosPDF) {
      let rutaArchivo = archivo.path;
      
      // Verificar si el archivo existe directamente
      if (!fs.existsSync(rutaArchivo)) {
        // Intentar buscar por nombre en toda la carpeta uploads
        const nombreArchivo = path.basename(rutaArchivo);
        console.log(`🔍 Buscando archivo ${nombreArchivo} en ${baseDir}...`);
        const rutaEncontrada = buscarArchivo(nombreArchivo, baseDir);
        if (rutaEncontrada) {
          console.log(`✅ Archivo encontrado en: ${rutaEncontrada}`);
          rutaArchivo = rutaEncontrada;
        } else {
          console.log(`❌ Archivo no encontrado: ${archivo.path}`);
          pdfsFallidos.push({ path: archivo.path, error: 'Archivo no encontrado', documento: archivo.documento });
          continue;
        }
      }
      
      // Verificar que el archivo existe (ahora sí)
      if (!fs.existsSync(rutaArchivo)) {
        console.log(`❌ Archivo no encontrado después de búsqueda: ${rutaArchivo}`);
        pdfsFallidos.push({ path: rutaArchivo, error: 'Archivo no encontrado', documento: archivo.documento });
        continue;
      }
      
      // Leer y verificar el archivo
      const pdfBytes = fs.readFileSync(rutaArchivo);
      if (pdfBytes.length < 100) {
        console.log(`❌ Archivo demasiado pequeño: ${pdfBytes.length} bytes`);
        pdfsFallidos.push({ path: rutaArchivo, error: 'Archivo demasiado pequeño', documento: archivo.documento });
        continue;
      }
      
      const header = pdfBytes.slice(0, 4).toString();
      if (header !== '%PDF') {
        console.log(`❌ Archivo no es un PDF válido (header: ${header})`);
        pdfsFallidos.push({ path: rutaArchivo, error: 'No es un PDF válido', documento: archivo.documento });
        continue;
      }
      
      try {
        const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const paginas = await pdfFusionado.copyPages(pdf, pdf.getPageIndices());
        paginas.forEach((pagina) => pdfFusionado.addPage(pagina));
        pdfsProcesados++;
        console.log(`✅ PDF procesado correctamente. Páginas: ${paginas.length}`);
      } catch (pdfError) {
        console.error(`❌ Error procesando PDF ${rutaArchivo}:`, pdfError.message);
        pdfsFallidos.push({ path: rutaArchivo, error: pdfError.message, documento: archivo.documento });
      }
    }
    
    console.log('📊 Resumen de fusión:');
    console.log(`   - Procesados: ${pdfsProcesados}`);
    console.log(`   - Fallidos: ${pdfsFallidos.length}`);
    
    if (pdfsProcesados === 0) {
      throw new Error('No se pudo procesar ningún PDF válido. Verifica que los archivos existan en ' + baseDir);
    }
    
    // Guardar el PDF fusionado
    const pdfBytes = await pdfFusionado.save();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `cedulas_fusionadas_${ofertaId}_${fecha}.pdf`;
    const rutaSalida = path.join(__dirname, '../uploads/fusionados', nombreArchivo);
    
    const dirSalida = path.dirname(rutaSalida);
    if (!fs.existsSync(dirSalida)) {
      fs.mkdirSync(dirSalida, { recursive: true });
    }
    
    fs.writeFileSync(rutaSalida, pdfBytes);
    
    return {
      success: true,
      path: rutaSalida,
      nombre: nombreArchivo,
      totalPaginas: pdfsProcesados,
      fallidos: pdfsFallidos
    };
    
  } catch (error) {
    console.error('❌ Error fusionando PDFs:', error);
    throw error;
  }
};

module.exports = { fusionarPDFs };