import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    proyecto: '',
    fechaCreacion: Timestamp.now()
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente({
      ...nuevoCliente,
      [name]: value,
    });
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    if (!currentUser) {
      console.log('No hay usuario autenticado');
      return;
    }
    
    const cargarClientes = async () => {
      try {
        console.log('Iniciando carga de clientes para usuario:', currentUser.uid);
        setCargando(true);
        setError(null);
        
        // Verificar que db esté inicializado
        if (!db) {
          throw new Error('La base de datos no está inicializada');
        }
        
        const clientesRef = collection(db, 'clientes');
        console.log('Referencia a colección clientes obtenida');
        
        // Primero obtenemos solo los clientes del usuario
        const q = query(
          clientesRef,
          where('usuarioId', '==', currentUser.uid)
        );
        
        // Si necesitas ordenar por fecha, necesitarás crear un índice compuesto en Firestore
        // Para evitar el error, primero obtenemos los datos y ordenamos localmente
        // También puedes crear el índice en Firebase Console:
        // Collection: clientes
        // Fields to index: usuarioId (Ascending), fechaCreacion (Descending)
        
        console.log('Configurando listener de Firestore...');
        
        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            console.log('Nueva actualización de clientes recibida');
            const clientesData = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              // Aseguramos que la fecha sea un objeto Timestamp
              const fechaCreacion = data.fechaCreacion?.toDate 
                ? data.fechaCreacion.toDate() 
                : new Date(data.fechaCreacion || Date.now());
                
              clientesData.push({ 
                id: doc.id, 
                ...data,
                fechaCreacion
              });
            });
            
            // Ordenamos localmente por fecha de creación
            clientesData.sort((a, b) => b.fechaCreacion - a.fechaCreacion);
            
            console.log('Clientes cargados:', clientesData.length);
            setClientes(clientesData);
            setCargando(false);
          }, 
          (error) => {
            console.error('Error en la suscripción a clientes:', error);
            setError(`Error al cargar los clientes: ${error.message}`);
            setCargando(false);
          }
        );

        return () => {
          console.log('Limpiando suscripción a clientes');
          unsubscribe();
        };
      } catch (error) {
        console.error('Error al cargar clientes:', error);
        setError(`Error al cargar los clientes: ${error.message}`);
        setCargando(false);
      }
    };

    cargarClientes();
  }, [currentUser]);

  // Estado para controlar si estamos editando
  const [editandoId, setEditandoId] = useState(null);

  // Cargar datos del cliente a editar
  const iniciarEdicion = (cliente) => {
    setNuevoCliente({
      nombre: cliente.nombre || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      empresa: cliente.empresa || '',
      proyecto: cliente.proyecto || '',
      fechaCreacion: cliente.fechaCreacion || Timestamp.now()
    });
    setEditandoId(cliente.id);
    // Hacer scroll al formulario
    document.getElementById('formulario-cliente').scrollIntoView({ behavior: 'smooth' });
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoCliente({ 
      nombre: '', 
      email: '', 
      telefono: '',
      empresa: '',
      proyecto: '',
      fechaCreacion: Timestamp.now() 
    });
  };

  // Guardar cliente (tanto nuevo como edición)
  const guardarCliente = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('No hay usuario autenticado');
      return;
    }

    try {
      setCargando(true);
      setError(null);
      
      const clienteData = {
        ...nuevoCliente,
        usuarioId: currentUser.uid,
        fechaActualizacion: serverTimestamp()
      };

      if (editandoId) {
        // Actualizar cliente existente
        await updateDoc(doc(db, 'clientes', editandoId), clienteData);
        setEditandoId(null);
      } else {
        // Crear nuevo cliente
        clienteData.fechaCreacion = serverTimestamp();
        await addDoc(collection(db, 'clientes'), clienteData);
      }
      
      // Limpiar formulario
      setNuevoCliente({ 
        nombre: '', 
        email: '', 
        telefono: '',
        empresa: '',
        proyecto: '',
        fechaCreacion: Timestamp.now() 
      });
      setError(null);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setError(`Error al guardar cliente: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await deleteDoc(doc(db, 'clientes', id));
      setClientes(clientes.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  return (
    <div className="clientes-container">
      <h2>Gestión de Clientes</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <form id="formulario-cliente" onSubmit={guardarCliente} className="cliente-form bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="form-group">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del cliente"
            value={nuevoCliente.nombre}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={nuevoCliente.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={nuevoCliente.telefono}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="empresa"
            placeholder="Empresa"
            value={nuevoCliente.empresa}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="proyecto"
            placeholder="Proyecto"
            value={nuevoCliente.proyecto}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex space-x-3">
          <button 
            type="submit"
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editandoId ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {editandoId ? 'Actualizar Cliente' : 'Agregar Cliente'}
              </>
            )}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicion}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Clientes</h2>
            <p className="mt-2 text-sm text-gray-700">
              Un listado de todos tus clientes, incluyendo su información de contacto y proyectos.
            </p>
          </div>
        </div>
        
        {cargando ? (
          <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium leading-6 text-gray-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando clientes...
            </div>
          </div>
        ) : clientes.length === 0 ? (
          <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer cliente.</p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nombre</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Empresa</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Proyecto</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contacto</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {clientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {cliente.nombre}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {cliente.empresa || <span className="text-gray-300">-</span>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {cliente.proyecto || <span className="text-gray-300">-</span>}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex flex-col space-y-1">
                              {cliente.email && (
                                <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {cliente.email}
                                </a>
                              )}
                              {cliente.telefono && (
                                <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {cliente.telefono}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium space-x-2 sm:pr-6">
                            <button
                              onClick={() => iniciarEdicion(cliente)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar cliente"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span className="sr-only">Editar</span>
                            </button>
                            <button
                              onClick={() => eliminarCliente(cliente.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar cliente"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="sr-only">Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientes;