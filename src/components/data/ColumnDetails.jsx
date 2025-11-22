"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function ColumnDetails() {
  const { analysis } = useData();
  if (!analysis) return <div className="panel">No column details.</div>;
  return (
    <div className="panel">
      <h3>Column Analysis</h3>
      <div className="table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              <th>Column</th><th>Type</th><th>Missing</th><th>Unique</th><th>Outliers</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(analysis.stats).map(([col, st]) => (
              <tr key={col}>
                <td>{col}</td>
                <td>{st.type}</td>
                <td>{st.missing}</td>
                <td>{st.unique}</td>
                <td>{st.outliers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
