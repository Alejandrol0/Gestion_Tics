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
  const [exportandoCedulas, setExportandoCedulas] = useState(false);
  const [descargandoFusion, setDescargandoFusion] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estados para el modal de cédulas (opcional, si quieres mantener la vista previa)
  const [mostrarModalCedulas, setMostrarModalCedulas] = useState(false);
  const [cedulasData, setCedulasData] = useState([]);
  const [cargandoCedulas, setCargandoCedulas] = useState(false);

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

  // Función para ver cédulas (abre modal con lista de cédulas)
  const handleVerCedulas = async () => {
    if (!ofertaSeleccionada) return;
    try {
      setCargandoCedulas(true);
      setCedulasData(inscritos);
      setMostrarModalCedulas(true);
    } catch (error) {
      console.error('Error cargando cédulas:', error);
      setError('Error al cargar las cédulas');
    } finally {
      setCargandoCedulas(false);
    }
  };

  // Descargar Excel de cédulas
  const descargarExcelCedulas = async () => {
    if (!ofertaSeleccionada) return;
    try {
      setExportandoCedulas(true);
      const res = await api.get(
        `/inscripciones/oferta/${ofertaSeleccionada._id}/exportar/cedulas`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `cedulas_${ofertaSeleccionada.programa_formacion?.codigo}.xlsx`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess('Excel de cédulas exportado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al exportar el Excel de cédulas');
    } finally {
      setExportandoCedulas(false);
    }
  };

  // 🔥 NUEVA FUNCIÓN: Descargar PDF fusionado de cédulas
  const descargarPDFFusionado = async () => {
    if (!ofertaSeleccionada) return;
    try {
      setDescargandoFusion(true);
      const res = await api.get(
        `/inscripciones/oferta/${ofertaSeleccionada._id}/fusionar-pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `cedulas_fusionadas_${ofertaSeleccionada.programa_formacion?.codigo}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess('✅ PDF fusionado descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Error al generar el PDF fusionado');
    } finally {
      setDescargandoFusion(false);
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
          .btn-group {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
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
          .btn-cedulas {
            padding: 10px 24px;
            background: #7c3aed;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-cedulas:hover:not(:disabled) {
            background: #6d28d9;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
          }
          .btn-cedulas:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .btn-pdf-fusion {
            padding: 10px 24px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-pdf-fusion:hover:not(:disabled) {
            background: #b91c1c;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }
          .btn-pdf-fusion:disabled {
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

          /* Modal (opcional, para vista previa de cédulas) */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }
          .modal-container {
            background: white;
            border-radius: 32px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 28px 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #eef2f6;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .modal-title {
            font-size: 22px;
            font-weight: 700;
            color: #00643C;
            margin: 0;
          }
          .modal-close {
            background: none;
            border: none;
            font-size: 28px;
            color: #94a3b8;
            cursor: pointer;
            transition: color 0.2s;
          }
          .modal-close:hover {
            color: #dc2626;
          }
          .modal-body {
            overflow-x: auto;
          }
          .modal-body table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          .modal-body th {
            background: #f8fafc;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
          }
          .modal-body td {
            padding: 10px 16px;
            border-bottom: 1px solid #edf2f7;
            color: #334155;
          }
          .modal-body tr:hover {
            background: #f8fafc;
          }
          .modal-empty {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
          }
          .btn-download-excel {
            background: transparent;
            border: 1px solid #cbd5e1;
            border-radius: 40px;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 6px;
          }
          .btn-download-excel:hover {
            background: #f1f5f9;
            border-color: #00643C;
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
            .btn-group {
              width: 100%;
            }
            .export-btn, .btn-cedulas, .btn-pdf-fusion {
              flex: 1;
              text-align: center;
            }
            .modal-container {
              padding: 20px;
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
                <div className="btn-group">
                  <button
                    onClick={exportarCompleto}
                    disabled={exportando || inscritos.length === 0}
                    className="export-btn"
                  >
                    {exportando ? 'Exportando…' : '📊 Exportar Excel'}
                  </button>
                  <button
                    onClick={handleVerCedulas}
                    disabled={cargandoCedulas || inscritos.length === 0}
                    className="btn-cedulas"
                  >
                    {cargandoCedulas ? 'Cargando…' : '🪪 Ver cédulas'}
                  </button>
                  <button
                    onClick={descargarPDFFusionado}
                    disabled={descargandoFusion || inscritos.length === 0}
                    className="btn-pdf-fusion"
                  >
                    {descargandoFusion ? 'Generando…' : '📄 Fusionar cédulas'}
                  </button>
                </div>
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

      {/* Modal de cédulas (opcional) */}
      {mostrarModalCedulas && (
        <div className="modal-overlay" onClick={() => setMostrarModalCedulas(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                🪪 Cédulas - {ofertaSeleccionada?.programa_formacion?.nombre_programa || 'Oferta'}
              </h3>
              <button className="modal-close" onClick={() => setMostrarModalCedulas(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cedulasData.length === 0 ? (
                <div className="modal-empty">No hay inscritos para mostrar cédulas.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tipo Doc.</th>
                      <th>Número</th>
                      <th>Nombres</th>
                      <th>Apellidos</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cedulasData.map((ins, idx) => (
                      <tr key={ins._id}>
                        <td>{idx + 1}</td>
                        <td>{ins.tipo_documento?.nombre || '—'}</td>
                        <td>{ins.numero_documento}</td>
                        <td>{ins.nombres}</td>
                        <td>{ins.apellidos}</td>
                        <td>{ins.telefono || '—'}</td>
                        <td>{ins.correo || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button
                  className="btn-download-excel"
                  onClick={descargarExcelCedulas}
                  disabled={exportandoCedulas || cedulasData.length === 0}
                >
                  {exportandoCedulas ? 'Descargando...' : '📥 Descargar Excel de cédulas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerInscritos;