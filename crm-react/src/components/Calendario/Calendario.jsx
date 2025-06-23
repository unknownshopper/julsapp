import React, { useState, useCallback, useRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import isSameDay from 'date-fns/isSameDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendario.css';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

import { es } from 'date-fns/locale';
import EventoModal from './EventoModal';

const locales = {
  'es-ES': es
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes como primer día de la semana
  getDay,
  locales,
});

// Componente de navegación personalizado
const CustomToolbar = ({ date, view, onNavigate, onView }) => {
  const goToToday = () => onNavigate(new Date());
  const goToPrevious = () => {
    if (view === 'month') return onNavigate(subMonths(date, 1));
    if (view === 'week') return onNavigate(subWeeks(date, 1));
    return onNavigate(subDays(date, 1));
  };
  const goToNext = () => {
    if (view === 'month') return onNavigate(addMonths(date, 1));
    if (view === 'week') return onNavigate(addWeeks(date, 1));
    return onNavigate(addDays(date, 1));
  };
  const changeView = (newView) => onView(newView);

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-2">
        <button
          onClick={goToToday}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Hoy
        </button>
        <button
          onClick={goToPrevious}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          &lt;
        </button>
        <button
          onClick={goToNext}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          &gt;
        </button>
        <span className="px-3 py-1 font-semibold">
          {format(date, 'MMMM yyyy', { locale: es })}
        </span>
      </div>
      <div className="flex space-x-2">
        {['month', 'week', 'day', 'agenda'].map((viewType) => (
          <button
            key={viewType}
            onClick={() => changeView(viewType)}
            className={`px-3 py-1 rounded transition ${
              view === viewType
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente personalizado para mostrar eventos
const EventComponent = ({ event }) => (
  <div className="p-1">
    <div className="font-semibold truncate">{event.title}</div>
    {event.resource.proyectoId && (
      <div className="text-xs opacity-75 truncate">
        Proyecto: {event.resource.proyectoId}
      </div>
    )}
    {!event.allDay && (
      <div className="text-xs">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
    )}
  </div>
);

const Calendario = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef(null);

  // Función para convertir diferentes formatos de fecha a Date
  const parseFirebaseDate = (dateValue) => {
    if (!dateValue) return new Date();
    
    // Si es un timestamp de Firestore
    if (typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Si es un string de fecha ISO
    if (typeof dateValue === 'string') {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    // Si es un objeto de fecha de JavaScript
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Si no se pudo parsear, devolver la fecha actual
    console.warn('No se pudo parsear la fecha:', dateValue);
    return new Date();
  };

  // Función para cargar los proyectos desde Firestore
  const loadProyectos = useCallback(async () => {
    if (!currentUser) return [];
    
    try {
      setLoading(true);
      const proyectosRef = collection(db, 'proyectos');
      const q = query(
        proyectosRef, 
        where('usuarioId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const proyectosData = [];
      
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          const fechaInicio = parseFirebaseDate(data.fechaInicio);
          const fechaEntrega = parseFirebaseDate(data.fechaEntrega);
          
          // Validar que las fechas sean válidas
          if (isNaN(fechaInicio.getTime()) || isNaN(fechaEntrega.getTime())) {
            console.warn('Fechas inválidas para el proyecto:', data.nombre);
            return; // Saltar este proyecto
          }
          
          // Crear un solo evento que abarque desde la fecha de inicio hasta la fecha de entrega
          proyectosData.push({
            id: `proyecto-${doc.id}`,
            title: data.nombre,
            start: fechaInicio,
            end: fechaEntrega,
            allDay: true,
            resource: {
              descripcion: data.descripcion || 'Proyecto',
              proyectoId: doc.id,
              tipo: 'proyecto',
              estado: data.estado || 'pendiente',
              fechaInicio: fechaInicio,
              fechaEntrega: fechaEntrega,
              proyectoData: data // Guardar todos los datos del proyecto
            }
          });
        } catch (error) {
          console.error('Error procesando proyecto:', doc.id, error);
        }
      });
      
      return proyectosData;
    } catch (err) {
      console.error('Error cargando proyectos:', err);
      setError('Error al cargar los proyectos');
      return [];
    }
  }, [currentUser]);
  
  // Función para cargar los eventos desde Firestore
  const loadEventos = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const eventosRef = collection(db, 'eventos');
      const q = query(
        eventosRef, 
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const eventosData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventosData.push({
          id: doc.id,
          title: data.titulo || 'Sin título',
          start: data.fechaInicio?.toDate() || new Date(),
          end: data.fechaFin?.toDate() || new Date(),
          allDay: data.todoElDia || false,
          resource: {
            descripcion: data.descripcion || '',
            proyectoId: data.proyectoId || null,
            tipo: data.tipo || 'general'
          }
        });
      });
      
      return eventosData;
    } catch (err) {
      console.error('Error cargando eventos:', err);
      setError('Error al cargar los eventos');
      return [];
    }
  }, [currentUser]);
  
  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar proyectos y eventos en paralelo
      const [proyectosCargados, eventosCargados] = await Promise.all([
        loadProyectos(),
        loadEventos()
      ]);
      
      // Combinar y ordenar por fecha de inicio
      const todosLosEventos = [...(proyectosCargados || []), ...(eventosCargados || [])]
        .sort((a, b) => a.start - b.start);
      
      setEvents(todosLosEventos);
      setProyectos(proyectosCargados || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos del calendario');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Cargar datos al montar el componente
  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Formatear la fecha para mostrar en el evento
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#1e5a8a';
    let textColor = 'white';
    let opacity = 0.9;
    let borderLeft = `4px solid ${borderColor}`;
    
    // Establecer colores según el tipo de evento
    if (event.resource.tipo === 'reunion') {
      backgroundColor = '#4caf50'; // Verde para reuniones
      borderColor = '#3d8b40';
    } else if (event.resource.tipo === 'tarea') {
      backgroundColor = '#ff9800'; // Naranja para tareas
      borderColor = '#cc7a00';
    } else if (event.resource.tipo === 'recordatorio') {
      backgroundColor = '#f44336'; // Rojo para recordatorios
      borderColor = '#d32f2f';
    } else if (event.resource.tipo === 'proyecto') {
      backgroundColor = '#9c27b0'; // Morado para proyectos
      borderColor = '#7b1fa2';
      // Si el proyecto es de varios días, mostrarlo con un borde izquierdo más grueso
      const diffTime = Math.abs(event.end - event.start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        borderLeft = '8px solid #4a148c';
      }
    }
    
    // Estilo según el estado del proyecto
    if (event.resource.estado === 'completado') {
      backgroundColor = '#757575'; // Gris para proyectos completados
      borderColor = '#616161';
      opacity = 0.7;
    } else if (event.resource.estado === 'cancelado') {
      backgroundColor = '#f44336'; // Rojo para proyectos cancelados
      borderColor = '#d32f2f';
      textColor = 'white';
      opacity = 0.6;
    }

    // Verificar si el evento es hoy
    const isToday = isSameDay(event.start, new Date()) || isSameDay(event.end, new Date());
    
    // Estilos base para todos los eventos
    const baseStyles = {
      backgroundColor,
      borderRadius: '4px',
      opacity,
      color: textColor,
      border: 'none',
      borderLeft: borderLeft,
      display: 'block',
      padding: '4px 8px',
      fontSize: '0.85em',
      boxShadow: isToday ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none',
      transition: 'all 0.2s ease',
      fontWeight: event.resource.tipo === 'proyecto' ? '600' : 'normal',
      textDecoration: event.resource.estado === 'cancelado' ? 'line-through' : 'none',
      margin: '1px 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };

    // Estilos adicionales para eventos de varios días
    if (event.resource.tipo === 'proyecto') {
      const diffTime = Math.abs(event.end - event.start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        baseStyles.borderRadius = '0 4px 4px 0';
        baseStyles.margin = '2px 0';
        baseStyles.padding = '6px 10px';
      }
    }

    return {
      style: baseStyles
    };
  };

  // Manejar la selección de una ranura de tiempo
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('Nuevo evento:');
    if (title) {
      // Aquí podrías implementar la lógica para guardar el nuevo evento
      console.log('Nuevo evento:', { title, start, end });
      // loadEvents(); // Recargar eventos después de agregar uno nuevo
    }
  };

  // Manejar la selección de un evento existente
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Manejar el cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Manejar la edición del evento
  const handleEditEvent = (event) => {
    console.log('Editar evento:', event);
    // Aquí puedes redirigir a un formulario de edición o abrir otro modal
    // Por ahora, solo cerramos el modal
    handleCloseModal();
  };

  if (loading) {
    return <div className="p-4">Cargando calendario...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  // Función para cambiar la vista
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Función para navegar entre fechas
  const handleNavigate = (newDate, view) => {
    setCurrentDate(newDate);
  };

  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Calendario de Actividades</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col">
        <BigCalendar
          ref={calendarRef}
          localizer={localizer}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ flex: 1 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                onView={handleViewChange}
              />
            ),
            event: EventComponent,
          }}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango de fechas.',
            showMore: (count) => `+${count} más`,
          }}
          min={new Date(0, 0, 0, 8, 0, 0)} // Hora de inicio del día
          max={new Date(0, 0, 0, 22, 0, 0)} // Hora de fin del día
          step={30} // Intervalo de tiempo en minutos
          timeslots={2} // Número de intervalos por hora
          defaultDate={new Date()}
          scrollToTime={new Date(1970, 1, 1, 8)} // Hora a la que hacer scroll al cargar
        />
        
        <EventoModal
          open={isModalOpen}
          onClose={handleCloseModal}
          evento={selectedEvent}
          onEdit={handleEditEvent}
        />
      </div>
    </div>
  );
};

export default Calendario;
