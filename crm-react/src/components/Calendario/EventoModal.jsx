import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal, Button, Typography, Divider, Chip, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const ModalContent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  outline: 'none',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '90vh',
  overflowY: 'auto',
}));

const InfoRow = ({ label, value }) => (
  <Grid container spacing={2} sx={{ mb: 1 }}>
    <Grid item xs={12} sm={3}>
      <Typography variant="subtitle2" color="textSecondary">
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={12} sm={9}>
      <Typography variant="body1">{value || 'No especificado'}</Typography>
    </Grid>
  </Grid>
);

const EventoModal = ({ open, onClose, evento, onEdit }) => {
  if (!evento) return null;

  const esProyecto = evento.resource?.tipo === 'proyecto';
  const datos = evento.resource?.proyectoData || evento.resource || {};
  const estado = evento.resource?.estado || 'pendiente';

  const getEstadoColor = () => {
    switch (estado) {
      case 'completado':
        return 'success';
      case 'cancelado':
        return 'error';
      case 'en_progreso':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No especificada';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return format(dateObj, "PPPP 'a las' hh:mm a", { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  return (
    <StyledModal open={open} onClose={onClose}>
      <ModalContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {esProyecto ? 'Detalles del Proyecto' : 'Detalles del Evento'}
          </Typography>
          <Chip 
            label={estado.replace('_', ' ').toUpperCase()} 
            color={getEstadoColor()}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {evento.title}
          </Typography>
          
          {evento.resource?.descripcion && (
            <Typography variant="body1" paragraph>
              {evento.resource.descripcion}
            </Typography>
          )}
        </Box>


        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Fechas
          </Typography>
          <InfoRow label="Inicio" value={formatDate(evento.start)} />
          <InfoRow label="Fin" value={formatDate(evento.end)} />
          
          {esProyecto && datos.fechaEntrega && (
            <InfoRow 
              label="Fecha de entrega" 
              value={formatDate(datos.fechaEntrega)} 
            />
          )}
        </Box>

        {esProyecto && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Detalles del Proyecto
              </Typography>
              <InfoRow label="Cliente" value={datos.cliente} />
              <InfoRow label="Presupuesto" value={datos.presupuesto ? `$${datos.presupuesto.toLocaleString()}` : 'No especificado'} />
              <InfoRow label="Responsable" value={datos.responsable} />
            </Box>

            {datos.contactos?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contactos
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {datos.contactos.map((contacto, index) => (
                    <Chip 
                      key={index} 
                      label={contacto.nombre} 
                      variant="outlined" 
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => onEdit(evento)}
          >
            Editar
          </Button>
        </Box>
      </ModalContent>
    </StyledModal>
  );
};

export default EventoModal;
