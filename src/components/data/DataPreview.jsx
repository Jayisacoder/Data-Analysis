"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function DataPreview({ highlight=false, title }) {
  const { rows, analysis } = useData();
  if (!rows || rows.length === 0) return <div className="panel">No data loaded.</div>;
  const columns = Object.keys(rows[0]);
  const limited = rows.slice(0, 25);
  const outlierMap = {};
  if (highlight && analysis && analysis.columns) {
    analysis.columns.forEach(c => { if (c.outliers && c.outliers.length) outlierMap[c.name] = new Set(c.outliers); });
  }
  return (
    <div className="panel">
      <h3>{title || `Data Preview (first ${limited.length} rows)`}</h3>
      <div className="table-wrapper">
        <table className="preview-table">
          <thead><tr>{columns.map(c=> <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {limited.map((r,i)=>(
              <tr key={i}>{columns.map(c=> {
                const v = r[c];
                const isMissing = v === null || v === undefined || v === '';
                const isOutlier = outlierMap[c] && typeof v === 'number' && outlierMap[c].has(v);
                const cls = isMissing ? 'cell-missing' : isOutlier ? 'cell-outlier' : '';
                return <td key={c} className={cls}>{String(v)}</td>;
              })}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {highlight && (
        <div className="legend" style={{marginTop:'.5rem', display:'flex', gap:'1rem', fontSize:'.6rem', opacity:.75}}>
          <span><span className="legend-box missing" /> Missing</span>
          <span><span className="legend-box outlier" /> Outlier</span>
        </div>
      )}
    </div>
  );
}
