import React from 'react';
import './Table.css';

const Table = ({ columns, data, onRowClick, className = '' }) => {
  return (
    <div className={`table-wrapper ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={column.headerClassName || ''}
                style={{ width: column.width || 'auto' }}
              >
                <div className="th-content">
                  <span>{column.title}</span>
                  {column.sortable && (
                    <button className="sort-button">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1L10.5 5.5H3.5L7 1Z" fill="#9CA3AF"/>
                        <path d="M7 13L3.5 8.5H10.5L7 13Z" fill="#9CA3AF"/>
                      </svg>
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable-row' : ''}
            >
              {columns.map((column) => (
                <td 
                  key={`${row.id || rowIndex}-${column.key}`} 
                  className={column.cellClassName || ''}
                >
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex) 
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;