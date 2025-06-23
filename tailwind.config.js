/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Desactivar purga en desarrollo
  safelist: [],
  theme: {
    extend: {},
  },
  plugins: [],
  // Configuración de purga para producción
  purge: process.env.NODE_ENV === 'production' ? {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Mantener estas clases aunque no se usen
    safelist: [
      'bg-blue-500',
      'bg-red-500',
      'bg-green-500',
      'bg-yellow-500',
      'text-white',
      'p-4',
      'm-2',
      'rounded',
      'shadow',
      'hover:bg-opacity-90'
    ]
  } : false,
}
