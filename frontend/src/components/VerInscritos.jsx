import React, { useState, useEffect } from 'react';
import api from '../services/api';

const VerInscritos = () => {
  const [ofertas, setOfertas] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarOfertas();
  }, []);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ofertas/mis-ofertas');
      setOfertas(res.data.data || []);
    } catch {
      setError('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const cargarInscritos = async (ofertaId) => {
    try {
      setLoading(true);
      const res = await api.get(`/inscripciones/oferta/${ofertaId}`);
      setInscritos(res.data.data || []);
      setOfertaSeleccionada(ofertas.find((o) => o._id === ofertaId) || null);
      setBusqueda('');
    } catch {
      setError('Error al cargar los inscritos');
    } finally {
      setLoading(false);
    }
  };

  const exportarCompleto = async () => {
    if (!ofertaSeleccionada) return;
    try {
      setExportando(true);
      const res = await api.get(
        `/inscripciones/oferta/${ofertaSeleccionada._id}/exportar/completo`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `inscritos_${ofertaSeleccionada.programa_formacion?.codigo}.xlsx`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess('Excel exportado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al exportar los datos');
    } finally {
      setExportando(false);
    }
  };

  const filtrados = inscritos.filter((i) =>
    `${i.nombres} ${i.apellidos} ${i.numero_documento}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  return (
    <>
      <style>
        {`
          .ver-inscritos-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6d9 100%);
            padding: 40px 24px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          }
          .ver-inscritos-card {
            background: white;
            border-radius: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 100, 60, 0.1);
            padding: 32px 36px;
            max-width: 1400px;
            margin: 0 auto;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .ver-inscritos-card:hover {
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
          .selector-card {
            background: #f8fafc;
            border-radius: 28px;
            padding: 20px 24px;
            margin-bottom: 28px;
            border: 1px solid #e2e8f0;
          }
          .selector-label {
            font-size: 13px;
            font-weight: 700;
            color: #00643C;
            display: block;
            margin-bottom: 8px;
          }
          .select {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 40px;
            font-size: 14px;
            font-family: inherit;
            background: white;
            transition: all 0.2s;
            outline: none;
            cursor: pointer;
          }
          .select:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
          }
          .oferta-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(145deg, #00643C 0%, #004d2e 100%);
            border-radius: 28px;
            padding: 16px 24px;
            margin-bottom: 24px;
            gap: 16px;
            flex-wrap: wrap;
          }
          .oferta-nombre {
            font-weight: 800;
            font-size: 18px;
            color: white;
            margin: 0;
          }
          .oferta-meta {
            font-size: 13px;
            color: #d1f2e6;
            margin-top: 4px;
            display: block;
          }
          .export-btn {
            padding: 10px 24px;
            background: #FFD966;
            color: #0F2B46;
            border: none;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }
          .export-btn:hover:not(:disabled) {
            background: #f0bc1a;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .export-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .search-input {
            width: 100%;
            padding: 12px 18px;
            border: 1.5px solid #e2e8f0;
            border-radius: 40px;
            font-size: 14px;
            color: #1e293b;
            outline: none;
            background: #fefefe;
            margin-bottom: 24px;
            transition: all 0.2s;
          }
          .search-input:focus {
            border-color: #00643C;
            box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
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
          .table-wrapper {
            background: white;
            border-radius: 24px;
            border: 1px solid #edf2f7;
            overflow-x: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          }
          .inscritos-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
          }
          .table-header {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .table-header th {
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: #2d3748;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .table-row {
            border-bottom: 1px solid #f0f2f5;
            transition: background 0.1s;
          }
          .table-row:hover {
            background: #fefce8;
          }
          .table-cell {
            padding: 12px 16px;
            font-size: 13.5px;
            color: #1a202c;
            vertical-align: middle;
          }
          .numero-cell {
            color: #94a3b8;
            font-weight: 600;
            width: 50px;
          }
          .nombre-cell {
            font-weight: 600;
            color: #0F2B46;
          }
          .code-badge {
            background: #edf2f7;
            color: #2d3748;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-family: monospace;
          }
          .email-cell {
            color: #2b6cb0;
          }
          .fecha-cell {
            color: #718096;
          }
          @media (max-width: 768px) {
            .ver-inscritos-container {
              padding: 20px 16px;
            }
            .ver-inscritos-card {
              padding: 24px 20px;
            }
            .page-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .oferta-banner {
              flex-direction: column;
              align-items: flex-start;
            }
            .export-btn {
              width: 100%;
              text-align: center;
            }
          }
        `}
      </style>

      <div className="ver-inscritos-container">
        <div className="ver-inscritos-card">
          <div className="page-header">
            <img src="/logosena.png" alt="SENA" className="logo" />
            <div>
              <h1 className="page-title">Ver Inscritos</h1>
              <p className="page-sub">Consulta y exporta el listado de aspirantes inscritos por oferta.</p>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {/* Selector de oferta */}
          <div className="selector-card">
            <label className="selector-label">Selecciona una oferta</label>
            <select
              onChange={(e) => {
                if (e.target.value) cargarInscritos(e.target.value);
              }}
              className="select"
              disabled={loading}
            >
              <option value="">Elige una oferta para ver sus inscritos…</option>
              {ofertas.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.programa_formacion?.nombre_programa} — {o.programa_formacion?.codigo}
                </option>
              ))}
            </select>
          </div>

          {ofertaSeleccionada && (
            <>
              <div className="oferta-banner">
                <div>
                  <div className="oferta-nombre">
                    {ofertaSeleccionada.programa_formacion?.nombre_programa}
                  </div>
                  <span className="oferta-meta">
                    {inscritos.length} inscrito{inscritos.length !== 1 ? 's' : ''} · Cupo máx:{' '}
                    {ofertaSeleccionada.cupo_maximo}
                  </span>
                </div>
                <button
                  onClick={exportarCompleto}
                  disabled={exportando || inscritos.length === 0}
                  className="export-btn"
                >
                  {exportando ? 'Exportando…' : 'Exportar Excel'}
                </button>
              </div>

              {inscritos.length > 0 && (
                <input
                  type="text"
                  placeholder="Buscar por nombre o documento…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="search-input"
                />
              )}

              {inscritos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">Sin inscritos</div>
                  <div className="empty-sub">
                    Aún no hay aspirantes inscritos en esta oferta.
                  </div>
                </div>
              ) : filtrados.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">Sin resultados</div>
                  <div className="empty-sub">
                    Ningún inscrito coincide con "{busqueda}".
                  </div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="inscritos-table">
                    <thead className="table-header">
                      <tr>
                        <th>#</th>
                        <th>Nombre completo</th>
                        <th>Documento</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Caracterización</th>
                        <th>Fecha inscripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map((i, idx) => (
                        <tr key={i._id} className="table-row">
                          <td className="table-cell numero-cell">{idx + 1}</td>
                          <td className="table-cell nombre-cell">
                            {i.nombres} {i.apellidos}
                          </td>
                          <td className="table-cell">
                            <code className="code-badge">{i.numero_documento}</code>
                          </td>
                          <td className="table-cell">{i.telefono || '—'}</td>
                          <td className="table-cell email-cell">{i.correo || '—'}</td>
                          <td className="table-cell">
                            {i.caracterizacion?.tipo_caracterizacion || '—'}
                          </td>
                          <td className="table-cell fecha-cell">{fmt(i.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!ofertaSeleccionada && !loading && (
            <div className="empty-state">
              <div className="empty-title">Selecciona una oferta</div>
              <div className="empty-sub">
                Elige una oferta del selector para ver su listado de inscritos.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VerInscritos;