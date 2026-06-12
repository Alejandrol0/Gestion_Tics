import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RevisarSolicitud = ({ solicitudId, onClose, onActualizar }) => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [archivos, setArchivos] = useState({
    ficha: false,
    carta: false,
    excel: false,
    cedulas: false
  });

  useEffect(() => {
    if (solicitudId) cargarSolicitud();
  }, [solicitudId]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/solicitudes/${solicitudId}`);
      const data = response.data.data;
      setSolicitud(data);
      try {
        const archivosRes = await api.get(`/solicitudes/${solicitudId}/archivos`);
        setArchivos(archivosRes.data.data);
      } catch { console.log('No se pudieron verificar archivos'); }
    } catch (error) {
      setError('Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    try {
      setEnviando(true);
      await api.put(`/solicitudes/${solicitudId}/aprobar`, {
        comentarios: 'Aprobada por coordinador'
      });
      if (onActualizar) onActualizar();
      if (onClose) onClose();
    } catch (error) {
      setError('Error al aprobar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  const handleRechazar = async () => {
    if (!observaciones.trim()) {
      setError('Debe escribir una observación explicando el motivo del rechazo');
      return;
    }
    try {
      setEnviando(true);
      await api.put(`/solicitudes/${solicitudId}/rechazar`, {
        comentarios: observaciones
      });
      if (onActualizar) onActualizar();
      if (onClose) onClose();
    } catch (error) {
      setError('Error al rechazar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  const descargarArchivo = async (tipo) => {
    try {
      const response = await api.get(`/solicitudes/${solicitudId}/descargar/${tipo}`, {
        responseType: 'blob'
      });
      let extension = '.pdf';
      const contentType = response.headers['content-type'];
      if (contentType && (contentType.includes('spreadsheet') || contentType.includes('excel'))) extension = '.xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}_${solicitud?.oferta_id?.programa_formacion?.codigo}${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error descargando:', error);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO') + ' ' + date.toLocaleTimeString('es-CO');
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #e2e8f0',
        borderTopColor: '#00643C',
        borderRadius: '50%',
        margin: '0 auto 16px',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p>Cargando solicitud...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px' }}>
      <div className="error-box">❌ {error}</div>
      <button onClick={onClose} className="btn-secondary" style={{ marginTop: '16px' }}>Cerrar</button>
    </div>
  );

  if (!solicitud) return (
    <div style={{ padding: '20px' }}>
      <div className="no-data">Solicitud no encontrada</div>
      <button onClick={onClose} className="btn-secondary" style={{ marginTop: '16px' }}>Cerrar</button>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .revisar-container {
          background: white;
          border-radius: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          font-family: 'Segoe UI', 'Roboto', sans-serif;
        }
        .modal-header {
          background: linear-gradient(145deg, #00643C 0%, #004d2e 100%);
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        .modal-title {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }
        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: rotate(90deg);
        }
        .section {
          padding: 24px;
          border-bottom: 1px solid #eef2f6;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #00643C;
          margin: 0 0 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid #FFD966;
          display: inline-block;
        }
        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 20px;
        }
        .info-icon {
          font-size: 24px;
        }
        .info-content {
          flex: 1;
        }
        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }
        .info-value {
          font-size: 15px;
          font-weight: 700;
          color: #0F2B46;
          margin-top: 2px;
        }
        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          padding: 10px 16px;
          border-radius: 16px;
        }
        .detail-label {
          font-weight: 600;
          color: #334155;
        }
        .estado-badge {
          background: #f39c12;
          color: white;
          padding: 4px 12px;
          border-radius: 40px;
          font-size: 12px;
          font-weight: 700;
        }
        .mensaje-box {
          background: #fefce8;
          border-left: 4px solid #FFD966;
          padding: 12px 16px;
          border-radius: 16px;
          margin-top: 8px;
          font-style: italic;
          color: #334155;
        }
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }
        .doc-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 40px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .doc-btn.available {
          background: #f0fdf4;
          border-color: #00643C;
          color: #00643C;
        }
        .doc-btn.available:hover {
          background: #dcfce7;
          transform: translateY(-1px);
        }
        .doc-btn.disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
          opacity: 0.6;
        }
        .doc-icon {
          font-size: 20px;
        }
        .doc-check {
          margin-left: auto;
          color: #2e7d32;
        }
        .archivos-nota {
          font-size: 12px;
          color: #64748b;
          margin-top: 8px;
        }
        .observaciones-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .label {
          font-weight: 700;
          color: #2d3748;
        }
        .textarea {
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 20px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s;
        }
        .textarea:focus {
          outline: none;
          border-color: #00643C;
          box-shadow: 0 0 0 3px rgba(0,100,60,0.2);
        }
        .btn-rechazar {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 40px;
          padding: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }
        .btn-rechazar:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
        }
        .btn-aprobar {
          background: #00643C;
          color: white;
          border: none;
          border-radius: 40px;
          padding: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }
        .btn-aprobar:hover:not(:disabled) {
          background: #004d2e;
          transform: translateY(-1px);
        }
        .btn-secondary {
          background: #e2e8f0;
          border: none;
          border-radius: 40px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: #cbd5e1;
        }
        .button-disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .nota {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          margin-top: 12px;
        }
        .error-box {
          background: #fff5f5;
          border-left: 4px solid #e53e3e;
          padding: 12px 16px;
          border-radius: 16px;
          color: #c53030;
          margin-bottom: 16px;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
        @media (max-width: 640px) {
          .section {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .docs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="revisar-container">
        <div className="modal-header">
          <h2 className="modal-title">📋 Revisar Solicitud de Validación</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Información de la oferta */}
        <div className="section">
          <h3 className="section-title">Información de la Oferta</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-icon">📌</span>
              <div className="info-content">
                <div className="info-label">Código</div>
                <div className="info-value">{solicitud.oferta_id?.programa_formacion?.codigo}</div>
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">🎓</span>
              <div className="info-content">
                <div className="info-label">Programa</div>
                <div className="info-value">{solicitud.oferta_id?.programa_formacion?.nombre_programa}</div>
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">👤</span>
              <div className="info-content">
                <div className="info-label">Instructor</div>
                <div className="info-value">{solicitud.instructor_id?.nombre} {solicitud.instructor_id?.apellido}</div>
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">📧</span>
              <div className="info-content">
                <div className="info-label">Email</div>
                <div className="info-value">{solicitud.instructor_id?.correoElectronico}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la solicitud */}
        <div className="section">
          <h3 className="section-title">Detalles de la Solicitud</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <span className="detail-label">📅 Fecha Solicitud:</span>
              <span>{formatFecha(solicitud.fecha_solicitud)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🏷️ Tipo de Programa:</span>
              <span>{solicitud.oferta_id?.es_campesena ? 'Campesena' : 'Regular'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🚪 Tipo de Oferta:</span>
              <span>{solicitud.oferta_id?.tipo_oferta?.nombre}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📊 Estado Actual:</span>
              <span className="estado-badge">PENDIENTE</span>
            </div>
            {solicitud.mensaje && (
              <div className="mensaje-box">
                <strong>💬 Mensaje del instructor:</strong>
                <div style={{ marginTop: '8px' }}>{solicitud.mensaje}</div>
              </div>
            )}
          </div>
        </div>

        {/* Documentos adjuntos */}
        <div className="section">
          <h3 className="section-title">📎 Documentos Adjuntos</h3>
          <div className="docs-grid">
            {[
              { key: 'ficha', label: 'Ficha', icon: '📄' },
              { key: 'carta', label: 'Carta', icon: '📋' },
              { key: 'excel', label: 'Excel', icon: '📊' },
              { key: 'cedulas', label: 'Cédulas PDF', icon: '📑' }
            ].map(doc => (
              <button
                key={doc.key}
                onClick={() => descargarArchivo(doc.key)}
                disabled={!archivos[doc.key]}
                className={`doc-btn ${archivos[doc.key] ? 'available' : 'disabled'}`}
              >
                <span className="doc-icon">{doc.icon}</span>
                <span>{doc.label}</span>
                {archivos[doc.key] && <span className="doc-check">✓</span>}
              </button>
            ))}
          </div>
          <p className="archivos-nota">* Revise que todos los documentos estén completos antes de rechazar</p>
        </div>

        {/* Rechazar solicitud */}
        <div className="section">
          <h3 className="section-title">❌ Rechazar Solicitud</h3>
          <div className="observaciones-group">
            <label className="label">📝 Motivo del rechazo (obligatorio):</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="textarea"
              rows="4"
              placeholder="Indique qué documentos faltan o qué debe corregir el instructor..."
            />
          </div>
          <button
            onClick={handleRechazar}
            disabled={enviando || !observaciones.trim()}
            className={`btn-rechazar ${(enviando || !observaciones.trim()) ? 'button-disabled' : ''}`}
          >
            {enviando ? 'Rechazando...' : '❌ Rechazar solicitud'}
          </button>
          <p className="nota">⚠️ Al rechazar, el instructor recibirá tus comentarios y deberá corregir los documentos.</p>
        </div>

        {/* Aprobar solicitud */}
        <div className="section" style={{ borderBottom: 'none' }}>
          <h3 className="section-title">✅ Aprobar Solicitud</h3>
          <p style={{ marginBottom: '16px', color: '#334155' }}>
            Si todos los documentos están completos y correctos, aprueba la solicitud para que pase al funcionario correspondiente.
          </p>
          <button
            onClick={handleAprobar}
            disabled={enviando}
            className={`btn-aprobar ${enviando ? 'button-disabled' : ''}`}
          >
            {enviando ? 'Aprobando...' : '✅ Aprobar solicitud'}
          </button>
          <p className="nota">⚠️ Al aprobar, la oferta pasará al funcionario para que cree la ficha en Sofía Plus.</p>
        </div>
      </div>
    </>
  );
};

export default RevisarSolicitud;