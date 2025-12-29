
import React from 'react';

export const TrendChart: React.FC<{ data: number[] }> = ({ data }) => {
  const width = 200;
  const height = 40;
  const padding = 4;
  
  const max = Math.max(...data, 100);
  const min = 0;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val - min) / (max - min)) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A63FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0A63FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${points} V ${height} H ${padding} Z`}
        fill="url(#trendGradient)"
      />
      <polyline
        fill="none"
        stroke="#0A63FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((val, i) => {
         const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
         const y = height - ((val - min) / (max - min)) * (height - padding * 2) - padding;
         return i === data.length - 1 ? (
           <circle key={i} cx={x} cy={y} r="3" fill="#0A63FF" stroke="white" strokeWidth="1" />
         ) : null;
      })}
    </svg>
  );
};
