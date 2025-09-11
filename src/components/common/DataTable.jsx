import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, onRowAction }) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr className="table-header-row">
            {columns.map((column) => (
              <th key={column.key} className={`table-header ${column.className || ''}`}>
                <div className="header-content">
                  <span>{column.title}</span>
                  {column.sortable && (
                    <svg className="sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 3L9 7H3L6 3Z" fill="#9CA3AF"/>
                      <path d="M6 9L3 5H9L6 9Z" fill="#E5E7EB"/>
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="table-row">
              {columns.map((column) => (
                <td key={column.key} className={`table-cell ${column.cellClassName || ''}`}>
                  {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;