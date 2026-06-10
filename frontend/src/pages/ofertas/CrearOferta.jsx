import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOfertas } from '../../context/OfertaContext';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';

const CrearOferta = ({ tipo }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { referencias, cargarReferencias, crearOferta } = useOfertas();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('programa');
  const [busquedaPrograma, setBusquedaPrograma] = useState('');
  const [mostrarListaPrograma, setMostrarListaPrograma] = useState(false);

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

  // Al seleccionar programa, autocompletar tipo_programa y horas del programa
  useEffect(() => {
    if (!formData.programa_formacion || !referencias.programas || !referencias.tiposProg) return;

    const programaSeleccionado = referencias.programas.find(
      p => p._id === formData.programa_formacion
    );
    if (!programaSeleccionado) return;

    // 1. Asignar las horas del programa (duracion_maxima)
    const horas = programaSeleccionado.duracion_maxima;
    if (horas && typeof horas === 'number') {
      setFormData(prev => ({ ...prev, duracion_meses: horas }));
    }

    // 2. Autocompletar tipo de programa
    const tipoTexto = programaSeleccionado.tipo_programa?.trim();
    if (tipoTexto) {
      const tipoEncontrado = referencias.tiposProg.find(t => 
        t.nombre && t.nombre.trim().toLowerCase() === tipoTexto.toLowerCase()
      );
      if (tipoEncontrado) {
        setFormData(prev => ({ ...prev, tipo_programa: tipoEncontrado._id }));
      } else {
        console.warn(`No se encontró tipo "${tipoTexto}"`);
        toast.error(`El programa tiene tipo "${tipoTexto}" pero no existe en la lista de tipos.`);
      }
    }
  }, [formData.programa_formacion, referencias.programas, referencias.tiposProg]);

  // ── Calcular fecha fin automáticamente (basado en horas del programa) ──
  const calcularFechaFin = (fechaInicio, horasPrograma, horaInicio, horaFin, diasSemana) => {
    if (!fechaInicio || !horasPrograma || !horaInicio || !horaFin || diasSemana.length === 0) return null;

    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    const horasPorDia = (hFin * 60 + mFin - (hIni * 60 + mIni)) / 60;
    if (horasPorDia <= 0) return null;

    const mapaDia = {
      'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
      'Jueves': 4, 'Viernes': 5, 'Sábado': 6
    };
    const numeroDias = diasSemana.map(d => mapaDia[d]).filter(n => n !== undefined);

    let horasAcumuladas = 0;
    let fechaActual = new Date(fechaInicio + 'T00:00:00');
    const MAX_ITER = 3650;
    let iter = 0;
    while (horasAcumuladas < horasPrograma && iter < MAX_ITER) {
      const diaSemana = fechaActual.getDay();
      if (numeroDias.includes(diaSemana)) {
        horasAcumuladas += horasPorDia;
      }
      if (horasAcumuladas < horasPrograma) {
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      iter++;
    }
    return fechaActual.toISOString().split('T')[0];
  };

  // Recalcular fecha fin cuando cambien los inputs relevantes
  useEffect(() => {
    if (formData.es_campesena) return;
    const horasPrograma = formData.duracion_meses; // aquí están las horas
    if (!horasPrograma) return;

    const fechaFin = calcularFechaFin(
      formData.fechas.inicio,
      horasPrograma,
      formData.horario.hora_inicio,
      formData.horario.hora_fin,
      formData.horario.dias
    );

    if (fechaFin && formData.fechas.inicio) {
      setFormData(prev => ({
        ...prev,
        fechas: { ...prev.fechas, fin: fechaFin }
      }));
    }
  }, [
    formData.fechas.inicio,
    formData.horario.hora_inicio,
    formData.horario.hora_fin,
    formData.horario.dias,
    formData.duracion_meses
  ]);

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

  const getTipoOfertaNombre = () => {
    const tipo = referencias.tiposOferta?.find(t => t._id === formData.tipo_oferta);
    return tipo ? tipo.nombre : '';
  };

  const validateTab = () => {
    if (activeTab === 'programa') {
      if (!formData.programa_formacion) return toast.error('Selecciona un programa de formación');
      if (!formData.modalidad) return toast.error('Selecciona una modalidad');
      if (!formData.duracion_meses) return toast.error('El programa debe tener horas registradas');
      if (!formData.tipo_programa) return toast.error('El tipo de programa no se pudo determinar');
      return true;
    }
    if (activeTab === 'oferta') {
      if (!formData.tipo_oferta) return toast.error('Selecciona un tipo de oferta');
      if (!formData.cupo_maximo) return toast.error('Ingresa el cupo máximo');
      if (!formData.subsector_economico.nombre) return toast.error('Ingresa el subsector económico');
      if (!formData.convenio.nombre) return toast.error('Ingresa el nombre del convenio');
      if (!formData.coordinador_asignado) return toast.error('No tienes un coordinador asignado');
      if (getTipoOfertaNombre() === 'Cerrada') {
        if (!formData.empresa_solicitante.nombre) return toast.error('Ingresa el nombre de la empresa');
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

  // ── Validación exhaustiva de campos críticos ──
  if (!formData.programa_formacion) {
    toast.error('⚠️ Debes seleccionar un programa de formación de la lista');
    setActiveTab('programa');
    return;
  }
  if (!formData.tipo_programa) {
    toast.error('⚠️ El tipo de programa no se pudo determinar. Selecciona otro programa.');
    setActiveTab('programa');
    return;
  }
  if (!formData.modalidad) {
    toast.error('⚠️ Selecciona una modalidad');
    setActiveTab('programa');
    return;
  }
  if (!formData.tipo_oferta) {
    toast.error('⚠️ Selecciona un tipo de oferta');
    setActiveTab('oferta');
    return;
  }
  // Validar que tipo_oferta sea un ObjectId válido (24 caracteres hex)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(formData.tipo_oferta)) {
    toast.error('⚠️ El tipo de oferta seleccionado no es válido. Vuelve a seleccionarlo.');
    setActiveTab('oferta');
    return;
  }
  if (!formData.ubicacion.municipio) {
    toast.error('⚠️ Selecciona un municipio');
    setActiveTab('ubicacion');
    return;
  }
  if (!formData.ubicacion.direccion) {
    toast.error('⚠️ Ingresa una dirección');
    setActiveTab('ubicacion');
    return;
  }
  if (!formData.ambiente.nombre) {
    toast.error('⚠️ Ingresa el nombre del ambiente');
    setActiveTab('ubicacion');
    return;
  }
  if (!formData.fechas.inicio || !formData.fechas.fin) {
    toast.error('⚠️ Las fechas de inicio y fin son obligatorias');
    setActiveTab('horario');
    return;
  }
  // Validar que las fechas sean válidas (no "Invalid Date")
  const fechaInicio = new Date(formData.fechas.inicio);
  const fechaFin = new Date(formData.fechas.fin);
  if (isNaN(fechaInicio.getTime())) {
    toast.error('⚠️ La fecha de inicio no es válida');
    setActiveTab('horario');
    return;
  }
  if (isNaN(fechaFin.getTime())) {
    toast.error('⚠️ La fecha de fin no es válida');
    setActiveTab('horario');
    return;
  }
  if (fechaInicio >= fechaFin) {
    toast.error('⚠️ La fecha de fin debe ser posterior a la de inicio');
    setActiveTab('horario');
    return;
  }
  if (!formData.es_campesena) {
    if (formData.horario.dias.length === 0) {
      toast.error('⚠️ Agrega al menos un día de clase');
      setActiveTab('horario');
      return;
    }
    if (!formData.horario.hora_inicio || !formData.horario.hora_fin) {
      toast.error('⚠️ Ingresa la hora de inicio y fin');
      setActiveTab('horario');
      return;
    }
  }

  const datosEnvio = { ...formData, tipo_oferta_nombre: getTipoOfertaNombre() };
  console.log('📤 Enviando oferta:', JSON.stringify(datosEnvio, null, 2));

  setLoading(true);
  try {
    const result = await crearOferta(datosEnvio, tipo);
    if (result.success) navigate('/ofertas/mis-ofertas');
    else toast.error(`Error: ${result.error || 'No se pudo crear la oferta'}`);
  } catch (err) {
    console.error('❌ Error inesperado:', err);
    toast.error('Error inesperado al crear la oferta');
  } finally {
    setLoading(false);
  }
  };

  return (
    <>
      <Navbar />
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
                  <div className="relative">
                    <label className="block font-semibold mb-1">Programa de formación *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar programa por nombre o código..."
                        value={busquedaPrograma}
                        onChange={e => {
                          const val = e.target.value;
                          setBusquedaPrograma(val);
                          setMostrarListaPrograma(true);
                          if (formData.programa_formacion) setFormData(prev => ({ ...prev, programa_formacion: '' }));
                        }}
                        onFocus={() => setMostrarListaPrograma(true)}
                        onBlur={() => setTimeout(() => setMostrarListaPrograma(false), 200)}
                        className={`w-full p-3 border rounded-xl pr-10 ${
                          formData.programa_formacion ? 'border-green-400 bg-green-50' : ''
                        }`}
                        autoComplete="off"
                      />
                      {formData.programa_formacion
                        ? <span className="absolute right-3 top-3.5 text-green-600">✅</span>
                        : busquedaPrograma && <span className="absolute right-3 top-3.5 text-gray-400">🔍</span>
                      }
                    </div>
                    {formData.programa_formacion && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-green-700 font-medium">Programa seleccionado</p>
                        <button
                          type="button"
                          onClick={() => { setBusquedaPrograma(''); setFormData(prev => ({ ...prev, programa_formacion: '', tipo_programa: '', duracion_meses: 4 })); }}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          ✕ Limpiar
                        </button>
                      </div>
                    )}
                    {mostrarListaPrograma && busquedaPrograma.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto mt-1">
                        {(referencias.programas || [])
                          .filter(p => p.nombre_programa.toLowerCase().includes(busquedaPrograma.toLowerCase()))
                          .slice(0, 50)
                          .map(p => (
                            <li
                              key={p._id}
                              onMouseDown={e => {
                                e.preventDefault();
                                setFormData(prev => ({ ...prev, programa_formacion: p._id }));
                                setBusquedaPrograma(p.nombre_programa);
                                setMostrarListaPrograma(false);
                              }}
                              className={`px-4 py-2.5 cursor-pointer hover:bg-green-50 text-sm ${formData.programa_formacion === p._id ? 'bg-green-100 font-semibold text-green-800' : 'text-gray-700'}`}
                            >
                              {p.nombre_programa}
                            </li>
                          ))}
                        {!(referencias.programas || []).some(p => p.nombre_programa.toLowerCase().includes(busquedaPrograma.toLowerCase())) && (
                          <li className="px-4 py-3 text-gray-400 text-sm text-center">Sin resultados</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Modalidad *</label>
                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                      <option value="">Selecciona</option>
                      {referencias.modalidades?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Horas del programa *</label>
                    <input
                      type="number"
                      name="duracion_meses"
                      value={formData.duracion_meses}
                      onChange={handleChange}
                      min="1"
                      className="w-full p-3 border rounded-xl bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">Cargadas automáticamente desde el programa de formación</p>
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
                      {referencias.tiposProg?.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Se asigna automáticamente según el programa de formación</p>
                  </div>
                </div>
              )}

              {/* TAB OFERTA */}
              {activeTab === 'oferta' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">Tipo de oferta *</label>
                    <select name="tipo_oferta" value={formData.tipo_oferta} onChange={handleChange} className="w-full p-3 border rounded-xl" required>
                      <option value="">Selecciona</option>
                      {referencias.tiposOferta
                        ?.filter(t => ['Cerrada', 'Pública', 'Publica'].includes(t.nombre))
                        .map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
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
                        <div><label className="block font-semibold mb-1">Nombre de la Empresa *</label><input type="text" name="empresa_solicitante.nombre" value={formData.empresa_solicitante.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                        <div><label className="block font-semibold mb-1">Fecha Creación</label><input type="date" name="empresa_solicitante.fecha_creacion" value={formData.empresa_solicitante.fecha_creacion?.split('T')[0] || ''} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                        <div><label className="block font-semibold mb-1">Dirección</label><input type="text" name="empresa_solicitante.direccion" value={formData.empresa_solicitante.direccion} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                        <div><label className="block font-semibold mb-1">NIT</label><input type="text" name="empresa_solicitante.nit" value={formData.empresa_solicitante.nit} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                        <div><label className="block font-semibold mb-1">Número de Empleados</label><input type="number" name="empresa_solicitante.numero_empleados" value={formData.empresa_solicitante.numero_empleados} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                        <div><label className="block font-semibold mb-1">Tipo de Empresa</label><select name="empresa_solicitante.tipo_empresa" value={formData.empresa_solicitante.tipo_empresa} onChange={handleChange} className="w-full p-3 border rounded-xl"><option value="Privada">Privada</option><option value="Pública">Pública</option><option value="Mixta">Mixta</option><option value="Sin ánimo de lucro">Sin ánimo de lucro</option></select></div>
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
                        <input type="file" accept="application/pdf" onChange={(e) => { const file = e.target.files[0]; setFormData(prev => ({ ...prev, carta_pdf_file: file })); }} className="w-full p-2 border rounded-xl" />
                        {formData.carta_pdf_file && <p className="text-sm text-green-600 mt-1">Archivo seleccionado: {formData.carta_pdf_file.name}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB UBICACIÓN */}
              {activeTab === 'ubicacion' && (
                <div className="space-y-4">
                  <div><label className="block font-semibold mb-1">Departamento</label><input type="text" name="ubicacion.departamento" value={formData.ubicacion.departamento} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                  <div><label className="block font-semibold mb-1">Municipio *</label><select name="ubicacion.municipio" value={formData.ubicacion.municipio} onChange={handleChange} className="w-full p-3 border rounded-xl" required><option value="">Selecciona</option>{referencias.municipios?.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}</select></div>
                  <div><label className="block font-semibold mb-1">Dirección *</label><input type="text" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                  <div><label className="block font-semibold mb-1">Ambiente (nombre) *</label><input type="text" name="ambiente.nombre" value={formData.ambiente.nombre} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                </div>
              )}

              {/* TAB HORARIO */}
              {activeTab === 'horario' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block font-semibold mb-1">Fecha de inicio *</label><input type="date" name="fechas.inicio" value={formData.fechas.inicio} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                    <div><label className="block font-semibold mb-1">Fecha de fin *</label><input type="date" name="fechas.fin" value={formData.fechas.fin} onChange={handleChange} className={`w-full p-3 border rounded-xl ${formData.fechas.fin && formData.horario.hora_inicio && formData.horario.dias.length > 0 ? 'bg-green-50 border-green-300' : ''}`} /></div>
                  </div>
                  {!formData.es_campesena && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block font-semibold mb-1">Hora inicio</label><input type="time" name="horario.hora_inicio" value={formData.horario.hora_inicio} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                        <div><label className="block font-semibold mb-1">Hora fin</label><input type="time" name="horario.hora_fin" value={formData.horario.hora_fin} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-2">Días de clase</label>
                        <div className="flex flex-wrap gap-2">
                          {[ { nombre: 'Lunes', corto: 'L' }, { nombre: 'Martes', corto: 'M' }, { nombre: 'Miércoles', corto: 'Mi' }, { nombre: 'Jueves', corto: 'J' }, { nombre: 'Viernes', corto: 'V' }, { nombre: 'Sábado', corto: 'S' } ].map(({ nombre, corto }) => {
                            const activo = formData.horario.dias.includes(nombre);
                            return (
                              <button key={nombre} type="button" onClick={() => { setFormData(prev => ({ ...prev, horario: { ...prev.horario, dias: activo ? prev.horario.dias.filter(d => d !== nombre) : [...prev.horario.dias, nombre] } })); }} className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold text-sm transition-all border-2 select-none ${activo ? 'bg-green-600 text-white border-green-600 shadow-md scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'}`}>
                                <span className="text-lg leading-none">{corto}</span><span className="text-[10px] font-normal mt-0.5 opacity-80">{nombre.slice(0,3)}</span>
                              </button>
                            );
                          })}
                        </div>
                        {formData.horario.dias.length > 0 && <p className="text-xs text-gray-500 mt-2">Seleccionados: <span className="font-semibold text-green-700">{formData.horario.dias.join(', ')}</span></p>}
                      </div>
                      {formData.horario.hora_inicio && formData.horario.hora_fin && formData.horario.dias.length > 0 && (() => {
                        const horasPrograma = formData.duracion_meses;
                        const [hIni, mIni] = formData.horario.hora_inicio.split(':').map(Number);
                        const [hFin, mFin] = formData.horario.hora_fin.split(':').map(Number);
                        const horasPorDia = ((hFin * 60 + mFin) - (hIni * 60 + mIni)) / 60;
                        const horasPorSemana = horasPorDia * formData.horario.dias.length;
                        const semanasTotal = horasPrograma ? Math.ceil(horasPrograma / horasPorSemana) : null;
                        const mesesTotal = semanasTotal ? (semanasTotal / 4.33).toFixed(1) : null;
                        if (horasPorDia <= 0) return null;
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                            <p className="text-sm font-semibold text-blue-800 mb-2">📊 Resumen del cálculo</p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                              <span>⏱ Horas por día:</span><span className="font-bold">{horasPorDia.toFixed(1)} h</span>
                              <span>📅 Días por semana:</span><span className="font-bold">{formData.horario.dias.length}</span>
                              <span>📆 Horas por semana:</span><span className="font-bold">{horasPorSemana.toFixed(1)} h</span>
                              {horasPrograma && <><span>🎓 Horas del programa:</span><span className="font-bold">{horasPrograma} h</span></>}
                              {semanasTotal && <><span>🗓 Semanas necesarias:</span><span className="font-bold">{semanasTotal}</span></>}
                              {mesesTotal && <><span>🗓 Meses aproximados:</span><span className="font-bold">{mesesTotal}</span></>}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                  {formData.es_campesena && <div className="bg-amber-50 p-4 rounded-xl text-amber-700">Las ofertas campesinas no requieren horario fijo.</div>}
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t">
                {activeTab !== 'programa' && <button type="button" onClick={prevTab} className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600">← Anterior</button>}
                {activeTab !== 'horario' ? <button type="button" onClick={nextTab} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 ml-auto">Siguiente →</button> : <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 ml-auto flex items-center gap-2">{loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creando...</> : <><FiSave /> Crear oferta</>}</button>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CrearOferta;