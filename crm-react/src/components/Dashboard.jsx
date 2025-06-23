import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiDollarSign, FiCheckCircle, FiPieChart, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import AgregarVenta from './AgregarVenta';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Clientes totales', value: '0', change: '+0%', icon: <FiUsers className="w-6 h-6" />, type: 'clientes' },
    { title: 'Ventas del mes', value: '$0', change: '+0%', icon: <FiDollarSign className="w-6 h-6" />, type: 'ventas' },
    { title: 'Tareas completadas', value: '0/0', change: '0%', icon: <FiCheckCircle className="w-6 h-6" />, type: 'tareas' },
    { title: 'Rendimiento', value: '0%', change: '0%', icon: <FiPieChart className="w-6 h-6" />, type: 'resumen' },
  ]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [ventasMes, setVentasMes] = useState(0);
  const [proyectos, setProyectos] = useState([]);
  const [mostrarAgregarVenta, setMostrarAgregarVenta] = useState(false);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  
  // Función para cargar los proyectos únicos de los clientes
  const cargarProyectos = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const clientesRef = collection(db, 'clientes');
      const q = query(clientesRef, where('usuarioId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const proyectosUnicos = new Set();
      querySnapshot.forEach((doc) => {
        const proyecto = doc.data().proyecto;
        if (proyecto) {
          proyectosUnicos.add(proyecto);
        }
      });
      
      setProyectos(Array.from(proyectosUnicos));
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  }, [currentUser]);
  
  // Función para cargar las ventas del mes actual
  const cargarVentasMes = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setCargandoVentas(true);
      const mesActual = new Date().toISOString().slice(0, 7); // Formato YYYY-MM
      
      const ventasRef = collection(db, 'ventas');
      const q = query(
        ventasRef,
        where('usuarioId', '==', currentUser.uid),
        where('mes', '==', mesActual)
      );
      
      const querySnapshot = await getDocs(q);
      let total = 0;
      
      querySnapshot.forEach((doc) => {
        const venta = doc.data();
        total += venta.monto || 0;
      });
      
      setVentasMes(total);
      
      // Actualizar el estado de las estadísticas
      setStats(prevStats => {
        const newStats = [...prevStats];
        const ventasIndex = newStats.findIndex(s => s.type === 'ventas');
        if (ventasIndex !== -1) {
          newStats[ventasIndex] = {
            ...newStats[ventasIndex],
            value: `$${total.toLocaleString()}`,
            change: '0%' // Podríamos calcular el cambio respecto al mes anterior
          };
        }
        return newStats;
      });
      
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setCargandoVentas(false);
    }
  }, [currentUser]);
  
  // Función para manejar cuando se agrega una nueva venta
  const handleVentaAgregada = () => {
    cargarVentasMes();
    setMostrarAgregarVenta(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Cargar proyectos y ventas en paralelo
        await Promise.all([
          cargarProyectos(),
          cargarVentasMes()
        ]);
        
        // Obtener conteo de clientes
        const clientesRef = collection(db, 'clientes');
        const clientesQuery = query(clientesRef, where('usuarioId', '==', currentUser.uid));
        const clientesSnapshot = await getCountFromServer(clientesQuery);
        const totalClientes = clientesSnapshot.data().count;
        
        // Obtener tareas completadas vs totales
        const tareasRef = collection(db, 'tareas');
        const tareasQuery = query(tareasRef, where('usuarioId', '==', currentUser.uid));
        const tareasSnapshot = await getCountFromServer(tareasQuery);
        
        const tareasCompletadasQuery = query(
          tareasRef, 
          where('usuarioId', '==', currentUser.uid),
          where('completada', '==', true)
        );
        const tareasCompletadasSnapshot = await getCountFromServer(tareasCompletadasQuery);
        
        const totalTareas = tareasSnapshot.data().count;
        const tareasCompletadas = tareasCompletadasSnapshot.data().count;
        const porcentajeCompletado = totalTareas > 0 
          ? Math.round((tareasCompletadas / totalTareas) * 100) 
          : 0;
        
        // Actualizar el estado con los datos básicos (sin actividades por ahora)
        setStats([
          { 
            ...stats[0], 
            value: totalClientes.toLocaleString() 
          },
          stats[1], // Ventas (se mantiene estático por ahora)
          { 
            ...stats[2], 
            value: `${tareasCompletadas}/${totalTareas}`,
            change: `${porcentajeCompletado}%`
          },
          { 
            ...stats[3],
            value: `${porcentajeCompletado}%`,
            change: `${porcentajeCompletado > 0 ? '+' : ''}${porcentajeCompletado}%`
          }
        ]);
        
        // Intentar cargar actividades, pero continuar si falla
        try {
          const actividadesQuery = query(
            collection(db, 'actividades'),
            where('usuarioId', '==', currentUser.uid),
            orderBy('fecha', 'desc'),
            limit(5)
          );
          
          const actividadesSnapshot = await getDocs(actividadesQuery);
          const actividades = actividadesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Formatear fecha a texto relativo
            time: formatRelativeTime(doc.data().fecha?.toDate())
          }));
          
          setRecentActivities(actividades);
        } catch (actividadesError) {
          console.warn('No se pudieron cargar las actividades:', actividadesError);
          // Usar actividades de ejemplo temporalmente
          setRecentActivities([
            { id: '1', action: 'Bienvenido a tu panel de control', time: 'Ahora', user: 'Sistema' },
            { id: '2', action: 'El sistema está cargando tus actividades...', time: 'Hace un momento', user: 'Sistema' }
          ]);
        }
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);
  
  // Función para formatear montos en formato de moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(monto);
  };

  // Función para formatear fechas a texto relativo (ej: "Hace 2 horas")
  const formatRelativeTime = (date) => {
    if (!date) return 'Recientemente';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hola, {currentUser?.email?.split('@')[0] || 'Usuario'}</h1>
        <p className="text-gray-600">Bienvenido a tu panel de control</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.type} className="card">
            <div className="card-content">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                    {stat.change}
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${getIconBg(stat.type)}`}>
                  {React.cloneElement(stat.icon, { className: 'w-6 h-6 text-white' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos y actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sección de ventas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Ventas del mes</h2>
              <button
                onClick={() => setMostrarAgregarVenta(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-1" /> Nueva Venta
              </button>
            </div>
            
            {cargandoVentas ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="text-center py-8">
                  <p className="text-sm font-medium text-gray-500">Total del mes actual</p>
                  <p className="mt-1 text-4xl font-bold text-gray-900">
                    {formatearMoneda(ventasMes)}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Resumen por proyecto</h3>
                  <div className="space-y-2">
                    {proyectos.length > 0 ? (
                      proyectos.map((proyecto) => (
                        <div key={proyecto} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{proyecto || 'Sin proyecto'}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatearMoneda(0)} {/* Aquí podríamos cargar el total por proyecto */}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay proyectos registrados</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Gráfico de ventas */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de ventas</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Gráfico de ventas mensuales aquí</p>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad reciente</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FiCheckCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time} • {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal para agregar venta */}
      {mostrarAgregarVenta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AgregarVenta 
                onVentaAgregada={handleVentaAgregada}
                proyectos={proyectos}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMostrarAgregarVenta(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para los colores de los iconos
function getIconBg(type) {
  switch(type) {
    case 'clientes':
      return 'bg-green-500';
    case 'ventas':
      return 'bg-purple-500';
    case 'tareas':
      return 'bg-yellow-500';
    case 'resumen':
    default:
      return 'bg-blue-500';
  }
}

export default Dashboard;