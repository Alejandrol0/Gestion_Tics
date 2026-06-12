import React, { useState } from 'react';

const FormularioCampesenaCompleto = ({ formData, setFormData }) => {
  const [instructores, setInstructores] = useState([
    {
      id: Date.now(),
      tipo: 'Técnico',
      tipo_identificacion: 'CC',
      identificacion: '',
      nombre: '',
      correo: '',
      celular: '',
      programacion: []
    }
  ]);

  // ===== Funciones de manejo (sin cambios en la lógica) =====
  const agregarInstructor = () => {
    const nuevoInstructor = {
      id: Date.now() + Math.random(),
      tipo: 'Técnico',
      tipo_identificacion: 'CC',
      identificacion: '',
      nombre: '',
      correo: '',
      celular: '',
      programacion: []
    };
    const nuevosInstructores = [...instructores, nuevoInstructor];
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const eliminarInstructor = (id) => {
    const nuevosInstructores = instructores.filter(inst => inst.id !== id);
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const actualizarCampo = (id, campo, valor) => {
    const nuevosInstructores = instructores.map(inst =>
      inst.id === id ? { ...inst, [campo]: valor } : inst
    );
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const agregarMes = (id) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const numMes = inst.programacion.length + 1;
        return {
          ...inst,
          programacion: [...inst.programacion, { mes: numMes, rangos: [] }]
        };
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const agregarRango = (id, indexMes) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevaProgramacion = [...inst.programacion];
        nuevaProgramacion[indexMes].rangos.push({
          desde: '',
          hasta: '',
          hora_inicio: '08:00',
          hora_fin: '16:00'
        });
        return { ...inst, programacion: nuevaProgramacion };
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const actualizarRango = (id, indexMes, indexRango, campo, valor) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevaProgramacion = [...inst.programacion];
        nuevaProgramacion[indexMes].rangos[indexRango][campo] = valor;
        return { ...inst, programacion: nuevaProgramacion };
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const eliminarRango = (id, indexMes, indexRango) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevaProgramacion = [...inst.programacion];
        nuevaProgramacion[indexMes].rangos.splice(indexRango, 1);
        return { ...inst, programacion: nuevaProgramacion };
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const eliminarMes = (id, indexMes) => {
    const nuevosInstructores = instructores.map(inst => {
      if (inst.id === id) {
        const nuevaProgramacion = [...inst.programacion];
        nuevaProgramacion.splice(indexMes, 1);
        nuevaProgramacion.forEach((mes, idx) => { mes.mes = idx + 1; });
        return { ...inst, programacion: nuevaProgramacion };
      }
      return inst;
    });
    setInstructores(nuevosInstructores);
    setFormData({ ...formData, instructores: nuevosInstructores });
  };

  const validarProgramacion = () => {
    const errores = [];
    instructores.forEach((instructor, idx) => {
      if (instructor.programacion.length === 0) {
        errores.push(`Instructor ${idx + 1}: Debe agregar al menos un mes de programación`);
      }
      instructor.programacion.forEach((mes, mIdx) => {
        if (mes.rangos.length === 0) {
          errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Debe agregar al menos un rango de fechas`);
        }
        mes.rangos.forEach((rango, rIdx) => {
          if (!rango.desde) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}, Rango ${rIdx + 1}: Fecha "desde" obligatoria`);
          if (!rango.hasta) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}, Rango ${rIdx + 1}: Fecha "hasta" obligatoria`);
          if (rango.desde && rango.hasta && new Date(rango.hasta) <= new Date(rango.desde)) {
            errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Fecha "hasta" debe ser posterior a "desde"`);
          }
          const [hI, mI] = rango.hora_inicio.split(':').map(Number);
          const [hF, mF] = rango.hora_fin.split(':').map(Number);
          const minutosInicio = hI * 60 + mI;
          const minutosFin = hF * 60 + mF;
          if (minutosFin <= minutosInicio) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Hora fin debe ser mayor a hora inicio`);
          if (minutosFin - minutosInicio < 60) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Duración mínima 1 hora`);
          if (minutosFin - minutosInicio > 600) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Duración máxima 10 horas`);
          if (minutosInicio < 6 * 60) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Hora inicio no puede ser antes de 06:00`);
          if (minutosFin > 22 * 60) errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Hora fin no puede ser después de 22:00`);
        });
        if (mes.rangos.length > 1) {
          const rangosOrdenados = [...mes.rangos].sort((a, b) => new Date(a.desde) - new Date(b.desde));
          for (let i = 0; i < rangosOrdenados.length - 1; i++) {
            if (new Date(rangosOrdenados[i + 1].desde) <= new Date(rangosOrdenados[i].hasta)) {
              errores.push(`Instructor ${idx + 1}, Mes ${mes.mes}: Los rangos de fechas no pueden solaparse`);
            }
          }
        }
      });
    });
    return errores;
  };

  return (
    <div className="campesena-container">
      <style>{`
        .campesena-container {
          margin-top: 28px;
          font-family: 'Segoe UI', 'Roboto', sans-serif;
        }
        .campesena-header {
          margin-bottom: 24px;
          border-bottom: 2px solid #eef2f6;
          padding-bottom: 12px;
        }
        .campesena-title {
          font-size: 22px;
          font-weight: 700;
          color: #00643C;
          margin: 0 0 4px;
        }
        .campesena-sub {
          font-size: 14px;
          color: #5a6e7c;
          margin: 0;
        }
        .instructor-card {
          background: #fefefe;
          border-radius: 28px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          margin-bottom: 32px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.2s;
        }
        .instructor-card:hover {
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
        .instructor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .instructor-title {
          font-size: 18px;
          font-weight: 700;
          color: #0F2B46;
          margin: 0;
        }
        .btn-remove-instructor {
          background: #fef2f2;
          border: none;
          color: #dc2626;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-remove-instructor:hover {
          background: #fee2e2;
          transform: translateY(-1px);
        }
        .instructor-body {
          padding: 24px;
        }
        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .form-group {
          flex: 1;
          min-width: 180px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 6px;
        }
        .form-input, .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 20px;
          font-size: 14px;
          font-family: inherit;
          background: white;
          transition: all 0.2s;
          outline: none;
        }
        .form-input:focus, .form-select:focus {
          border-color: #00643C;
          box-shadow: 0 0 0 3px rgba(0, 100, 60, 0.2);
        }
        .mes-section {
          margin-top: 28px;
        }
        .mes-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .mes-badge {
          background: #FFD966;
          color: #0F2B46;
          padding: 4px 14px;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 700;
        }
        .btn-remove-mes {
          background: none;
          border: none;
          color: #e53e3e;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 40px;
        }
        .btn-remove-mes:hover {
          background: #fff0f0;
        }
        .rango-card {
          background: #fafcff;
          border-radius: 24px;
          padding: 16px 20px;
          margin-bottom: 16px;
          border: 1px solid #e2edf7;
          transition: all 0.2s;
        }
        .rango-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .rango-label {
          font-weight: 700;
          color: #00643C;
          font-size: 14px;
        }
        .btn-remove-rango {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 18px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-remove-rango:hover {
          background: #fee2e2;
        }
        .btn-add-rango {
          background: #e8f5e9;
          border: none;
          color: #2e7d32;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 13px;
          margin-top: 8px;
          transition: all 0.2s;
        }
        .btn-add-rango:hover {
          background: #c8e6c9;
        }
        .btn-add-mes {
          background: #e6f0ff;
          border: none;
          color: #1e40af;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 16px;
          width: 100%;
          transition: all 0.2s;
        }
        .btn-add-mes:hover {
          background: #dbeafe;
        }
        .btn-add-instructor {
          width: 100%;
          background: #00643C;
          color: white;
          border: none;
          border-radius: 40px;
          padding: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          margin: 16px 0 20px;
          transition: all 0.2s;
        }
        .btn-add-instructor:hover {
          background: #004d2e;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(0, 100, 60, 0.3);
        }
        .validate-section {
          text-align: center;
          margin-top: 20px;
        }
        .btn-validate {
          background: #FFD966;
          color: #0F2B46;
          border: none;
          border-radius: 40px;
          padding: 12px 32px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-validate:hover {
          background: #f0bc1a;
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .form-row {
            flex-direction: column;
            gap: 16px;
          }
          .instructor-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>

      <div className="campesena-header">
        <h3 className="campesena-title">👨‍🏫 Instructores Campesena</h3>
        <p className="campesena-sub">Agregue los instructores necesarios y su programación detallada</p>
      </div>

      {instructores.map((instructor, idx) => (
        <div key={instructor.id} className="instructor-card">
          <div className="instructor-header">
            <h4 className="instructor-title">Instructor {idx + 1}</h4>
            {instructores.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarInstructor(instructor.id)}
                className="btn-remove-instructor"
              >
                ✕ Eliminar instructor
              </button>
            )}
          </div>

          <div className="instructor-body">
            {/* Tipo de instructor */}
            <div className="form-group">
              <label className="form-label">Tipo de Instructor</label>
              <select
                className="form-select"
                value={instructor.tipo}
                onChange={(e) => actualizarCampo(instructor.id, 'tipo', e.target.value)}
              >
                <option value="Técnico">🔧 Técnico</option>
                <option value="Empresarial">💼 Empresarial</option>
                <option value="Popular">👥 Popular</option>
              </select>
            </div>

            {/* Datos personales */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo ID</label>
                <select
                  className="form-select"
                  value={instructor.tipo_identificacion}
                  onChange={(e) => actualizarCampo(instructor.id, 'tipo_identificacion', e.target.value)}
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="TI">TI</option>
                  <option value="PAP">PAP</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Identificación</label>
                <input
                  type="text"
                  className="form-input"
                  value={instructor.identificacion}
                  onChange={(e) => actualizarCampo(instructor.id, 'identificacion', e.target.value)}
                  placeholder="12345678"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input
                type="text"
                className="form-input"
                value={instructor.nombre}
                onChange={(e) => actualizarCampo(instructor.id, 'nombre', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-input"
                  value={instructor.correo}
                  onChange={(e) => actualizarCampo(instructor.id, 'correo', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Celular</label>
                <input
                  type="tel"
                  className="form-input"
                  value={instructor.celular}
                  onChange={(e) => actualizarCampo(instructor.id, 'celular', e.target.value)}
                  placeholder="3001234567"
                />
              </div>
            </div>

            {/* Programación por meses */}
            <div className="mes-section">
              <div className="mes-title-row">
                <span className="mes-badge">📅 Programación por meses</span>
              </div>

              {instructor.programacion.map((mes, mIdx) => (
                <div key={mIdx} style={{ marginBottom: '24px' }}>
                  <div className="mes-title-row">
                    <span className="mes-badge">Mes {mes.mes}</span>
                    <button
                      type="button"
                      onClick={() => eliminarMes(instructor.id, mIdx)}
                      className="btn-remove-mes"
                    >
                      ✕ Eliminar mes
                    </button>
                  </div>

                  {mes.rangos.map((rango, rIdx) => (
                    <div key={rIdx} className="rango-card">
                      <div className="rango-header">
                        <span className="rango-label">Rango {rIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => eliminarRango(instructor.id, mIdx, rIdx)}
                          className="btn-remove-rango"
                          title="Eliminar rango"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Desde</label>
                          <input
                            type="date"
                            className="form-input"
                            value={rango.desde}
                            onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'desde', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hasta</label>
                          <input
                            type="date"
                            className="form-input"
                            value={rango.hasta}
                            onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'hasta', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Hora inicio</label>
                          <input
                            type="time"
                            className="form-input"
                            value={rango.hora_inicio}
                            onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'hora_inicio', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hora fin</label>
                          <input
                            type="time"
                            className="form-input"
                            value={rango.hora_fin}
                            onChange={(e) => actualizarRango(instructor.id, mIdx, rIdx, 'hora_fin', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => agregarRango(instructor.id, mIdx)}
                    className="btn-add-rango"
                  >
                    + Agregar rango de fechas
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => agregarMes(instructor.id)}
                className="btn-add-mes"
              >
                + Agregar nuevo mes
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={agregarInstructor}
        className="btn-add-instructor"
      >
        + Agregar nuevo instructor
      </button>

      <div className="validate-section">
        <button
          type="button"
          onClick={() => {
            const errores = validarProgramacion();
            if (errores.length > 0) {
              alert('❌ Errores de validación:\n- ' + errores.join('\n- '));
            } else {
              alert('✅ Validación exitosa');
            }
          }}
          className="btn-validate"
        >
          Validar programación
        </button>
      </div>
    </div>
  );
};

export default FormularioCampesenaCompleto;