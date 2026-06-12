import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const FormularioInscripcion = () => {
  const { codigo } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [caracterizaciones, setCaracterizaciones] = useState([]);
  const [oferta, setOferta] = useState(null);

  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', tipo_documento: '',
    numero_documento: '', caracterizacion: '',
    telefono: '', correo: '', pdf_cedula: null,
  });

  useEffect(() => {
    cargarDatosIniciales();
    cargarInfoOferta();
  }, [codigo]);

  const cargarDatosIniciales = async () => {
    try {
      const [tiposRes, caracRes] = await Promise.all([
        api.get('/tipos-documento'),
        api.get('/caracterizaciones'),
      ]);
      setTiposDocumento(Array.isArray(tiposRes.data.data) ? tiposRes.data.data : []);
      setCaracterizaciones(Array.isArray(caracRes.data.data) ? caracRes.data.data : []);
    } catch {
      setError('Error al cargar datos del formulario');
    }
  };

  const cargarInfoOferta = async () => {
    try {
      const res = await api.get(`/ofertas/link/${codigo}`);
      setOferta(res.data.data);
    } catch {
      setError('Link de inscripción no válido');
    } finally {
      setLoadingDatos(false);
    }
  };

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = e =>
    setFormData({ ...formData, pdf_cedula: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (!formData.nombres) throw new Error('Los nombres son obligatorios');
      if (!formData.apellidos) throw new Error('Los apellidos son obligatorios');
      if (!formData.tipo_documento) throw new Error('Seleccione un tipo de documento');
      if (!formData.numero_documento) throw new Error('El número de documento es obligatorio');
      if (!formData.caracterizacion) throw new Error('Seleccione una caracterización');
      if (!formData.telefono) throw new Error('El teléfono es obligatorio');
      if (!formData.correo) throw new Error('El correo es obligatorio');
      if (!formData.pdf_cedula) throw new Error('La cédula escaneada es obligatoria');

      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));

      await api.post(`/inscripciones/oferta/${codigo}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('¡Inscripción registrada exitosamente! Te notificaremos por correo.');
      setFormData({ nombres: '', apellidos: '', tipo_documento: '',
        numero_documento: '', caracterizacion: '', telefono: '', correo: '', pdf_cedula: null });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loadingDatos) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#00643C',
          borderRadius: '50%',
          margin: '0 auto 16px',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#2d6a4f' }}>Cargando información de la oferta…</p>
      </div>
    </div>
  );

  if (!oferta) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="error-box">El link de inscripción no es válido o ha expirado.</div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes spin { to { transform: rotate(360deg); } }
          .inscripcion-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            display: flex;
            justify-content: center;
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .inscripcion-wrapper {
            max-width: 800px;
            width: 100%;
          }
          .oferta-card {
            background: linear-gradient(145deg, #00643C 0%, #004d2e 100%);
            border-radius: 32px;
            padding: 28px 32px;
            margin-bottom: 28px;
            color: white;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          }
          .oferta-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          .logo-sena-blanco {
            width: 40px;
            height: auto;
            filter: brightness(0) invert(1);
          }
          .oferta-brand {
            font-size: 13px;
            letter-spacing: 0.03em;
            opacity: 0.8;
          }
          .oferta-titulo {
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 20px;
          }
          .oferta-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .meta-label {
            font-size: 11px;
            text-transform: uppercase;
            opacity: 0.7;
            letter-spacing: 0.05em;
          }
          .meta-value {
            font-weight: 700;
            font-size: 15px;
          }
          .code-value {
            background: rgba(255,255,255,0.2);
            padding: 2px 10px;
            border-radius: 40px;
            font-family: monospace;
            font-size: 13px;
          }
          .form-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .form-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 28px 48px rgba(0, 0, 0, 0.12), 0 12px 28px rgba(0, 100, 60, 0.15);
          }
          .form-title {
            font-size: 26px;
            font-weight: 700;
            color: #00643C;
            margin: 0 0 6px;
          }
          .form-sub {
            font-size: 14px;
            color: #5a6e7c;
            margin-bottom: 28px;
          }
          .error-box {
            background: #fff5f5;
            border-left: 4px solid #e53e3e;
            color: #c53030;
            border-radius: 20px;
            padding: 12px 18px;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .success-box {
            background: #e8f5e9;
            border-left: 4px solid #2e7d32;
            color: #1b5e20;
            border-radius: 20px;
            padding: 16px 20px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 24px;
          }
          .form-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .field {
            flex: 1;
            min-width: 180px;
          }
          .field-label {
            font-size: 13px;
            font-weight: 600;
            color: #2d3748;
            display: block;
            margin-bottom: 6px;
          }
          .input, .select {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 20px;
            font-size: 14px;
            font-family: inherit;
            background: #fefefe;
            transition: all 0.2s;
            outline: none;
          }
          .input:focus, .select:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
            background: white;
          }
          .file-area {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .file-label {
            background: white;
            border: 1.5px dashed #cbd5e1;
            border-radius: 40px;
            padding: 10px 20px;
            font-size: 13px;
            color: #4a5568;
            cursor: pointer;
            transition: all 0.2s;
          }
          .file-label:hover {
            background: #f7fafc;
            border-color: #00643C;
          }
          .file-ok {
            color: #2e7d32;
            font-weight: 600;
            font-size: 13px;
          }
          .submit-btn {
            width: 100%;
            padding: 14px;
            background: #00643C;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 8px;
          }
          .submit-btn:hover:not(:disabled) {
            background: #004d2e;
            transform: translateY(-1px);
            box-shadow: 0 8px 18px rgba(0, 100, 60, 0.3);
          }
          .submit-btn:disabled {
            background: #9bb7a8;
            cursor: not-allowed;
          }
          @media (max-width: 640px) {
            .inscripcion-container {
              padding: 20px 16px;
            }
            .form-card {
              padding: 24px 20px;
            }
            .oferta-card {
              padding: 20px;
            }
            .row {
              flex-direction: column;
              gap: 16px;
            }
          }
        `}
      </style>

      <div className="inscripcion-container">
        <div className="inscripcion-wrapper">
          {/* Tarjeta de la oferta */}
          <div className="oferta-card">
            <div className="oferta-header">
              <img src="/logosena.png" alt="SENA" className="logo-sena-blanco" />
              <span className="oferta-brand">SENA · Inscripción</span>
            </div>
            <h3 className="oferta-titulo">{oferta.programa_formacion?.nombre_programa}</h3>
            <div className="oferta-meta">
              <div className="meta-item">
                <span className="meta-label">Código</span>
                <code className="code-value">{oferta.programa_formacion?.codigo || '—'}</code>
              </div>
              <div className="meta-item">
                <span className="meta-label">Cupos disponibles</span>
                <span className="meta-value">{oferta.cupos_disponibles}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Inicio</span>
                <span className="meta-value">{fmt(oferta.fechas?.inicio)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Cierre</span>
                <span className="meta-value">{fmt(oferta.fechas?.fin)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Municipio</span>
                <span className="meta-value">{oferta.ubicacion?.municipio?.nombre || '—'}</span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="form-card">
            <h2 className="form-title">Formulario de Inscripción</h2>
            <p className="form-sub">Completa todos los campos para registrar tu inscripción.</p>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">{success}</div>}

            {!success && (
              <form onSubmit={handleSubmit} className="form-grid">
                <div className="row">
                  <div className="field">
                    <label className="field-label">Nombres</label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      className="input"
                      placeholder="Juan Carlos"
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Apellidos</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      className="input"
                      placeholder="Pérez González"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="field">
                    <label className="field-label">Tipo de documento</label>
                    <select
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      className="select"
                      required
                    >
                      <option value="">Seleccione…</option>
                      {tiposDocumento.map(t => (
                        <option key={t._id} value={t._id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">Número de documento</label>
                    <input
                      type="text"
                      name="numero_documento"
                      value={formData.numero_documento}
                      onChange={handleChange}
                      className="input"
                      placeholder="123456789"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Caracterización</label>
                  <select
                    name="caracterizacion"
                    value={formData.caracterizacion}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value="">Seleccione…</option>
                    {caracterizaciones.map(c => (
                      <option key={c._id} value={c._id}>{c.tipo_caracterizacion}</option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="field">
                    <label className="field-label">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="input"
                      placeholder="3001234567"
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Correo electrónico</label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      className="input"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Cédula escaneada (PDF)</label>
                  <div className="file-area">
                    <input
                      type="file"
                      name="pdf_cedula"
                      accept=".pdf"
                      onChange={handleFile}
                      style={{ display: 'none' }}
                      id="pdf-cedula"
                      required
                    />
                    <label htmlFor="pdf-cedula" className="file-label">
                      {formData.pdf_cedula ? formData.pdf_cedula.name : 'Seleccionar archivo PDF…'}
                    </label>
                    {formData.pdf_cedula && (
                      <span className="file-ok">✓ Archivo seleccionado</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? 'Procesando inscripción…' : 'Confirmar inscripción'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FormularioInscripcion;