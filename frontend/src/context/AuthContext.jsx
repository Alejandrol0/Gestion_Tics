import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/usuarios/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, msg: error.response?.data?.msg };
        }
    };

    const registrar = async (datos) => {
        try {
            await api.post('/usuarios/registro', datos);
            return { success: true };
        } catch (error) {
            return { success: false, msg: error.response?.data?.msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, registrar, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);