import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ 
  title, 
  description, 
  type = 'primary', 
  image, 
  icon: Icon, 
  footer, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`card ${type} ${className}`}
      {...props}
    >
      {image && (
        <img 
          src={image} 
          alt={title || 'Card header'} 
          className="card-image"
        />
      )}
      
      <div className="card-content">
        {(Icon || type) && (
          <div 
            className="card-icon" 
            style={{
              backgroundColor: !Icon && {
                primary: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444'
              }[type]
            }}
          >
            {Icon && <Icon size={20} />}
          </div>
        )}
        
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  type: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  image: PropTypes.string,
  icon: PropTypes.elementType,
  footer: PropTypes.node,
  className: PropTypes.string
};

export default Card;