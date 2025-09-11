import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.link ? (
            <Link to={item.link} className="breadcrumb-link">
              {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">
              {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <svg className="breadcrumb-separator" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;