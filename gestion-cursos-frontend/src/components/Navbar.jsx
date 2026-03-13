import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiHome, FiList, FiMenu } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Solo dejamos Inicio y Mis Cursos
    const navLinks = [
        { to: '/dashboard', label: 'Inicio', icon: FiHome },
        { to: '/cursos/mis-cursos', label: 'Mis Cursos', icon: FiList },
    ];

    return (
        <nav className="bg-white shadow-lg border-b-2 border-green-500 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <FiHome className="text-white text-xl" />
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                            SENA
                        </span>
                    </Link>

                    {/* Menú desktop */}
                    {user?.role === 'instructor' && (
                        <div className="hidden md:flex items-center gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                >
                                    <link.icon className="text-lg" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Perfil y logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                <FiUser className="text-white text-sm" />
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 text-sm">{user?.nombre}</span>
                                <span className="text-xs text-green-600 font-semibold capitalize block">{user?.role}</span>
                            </div>
                        </div>

                        {/* Botón de menú móvil */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        >
                            <FiMenu className="text-2xl" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                        >
                            <FiLogOut className="sm:mr-0" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>

                {/* Menú móvil desplegable */}
                {mobileMenuOpen && user?.role === 'instructor' && (
                    <div className="md:hidden py-2 border-t border-gray-200">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <link.icon className="text-xl" />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        ))}
                        <div className="px-4 py-3 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                    <FiUser className="text-white text-sm" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">{user?.nombre}</p>
                                    <p className="text-xs text-green-600 font-semibold capitalize">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;