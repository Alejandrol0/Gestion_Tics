import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coordinadores, setCoordinadores] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            cargarCoordinadores();
        }
        setLoading(false);
    }, []);

    const cargarCoordinadores = async () => {
        try {
            const response = await api.get('/coordinadores/disponibles');
            setCoordinadores(response.data.coordinadores);
        } catch (error) {
            console.error('Error cargando coordinadores:', error);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/usuarios/login', { email, password });
            const { token, ...userData } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            
            toast.success('¡Bienvenido!');
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error al iniciar sesión');
            return { success: false, error: error.response?.data?.msg };
        }
    };

    const registrar = async (userData) => {
        try {
            const response = await api.post('/usuarios/registro', userData);
            
            toast.success('¡Usuario registrado exitosamente!');
            return { success: true, data: response.data };
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error al registrar');
            return { success: false, error: error.response?.data?.msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Sesión cerrada');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            registrar,
            logout,
            loading,
            coordinadores,
            cargarCoordinadores
        }}>
            {children}
        </AuthContext.Provider>
    );
};