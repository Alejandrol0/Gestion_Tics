import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SolicitarOferta = () => {
  const [ofertas, setOfertas] = useState([]);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [coordinador, setCoordinador] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [archivos, setArchivos] = useState({
    ficha: null, carta: null, excel: null, cedulas: null,
  });

  useEffect(() => {
    cargarOfertas();
    cargarCoordinador();
  }, []);

  const cargarOfertas = async () => {
    try {
      const res = await api.get('/ofertas/mis-ofertas');
      setOfertas(res.data.data || []);
    } catch { setError('Error al cargar las ofertas'); }
  };

  const cargarCoordinador = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.coordinadorAsignado) {
        setCoordinador(user.coordinadorAsignado);
      } else {
        const res = await api.get('/usuarios/coordinador');
        setCoordinador(res.data.data);
      }
    } catch { console.error('Error cargando coordinador'); }
  };

  const cargarInscritos = async (ofertaId) => {
    try {
      const res = await api.get(`/inscripciones/oferta/${ofertaId}`);
      setInscritos(res.data.data || []);
    } catch { console.error('Error cargando inscritos'); }
  };

  const handleOfertaChange = async e => {
    const id = e.target.value;
    if (!id) { setOfertaSeleccionada(null); setInscritos([]); return; }
    const oferta = ofertas.find(o => o._id === id);
    setOfertaSeleccionada(oferta);
    await cargarInscritos(id);
  };

  const handleArchivo = (campo, e) =>
    setArchivos({ ...archivos, [campo]: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!ofertaSeleccionada) return setError('Debe seleccionar una oferta');
    setLoading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('oferta_id', ofertaSeleccionada._id);
      fd.append('mensaje', mensaje);
      Object.entries(archivos).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await api.post('/solicitudes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Solicitud enviada correctamente. Tu coordinador recibirá una notificación.');
      setMensaje('');
      setArchivos({ ficha: null, carta: null, excel: null, cedulas: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const docs = [
    { key: 'ficha',   label: 'Ficha de caracterización',  desc: 'Documento PDF de la ficha' },
    { key: 'carta',   label: 'Carta de solicitud',        desc: 'Carta firmada dirigida al coordinador' },
    { key: 'excel',   label: 'Listado de inscritos',      desc: 'Archivo Excel con los datos' },
    { key: 'cedulas', label: 'Cédulas de inscritos',      desc: 'Carpeta ZIP o PDF compilado' },
  ];

  return (
    <>
      <style>
        {`
          .solicitar-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .solicitar-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 800px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .solicitar-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 28px 48px rgba(0, 0, 0, 0.12), 0 12px 28px rgba(0, 100, 60, 0.15);
          }
          .page-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 28px;
            border-bottom: 2px solid #eef2f6;
            padding-bottom: 20px;
          }
          .logo {
            width: 56px;
            height: auto;
          }
          .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #00643C;
            margin: 0;
          }
          .page-sub {
            font-size: 14px;
            color: #5a6e7c;
            margin: 6px 0 0;
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
            padding: 12px 18px;
            font-size: 13px;
            margin-bottom: 24px;
          }
          .coord-card {
            background: #e8f5e9;
            border: 1px solid #c8e6d9;
            border-radius: 28px;
            padding: 18px 22px;
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 28px;
          }
          .coord-icon {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #00643C;
            color: #FFD966;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 18px;
            flex-shrink: 0;
          }
          .coord-label {
            font-size: 11px;
            font-weight: 700;
            color: #2d6a4f;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 4px;
          }
          .coord-name {
            font-size: 16px;
            font-weight: 700;
            color: #0F2B46;
            margin: 0 0 2px;
          }
          .coord-email {
            font-size: 13px;
            color: #4a5568;
            margin: 0;
          }
          .form-card {
            background: white;
            border-radius: 28px;
            border: 1px solid #edf2f7;
            padding: 0;
            margin-top: 0;
          }
          .section {
            margin-bottom: 28px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 800;
            color: #00643C;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #eef2f6;
          }
          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
          }
          .field-label {
            font-size: 13px;
            font-weight: 600;
            color: #2d3748;
          }
          .input, .select {
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 20px;
            font-size: 14px;
            font-family: inherit;
            background: #fefefe;
            transition: all 0.2s;
            outline: none;
            width: 100%;
            box-sizing: border-box;
          }
          .input:focus, .select:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
            background: white;
          }
          .oferta-preview {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 12px;
            margin-top: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
          }
          .preview-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .preview-label {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .preview-value {
            font-size: 14px;
            font-weight: 600;
            color: #0F2B46;
          }
          .docs-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .doc-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            gap: 16px;
          }
          .doc-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .doc-title {
            font-weight: 700;
            font-size: 13.5px;
            color: #1e293b;
          }
          .doc-desc {
            font-size: 12px;
            color: #94a3b8;
          }
          .upload-btn {
            padding: 6px 18px;
            background: transparent;
            border: 1.5px solid #cbd5e1;
            border-radius: 40px;
            color: #475569;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
          }
          .upload-btn:hover {
            background: #edf2f7;
            border-color: #00643C;
          }
          .upload-done {
            background: #e8f5e9;
            border-color: #2e7d32;
            color: #2e7d32;
          }
          .textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 20px;
            font-size: 14px;
            font-family: inherit;
            background: #fefefe;
            resize: vertical;
            transition: all 0.2s;
            outline: none;
            box-sizing: border-box;
          }
          .textarea:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
          }
          .submit-btn {
            width: 100%;
            padding: 14px;
            background: #00643C;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 12px;
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
            .solicitar-container {
              padding: 20px 16px;
            }
            .solicitar-card {
              padding: 24px 20px;
            }
            .page-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .doc-item {
              flex-direction: column;
              align-items: stretch;
            }
            .upload-btn {
              text-align: center;
            }
          }
        `}
      </style>

      <div className="solicitar-container">
        <div className="solicitar-card">
          <div className="page-header">
            <img src="/logosena.png" alt="SENA" className="logo" />
            <div>
              <h1 className="page-title">Enviar Solicitud de Validación</h1>
              <p className="page-sub">
                Envía la documentación de tu oferta al coordinador para su revisión y aprobación.
              </p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {/* Tarjeta del coordinador */}
          {coordinador && (
            <div className="coord-card">
              <div className="coord-icon">
                {((coordinador.nombre?.[0] || '') + (coordinador.apellido?.[0] || '')).toUpperCase() || 'C'}
              </div>
              <div>
                <p className="coord-label">Tu coordinador asignado</p>
                <p className="coord-name">{coordinador.nombre || 'Coordinador'}</p>
                {coordinador.correoElectronico && (
                  <p className="coord-email">{coordinador.correoElectronico}</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Sección: Oferta */}
            <div className="section">
              <h3 className="section-title">Oferta a solicitar</h3>
              <div className="field">
                <label className="field-label">Selecciona la oferta</label>
                <select onChange={handleOfertaChange} className="select" required>
                  <option value="">Elige una oferta…</option>
                  {ofertas.map(o => (
                    <option key={o._id} value={o._id}>
                      {o.programa_formacion?.nombre_programa} — {o.programa_formacion?.codigo}
                    </option>
                  ))}
                </select>
              </div>

              {ofertaSeleccionada && (
                <div className="oferta-preview">
                  <div className="preview-item">
                    <span className="preview-label">Programa</span>
                    <span className="preview-value">{ofertaSeleccionada.programa_formacion?.nombre_programa || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Código</span>
                    <span className="preview-value">{ofertaSeleccionada.programa_formacion?.codigo || '—'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Inicio</span>
                    <span className="preview-value">{fmt(ofertaSeleccionada.fechas?.inicio)}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Fin</span>
                    <span className="preview-value">{fmt(ofertaSeleccionada.fechas?.fin)}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Inscritos</span>
                    <span className="preview-value">{inscritos.length}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Cupo máximo</span>
                    <span className="preview-value">{ofertaSeleccionada.cupo_maximo ?? '—'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Documentos */}
            <div className="section">
              <h3 className="section-title">Documentos adjuntos</h3>
              <div className="docs-list">
                {docs.map(d => (
                  <div key={d.key} className="doc-item">
                    <div className="doc-info">
                      <span className="doc-title">{d.label}</span>
                      <span className="doc-desc">{d.desc}</span>
                    </div>
                    <div>
                      <input
                        type="file"
                        id={`file-${d.key}`}
                        style={{ display: 'none' }}
                        onChange={e => handleArchivo(d.key, e)}
                      />
                      <label
                        htmlFor={`file-${d.key}`}
                        className={`upload-btn ${archivos[d.key] ? 'upload-done' : ''}`}
                      >
                        {archivos[d.key] ? '✓ Cargado' : 'Adjuntar'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección: Mensaje */}
            <div className="section">
              <h3 className="section-title">Mensaje al coordinador (opcional)</h3>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                rows={4}
                className="textarea"
                placeholder="Agrega cualquier comentario o aclaración para tu coordinador…"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Enviando solicitud…' : 'Enviar solicitud de validación'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SolicitarOferta;