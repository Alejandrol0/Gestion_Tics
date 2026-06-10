// context/OfertaContext.jsx
import { createContext, useState, useContext } from 'react';
import ofertaApi from '../services/ofertaApi';
import toast from 'react-hot-toast';

const OfertaContext = createContext();

export const useOfertas = () => {
    const context = useContext(OfertaContext);
    if (!context) throw new Error('useOfertas debe usarse dentro de OfertaProvider');
    return context;
};

export const OfertaProvider = ({ children }) => {
    const [ofertas, setOfertas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [referencias, setReferencias] = useState({
        programas: [],
        modalidades: [],
        tiposProg: [],
        tiposOferta: [],
        municipios: []
    });

    // Cargar referencias (catálogos)
    const cargarReferencias = async () => {
        try {
            const data = await ofertaApi.getReferencias();
            setReferencias(data);
        } catch (error) {
            console.error('Error cargando referencias:', error);
            toast.error('Error al cargar datos de referencia');
        }
    };

    // Cargar mis ofertas
    const cargarMisOfertas = async () => {
        setLoading(true);
        try {
            const data = await ofertaApi.getMisOfertas();
            setOfertas(data);
        } catch (error) {
            console.error('Error cargando ofertas:', error);
            toast.error('Error al cargar las ofertas');
        } finally {
            setLoading(false);
        }
    };

    // Crear oferta
    const crearOferta = async (ofertaData, tipo) => {
        try {
            const response = await ofertaApi.crearOferta(ofertaData, tipo);
            toast.success('✅ Oferta creada exitosamente');
            return { success: true, data: response };
        } catch (error) {
            const errorMsg = error.response?.data?.msg || error.message || 'Error al crear la oferta';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    // Actualizar oferta
    const actualizarOferta = async (id, ofertaData) => {
        try {
            const response = await ofertaApi.actualizarOferta(id, ofertaData);
            toast.success('✅ Oferta actualizada exitosamente');
            return { success: true, data: response };
        } catch (error) {
            const errorMsg = error.response?.data?.msg || error.message || 'Error al actualizar la oferta';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    // Eliminar oferta
    const eliminarOferta = async (id) => {
        try {
            await ofertaApi.eliminarOferta(id);
            toast.success('✅ Oferta eliminada exitosamente');
            setOfertas(prev => prev.filter(o => o._id !== id));
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.msg || error.message || 'Error al eliminar la oferta';
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    return (
        <OfertaContext.Provider value={{
            ofertas,
            loading,
            referencias,
            cargarReferencias,
            cargarMisOfertas,
            crearOferta,
            actualizarOferta,
            eliminarOferta
        }}>
            {children}
        </OfertaContext.Provider>
    );
};