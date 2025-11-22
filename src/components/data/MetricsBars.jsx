"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function MetricsBars(){
  const { analysis } = useData();
  if(!analysis || !analysis.qualityMetrics) return <div className="panel"><p style={{margin:0, opacity:.6}}>No metrics yet.</p></div>;
  const qm = analysis.qualityMetrics;
  const metrics = [
    { label:'Completeness', val:qm.completeness, desc:'Non-missing cell ratio' },
    { label:'Consistency', val:qm.consistency, desc:'Type & format uniformity' },
    { label:'Accuracy', val:qm.accuracy, desc:'Low numeric anomaly presence' },
    { label:'Validity', val:qm.validity, desc:'Distinct / valid value ratio' }
  ];
  return (
    <div className="panel metrics-bars">
      <h3 className="panel-title">Key Metrics</h3>
      <ul className="metrics-list">
        {metrics.map(m => (
          <li key={m.label} className="metric-item">
            <div className="metric-head"><strong>{m.label}</strong><span className="metric-val">{(m.val*100).toFixed(1)}%</span></div>
            <div className="bar-wrap"><div className="bar-fill" style={{width:`${m.val*100}%`}} /></div>
            <div className="metric-desc">{m.desc}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// avg helper removed (metrics precomputed)