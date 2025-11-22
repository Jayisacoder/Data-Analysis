"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function ColumnStatsSummary(){
  const { analysis, rows } = useData();
  if(!analysis) return <div className="panel"><p style={{margin:0, opacity:.6}}>No column stats yet.</p></div>;
  const totalRows = rows.length || 1;
  const agg = analysis.columns.reduce((acc,c)=>{
    acc.missing += c.missing;
    acc.outliers += c.outliers.length;
    return acc;
  }, { missing:0, outliers:0 });
  return (
    <div className="panel column-stats-summary">
      <h3 className="panel-title">Column Summary</h3>
      <div className="summary-grid">
        <div className="summary-item"><span className="summary-label">Columns</span><span className="summary-val">{analysis.columns.length}</span></div>
        <div className="summary-item"><span className="summary-label">Total Rows</span><span className="summary-val">{totalRows}</span></div>
        <div className="summary-item"><span className="summary-label">Missing Cells</span><span className="summary-val">{agg.missing}</span></div>
        <div className="summary-item"><span className="summary-label">Outliers</span><span className="summary-val">{agg.outliers}</span></div>
      </div>
    </div>
  );
}