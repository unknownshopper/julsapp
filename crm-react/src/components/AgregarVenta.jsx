import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function AgregarVenta({ onVentaAgregada, proyectos }) {
  const { currentUser } = useAuth();
  const [monto, setMonto] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!monto || !proyecto) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setCargando(true);
      setError('');
      
      console.log('Intentando guardar venta con:', {
        monto: parseFloat(monto),
        proyecto,
        comentario: comentario || '',
        usuarioId: currentUser.uid,
        fecha: 'serverTimestamp',
        mes: new Date().toISOString().slice(0, 7)
      });
      
      const ventaRef = await addDoc(collection(db, 'ventas'), {
        monto: parseFloat(monto),
        proyecto,
        comentario: comentario || '',
        usuarioId: currentUser.uid,
        fecha: serverTimestamp(),
        mes: new Date().toISOString().slice(0, 7) // Formato YYYY-MM
      });
      
      console.log('Venta guardada con ID:', ventaRef.id);
      
      // Limpiar formulario
      setMonto('');
      setProyecto('');
      setComentario('');
      
      // Notificar al componente padre
      if (onVentaAgregada) onVentaAgregada();
      
    } catch (error) {
      console.error('Error detallado al guardar la venta:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setError(`Error al guardar la venta: ${error.message}. Por favor, inténtalo de nuevo.`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Venta</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
            Monto <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="monto"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="proyecto" className="block text-sm font-medium text-gray-700">
            Proyecto <span className="text-red-500">*</span>
          </label>
          <select
            id="proyecto"
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Selecciona un proyecto</option>
            {proyectos.map((p) => (
              <option key={p} value={p}>
                {p || 'Sin proyecto'}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder="Notas adicionales sobre esta venta..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={cargando}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Guardando...' : 'Guardar Venta'}
          </button>
        </div>
      </form>
    </div>
  );
}
