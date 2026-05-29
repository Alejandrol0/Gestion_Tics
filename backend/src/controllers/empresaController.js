import Empresa from '../models/Empresa.js';

// Crear o actualizar empresa (usado desde creación de oferta)
export const crearEmpresa = async (datos, archivoUrl, usuarioId) => {
  try {
    // Buscar por NIT si existe
    let empresa = await Empresa.findOne({ nit: datos.nit });
    if (empresa) {
      // Actualizar datos (opcional)
      Object.assign(empresa, datos);
      if (archivoUrl) empresa.carta_pdf_url = archivoUrl;
      await empresa.save();
      return empresa;
    }
    // Crear nueva
    const nuevaEmpresa = new Empresa({
      ...datos,
      carta_pdf_url: archivoUrl || '',
      creado_por: usuarioId
    });
    await nuevaEmpresa.save();
    return nuevaEmpresa;
  } catch (error) {
    throw new Error(`Error al guardar empresa: ${error.message}`);
  }
};

// Obtener empresa por ID (opcional)
export const getEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id);
    if (!empresa) return res.status(404).json({ msg: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};