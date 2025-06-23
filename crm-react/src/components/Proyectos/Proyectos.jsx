import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiCalendar, FiDollarSign, FiUsers, FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Proyectos() {
  const { currentUser } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
  const [mostrarFormularioContacto, setMostrarFormularioContacto] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  
  // Estados para nuevo contacto
  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    puesto: '',
    clienteId: ''
  });
  
  // Estados
  const [proyectoEditando, setProyectoEditando] = useState(null);
  const [esEditando, setEsEditando] = useState(false);
  
  // Estado del formulario
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaEntrega: '',
    costoOperacion: 0,
    costoProduccion: 0,
    montoTotal: 0,
    margenGanancia: 0,
    clienteId: '',
    contactoId: '',
    estado: 'pendiente' // pendiente, en_progreso, completado, cancelado
  });
  
  // Calcular el monto total y el margen automáticamente
  useEffect(() => {
    const totalCostos = nuevoProyecto.costoOperacion + nuevoProyecto.costoProduccion;
    const montoTotal = nuevoProyecto.montoTotal || 0;
    const margen = montoTotal > 0 ? ((montoTotal - totalCostos) / montoTotal) * 100 : 0;
    
    setNuevoProyecto(prev => ({
      ...prev,
      margenGanancia: parseFloat(margen.toFixed(2))
    }));
  }, [nuevoProyecto.costoOperacion, nuevoProyecto.costoProduccion, nuevoProyecto.montoTotal]);

  // Cargar proyectos
  const cargarProyectos = async () => {
    if (!currentUser) return;
    
    try {
      setCargando(true);
      const proyectosRef = collection(db, 'proyectos');
      const q = query(proyectosRef, where('usuarioId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const proyectosData = [];
      querySnapshot.forEach((doc) => {
        proyectosData.push({ id: doc.id, ...doc.data() });
      });
      
      setProyectos(proyectosData);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar los proyectos');
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProyecto(prev => ({
      ...prev,
      [name]: name.includes('costo') || name === 'montoTotal' ? parseFloat(value) || 0 : value
    }));
  };
  
  // Preparar el formulario para edición
  const handleEditarProyecto = (proyecto) => {
    setProyectoEditando(proyecto);
    setEsEditando(true);
    setNuevoProyecto({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || '',
      fechaInicio: proyecto.fechaInicio || '',
      fechaEntrega: proyecto.fechaEntrega || '',
      costoOperacion: proyecto.costoOperacion || 0,
      costoProduccion: proyecto.costoProduccion || 0,
      montoTotal: proyecto.montoTotal || 0,
      margenGanancia: proyecto.margenGanancia || 0,
      contactoId: proyecto.contactoId || '',
      estado: proyecto.estado || 'pendiente'
    });
    setMostrarFormulario(true);
  };
  
  // Cancelar edición
  const cancelarEdicion = () => {
    setEsEditando(false);
    setProyectoEditando(null);
    setNuevoProyecto({
      nombre: '',
      descripcion: '',
      fechaInicio: '',
      fechaEntrega: '',
      costoOperacion: 0,
      costoProduccion: 0,
      montoTotal: 0,
      margenGanancia: 0,
      contactoId: '',
      estado: 'pendiente'
    });
    setMostrarFormulario(false);
  };

  // Guardar o actualizar proyecto
  const guardarProyecto = async (e) => {
    e.preventDefault();
    
    try {
      setCargando(true);
      
      const proyectoData = {
        ...nuevoProyecto,
        fechaActualizacion: serverTimestamp()
      };
      
      if (esEditando && proyectoEditando) {
        // Actualizar proyecto existente
        const proyectoRef = doc(db, 'proyectos', proyectoEditando.id);
        await updateDoc(proyectoRef, proyectoData);
      } else {
        // Crear nuevo proyecto
        await addDoc(collection(db, 'proyectos'), {
          ...proyectoData,
          usuarioId: currentUser.uid,
          fechaCreacion: serverTimestamp()
        });
      }
      
      // Limpiar formulario y recargar lista
      cancelarEdicion();
      cargarProyectos();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      setError(`Error al ${esEditando ? 'actualizar' : 'guardar'} el proyecto: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Cargar clientes
  const cargarClientes = async () => {
    if (!currentUser) return;
    
    try {
      setCargandoClientes(true);
      const clientesRef = collection(db, 'clientes');
      const q = query(clientesRef, where('usuarioId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const clientesData = [];
      querySnapshot.forEach((doc) => {
        clientesData.push({ id: doc.id, ...doc.data() });
      });
      
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar la lista de clientes');
    } finally {
      setCargandoClientes(false);
    }
  };
  
  // Cargar contactos de un cliente
  const cargarContactos = async (clienteId) => {
    if (!clienteId) {
      setContactos([]);
      return;
    }
    
    try {
      const contactosRef = collection(db, 'contactos');
      const q = query(contactosRef, 
        where('clienteId', '==', clienteId),
        where('usuarioId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const contactosData = [];
      querySnapshot.forEach((doc) => {
        contactosData.push({ id: doc.id, ...doc.data() });
      });
      
      setContactos(contactosData);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      setError('Error al cargar la lista de contactos');
    }
  };
  
  // Manejar cambio de cliente seleccionado
  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    setNuevoProyecto(prev => ({
      ...prev,
      clienteId,
      contactoId: '' // Resetear contacto al cambiar de cliente
    }));
    
    if (clienteId) {
      cargarContactos(clienteId);
    } else {
      setContactos([]);
    }
  };
  
  // Crear nuevo cliente
  const crearCliente = async (e) => {
    e.preventDefault();
    
    try {
      setCargando(true);
      await addDoc(collection(db, 'clientes'), {
        ...nuevoCliente,
        usuarioId: currentUser.uid,
        fechaCreacion: serverTimestamp()
      });
      
      await cargarClientes();
      setMostrarFormularioCliente(false);
      setNuevoCliente({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      setError('Error al crear el cliente');
    } finally {
      setCargando(false);
    }
  };
  
  // Crear nuevo contacto
  const crearContacto = async (e) => {
    e.preventDefault();
    
    try {
      setCargando(true);
      await addDoc(collection(db, 'contactos'), {
        ...nuevoContacto,
        usuarioId: currentUser.uid,
        fechaCreacion: serverTimestamp()
      });
      
      await cargarContactos(nuevoContacto.clienteId);
      setMostrarFormularioContacto(false);
      setNuevoContacto({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        puesto: '',
        clienteId: nuevoContacto.clienteId // Mantener el mismo cliente
      });
    } catch (error) {
      console.error('Error al crear contacto:', error);
      setError('Error al crear el contacto');
    } finally {
      setCargando(false);
    }
  };
  
  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        cargarProyectos(),
        cargarClientes()
      ]);
    };
    
    cargarDatos();
  }, [currentUser]);

  if (cargando && proyectos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Proyectos</h1>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" /> Nuevo Proyecto
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Formulario de nuevo proyecto */}
      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {esEditando ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          
          <form onSubmit={guardarProyecto} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selección de Cliente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="clienteId"
                    value={nuevoProyecto.clienteId || ''}
                    onChange={handleClienteChange}
                    className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setMostrarFormularioCliente(true)}
                    className="ml-1 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Selección de Contacto */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto
                </label>
                <div className="flex">
                  <select
                    name="contactoId"
                    value={nuevoProyecto.contactoId || ''}
                    onChange={handleChange}
                    className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={!nuevoProyecto.clienteId}
                  >
                    <option value="">Seleccionar contacto</option>
                    {contactos.map(contacto => (
                      <option key={contacto.id} value={contacto.id}>
                        {contacto.nombre} {contacto.apellido} {contacto.puesto ? `(${contacto.puesto})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (nuevoProyecto.clienteId) {
                        setNuevoContacto(prev => ({ ...prev, clienteId: nuevoProyecto.clienteId }));
                        setMostrarFormularioContacto(true);
                      }
                    }}
                    className="ml-1 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!nuevoProyecto.clienteId}
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Nombre del Proyecto */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={nuevoProyecto.nombre}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={nuevoProyecto.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              {/* Fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={nuevoProyecto.fechaInicio || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  name="fechaEntrega"
                  value={nuevoProyecto.fechaEntrega}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de Operación ($)
                </label>
                <input
                  type="number"
                  name="costoOperacion"
                  value={nuevoProyecto.costoOperacion}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de Producción ($)
                </label>
                <input
                  type="number"
                  name="costoProduccion"
                  value={nuevoProyecto.costoProduccion}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Total del Proyecto ($) *
                </label>
                <input
                  type="number"
                  name="montoTotal"
                  value={nuevoProyecto.montoTotal}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Margen de Ganancia:</span>
                  <span className={`text-lg font-semibold ${nuevoProyecto.margenGanancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {nuevoProyecto.margenGanancia}%
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {nuevoProyecto.margenGanancia >= 0 ? (
                    <span>Ganancia estimada: ${(nuevoProyecto.montoTotal - (nuevoProyecto.costoOperacion + nuevoProyecto.costoProduccion)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  ) : (
                    <span className="text-red-600">Pérdida estimada: ${Math.abs(nuevoProyecto.montoTotal - (nuevoProyecto.costoOperacion + nuevoProyecto.costoProduccion)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={cancelarEdicion}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={cargando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {esEditando ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : esEditando ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de proyectos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {proyectos.length === 0 ? (
            <li className="p-6 text-center text-gray-500">
              No hay proyectos registrados. Crea tu primer proyecto para comenzar.
            </li>
          ) : (
            proyectos.map((proyecto) => (
              <li key={proyecto.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-blue-600 truncate">
                          {proyecto.nombre}
                        </p>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {proyecto.estado.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {proyecto.fechaInicio} - {proyecto.fechaEntrega}
                        </div>
                        <div className="mt-2 flex items-center text-sm font-medium text-gray-900">
                          <FiDollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-600" />
                          ${proyecto.montoTotal?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <span className="font-medium">Inversión:</span>
                          <span className="ml-1 text-gray-600">
                            ${(proyecto.costoOperacion + proyecto.costoProduccion).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <span className="font-medium">Margen:</span>
                          <span className={`ml-1 ${proyecto.margenGanancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {proyecto.margenGanancia?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button 
                        onClick={() => handleEditarProyecto(proyecto)}
                        className="p-1 rounded-full text-gray-400 hover:text-blue-600 focus:outline-none hover:bg-blue-50 transition-colors"
                        title="Editar proyecto"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-1 rounded-full text-gray-400 hover:text-red-600 focus:outline-none hover:bg-red-50 transition-colors"
                        title="Eliminar proyecto"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {proyecto.descripcion && (
                    <div className="mt-2 text-sm text-gray-600">
                      {proyecto.descripcion}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
