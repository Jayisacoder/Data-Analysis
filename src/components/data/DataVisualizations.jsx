"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DataVisualizations() {
  const { analysis } = useData();
  if (!analysis) return <div className="panel">No metrics to visualize.</div>;
  const completeness = Object.entries(analysis.stats).map(([col, st]) => ({ col, value: (1 - st.missing/st.total)*100 }));
  const types = Object.entries(analysis.stats).reduce((acc,[col, st])=> { acc[st.type] = (acc[st.type]||0)+1; return acc; }, {});

  return (
    <div className="panel">
      <h3>Data Quality Visualizations</h3>
      <div className="charts-grid">
        <div className="chart-item">
          <Bar data={{
            labels: completeness.map(c=>c.col),
            datasets: [{ label: 'Completeness %', data: completeness.map(c=>c.value), backgroundColor: '#3b82f6' }]
          }} options={{ responsive:true, plugins:{legend:{display:false}} }} />
        </div>
        <div className="chart-item">
          <Pie data={{
            labels: Object.keys(types),
            datasets: [{ data: Object.values(types), backgroundColor: ['#10b981','#f59e0b','#6b7280'] }]
          }} options={{ responsive:true }} />
        </div>
      </div>
    </div>
  );
}
