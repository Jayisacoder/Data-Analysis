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

  // Data quality issues summary for pie chart
  const missingCols = Object.entries(analysis.stats).filter(([_, st]) => st.missing > 0).length;
  const outlierCols = Object.entries(analysis.stats).filter(([_, st]) => st.outliers > 0).length;
  const duplicateCols = Object.entries(analysis.stats).filter(([_, st]) => st.unique < st.total).length;
  const cleanCols = Object.entries(analysis.stats).filter(([_, st]) => st.missing === 0 && st.outliers === 0 && st.unique === st.total).length;

  const qualityLabels = ['Clean', 'Missing Values', 'Outliers', 'Duplicates'];
  const qualityData = [cleanCols, missingCols, outlierCols, duplicateCols];
  const qualityColors = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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
            labels: qualityLabels,
            datasets: [{ data: qualityData, backgroundColor: qualityColors }]
          }} options={{
            responsive:true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    if (label === 'Clean') return `${label}: ${value} columns with no issues`;
                    if (label === 'Missing Values') return `${label}: ${value} columns have missing data`;
                    if (label === 'Outliers') return `${label}: ${value} columns have outliers`;
                    if (label === 'Duplicates') return `${label}: ${value} columns have duplicates`;
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
}
