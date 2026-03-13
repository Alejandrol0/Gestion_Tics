import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CursoProvider } from './context/CursoContext';
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import CrearCurso from './components/cursos/CrearCurso';
import MisCursos from './components/cursos/MisCursos';
import DetalleCurso from './components/cursos/DetalleCurso';
import EditarCurso from './components/cursos/EditarCurso';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
                <div className="bg-white p-8 rounded-2xl shadow-2xl">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <CursoProvider>
                <BrowserRouter>
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                                borderRadius: '10px',
                            },
                            success: {
                                style: {
                                    background: '#39A900',
                                },
                            },
                            error: {
                                style: {
                                    background: '#ef4444',
                                },
                            },
                        }}
                    />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Registro />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <Dashboard />
                                    </>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/cursos/nuevo" 
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <CrearCurso />
                                    </>
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/cursos/mis-cursos" 
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <MisCursos />
                                    </>
                                </ProtectedRoute>
                            } 
                        />

                        <Route 
                            path="/cursos/:id" 
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <DetalleCurso />
                                    </>
                                </ProtectedRoute>
                            } 
                        />

                        <Route 
                            path="/cursos/editar/:id" 
                            element={
                                <ProtectedRoute>
                                    <>
                                        <Navbar />
                                        <EditarCurso />
                                    </>
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/" element={<Navigate to="/login" />} />
                    </Routes>
                </BrowserRouter>
            </CursoProvider>
        </AuthProvider>
    );
}

export default App;