import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SeleccionarTipoOferta from './SeleccionarTipoOferta';
import FormularioCampesenaCompleto from './FormularioCampesenaCompleto';
import Swal from 'sweetalert2';

const CrearOferta = () => {
  // ===== ESTADOS PRINCIPALES =====
  const [modo, setModo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mostrarFormularioEmpresa, setMostrarFormularioEmpresa] = useState(false);
  const [instructoresVisibles, setInstructoresVisibles] = useState({ primerInstructor: '', segundoInstructor: '' });

  // ===== BÚSQUEDA DE PROGRAMA =====
  const [busquedaPrograma, setBusquedaPrograma] = useState('');
  const [mostrarListaPrograma, setMostrarListaPrograma] = useState(false);

  // ===== IDs DE TIPOS DE PROGRAMA =====
  const [tiposProgramaIds, setTiposProgramaIds] = useState({ regular: '', campesena: '' });

  // ===== ESTADO DEL FORMULARIO BASE =====
  const [formData, setFormData] = useState({
    programa_formacion: '',
    modalidad: '',
    tipo_oferta: '',
    cupo_maximo: '',
    ambiente: { nombre: '' },
    fechas: { inicio: '', fin: '' },
    ubicacion: { departamento: 'Cauca', municipio: '', direccion: '' },
    empresa_solicitante: '',
    subsector_economico: { nombre: '' },
    programa_especial: '',
    convenio: { nombre: '' },
    horario: { hora_inicio: '08:00', hora_fin: '12:00', dias: [] },
    firma_digital_pdf: null,
    carta_pdf: null,
    horas_programa: 0,        // ← guardamos las horas reales
    duracion_meses: 4,        // ← valor en meses (se calculará a partir de horas_programa)
    tipo_programa: ''
  });

  // ===== REFERENCIAS =====
  const [programas, setProgramas] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [tiposPrograma, setTiposPrograma] = useState([]);
  const [tiposOferta, setTiposOferta] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [programasEspeciales, setProgramasEspeciales] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  // ===== NUEVA EMPRESA =====
  const [nuevaEmpresa, setNuevaEmpresa] = useState({
    nombre: '', nit: '', fecha_creacion: '', tipo_empresa: 'Privada', direccion: '',
    representante_legal: { nombre_completo: '', documento_identidad: '', telefono: '', correo: '' },
    contacto: { nombre_completo: '', cargo: '', telefono: '', correo: '' },
    numero_empleados: ''
  });

  // ===== CARGAR DATOS INICIALES =====
  useEffect(() => { cargarDatosIniciales(); }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [programasRes, modalidadesRes, tiposProgramaRes, tiposOfertaRes, municipiosRes, programasEspecialesRes, empresasRes] = await Promise.all([
        api.get('/programas-formacion'),
        api.get('/modalidades'),
        api.get('/tipos-programa'),
        api.get('/tipos-oferta'),
        api.get('/municipios'),
        api.get('/programas-especiales'),
        api.get('/empresas')
      ]);
      setProgramas(programasRes.data.data || []);
      setModalidades(modalidadesRes.data.data || []);
      setTiposPrograma(tiposProgramaRes.data.data || []);
      setTiposOferta(tiposOfertaRes.data.data || []);
      setMunicipios(municipiosRes.data.data || []);
      setProgramasEspeciales(programasEspecialesRes.data.data || []);
      setEmpresas(empresasRes.data.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire({ icon: 'error', title: 'Error de carga', text: 'No se pudieron cargar los datos iniciales', timer: 3000, showConfirmButton: false });
    }
  };

  // ===== Guardar IDs de tipos de programa =====
  useEffect(() => {
    if (tiposPrograma.length > 0) {
      const regular = tiposPrograma.find(t => t.nombre === 'Regular');
      const campesena = tiposPrograma.find(t => t.nombre === 'Campesena');
      setTiposProgramaIds({ regular: regular?._id || '', campesena: campesena?._id || '' });
    }
  }, [tiposPrograma]);

  // ===== Lógica instructores Campesena =====
  const determinarInstructores = (tipoProgramaId) => {
    const tipoSeleccionado = tiposPrograma.find(t => t._id === tipoProgramaId);
    if (!tipoSeleccionado) return { primero: '', segundo: '' };
    const tipoNombre = tipoSeleccionado.nombre;
    const instructores = {
      'Técnico': { primero: 'Empresarial', segundo: 'Popular' },
      'Empresarial': { primero: 'Técnico', segundo: 'Popular' },
      'Popular': { primero: 'Técnico', segundo: 'Empresarial' }
    };
    return instructores[tipoNombre] || { primero: '', segundo: '' };
  };

  useEffect(() => {
    if (modo === 'campesena' && formData.tipo_programa) {
      const instructores = determinarInstructores(formData.tipo_programa);
      setInstructoresVisibles(instructores);
    }
  }, [formData.tipo_programa, tiposPrograma, modo]);

  // ===== AUTOCOMPLETAR TIPO Y HORAS AL SELECCIONAR PROGRAMA =====
  useEffect(() => {
    if (!formData.programa_formacion || !programas.length) return;
    const programaSeleccionado = programas.find(p => p._id === formData.programa_formacion);
    if (!programaSeleccionado) return;

    // 1. Guardar horas reales del programa
    const horas = programaSeleccionado.duracion_maxima || 0;
    setFormData(prev => ({ ...prev, horas_programa: horas }));

    // 2. Convertir horas a meses (aproximación: 1 mes = 160 horas)
    const horasPorMes = 160; // 4 semanas * 5 días * 8 horas
    let meses = Math.ceil(horas / horasPorMes);
    meses = Math.min(12, Math.max(1, meses)); // entre 1 y 12
    setFormData(prev => ({ ...prev, duracion_meses: meses }));

    // 3. Autocompletar tipo de programa
    const tipoTexto = programaSeleccionado.tipo_programa?.trim();
    if (tipoTexto) {
      const tipoEncontrado = tiposPrograma.find(t => t.nombre && t.nombre.trim().toLowerCase() === tipoTexto.toLowerCase());
      if (tipoEncontrado) setFormData(prev => ({ ...prev, tipo_programa: tipoEncontrado._id }));
      else console.warn(`No se encontró tipo "${tipoTexto}"`);
    }
  }, [formData.programa_formacion, programas, tiposPrograma]);

  // ===== CALCULAR FECHA DE FIN AUTOMÁTICAMENTE =====
  const calcularFechaFin = (fechaInicio, horasPrograma, horaInicio, horaFin, diasSemana) => {
    if (!fechaInicio || !horasPrograma || !horaInicio || !horaFin || diasSemana.length === 0) return null;

    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);
    const horasPorDia = (hFin * 60 + mFin - (hIni * 60 + mIni)) / 60;
    if (horasPorDia <= 0) return null;

    const mapaDia = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };
    const numeroDias = diasSemana.map(d => mapaDia[d]).filter(n => n !== undefined);
    if (numeroDias.length === 0) return null;

    let horasAcumuladas = 0;
    let fechaActual = new Date(fechaInicio + 'T00:00:00');
    let iter = 0;
    const MAX_ITER = 3650;
    while (horasAcumuladas < horasPrograma && iter < MAX_ITER) {
      if (numeroDias.includes(fechaActual.getDay())) {
        horasAcumuladas += horasPorDia;
      }
      if (horasAcumuladas < horasPrograma) {
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      iter++;
    }
    return fechaActual.toISOString().split('T')[0];
  };

  // Efecto que recalcula la fecha de fin (usa horas_programa, no duracion_meses)
  useEffect(() => {
    if (modo !== 'regular') return;
    const { inicio } = formData.fechas;
    const { hora_inicio, hora_fin, dias } = formData.horario;
    const horasPrograma = formData.horas_programa;
    if (!inicio || !hora_inicio || !hora_fin || dias.length === 0 || horasPrograma === 0) return;

    const fechaFinCalculada = calcularFechaFin(inicio, horasPrograma, hora_inicio, hora_fin, dias);
    if (fechaFinCalculada && fechaFinCalculada !== formData.fechas.fin) {
      setFormData(prev => ({ ...prev, fechas: { ...prev.fechas, fin: fechaFinCalculada } }));
    }
  }, [modo, formData.fechas.inicio, formData.horario.hora_inicio, formData.horario.hora_fin, formData.horario.dias, formData.horas_programa]);

  // ===== MANEJADORES DE EVENTOS =====
  const handleNuevaEmpresaChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNuevaEmpresa(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setNuevaEmpresa(prev => ({ ...prev, [name]: value }));
    }
  };

  const mostrarAlertaValidacion = (mensaje) => {
    Swal.fire({ icon: 'warning', title: 'Campo requerido', text: mensaje, timer: 3000, showConfirmButton: true, confirmButtonColor: '#00643C' });
  };

  const crearNuevaEmpresa = async () => {
    try {
      if (!nuevaEmpresa.nombre) return mostrarAlertaValidacion('El nombre de la empresa es obligatorio');
      if (!nuevaEmpresa.nit) return mostrarAlertaValidacion('El NIT es obligatorio');
      if (!nuevaEmpresa.fecha_creacion) return mostrarAlertaValidacion('La fecha de creación es obligatoria');
      if (!nuevaEmpresa.direccion) return mostrarAlertaValidacion('La dirección es obligatoria');
      if (!nuevaEmpresa.representante_legal.nombre_completo) return mostrarAlertaValidacion('El nombre del representante legal es obligatorio');
      if (!nuevaEmpresa.contacto.nombre_completo) return mostrarAlertaValidacion('El nombre del contacto es obligatorio');
      if (!nuevaEmpresa.contacto.telefono) return mostrarAlertaValidacion('El teléfono del contacto es obligatorio');
      if (!nuevaEmpresa.contacto.correo) return mostrarAlertaValidacion('El correo del contacto es obligatorio');
      if (!nuevaEmpresa.numero_empleados) return mostrarAlertaValidacion('El número de empleados es obligatorio');

      setLoading(true);
      const response = await api.post('/empresas', nuevaEmpresa);
      setEmpresas([...empresas, response.data.data]);
      setFormData(prev => ({ ...prev, empresa_solicitante: response.data.data._id }));
      setMostrarFormularioEmpresa(false);
      setNuevaEmpresa({
        nombre: '', nit: '', fecha_creacion: '', tipo_empresa: 'Privada', direccion: '',
        representante_legal: { nombre_completo: '', documento_identidad: '', telefono: '', correo: '' },
        contacto: { nombre_completo: '', cargo: '', telefono: '', correo: '' },
        numero_empleados: ''
      });
      Swal.fire({ icon: 'success', title: '¡Empresa creada!', text: 'La empresa se ha registrado exitosamente', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message, confirmButtonColor: '#e74c3c' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].type !== 'application/pdf') {
        Swal.fire({ icon: 'error', title: 'Formato incorrecto', text: 'Solo se permiten archivos PDF', timer: 3000, showConfirmButton: false });
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'Archivo demasiado grande', text: 'El archivo no puede superar los 5MB', timer: 3000, showConfirmButton: false });
        return;
      }
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDiaChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      horario: {
        ...prev.horario,
        dias: checked ? [...prev.horario.dias, value] : prev.horario.dias.filter(dia => dia !== value)
      }
    }));
  };

  const validarFormulario = () => {
    if (!formData.programa_formacion) { mostrarAlertaValidacion('Seleccione un programa de formación'); return false; }
    if (!formData.modalidad) { mostrarAlertaValidacion('Seleccione una modalidad'); return false; }
    if (!formData.tipo_oferta) { mostrarAlertaValidacion('Seleccione un tipo de oferta'); return false; }
    if (!formData.cupo_maximo) { mostrarAlertaValidacion('Ingrese el cupo máximo'); return false; }
    if (!formData.ambiente.nombre) { mostrarAlertaValidacion('El nombre del ambiente es obligatorio'); return false; }
    if (!formData.fechas.inicio || !formData.fechas.fin) { mostrarAlertaValidacion('Ingrese las fechas de inicio y fin'); return false; }
    const fechaInicio = new Date(formData.fechas.inicio);
    const fechaFin = new Date(formData.fechas.fin);
    if (fechaFin <= fechaInicio) {
      Swal.fire({ icon: 'warning', title: 'Fechas inválidas', text: 'La fecha de fin debe ser posterior a la de inicio', timer: 3000 });
      return false;
    }
    if (!formData.ubicacion.municipio) { mostrarAlertaValidacion('Seleccione un municipio'); return false; }
    if (!formData.ubicacion.direccion) { mostrarAlertaValidacion('Ingrese la dirección'); return false; }
    if (!formData.empresa_solicitante) { mostrarAlertaValidacion('Seleccione una empresa solicitante'); return false; }
    if (!formData.subsector_economico.nombre) { mostrarAlertaValidacion('Ingrese el subsector económico'); return false; }
    if (!formData.convenio.nombre) { mostrarAlertaValidacion('El nombre del convenio es obligatorio'); return false; }
    if (modo === 'regular' && formData.horario.dias.length === 0) { mostrarAlertaValidacion('Seleccione al menos un día'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setLoading(true);
    try {
      const tipoProgramaId = modo === 'regular' ? tiposProgramaIds.regular : tiposProgramaIds.campesena;
      if (!tipoProgramaId) {
        Swal.fire({ icon: 'error', title: 'Error de configuración', text: 'No se encontró el ID del tipo de programa.', confirmButtonColor: '#e74c3c' });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Campos simples
      formDataToSend.append('programa_formacion', formData.programa_formacion);
      formDataToSend.append('modalidad', formData.modalidad);
      formDataToSend.append('tipo_oferta', formData.tipo_oferta);
      formDataToSend.append('cupo_maximo', formData.cupo_maximo);
      formDataToSend.append('empresa_solicitante', formData.empresa_solicitante);
      formDataToSend.append('programa_especial', formData.programa_especial || '');
      formDataToSend.append('tipo_programa', tipoProgramaId);
      formDataToSend.append('modo', modo);
      formDataToSend.append('duracion_meses', formData.duracion_meses); // ← ahora es meses (1-12)

      // Ambiente
      formDataToSend.append('ambiente_nombre', formData.ambiente.nombre);

      // Fechas
      formDataToSend.append('fechas_inicio', formData.fechas.inicio);
      formDataToSend.append('fechas_fin', formData.fechas.fin);

      // Ubicación
      formDataToSend.append('ubicacion_departamento', formData.ubicacion.departamento);
      formDataToSend.append('ubicacion_municipio', formData.ubicacion.municipio);
      formDataToSend.append('ubicacion_direccion', formData.ubicacion.direccion);

      // Subsector y convenio
      formDataToSend.append('subsector_nombre', formData.subsector_economico.nombre);
      formDataToSend.append('convenio_nombre', formData.convenio.nombre);

      // Horario (solo para regular)
      if (modo === 'regular') {
        formDataToSend.append('horario_hora_inicio', formData.horario.hora_inicio);
        formDataToSend.append('horario_hora_fin', formData.horario.hora_fin);
        formDataToSend.append('horario_dias', JSON.stringify(formData.horario.dias));
      }

      // Archivos PDF
      if (formData.firma_digital_pdf) formDataToSend.append('firma_digital_pdf', formData.firma_digital_pdf);
      if (formData.carta_pdf) formDataToSend.append('carta_pdf', formData.carta_pdf);

      // Instructores para campesena
      if (modo === 'campesena' && formData.instructores) {
        formDataToSend.append('instructores', JSON.stringify(formData.instructores));
      }

      Swal.fire({ title: 'Guardando oferta...', text: 'Por favor espere', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.post('/ofertas', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      Swal.close();
      Swal.fire({ icon: 'success', title: '¡Oferta creada!', text: 'La oferta se ha guardado exitosamente', timer: 2000, showConfirmButton: false });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
      Swal.close();
      let mensajeError = error.response?.data?.message || error.message;
      if (error.response?.data?.errors) mensajeError = error.response.data.errors.join(', ');
      Swal.fire({ icon: 'error', title: 'Error', text: mensajeError, confirmButtonColor: '#e74c3c' });
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  if (!modo) return <SeleccionarTipoOferta onSeleccionar={setModo} />;

  return (
    <>
      <style>{`
        .crear-oferta-container { min-height: 100vh; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%); padding: 40px 24px; font-family: 'Segoe UI', 'Roboto', sans-serif; }
        .crear-oferta-card { background: white; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); padding: 32px 36px; max-width: 1000px; margin: 0 auto; transition: all 0.2s; }
        .crear-oferta-card:hover { transform: translateY(-4px); box-shadow: 0 28px 48px rgba(0,0,0,0.12); }
        .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; border-bottom: 2px solid #eef2f6; padding-bottom: 20px; }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .logo { width: 56px; height: auto; }
        .page-title { font-size: 28px; font-weight: 700; color: #00643C; margin: 0; }
        .cambiar-modo-btn { background: #e2e8f0; color: #1e293b; border: none; border-radius: 40px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .cambiar-modo-btn:hover { background: #cbd5e1; transform: translateY(-1px); }
        .section { background: #f8fafc; border-radius: 24px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
        .section-title { font-size: 18px; font-weight: 700; color: #00643C; margin: 0 0 20px; padding-bottom: 8px; border-bottom: 2px solid #FFD966; display: inline-block; }
        .sub-section { background: white; border-radius: 20px; padding: 20px; margin-top: 16px; border: 1px solid #e2e8f0; }
        .sub-section-title { font-size: 16px; font-weight: 700; color: #0F2B46; margin: 0 0 16px; }
        .form-group { margin-bottom: 20px; }
        .label { display: block; font-size: 13px; font-weight: 600; color: #2d3748; margin-bottom: 6px; }
        .input, .select, .textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 20px; font-size: 14px; background: #fefefe; transition: all 0.2s; outline: none; box-sizing: border-box; }
        .input:focus, .select:focus, .textarea:focus { border-color: #00643C; box-shadow: 0 0 0 3px rgba(0,100,60,0.2); background: white; }
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .clear-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #e53e3e; cursor: pointer; font-size: 18px; }
        .dropdown-list { position: absolute; z-index: 50; width: 100%; background: white; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); max-height: 280px; overflow-y: auto; margin-top: 4px; }
        .dropdown-item { padding: 10px 16px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f0f2f5; }
        .dropdown-item:hover { background: #e8f5e9; }
        .selected-item { background: #dcfce7; font-weight: 600; color: #00643C; }
        .row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .half { flex: 1; min-width: 180px; }
        .checkbox-group { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
        .checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
        .file-group { display: flex; flex-direction: column; gap: 12px; }
        .file-info { display: flex; align-items: center; gap: 12px; background: #edf2f7; padding: 8px 12px; border-radius: 40px; }
        .file-name { font-size: 13px; color: #1e293b; flex: 1; }
        .remove-file { background: none; border: none; color: #e53e3e; font-size: 18px; cursor: pointer; }
        .file-hint { font-size: 12px; color: #94a3b8; margin-top: 6px; }
        .button-group { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
        .btn-primary { background: #00643C; color: white; border: none; border-radius: 40px; padding: 12px 24px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover:not(:disabled) { background: #004d2e; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,100,60,0.3); }
        .btn-secondary { background: #e2e8f0; color: #1e293b; border: none; border-radius: 40px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-secondary:hover { background: #cbd5e1; }
        .btn-success { background: #FFD966; color: #0F2B46; border: none; border-radius: 40px; padding: 12px 24px; font-size: 14px; font-weight: 700; cursor: pointer; }
        .btn-success:hover { background: #f0bc1a; }
        .btn-cancel { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 40px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-cancel:hover { background: #fee2e2; }
        .info-text { font-size: 12px; color: #64748b; margin-top: 8px; font-style: italic; }
        @media (max-width: 768px) {
          .crear-oferta-container { padding: 20px 16px; }
          .crear-oferta-card { padding: 24px 20px; }
          .page-header { flex-direction: column; align-items: stretch; }
          .header-left { flex-direction: column; align-items: flex-start; }
          .row { flex-direction: column; gap: 16px; }
        }
      `}</style>

      <div className="crear-oferta-container">
        <div className="crear-oferta-card">
          <div className="page-header">
            <div className="header-left">
              <img src="/logosena.png" alt="SENA" className="logo" />
              <h1 className="page-title">{modo === 'regular' ? 'Crear Oferta Regular' : 'Crear Oferta Campesena'}</h1>
            </div>
            <button onClick={() => setModo(null)} className="cambiar-modo-btn">← Cambiar tipo de oferta</button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* PROGRAMA DE FORMACIÓN CON BÚSQUEDA */}
            <div className="section">
              <h3 className="section-title">Programa de Formación</h3>
              <div className="form-group">
                <label className="label">Programa:</label>
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Buscar programa por nombre o código..."
                    value={busquedaPrograma}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBusquedaPrograma(val);
                      setMostrarListaPrograma(true);
                      if (formData.programa_formacion) setFormData(prev => ({ ...prev, programa_formacion: '' }));
                    }}
                    onFocus={() => setMostrarListaPrograma(true)}
                    onBlur={() => setTimeout(() => setMostrarListaPrograma(false), 200)}
                    className="input"
                    autoComplete="off"
                  />
                  {formData.programa_formacion ? (
                    <button type="button" className="clear-btn" onClick={() => { setBusquedaPrograma(''); setFormData(prev => ({ ...prev, programa_formacion: '', tipo_programa: '', horas_programa: 0, duracion_meses: 4 })); }}>✕</button>
                  ) : (
                    <span className="search-icon">🔍</span>
                  )}
                </div>
                {mostrarListaPrograma && busquedaPrograma.length > 0 && (
                  <ul className="dropdown-list">
                    {programas
                      .filter(p => p.nombre_programa.toLowerCase().includes(busquedaPrograma.toLowerCase()) || (p.codigo && p.codigo.toLowerCase().includes(busquedaPrograma.toLowerCase())))
                      .slice(0, 50)
                      .map(p => (
                        <li
                          key={p._id}
                          onMouseDown={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, programa_formacion: p._id })); setBusquedaPrograma(p.nombre_programa); setMostrarListaPrograma(false); }}
                          className={`dropdown-item ${formData.programa_formacion === p._id ? 'selected-item' : ''}`}
                        >
                          {p.nombre_programa} {p.codigo && `(${p.codigo})`}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label className="label">Modalidad:</label>
                <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="select" required>
                  <option value="">Seleccione...</option>
                  {modalidades.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Tipo de Oferta:</label>
                <select name="tipo_oferta" value={formData.tipo_oferta} onChange={handleChange} className="select" required>
                  <option value="">Seleccione...</option>
                  {tiposOferta.map(to => <option key={to._id} value={to._id}>{to.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* CUPOS */}
            <div className="section">
              <h3 className="section-title">Cupos</h3>
              <div className="form-group">
                <label className="label">Cupo Máximo:</label>
                <input type="number" name="cupo_maximo" value={formData.cupo_maximo} onChange={handleChange} className="input" placeholder="30" min="1" required />
              </div>
            </div>

            {/* AMBIENTE */}
            <div className="section">
              <h3 className="section-title">Modelo de Ambiente</h3>
              <div className="form-group">
                <label className="label">Nombre del Ambiente:</label>
                <input type="text" name="ambiente.nombre" value={formData.ambiente.nombre} onChange={handleChange} className="input" placeholder="Ej: Aula 101" required />
              </div>
            </div>

            {/* FECHAS con cálculo automático */}
            <div className="section">
              <h3 className="section-title">Fechas</h3>
              <div className="row">
                <div className="half">
                  <label className="label">Fecha Inicio:</label>
                  <input type="date" name="fechas.inicio" value={formData.fechas.inicio} onChange={handleChange} className="input" required />
                </div>
                <div className="half">
                  <label className="label">Fecha Fin:</label>
                  <input type="date" name="fechas.fin" value={formData.fechas.fin} onChange={handleChange} className="input" required />
                  {modo === 'regular' && formData.horario.dias.length > 0 && formData.horario.hora_inicio && formData.horario.hora_fin && (
                    <div className="info-text">📅 Calculada automáticamente según horario y duración del programa</div>
                  )}
                </div>
              </div>
            </div>

            {/* UBICACIÓN */}
            <div className="section">
              <h3 className="section-title">Ubicación</h3>
              <div className="form-group">
                <label className="label">Departamento:</label>
                <input type="text" name="ubicacion.departamento" value={formData.ubicacion.departamento} onChange={handleChange} className="input" placeholder="Cauca" required />
              </div>
              <div className="form-group">
                <label className="label">Municipio:</label>
                <select name="ubicacion.municipio" value={formData.ubicacion.municipio} onChange={handleChange} className="select" required>
                  <option value="">Seleccione...</option>
                  {municipios.map(mun => <option key={mun._id} value={mun._id}>{mun.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Dirección:</label>
                <input type="text" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleChange} className="input" placeholder="Calle 123 #45-67" required />
              </div>
            </div>

            {/* EMPRESA SOLICITANTE */}
            <div className="section">
              <h3 className="section-title">Empresa Solicitante</h3>
              {!mostrarFormularioEmpresa ? (
                <>
                  <div className="form-group">
                    <label className="label">Seleccionar Empresa:</label>
                    <select name="empresa_solicitante" value={formData.empresa_solicitante} onChange={handleChange} className="select" required>
                      <option value="">Seleccione una empresa...</option>
                      {empresas.map(emp => <option key={emp._id} value={emp._id}>{emp.nombre} - NIT: {emp.nit}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => setMostrarFormularioEmpresa(true)} className="btn-secondary">➕ Crear Nueva Empresa</button>
                </>
              ) : (
                <div className="sub-section">
                  <h4 className="sub-section-title">Nueva Empresa</h4>
                  <div className="form-group">
                    <label className="label">Nombre de la Empresa:</label>
                    <input type="text" name="nombre" value={nuevaEmpresa.nombre} onChange={handleNuevaEmpresaChange} className="input" />
                  </div>
                  <div className="row">
                    <div className="half">
                      <label className="label">NIT:</label>
                      <input type="text" name="nit" value={nuevaEmpresa.nit} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                    <div className="half">
                      <label className="label">Fecha Creación:</label>
                      <input type="date" name="fecha_creacion" value={nuevaEmpresa.fecha_creacion} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="half">
                      <label className="label">Tipo de Empresa:</label>
                      <select name="tipo_empresa" value={nuevaEmpresa.tipo_empresa} onChange={handleNuevaEmpresaChange} className="select">
                        <option value="Privada">Privada</option>
                        <option value="Pública">Pública</option>
                        <option value="Mixta">Mixta</option>
                        <option value="ONG">ONG</option>
                        <option value="Fundación">Fundación</option>
                        <option value="Cooperativa">Cooperativa</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="half">
                      <label className="label">Dirección:</label>
                      <input type="text" name="direccion" value={nuevaEmpresa.direccion} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                  </div>
                  <h4 className="sub-section-title">Representante Legal</h4>
                  <div className="form-group">
                    <label className="label">Nombre Completo:</label>
                    <input type="text" name="representante_legal.nombre_completo" value={nuevaEmpresa.representante_legal.nombre_completo} onChange={handleNuevaEmpresaChange} className="input" />
                  </div>
                  <div className="row">
                    <div className="half">
                      <label className="label">Documento:</label>
                      <input type="text" name="representante_legal.documento_identidad" value={nuevaEmpresa.representante_legal.documento_identidad} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                    <div className="half">
                      <label className="label">Teléfono:</label>
                      <input type="text" name="representante_legal.telefono" value={nuevaEmpresa.representante_legal.telefono} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Correo:</label>
                    <input type="email" name="representante_legal.correo" value={nuevaEmpresa.representante_legal.correo} onChange={handleNuevaEmpresaChange} className="input" />
                  </div>
                  <h4 className="sub-section-title">Contacto en la Empresa</h4>
                  <div className="form-group">
                    <label className="label">Nombre Completo:</label>
                    <input type="text" name="contacto.nombre_completo" value={nuevaEmpresa.contacto.nombre_completo} onChange={handleNuevaEmpresaChange} className="input" />
                  </div>
                  <div className="row">
                    <div className="half">
                      <label className="label">Cargo:</label>
                      <input type="text" name="contacto.cargo" value={nuevaEmpresa.contacto.cargo} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                    <div className="half">
                      <label className="label">Teléfono:</label>
                      <input type="text" name="contacto.telefono" value={nuevaEmpresa.contacto.telefono} onChange={handleNuevaEmpresaChange} className="input" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Correo:</label>
                    <input type="email" name="contacto.correo" value={nuevaEmpresa.contacto.correo} onChange={handleNuevaEmpresaChange} className="input" />
                  </div>
                  <div className="form-group">
                    <label className="label">Número de Empleados:</label>
                    <input type="number" name="numero_empleados" value={nuevaEmpresa.numero_empleados} onChange={handleNuevaEmpresaChange} className="input" min="1" />
                  </div>
                  <div className="button-group">
                    <button type="button" onClick={crearNuevaEmpresa} className="btn-success" disabled={loading}>Guardar Empresa</button>
                    <button type="button" onClick={() => setMostrarFormularioEmpresa(false)} className="btn-cancel">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* SUBSECTOR ECONÓMICO */}
            <div className="section">
              <h3 className="section-title">Subsector Económico</h3>
              <div className="form-group">
                <label className="label">Nombre:</label>
                <input type="text" name="subsector_economico.nombre" value={formData.subsector_economico.nombre} onChange={handleChange} className="input" placeholder="Ej: Tecnologías de la Información" required />
              </div>
            </div>

            {/* PROGRAMA ESPECIAL */}
            <div className="section">
              <h3 className="section-title">Programa Especial</h3>
              <div className="form-group">
                <select name="programa_especial" value={formData.programa_especial} onChange={handleChange} className="select">
                  <option value="">Ninguno</option>
                  {programasEspeciales.map(pe => <option key={pe._id} value={pe._id}>{pe.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* CONVENIO */}
            <div className="section">
              <h3 className="section-title">Convenio</h3>
              <div className="form-group">
                <label className="label">Nombre del Convenio:</label>
                <input type="text" name="convenio.nombre" value={formData.convenio.nombre} onChange={handleChange} className="input" placeholder="Nombre del convenio" required />
              </div>
            </div>

            {/* HORARIO (solo regular) */}
            {modo === 'regular' && (
              <div className="section">
                <h3 className="section-title">Horario</h3>
                <div className="row">
                  <div className="half">
                    <label className="label">Hora Inicio:</label>
                    <input type="time" name="horario.hora_inicio" value={formData.horario.hora_inicio} onChange={handleChange} className="input" required />
                  </div>
                  <div className="half">
                    <label className="label">Hora Fin:</label>
                    <input type="time" name="horario.hora_fin" value={formData.horario.hora_fin} onChange={handleChange} className="input" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Días:</label>
                  <div className="checkbox-group">
                    {diasSemana.map(dia => (
                      <label key={dia} className="checkbox-label">
                        <input type="checkbox" value={dia} checked={formData.horario.dias.includes(dia)} onChange={handleDiaChange} /> {dia}
                      </label>
                    ))}
                  </div>
                </div>
                {formData.horario.hora_inicio && formData.horario.hora_fin && formData.horario.dias.length > 0 && formData.horas_programa > 0 && (
                  <div className="info-text">
                    ⏱️ Duración del programa: <strong>{formData.horas_programa} horas</strong> ≈ <strong>{formData.duracion_meses} meses</strong>. Fecha fin calculada automáticamente.
                  </div>
                )}
              </div>
            )}

            {/* CAMPESENA */}
            {modo === 'campesena' && (
              <FormularioCampesenaCompleto formData={formData} setFormData={setFormData} />
            )}

            {/* DOCUMENTOS ADJUNTOS */}
            <div className="section">
              <h3 className="section-title">Documentos Adjuntos</h3>
              <div className="form-group file-group">
                <label className="label">Firma Digital (PDF):</label>
                <input type="file" id="firma_digital_pdf" name="firma_digital_pdf" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf" />
                <button type="button" onClick={() => document.getElementById('firma_digital_pdf').click()} className="btn-secondary">Seleccionar archivo</button>
                {formData.firma_digital_pdf && (
                  <div className="file-info">
                    <span className="file-name">{formData.firma_digital_pdf.name}</span>
                    <button type="button" onClick={() => { document.getElementById('firma_digital_pdf').value = ''; setFormData(prev => ({ ...prev, firma_digital_pdf: null })); }} className="remove-file">✕</button>
                  </div>
                )}
                <div className="file-hint">Archivo PDF con la firma digital escaneada (máx. 5MB)</div>
              </div>
              <div className="form-group file-group">
                <label className="label">Carta (PDF):</label>
                <input type="file" id="carta_pdf" name="carta_pdf" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf" />
                <button type="button" onClick={() => document.getElementById('carta_pdf').click()} className="btn-secondary">Seleccionar archivo</button>
                {formData.carta_pdf && (
                  <div className="file-info">
                    <span className="file-name">{formData.carta_pdf.name}</span>
                    <button type="button" onClick={() => { document.getElementById('carta_pdf').value = ''; setFormData(prev => ({ ...prev, carta_pdf: null })); }} className="remove-file">✕</button>
                  </div>
                )}
                <div className="file-hint">Documento PDF de la carta solicitante (máx. 5MB)</div>
              </div>
            </div>

            <div className="button-group" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Oferta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CrearOferta;