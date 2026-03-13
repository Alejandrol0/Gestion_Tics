import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const opciones = [
        {
            id: 'regular',
            titulo: 'REGULAR',
            descripcion: 'Formación estándar sin instructores adicionales',
            icono: FiBookOpen,
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'from-blue-600 to-blue-700',
            ruta: '/cursos/nuevo?tipo=regular'
        },
        {
            id: 'campesena',
            titulo: 'CAMPESENA',
            descripcion: 'Incluye 2 instructores adicionales y duración de 5 meses',
            icono: FiAward,
            color: 'from-green-600 to-green-700',
            hoverColor: 'from-green-700 to-green-800',
            ruta: '/cursos/nuevo?tipo=campesena'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con bienvenida */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-2">
                        ¡Bienvenido, {user?.nombre}!
                    </h1>
                    <p className="text-xl text-green-100">
                        ¿Qué tipo de oferta deseas crear hoy?
                    </p>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                    Selecciona el tipo de oferta
                </h2>

                {/* Grid de opciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {opciones.map((opcion) => (
                        <button
                            key={opcion.id}
                            onClick={() => navigate(`${opcion.ruta}`)}
                            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            {/* Gradient superior */}
                            <div className={`h-2 w-full bg-gradient-to-r ${opcion.color}`}></div>
                            
                            {/* Contenido */}
                            <div className="p-8">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${opcion.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <opcion.icono className="text-4xl text-white" />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-center mb-3">
                                    {opcion.titulo}
                                </h3>
                                
                                <p className="text-gray-600 text-center mb-6">
                                    {opcion.descripcion}
                                </p>

                                {/* Características específicas */}
                                <div className="space-y-3">
                                    {opcion.id === 'regular' ? (
                                        <>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FiUsers className="text-blue-500" />
                                                <span>1 instructor asignado</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FiTrendingUp className="text-blue-500" />
                                                <span>Duración estándar</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FiUsers className="text-green-600" />
                                                <span>2 instructores adicionales</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FiTrendingUp className="text-green-600" />
                                                <span>Duración: 5 meses</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Botón de acción */}
                                <div className={`mt-8 w-full bg-gradient-to-r ${opcion.color} text-white py-3 rounded-xl font-semibold opacity-90 group-hover:opacity-100 transition-opacity text-center`}>
                                    Crear oferta {opcion.titulo.toLowerCase()}
                                </div>
                            </div>

                            {/* Efecto de brillo */}
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                        </button>
                    ))}
                </div>

                {/* Footer con información adicional */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Selecciona el tipo de oferta que deseas crear. 
                        Cada tipo tiene características específicas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;