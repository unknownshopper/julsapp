import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const registrarActividad = async (usuarioId, accion, detalles = {}) => {
  try {
    await addDoc(collection(db, 'actividades'), {
      usuarioId,
      accion,
      detalles,
      fecha: serverTimestamp(),
      leida: false
    });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
  }
};

export const TIPOS_ACTIVIDAD = {
  CLIENTE_CREADO: 'Cliente creado',
  CLIENTE_ACTUALIZADO: 'Cliente actualizado',
  TAREA_CREADA: 'Tarea creada',
  TAREA_COMPLETADA: 'Tarea completada',
  TAREA_PENDIENTE: 'Tarea marcada como pendiente',
  VENTA_REGISTRADA: 'Venta registrada',
  NOTA_AGREGADA: 'Nota agregada',
  COMENTARIO_AGREGADO: 'Comentario agregado'
};
