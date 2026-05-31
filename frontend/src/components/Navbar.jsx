import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiLogOut, FiUser, FiHome, FiClipboard, FiPlusCircle } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const navLinks = user?.role === 'instructor'
        ? [
            { to: '/dashboard', label: 'Inicio', icon: <FiHome /> },
            { to: '/ofertas/mis-ofertas', label: 'Mis Fichas', icon: <FiClipboard /> },
            { to: '/ofertas/regular', label: 'Nueva Ficha', icon: <FiPlusCircle /> },
          ]
        : user?.role === 'coordinador'
        ? [
            { to: '/dashboard', label: 'Inicio', icon: <FiHome /> },
            { to: '/coordinador/pendientes', label: 'Fichas Pendientes', icon: <FiClipboard /> },
          ]
        : [
            { to: '/dashboard', label: 'Inicio', icon: <FiHome /> },
          ];

    return (
        <nav className="bg-white shadow-md border-b-2 border-green-500 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-sm">SENA</span>
                        </div>
                        <span className="text-xl font-bold text-green-700 hidden sm:block">
                            Gestión de Cursos
                        </span>
                    </Link>

                    {/* Links de navegación */}
                    <div className="hidden md:flex items-center gap-1 ml-4">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    isActive(link.to)
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                                }`}
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Usuario + logout */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <FiUser className="text-white text-sm" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 leading-none">{user?.nombre}</p>
                            <p className="text-xs text-green-600 font-semibold capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md text-sm font-medium"
                    >
                        <FiLogOut />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </div>

            {/* Links móvil */}
            <div className="md:hidden flex border-t overflow-x-auto">
                {navLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-semibold transition-all min-w-[60px] ${
                            isActive(link.to)
                                ? 'text-green-600 border-b-2 border-green-600'
                                : 'text-gray-500'
                        }`}
                    >
                        <span className="text-base">{link.icon}</span>
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;