import React from 'react';
import './AnalyticsChart.css';

const AnalyticsChart = ({ data, total }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate smooth curve path for the chart
  const generatePath = () => {
    const width = 800;
    const height = 200;
    const padding = 50;
    const points = 12;
    
    let path = `M ${padding},${height - padding}`;
    
    for (let i = 0; i < points; i++) {
      const x = padding + (i * (width - 2 * padding) / (points - 1));
      const y = height - padding - (Math.random() * 50 + 30);
      
      if (i === 0) {
        path += ` L${x},${y}`;
      } else {
        const prevX = padding + ((i - 1) * (width - 2 * padding) / (points - 1));
        const controlX = (prevX + x) / 2;
        path += ` Q${controlX},${y} ${x},${y}`;
      }
    }
    
    return path;
  };

  return (
    <div className="analytics-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Total Postcards Sent</h3>
        <div className="chart-total">{total.toLocaleString()}</div>
      </div>
      
      <div className="chart-wrapper">
        <svg className="chart-svg" viewBox="0 0 800 250" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="50"
              y1={50 + i * 30}
              x2="750"
              y2={50 + i * 30}
              stroke="#F3F4F6"
              strokeWidth="1"
            />
          ))}
          
          {/* Chart line */}
          <path
            d={generatePath()}
            stroke="#8B5CF6"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Area fill */}
          <path
            d={`${generatePath()} L750,200 L50,200 Z`}
            fill="url(#chartGradient)"
          />
        </svg>
        
        <div className="chart-labels">
          {months.map((month) => (
            <span key={month} className="month-label">{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;