import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { FaWhatsapp, FaEnvelope, FaUserPlus, FaTimes, FaPlus, FaTrashAlt, FaCheck } from 'react-icons/fa';
import { db, auth } from '../firebase/config';
import { registrarActividad, TIPOS_ACTIVIDAD } from '../helpers/actividadHelper';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    completada: false,
    asignacion: {
      metodo: '', // 'email' o 'whatsapp'
      contacto: '',
      enviado: false,
      fechaEnvio: null
    },
    asignadoA: ''
  });
  
  const [mostrarAsignar, setMostrarAsignar] = useState(false);
  const [mostrarNuevoContacto, setMostrarNuevoContacto] = useState(false);
  const [contactos, setContactos] = useState([]);
  const [cargandoContactos, setCargandoContactos] = useState(false);
  const [busquedaContacto, setBusquedaContacto] = useState('');
  const asignarRef = useRef(null);
  const [filtro, setFiltro] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el nuevo contacto
  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const { currentUser } = useAuth();

  // Cargar contactos desde clientes
  useEffect(() => {
    if (!currentUser) return;
    
    const cargarContactos = async () => {
      try {
        setCargandoContactos(true);
        setError(null);
        
        // Verificar autenticación
        if (!currentUser || !currentUser.uid) {
          throw new Error('Usuario no autenticado');
        }
        
        const clientesRef = collection(db, 'clientes');
        const q = query(
          clientesRef,
          where('usuarioId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const contactosData = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            contactosData.push({
              id: doc.id,
              nombre: data.nombre || 'Sin nombre',
              email: data.email || '',
              telefono: data.telefono || ''
            });
          }
        });
        
        setContactos(contactosData);
      } catch (error) {
        console.error('Error al cargar contactos:', error);
        setError(`Error al cargar contactos: ${error.message}`);
      } finally {
        setCargandoContactos(false);
      }
    };
    
    cargarContactos();
  }, [currentUser]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (asignarRef.current && !asignarRef.current.contains(event.target)) {
        setMostrarAsignar(false);
        setMostrarNuevoContacto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filtrar contactos según la búsqueda
  const contactosFiltrados = contactos.filter(contacto => {
    if (!busquedaContacto) return true;
    const busqueda = busquedaContacto.toLowerCase();
    return (
      contacto.nombre.toLowerCase().includes(busqueda) ||
      (contacto.email && contacto.email.toLowerCase().includes(busqueda)) ||
      (contacto.telefono && contacto.telefono.includes(busqueda))
    );
  });

  // Cargar tareas al iniciar
  useEffect(() => {
    if (!currentUser) {
      console.log('No hay usuario autenticado');
      return;
    }
    
    const cargarTareas = async () => {
      let unsubscribe;
      
      try {
        console.log('Iniciando carga de tareas para usuario:', currentUser.uid);
        setCargando(true);
        setError(null);
        
        // Verificar que db esté inicializado
        if (!db) {
          throw new Error('La base de datos no está inicializada');
        }
        
        const tareasRef = collection(db, 'tareas');
        console.log('Referencia a colección tareas obtenida');
        
        // Primero intentamos con el ordenamiento
        try {
          const q = query(
            tareasRef,
            where('usuarioId', '==', currentUser.uid),
            orderBy('fechaCreacion', 'desc')
          );
          
          console.log('Configurando listener de Firestore para tareas con ordenamiento...');
          
          unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
              console.log('Nueva actualización de tareas recibida');
              const tareasData = [];
              querySnapshot.forEach((doc) => {
                if (doc.exists()) {
                  const data = doc.data();
                  // Convertir fechas de Firestore a objetos Date de manera segura
                  const fechaVencimiento = data.fechaVencimiento && 
                    typeof data.fechaVencimiento.toDate === 'function' 
                    ? data.fechaVencimiento.toDate() 
                    : null;
                  
                  const fechaCreacion = data.fechaCreacion && 
                    typeof data.fechaCreacion.toDate === 'function'
                    ? data.fechaCreacion.toDate()
                    : new Date();
                  
                  tareasData.push({ 
                    id: doc.id, 
                    ...data,
                    fechaVencimiento,
                    fechaCreacion
                  });
                }
              });
              console.log('Tareas cargadas:', tareasData.length);
              setTareas(tareasData);
              setCargando(false);
            }, 
            (error) => {
              console.error('Error en la suscripción a tareas:', error);
              // Si falla, intentamos sin ordenamiento
              console.log('Intentando cargar sin ordenamiento...');
              cargarSinOrdenamiento();
            }
          );
        } catch (error) {
          console.error('Error al configurar consulta ordenada:', error);
          cargarSinOrdenamiento();
        }
        
        // Función para cargar sin ordenamiento
        const cargarSinOrdenamiento = async () => {
          try {
            const q = query(
              tareasRef,
              where('usuarioId', '==', currentUser.uid)
            );
            
            console.log('Configurando listener de Firestore para tareas sin ordenamiento...');
            
            const querySnapshot = await getDocs(q);
            const tareasData = [];
            querySnapshot.forEach((doc) => {
              if (doc.exists()) {
                const data = doc.data();
                tareasData.push({ 
                  id: doc.id, 
                  ...data,
                  fechaVencimiento: data.fechaVencimiento?.toDate() || null,
                  fechaCreacion: data.fechaCreacion?.toDate() || new Date()
                });
              }
            });
            
            // Ordenar localmente
            tareasData.sort((a, b) => {
              const dateA = a.fechaCreacion instanceof Date ? a.fechaCreacion : new Date(a.fechaCreacion);
              const dateB = b.fechaCreacion instanceof Date ? b.fechaCreacion : new Date(b.fechaCreacion);
              return dateB - dateA; // Orden descendente
            });
            
            console.log('Tareas cargadas (sin ordenamiento del servidor):', tareasData.length);
            setTareas(tareasData);
            setCargando(false);
          } catch (error) {
            console.error('Error al cargar tareas sin ordenamiento:', error);
            setError(`Error al cargar las tareas: ${error.message}`);
            setCargando(false);
          }
        };
        
      } catch (error) {
        console.error('Error al cargar tareas:', error);
        setError(`Error al cargar las tareas: ${error.message}`);
        setCargando(false);
      }
      
      return () => {
        if (unsubscribe) {
          console.log('Limpiando suscripción a tareas');
          unsubscribe();
        }
      };
    };

    cargarTareas();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('asignacion.')) {
      const field = name.split('.')[1];
      setNuevaTarea({
        ...nuevaTarea,
        asignacion: {
          ...nuevaTarea.asignacion,
          [field]: value
        }
      });
    } else if (name.startsWith('nuevoContacto.')) {
      const field = name.split('.')[1];
      setNuevoContacto({
        ...nuevoContacto,
        [field]: value
      });
    } else {
      setNuevaTarea({
        ...nuevaTarea,
        [name]: value
      });
    }
  };
  
  const handleAsignarContacto = (contacto) => {
    const metodo = contacto.email ? 'email' : 'whatsapp';
    const contactoValue = contacto[metodo === 'email' ? 'email' : 'telefono'];
    
    setNuevaTarea({
      ...nuevaTarea,
      asignacion: {
        ...nuevaTarea.asignacion,
        metodo,
        contacto: contactoValue
      },
      asignadoA: contacto.nombre
    });
    setMostrarAsignar(false);
  };
  
  const limpiarAsignacion = () => {
    setNuevaTarea({
      ...nuevaTarea,
      asignacion: {
        metodo: '',
        contacto: '',
        enviado: false,
        fechaEnvio: null
      },
      asignadoA: ''
    });
  };
  
  const enviarAsignacion = () => {
    if (!nuevaTarea.asignacion.contacto) return;
    
    const { metodo, contacto } = nuevaTarea.asignacion;
    let url = '';
    
    if (metodo === 'email') {
      const subject = encodeURIComponent(`Tarea: ${nuevaTarea.titulo}`);
      const body = encodeURIComponent(
        `Hola,\n\nTe han asignado la siguiente tarea:\n\n` +
        `Título: ${nuevaTarea.titulo}\n` +
        `Descripción: ${nuevaTarea.descripcion || 'Sin descripción'}\n` +
        `Fecha de vencimiento: ${nuevaTarea.fechaVencimiento || 'Sin fecha'}\n\n` +
        `Por favor, confirma cuando la hayas completado.\n\n` +
        `Saludos`
      );
      url = `mailto:${contacto}?subject=${subject}&body=${body}`;
    } else if (metodo === 'whatsapp') {
      const message = encodeURIComponent(
        `*Nueva tarea asignada*\n\n` +
        `*Título:* ${nuevaTarea.titulo}\n` +
        `*Descripción:* ${nuevaTarea.descripcion || 'Sin descripción'}\n` +
        `*Vencimiento:* ${nuevaTarea.fechaVencimiento || 'Sin fecha'}\n\n` +
        `Por favor, confirma cuando la hayas completado.`
      );
      // Asumimos que el número está en formato internacional (ej: +521234567890)
      const numero = contacto.replace(/[^0-9+]/g, '');
      url = `https://wa.me/${numero}?text=${message}`;
    }
    
    if (url) {
      window.open(url, '_blank');
      
      // Actualizar el estado para marcar como enviado
      setNuevaTarea({
        ...nuevaTarea,
        asignacion: {
          ...nuevaTarea.asignacion,
          enviado: true,
          fechaEnvio: new Date().toISOString()
        }
      });
    }
  };

  const guardarNuevoContacto = async () => {
    if (!nuevoContacto.nombre.trim()) {
      setError('El nombre del contacto es obligatorio');
      return false;
    }
    
    if (!nuevoContacto.email && !nuevoContacto.telefono) {
      setError('Debes proporcionar al menos un email o teléfono');
      return false;
    }
    
    try {
      setCargandoContactos(true);
      const clientesRef = collection(db, 'clientes');
      const clienteData = {
        ...nuevoContacto,
        usuarioId: currentUser.uid,
        fechaCreacion: new Date().toISOString()
      };
      
      const docRef = await addDoc(clientesRef, clienteData);
      
      // Agregar el nuevo contacto a la lista
      const nuevoContactoGuardado = {
        id: docRef.id,
        ...nuevoContacto
      };
      
      setContactos([...contactos, nuevoContactoGuardado]);
      
      // Asignar automáticamente el nuevo contacto
      handleAsignarContacto(nuevoContactoGuardado);
      
      // Limpiar el formulario de nuevo contacto
      setNuevoContacto({ nombre: '', email: '', telefono: '' });
      setMostrarNuevoContacto(false);
      
      return true;
    } catch (error) {
      console.error('Error al guardar el contacto:', error);
      setError('Error al guardar el contacto: ' + error.message);
      return false;
    } finally {
      setCargandoContactos(false);
    }
  };

  const agregarTarea = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Debes iniciar sesión para agregar tareas');
      return;
    }
    
    if (!nuevaTarea.titulo.trim()) {
      setError('El título de la tarea es obligatorio');
      return;
    }
    
    // Si hay una asignación pero no se ha enviado, pedir confirmación
    if (nuevaTarea.asignacion.metodo && !nuevaTarea.asignacion.enviado) {
      const confirmar = window.confirm(
        '¿Deseas enviar la asignación de esta tarea ahora?\n\n' +
        'Si seleccionas "Cancelar", la tarea se guardará pero no se enviará la notificación.'
      );
      
      if (confirmar) {
        try {
          await enviarAsignacion();
        } catch (error) {
          console.error('Error al enviar asignación:', error);
          setError(`Error al enviar la asignación: ${error.message}`);
          return;
        }
      }
    }
    
    try {
      setCargando(true);
      setError(null);
      
      // Verificar que db esté inicializado
      if (!db) {
        throw new Error('La base de datos no está inicializada');
      }
      
      // Verificar que el usuario esté autenticado
      if (!currentUser || !currentUser.uid) {
        throw new Error('Usuario no autenticado');
      }
      
      const tareasRef = collection(db, 'tareas');
      console.log('Agregando nueva tarea...');
      
      try {
        // Crear objeto de tarea con los datos necesarios
        const tareaData = {
          titulo: nuevaTarea.titulo.trim(),
          descripcion: nuevaTarea.descripcion.trim(),
          fechaVencimiento: nuevaTarea.fechaVencimiento || null,
          completada: false,
          usuarioId: currentUser.uid,
          fechaCreacion: serverTimestamp(),
          fechaActualizacion: serverTimestamp(),
          asignacion: {
            metodo: nuevaTarea.asignacion?.metodo || '',
            contacto: nuevaTarea.asignacion?.contacto || '',
            enviado: nuevaTarea.asignacion?.enviado || false,
            fechaEnvio: nuevaTarea.asignacion?.fechaEnvio || null
          },
          asignadoA: nuevaTarea.asignadoA || null
        };
        
        console.log('Datos de la tarea a guardar:', tareaData);
        
        // Agregar la tarea a Firestore
        const docRef = await addDoc(tareasRef, tareaData);
        console.log('Tarea agregada con ID:', docRef.id);
        
        // Registrar actividad
        try {
          await registrarActividad(currentUser.uid, TIPOS_ACTIVIDAD.TAREA_CREADA, {
            tareaId: docRef.id,
            titulo: tareaData.titulo,
            asignadoA: tareaData.asignadoA || 'Sin asignar',
            fecha: new Date().toISOString()
          });
        } catch (actividadError) {
          console.warn('No se pudo registrar la actividad:', actividadError);
          // Continuar aunque falle el registro de actividad
        }
        
        return docRef.id;
      } catch (error) {
        console.error('Error al guardar en Firestore:', error);
        throw error; // Relanzar el error para manejarlo en el catch externo
      }
      
      // Limpiar el formulario
      setNuevaTarea({ 
        titulo: '', 
        descripcion: '', 
        fechaVencimiento: '', 
        completada: false,
        asignacion: {
          metodo: '',
          contacto: '',
          enviado: false,
          fechaEnvio: null
        },
        asignadoA: ''
      });
      
      // Mostrar mensaje de éxito
      setError('');
      
    } catch (error) {
      console.error('Error al agregar tarea:', error);
      setError(`Error al agregar la tarea: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const toggleCompletada = async (id) => {
    if (!currentUser) {
      setError('Debes iniciar sesión para actualizar tareas');
      return;
    }
    
    try {
      setCargando(true);
      setError(null);
      
      // Verificar que db esté inicializado
      if (!db) {
        throw new Error('La base de datos no está inicializada');
      }
      
      const tareaRef = doc(db, 'tareas', id);
      const tarea = tareas.find(t => t.id === id);
      
      if (!tarea) {
        throw new Error('No se encontró la tarea a actualizar');
      }
      
      const nuevaCompletada = !tarea.completada;
      
      console.log(`Actualizando estado de tarea ${id} a ${nuevaCompletada}`);
      
      await updateDoc(tareaRef, {
        completada: nuevaCompletada,
        fechaActualizacion: serverTimestamp()
      });
      
      // Registrar actividad
      await registrarActividad(currentUser.uid, 
        nuevaCompletada ? TIPOS_ACTIVIDAD.TAREA_COMPLETADA : TIPOS_ACTIVIDAD.TAREA_PENDIENTE,
        {
          tareaId: id,
          titulo: tarea.titulo,
          estado: nuevaCompletada ? 'completada' : 'pendiente'
        }
      );
      
      console.log('Tarea actualizada correctamente');
      
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      setError(`Error al actualizar la tarea: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const eliminarTarea = async (id) => {
    if (!currentUser) {
      setError('Debes iniciar sesión para eliminar tareas');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      return;
    }
    
    try {
      setCargando(true);
      setError(null);
      
      // Verificar que db esté inicializado
      if (!db) {
        throw new Error('La base de datos no está inicializada');
      }
      
      console.log(`Eliminando tarea con ID: ${id}`);
      
      await deleteDoc(doc(db, 'tareas', id));
      
      console.log('Tarea eliminada correctamente');
      
      // No es necesario actualizar el estado local ya que el listener de onSnapshot lo hará
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      setError(`Error al eliminar la tarea: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const tareasFiltradas = tareas.filter((tarea) => {
    if (filtro === 'completadas') return tarea.completada;
    if (filtro === 'pendientes') return !tarea.completada;
    return true;
  });

  return (
    <div className="tareas-container">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Tareas</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={agregarTarea} className="tarea-form">
        <div className="form-group">
          <input
            type="text"
            name="titulo"
            placeholder="Título de la tarea"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={nuevaTarea.titulo}
            onChange={handleInputChange}
            autoComplete="title"
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="descripcion"
            placeholder="Descripción (opcional)"
            rows="3"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={nuevaTarea.descripcion}
            onChange={handleInputChange}
            autoComplete="description"
          />
        </div>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de vencimiento (opcional):
          </label>
          <input
            type="date"
            name="fechaVencimiento"
            value={nuevaTarea.fechaVencimiento}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
        </div>
        
        <div className="form-group">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Asignar tarea (opcional):
            </label>
            {nuevaTarea.asignacion.metodo && (
              <button
                type="button"
                onClick={limpiarAsignacion}
                className="text-xs text-red-600 hover:text-red-800"
                title="Quitar asignación"
              >
                <FaTimes className="inline mr-1" /> Quitar
              </button>
            )}
          </div>
          
          {nuevaTarea.asignacion.metodo ? (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {nuevaTarea.asignacion.metodo === 'email' ? (
                      <>
                        <FaEnvelope className="inline mr-2 text-blue-500" />
                        Email: {nuevaTarea.asignacion.contacto}
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="inline mr-2 text-green-500" />
                        WhatsApp: {nuevaTarea.asignacion.contacto}
                      </>
                    )}
                  </p>
                  {nuevaTarea.asignadoA && (
                    <p className="text-sm text-gray-600">
                      A: {nuevaTarea.asignadoA}
                    </p>
                  )}
                  {nuevaTarea.asignacion.enviado ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Enviado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={enviarAsignacion}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enviar notificación
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative" ref={asignarRef}>
              <button
                type="button"
                onClick={() => setMostrarAsignar(!mostrarAsignar)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaUserPlus className="mr-2" />
                Asignar a contacto
              </button>
              
              {mostrarAsignar && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Buscar contacto..."
                      className="w-full p-2 border rounded text-sm"
                      value={busquedaContacto}
                      onChange={(e) => setBusquedaContacto(e.target.value)}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>
                  
                  {mostrarNuevoContacto ? (
                    <div className="p-3 border-b">
                      <h4 className="text-sm font-medium mb-2">Nuevo Contacto</h4>
                      <div className="space-y-2">
                        <div>
                          <input
                            type="text"
                            name="nuevoContacto.nombre"
                            placeholder="Nombre completo"
                            className="w-full p-2 border rounded text-sm"
                            value={nuevoContacto.nombre}
                            onChange={handleInputChange}
                            autoComplete="name"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            name="nuevoContacto.email"
                            placeholder="Email (opcional)"
                            className="w-full p-2 border rounded text-sm"
                            value={nuevoContacto.email}
                            onChange={handleInputChange}
                            autoComplete="email"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            name="nuevoContacto.telefono"
                            placeholder="Teléfono (opcional)"
                            className="w-full p-2 border rounded text-sm"
                            value={nuevoContacto.telefono}
                            onChange={handleInputChange}
                            autoComplete="tel"
                          />
                        </div>
                        <div className="flex justify-between space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMostrarNuevoContacto(false);
                              setNuevoContacto({ nombre: '', email: '', telefono: '' });
                            }}
                            className="flex-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={guardarNuevoContacto}
                            disabled={cargandoContactos}
                            className="flex-1 px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {cargandoContactos ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-auto">
                      <div className="p-2 border-b">
                        <button
                          type="button"
                          onClick={() => setMostrarNuevoContacto(true)}
                          className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center"
                        >
                          <FaUserPlus className="mr-2" />
                          Agregar nuevo contacto
                        </button>
                      </div>
                      
                      {cargandoContactos ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          Cargando contactos...
                        </div>
                      ) : contactosFiltrados.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          No se encontraron contactos
                        </div>
                      ) : (
                        <ul>
                          {contactosFiltrados.map((contacto) => (
                            <li key={contacto.id} className="border-b">
                              <button
                                type="button"
                                onClick={() => handleAsignarContacto(contacto)}
                                className="w-full text-left p-3 hover:bg-gray-100 text-sm flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">{contacto.nombre}</p>
                                  <p className="text-xs text-gray-500">
                                    {contacto.email && <><FaEnvelope className="inline mr-1" /> {contacto.email}</>}
                                    {contacto.email && contacto.telefono && ' • '}
                                    {contacto.telefono && <><FaWhatsapp className="inline mr-1" /> {contacto.telefono}</>}
                                  </p>
                                </div>
                                {contacto.email && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Email
                                  </span>
                                )}
                                {!contacto.email && contacto.telefono && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    WhatsApp
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <FaPlus className="mr-2" />
              Agregar Tarea
            </>
          )}
        </button>
      </form>

      <div className="filtros mb-6 flex space-x-2 bg-blue-600 p-1.5 rounded-lg">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            filtro === 'todas' 
              ? 'bg-white text-blue-700 shadow-md' 
              : 'text-white hover:bg-blue-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltro('pendientes')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            filtro === 'pendientes' 
              ? 'bg-white text-blue-700 shadow-md' 
              : 'text-white hover:bg-blue-700'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltro('completadas')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            filtro === 'completadas' 
              ? 'bg-white text-green-700 shadow-md' 
              : 'text-white hover:bg-green-600 bg-green-500'
          }`}
        >
          Completadas
        </button>
      </div>

      <div className="lista-tareas mt-6">
        {cargando ? (
          <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
        ) : tareasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay tareas {filtro !== 'todas' ? `en la categoría ${filtro}` : 'por mostrar'}
          </div>
        ) : (
          tareasFiltradas.map((tarea) => (
            <div
              key={tarea.id}
              className={`relative overflow-hidden transition-all duration-200 ${
                tarea.completada 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'bg-white border-l-4 border-blue-500'
              } rounded-lg shadow-sm hover:shadow-md mb-3`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium truncate ${
                        tarea.completada ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {tarea.titulo}
                      </h3>
                      {tarea.asignadoA && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                          tarea.asignacion?.metodo === 'email' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {tarea.asignacion?.metodo === 'email' ? (
                            <FaEnvelope className="inline mr-1" />
                          ) : tarea.asignacion?.metodo === 'whatsapp' ? (
                            <FaWhatsapp className="inline mr-1" />
                          ) : null}
                          {tarea.asignadoA}
                        </span>
                      )}
                    </div>
                    
                    {tarea.descripcion && (
                      <p className={`mt-1 text-sm ${
                        tarea.completada ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {tarea.descripcion}
                      </p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      {tarea.fechaVencimiento && (
                        <span className={`inline-flex items-center ${
                          tarea.completada 
                            ? 'text-gray-400' 
                            : new Date(tarea.fechaVencimiento) < new Date() 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                        }`}>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                          {new Date(tarea.fechaVencimiento) < new Date() && !tarea.completada && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Vencida
                            </span>
                          )}
                        </span>
                      )}
                      
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        tarea.completada 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tarea.completada ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {!tarea.completada && (
                      <button
                        onClick={() => toggleCompletada(tarea.id)}
                        className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Marcar como completada"
                        disabled={cargando}
                      >
                        <FaCheck className="w-4 h-4" />
                        <span className="sr-only">Completar</span>
                      </button>
                    )}
                    <button
                      onClick={() => eliminarTarea(tarea.id)}
                      className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Eliminar tarea"
                      disabled={cargando}
                    >
                      <FaTrashAlt className="w-4 h-4" />
                      <span className="sr-only">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tareas;