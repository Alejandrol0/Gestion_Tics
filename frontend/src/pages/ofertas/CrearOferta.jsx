import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOfertas } from '../../context/OfertaContext';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CrearOferta = ({ tipo }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { referencias, cargarReferencias, crearOferta } = useOfertas();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('programa');
  const [diaInput, setDiaInput] = useState('');

  const [formData, setFormData] = useState({
    programa_formacion: '',
    modalidad: '',
    duracion_meses: 4,
    es_campesena: tipo === 'campesena',
    tipo_programa: '',
    tipo_oferta: '',
    cupo_maximo: '',
    ambiente: { nombre: '' },
    fechas: { inicio: '', fin: '' },
    ubicacion: { departamento: 'Cauca', municipio: '', direccion: '' },
    empresa_solicitante: {
      nombre: '',
      fecha_creacion: '',
      direccion: '',
      nit: '',
      numero_empleados: '',
      tipo_empresa: 'Privada',
      representante_legal: { nombre: '', documento: '', correo: '' },
      contacto_empresa: { nombre: '', cargo: '', correo: '' }
    },
    subsector_economico: { nombre: '' },
    programa_especial: '',
    convenio: { nombre: '' },
    horario: { hora_inicio: '', hora_fin: '', dias: [] },
    firma_digital: { tipo: 'electronica' },
    coordinador_asignado: user?.coordinador_asignado?._id || ''
  });

  // Cargar referencias al montar
  useEffect(() => {
    cargarReferencias();
  }, []);

  // Al seleccionar programa, autocompletar tipo_programa y duración
  useEffect(() => {
    // Solo ejecutar si tenemos los datos necesarios
    if (!formData.programa_formacion || !referencias.programas || !referencias.tiposProg) return;

    const programaSeleccionado = referencias.programas.find(
      p => p._id === formData.programa_formacion
    );
    if (!programaSeleccionado) return;

    // Depuración: ver en consola qué trae el programa
    console.log('Programa seleccionado:', programaSeleccionado);
    console.log('Tipos disponibles:', referencias.tiposProg);

    // 1. Duración en meses (usando duracion_maxima, asumiendo 40 horas/mes)
    const horas = programaSeleccionado.duracion_maxima;
    if (horas && typeof horas === 'number') {
      const meses = Math.ceil(horas / 40);
      setFormData(prev => ({ ...prev, duracion_meses: meses }));
    }

    // 2. Tipo de programa: mapear el string (ej "COMPLEMENTARIA") al ObjectId correspondiente
    const tipoTexto = programaSeleccionado.tipo_programa?.trim();
    if (tipoTexto) {
      // Búsqueda insensible a mayúsculas/minúsculas
      const tipoEncontrado = referencias.tiposProg.find(t => 
        t.nombre && t.nombre.trim().toLowerCase() === tipoTexto.toLowerCase()
      );
      if (tipoEncontrado) {
        setFormData(prev => ({ ...prev, tipo_programa: tipoEncontrado._id }));
        console.log('✅ Tipo asignado:', tipoEncontrado.nombre);
      } else {
        console.warn(`⚠️ No se encontró un TipoPrograma con nombre "${tipoTexto}".`);
        toast.error(`El programa tiene tipo "${tipoTexto}" pero no existe en la lista de tipos. Notifica al administrador.`);
      }
    } else {
      console.warn('El programa seleccionado no tiene campo tipo_programa');
    }
  }, [formData.programa_formacion, referencias.programas, referencias.tiposProg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.');
      if (subchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: { ...prev[parent][child], [subchild]: value }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDias = () => {
    if (diaInput && !formData.horario.dias.includes(diaInput)) {
      setFormData(prev => ({
        ...prev,
        horario: { ...prev.horario, dias: [...prev.horario.dias, diaInput] }
      }));
    }
    setDiaInput('');
  };

  const removeDia = (dia) => {
    setFormData(prev => ({
      ...prev,
      horario: { ...prev.horario, dias: prev.horario.dias.filter(d => d !== dia) }
    }));
  };

  const getTipoOfertaNombre = () => {
    const tipo = referencias.tiposOferta?.find(t => t._id === formData.tipo_oferta);
    return tipo ? tipo.nombre : '';
  };

  const validateTab = () => {
    if (activeTab === 'programa') {
      if (!formData.programa_formacion) return toast.error('Selecciona un programa de formación');
      if (!formData.modalidad) return toast.error('Selecciona una modalidad');
      if (!formData.duracion_meses) return toast.error('La duración se calcula automáticamente, pero no se pudo calcular');
      if (!formData.tipo_programa) return toast.error('El tipo de programa no se pudo determinar automáticamente. Contacta al administrador.');
      return true;
    }
    if (activeTab === 'oferta') {
      if (!formData.tipo_oferta) return toast.error('Selecciona un tipo de oferta');
      if (!formData.cupo_maximo) return toast.error('Ingresa el cupo máximo');
      if (!formData.subsector_economico.nombre) return toast.error('Ingresa el subsector económico');
      if (!formData.convenio.nombre) return toast.error('Ingresa el nombre del convenio');
      if (!formData.coordinador_asignado) return toast.error('No tienes un coordinador asignado');
      if (getTipoOfertaNombre() === 'Cerrada') {
        if (!formData.empresa_solicitante.nombre) return toast.error('Ingresa el nombre de la empresa patrocinadora');
        if (!formData.empresa_solicitante.nit) return toast.error('Ingresa el NIT de la empresa');
      }
      return true;
    }
    if (activeTab === 'ubicacion') {
      if (!formData.ubicacion.municipio) return toast.error('Selecciona un municipio');
      if (!formData.ubicacion.direccion) return toast.error('Ingresa la dirección');
      if (!formData.ambiente.nombre) return toast.error('Ingresa el nombre del ambiente');
      return true;
    }
    if (activeTab === 'horario') {
      if (!formData.fechas.inicio) return toast.error('Ingresa la fecha de inicio');
      if (!formData.fechas.fin) return toast.error('Ingresa la fecha de fin');
      if (new Date(formData.fechas.inicio) >= new Date(formData.fechas.fin)) {
        return toast.error('La fecha de fin debe ser posterior a la de inicio');
      }
      if (formData.es_campesena === false && formData.horario.dias.length === 0) {
        return toast.error('Agrega al menos un día de clase');
      }
      if (formData.es_campesena === false && (!formData.horario.hora_inicio || !formData.horario.hora_fin)) {
        return toast.error('Ingresa la hora de inicio y fin');
      }
      return true;
    }
    return true;
  };

  const nextTab = () => {
    if (validateTab()) {
      const tabs = ['programa', 'oferta', 'ubicacion', 'horario'];
      const nextIndex = tabs.indexOf(activeTab) + 1;
      if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
    }
  };

  const prevTab = () => {
    const tabs = ['programa', 'oferta', 'ubicacion', 'horario'];
    const prevIndex = tabs.indexOf(activeTab) - 1;
    if (prevIndex >= 0) setActiveTab(tabs[prevIndex]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTab()) return;

    const datosEnvio = {
      ...formData,
      tipo_oferta_nombre: getTipoOfertaNombre()
    };

    setLoading(true);
    const result = await crearOferta(datosEnvio, tipo);
    if (result.success) navigate('/ofertas/mis-ofertas');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
          <FiArrowLeft /> Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <h1 className="text-3xl font-bold">Nueva Oferta</h1>
            <p className="text-green-100">Tipo: {tipo === 'campesena' ? 'Campesena' : 'Regular'}</p>
          </div>

          <div className="flex border-b">
            {['programa', 'oferta', 'ubicacion', 'horario'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-semibold uppercase tracking-wide transition-all ${
                  activeTab === tab
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-green-500'
                }`}
              >
                {tab === 'programa' && 'Programa'}
                {tab === 'oferta' && 'Oferta'}
                {tab === 'ubicacion' && 'Ubicación'}
                {tab === 'horario' && 'Horario'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* TAB PROGRAMA */}
            {activeTab === 'programa' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Programa de formación *</label>
                  <select name="programa_formacion" value={formData.programa_formacion} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                    <option value="">Selecciona</option>
                    {referencias.programas?.map(p => (
                      <option key={p._id} value={p._id}>{p.nombre_programa}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Modalidad *</label>
                  <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                    <option value="">Selecciona</option>
                    {referencias.modalidades?.map(m => (
                      <option key={m._id} value={m._id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duración (meses) *</label>
                  <input
                    type="number"
                    name="duracion_meses"
                    value={formData.duracion_meses}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    className="w-full p-3 border rounded-xl bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Calculada automáticamente según las horas del programa</p>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tipo de programa *</label>
                  <select
                    name="tipo_programa"
                    value={formData.tipo_programa}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl bg-gray-100"
                    disabled
                    required
                  >
                    <option value="">Selecciona</option>
                    {referencias.tiposProg?.map(t => (
                      <option key={t._id} value={t._id}>{t.nombre}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Se asigna automáticamente según el programa de formación</p>
                </div>
              </div>
            )}

            {/* TAB OFERTA (sin cambios) */}
            {activeTab === 'oferta' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Tipo de oferta *</label>
                  <select name="tipo_oferta" value={formData.tipo_oferta} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                    <option value="">Selecciona</option>
                    {referencias.tiposOferta?.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Cupo máximo *</label>
                  <input type="number" name="cupo_maximo" value={formData.cupo_maximo} onChange={handleChange} min="1" className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Subsector económico *</label>
                  <input type="text" name="subsector_economico.nombre" value={formData.subsector_economico.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Convenio *</label>
                  <input type="text" name="convenio.nombre" value={formData.convenio.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Coordinador asignado</label>
                  <input type="text" value={user?.coordinador_asignado?.nombre || 'No asignado'} disabled className="w-full p-3 border rounded-xl bg-gray-100" />
                </div>

                {getTipoOfertaNombre() === 'Cerrada' && (
                  <div className="mt-6 p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">Datos de la empresa patrocinadora</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Nombre de la Empresa *</label>
                        <input type="text" name="empresa_solicitante.nombre" value={formData.empresa_solicitante.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Fecha Creación</label>
                        <input type="date" name="empresa_solicitante.fecha_creacion" value={formData.empresa_solicitante.fecha_creacion?.split('T')[0] || ''} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Dirección</label>
                        <input type="text" name="empresa_solicitante.direccion" value={formData.empresa_solicitante.direccion} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">NIT</label>
                        <input type="text" name="empresa_solicitante.nit" value={formData.empresa_solicitante.nit} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Número de Empleados</label>
                        <input type="number" name="empresa_solicitante.numero_empleados" value={formData.empresa_solicitante.numero_empleados} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Tipo de Empresa</label>
                        <select name="empresa_solicitante.tipo_empresa" value={formData.empresa_solicitante.tipo_empresa} onChange={handleChange} className="w-full p-3 border rounded-xl">
                          <option value="Privada">Privada</option>
                          <option value="Pública">Pública</option>
                          <option value="Mixta">Mixta</option>
                          <option value="Sin ánimo de lucro">Sin ánimo de lucro</option>
                        </select>
                      </div>
                    </div>
                    <h4 className="font-semibold mt-4 mb-2">Representante Legal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" name="empresa_solicitante.representante_legal.nombre" value={formData.empresa_solicitante.representante_legal.nombre} onChange={handleChange} placeholder="Nombre completo" className="p-3 border rounded-xl" />
                      <input type="text" name="empresa_solicitante.representante_legal.documento" value={formData.empresa_solicitante.representante_legal.documento} onChange={handleChange} placeholder="Documento" className="p-3 border rounded-xl" />
                      <input type="email" name="empresa_solicitante.representante_legal.correo" value={formData.empresa_solicitante.representante_legal.correo} onChange={handleChange} placeholder="Correo" className="p-3 border rounded-xl" />
                    </div>
                    <h4 className="font-semibold mt-4 mb-2">Contacto en la Empresa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" name="empresa_solicitante.contacto_empresa.nombre" value={formData.empresa_solicitante.contacto_empresa.nombre} onChange={handleChange} placeholder="Nombre del contacto" className="p-3 border rounded-xl" />
                      <input type="text" name="empresa_solicitante.contacto_empresa.cargo" value={formData.empresa_solicitante.contacto_empresa.cargo} onChange={handleChange} placeholder="Cargo" className="p-3 border rounded-xl" />
                      <input type="email" name="empresa_solicitante.contacto_empresa.correo" value={formData.empresa_solicitante.contacto_empresa.correo} onChange={handleChange} placeholder="Correo" className="p-3 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Carta de la empresa (PDF)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFormData(prev => ({
                            ...prev,
                            carta_pdf_file: file
                          }));
                        }}
                        className="w-full p-2 border rounded-xl"
                      />
                      {formData.carta_pdf_file && <p className="text-sm text-green-600 mt-1">Archivo seleccionado: {formData.carta_pdf_file.name}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB UBICACIÓN */}
            {activeTab === 'ubicacion' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Departamento</label>
                  <input type="text" name="ubicacion.departamento" value={formData.ubicacion.departamento} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Municipio *</label>
                  <select name="ubicacion.municipio" value={formData.ubicacion.municipio} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                    <option value="">Selecciona</option>
                    {referencias.municipios?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Dirección *</label>
                  <input type="text" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ambiente (nombre) *</label>
                  <input type="text" name="ambiente.nombre" value={formData.ambiente.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
            )}

            {/* TAB HORARIO */}
            {activeTab === 'horario' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Fecha de inicio *</label>
                    <input type="date" name="fechas.inicio" value={formData.fechas.inicio} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Fecha de fin *</label>
                    <input type="date" name="fechas.fin" value={formData.fechas.fin} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>
                {!formData.es_campesena && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Hora inicio</label>
                        <input type="time" name="horario.hora_inicio" value={formData.horario.hora_inicio} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Hora fin</label>
                        <input type="time" name="horario.hora_fin" value={formData.horario.hora_fin} onChange={handleChange} className="w-full p-3 border rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Días de clase</label>
                      <div className="flex gap-2">
                        <select value={diaInput} onChange={(e) => setDiaInput(e.target.value)} className="flex-1 p-3 border rounded-xl">
                          <option value="">Selecciona un día</option>
                          {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(d => <option key={d}>{d}</option>)}
                        </select>
                        <button type="button" onClick={handleDias} className="px-4 py-2 bg-green-600 text-white rounded-xl">Agregar</button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.horario.dias.map((dia, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2">
                            {dia} <button type="button" onClick={() => removeDia(dia)} className="text-green-600">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {formData.es_campesena && (
                  <div className="bg-amber-50 p-4 rounded-xl text-amber-700">
                    Las ofertas campesinas no requieren horario fijo.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              {activeTab !== 'programa' && (
                <button type="button" onClick={prevTab} className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600">← Anterior</button>
              )}
              {activeTab !== 'horario' ? (
                <button type="button" onClick={nextTab} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 ml-auto">Siguiente →</button>
              ) : (
                <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 ml-auto flex items-center gap-2">
                  {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creando...</> : <><FiSave /> Crear oferta</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearOferta;