import { createContext, useState, useContext } from 'react';
import cursoApi from '../services/cursoApi';
import toast from 'react-hot-toast';

const CursoContext = createContext();

export const useCursos = () => {
    const context = useContext(CursoContext);
    if (!context) {
        throw new Error('useCursos debe usarse dentro de CursoProvider');
    }
    return context;
};

export const CursoProvider = ({ children }) => {
    const [cursos, setCursos]           = useState([]);
    const [loading, setLoading]         = useState(false);
    const [referencias, setReferencias] = useState({
        programas:         [],
        modalidades:       [],
        tiposPrograma:     [],
        tiposOferta:       [],
        programasEspeciales: [],
        sectores:          []
    });
    const [coordinadores, setCoordinadores] = useState([]);

    // ── Cargar referencias ─────────────────────────────────────────────────────
    const cargarReferencias = async () => {
        try {
            const data = await cursoApi.getReferencias();
            setReferencias(data);
        } catch (error) {
            console.error('Error cargando referencias:', error);
            toast.error('Error al cargar datos de referencia');
        }
    };

    // ── Cargar coordinadores ───────────────────────────────────────────────────
    const cargarCoordinadores = async () => {
        try {
            const data = await cursoApi.getCoordinadores();
            // ✅ FIX: el controlador devuelve { coordinadores: [...] }
            setCoordinadores(data.coordinadores || []);
        } catch (error) {
            console.error('Error cargando coordinadores:', error);
            toast.error('Error al cargar coordinadores');
        }
    };

    // ── Cargar mis cursos ──────────────────────────────────────────────────────
    const cargarMisCursos = async () => {
        setLoading(true);
        try {
            const data = await cursoApi.getMisCursos();
            setCursos(data.cursos || []);
        } catch (error) {
            console.error('Error cargando cursos:', error);
            toast.error('Error al cargar los cursos');
        } finally {
            setLoading(false);
        }
    };

    // ── Crear curso ────────────────────────────────────────────────────────────
    const crearCurso = async (cursoData, tipo) => {
        try {
            console.log('📦 Datos recibidos en crearCurso:', cursoData);
            const response = await cursoApi.crearCurso(cursoData, tipo);
            toast.success('✅ Curso creado exitosamente');
            return { success: true, data: response };
        } catch (error) {
            // ✅ FIX: leer el mensaje real del backend para mostrarlo al usuario
            const errorMsg = error.response?.data?.msg || error.message || 'Error al crear el curso';
            console.error('❌ Error en crearCurso:', errorMsg);
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    // ── Actualizar curso ───────────────────────────────────────────────────────
    const actualizarCurso = async (id, cursoData) => {
        try {
            const response = await cursoApi.actualizarCurso(id, cursoData);
            toast.success('✅ Curso actualizado exitosamente');
            return { success: true, data: response };
        } catch (error) {
            const errorMsg = error.response?.data?.msg || error.message || 'Error al actualizar el curso';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    // ── Eliminar curso ─────────────────────────────────────────────────────────
    const eliminarCurso = async (id) => {
        try {
            await cursoApi.eliminarCurso(id);
            toast.success('✅ Curso eliminado exitosamente');
            setCursos(prev => prev.filter(c => c._id !== id));
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.msg || error.message || 'Error al eliminar el curso';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    return (
        <CursoContext.Provider value={{
            cursos,
            loading,
            referencias,
            coordinadores,
            cargarReferencias,
            cargarCoordinadores,
            cargarMisCursos,
            crearCurso,
            actualizarCurso,
            eliminarCurso
        }}>
            {children}
        </CursoContext.Provider>
    );
};