import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import CrearOferta from './pages/Ofertas/CrearOferta';
import MisOfertas from './pages/Ofertas/MisOfertas';
import DetalleOferta from './pages/Ofertas/DetalleOferta';
import EditarOferta from './pages/Ofertas/EditarOferta';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/ofertas/regular" element={<PrivateRoute><CrearOferta tipo="regular" /></PrivateRoute>} />
            <Route path="/ofertas/campesena" element={<PrivateRoute><CrearOferta tipo="campesena" /></PrivateRoute>} />
            <Route path="/ofertas/mis-ofertas" element={<PrivateRoute><MisOfertas /></PrivateRoute>} />
            <Route path="/ofertas/:id" element={<PrivateRoute><DetalleOferta /></PrivateRoute>} />
            <Route path="/ofertas/editar/:id" element={<PrivateRoute><EditarOferta /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;