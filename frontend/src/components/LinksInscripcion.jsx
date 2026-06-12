import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LinksInscripcion = () => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUsuario(user);
    cargarMisOfertas();
  }, []);

  const cargarMisOfertas = async () => {
    try {
      const res = await api.get('/ofertas/mis-ofertas');
      setOfertas(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = (link) => {
    navigator.clipboard.writeText(`http://localhost:3000${link}`);
    setCopiado(link);
    setTimeout(() => setCopiado(null), 2000);
  };

  const descargarPDF = async (ofertaId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/ofertas/${ofertaId}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `ficha-${ofertaId}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Error al descargar el PDF');
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—';

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      fontSize: '14px',
      color: '#2d6a4f'
    }}>
      Cargando enlaces…
    </div>
  );

  return (
    <>
      <style>
        {`
          .links-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .links-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 1400px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .links-card:hover {
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
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: #fafcff;
            border-radius: 24px;
            border: 1.5px dashed #cbd5e1;
          }
          .empty-title {
            font-weight: 700;
            color: #00643C;
            margin-bottom: 8px;
            font-size: 18px;
          }
          .empty-sub {
            color: #64748b;
            font-size: 13px;
          }
          .ofertas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
            gap: 24px;
          }
          .oferta-card {
            background: white;
            border-radius: 24px;
            border: 1px solid #edf2f7;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
            transition: all 0.2s;
          }
          .oferta-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          }
          .card-top {
            padding: 20px 20px 16px;
          }
          .card-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
          }
          .card-title {
            font-weight: 700;
            font-size: 15px;
            color: #0F2B46;
            line-height: 1.4;
          }
          .cupos-badge {
            background: #e8f5e9;
            color: #2e7d32;
            border-radius: 40px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .card-meta {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .meta-item {
            font-size: 12.5px;
            color: #4a5568;
            display: flex;
            gap: 8px;
            align-items: baseline;
          }
          .meta-label {
            color: #94a3b8;
            font-weight: 600;
            min-width: 56px;
          }
          .code-badge {
            background: #edf2f7;
            color: #2d3748;
            padding: 2px 8px;
            border-radius: 8px;
            font-size: 11.5px;
            font-family: monospace;
          }
          .url-row {
            background: #f8fafc;
            padding: 12px 20px;
            border-top: 1px solid #edf2f7;
            border-bottom: 1px solid #edf2f7;
          }
          .url-text {
            font-size: 11.5px;
            color: #475569;
            font-family: monospace;
            word-break: break-all;
          }
          .btn-row {
            display: flex;
            gap: 12px;
            padding: 16px 20px;
          }
          .btn {
            flex: 1;
            padding: 8px 12px;
            border-radius: 40px;
            border: none;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
          }
          .btn-primary {
            background: #00643C;
            color: white;
          }
          .btn-primary:hover {
            background: #004d2e;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 100, 60, 0.3);
          }
          .btn-outline {
            background: transparent;
            color: #00643C;
            border: 1.5px solid #cbd5e1;
          }
          .btn-outline:hover {
            background: #e8f5e9;
            border-color: #00643C;
          }
          .btn-pdf {
            background: #FFD966;
            color: #0F2B46;
            flex: 0 0 auto;
            padding: 8px 20px;
          }
          .btn-pdf:hover {
            background: #f0bc1a;
            transform: translateY(-1px);
          }
          .btn-copied {
            background: #2e7d32;
            color: white;
          }
          @media (max-width: 768px) {
            .links-card {
              padding: 20px 16px;
            }
            .page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
            .ofertas-grid {
              grid-template-columns: 1fr;
            }
            .btn-row {
              flex-wrap: wrap;
            }
            .btn-pdf {
              flex: 1;
            }
          }
        `}
      </style>

      <div className="links-container">
        <div className="links-card">
          <div className="page-header">
            <img src="/logosena.png" alt="SENA" className="logo" />
            <div>
              <h1 className="page-title">Links de Inscripción</h1>
              <p className="page-sub">
                Comparte estos enlaces para que los aspirantes se inscriban directamente a cada oferta.
              </p>
            </div>
          </div>

          {ofertas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Sin ofertas registradas</div>
              <div className="empty-sub">
                Crea tu primera oferta para obtener el link de inscripción.
              </div>
            </div>
          ) : (
            <div className="ofertas-grid">
              {ofertas.map(oferta => {
                const copied = copiado === oferta.link_inscripciones;
                const url = `localhost:3000${oferta.link_inscripciones || '/inscribirse/error'}`;
                return (
                  <div key={oferta._id} className="oferta-card">
                    <div className="card-top">
                      <div className="card-title-row">
                        <span className="card-title">
                          {oferta.programa_formacion?.nombre_programa || 'Programa sin nombre'}
                        </span>
                        <span className="cupos-badge">
                          {oferta.cupos_disponibles}/{oferta.cupo_maximo} cupos
                        </span>
                      </div>
                      <div className="card-meta">
                        <div className="meta-item">
                          <span className="meta-label">Código</span>
                          <code className="code-badge">{oferta.programa_formacion?.codigo || '—'}</code>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Fechas</span>
                          {fmt(oferta.fechas?.inicio)} – {fmt(oferta.fechas?.fin)}
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Municipio</span>
                          {oferta.ubicacion?.municipio?.nombre || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="url-row">
                      <div className="url-text">{url}</div>
                    </div>

                    <div className="btn-row">
                      <button
                        onClick={() => copiarLink(oferta.link_inscripciones)}
                        className={`btn ${copied ? 'btn-primary btn-copied' : 'btn-primary'}`}
                      >
                        {copied ? '✓ Copiado' : 'Copiar link'}
                      </button>
                      <button
                        onClick={() => window.open(`http://localhost:3000${oferta.link_inscripciones}`, '_blank')}
                        className="btn btn-outline"
                      >
                        Abrir
                      </button>
                      <button
                        onClick={() => descargarPDF(oferta._id)}
                        className="btn btn-pdf"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LinksInscripcion;