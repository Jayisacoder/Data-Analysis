"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';
import ProgressBar from '../../components/data/ProgressBar';
import QualityScore from '../../components/data/QualityScore';

export default function PreviewPage() {
  const { fileMeta, rows, analysis, phase, goDashboard } = useData();

  if (!fileMeta) {
    return <main className="container"><p>No file loaded. Return <a href="/">home</a> to upload.</p></main>;
  }

  const columns = analysis?.columns || [];
  const sampleRows = rows.slice(0, 5);

  return (
    <main className="container preview-screen">
      <ProgressBar current={1} />
      <header className="panel preview-header">
        <h1 className="preview-title">Preview: {fileMeta.name}</h1>
        <p className="preview-sub">Phase: {phase} | Rows: {rows.length} | Columns: {columns.length}</p>
      </header>
      <section className="panel preview-score">
        <QualityScore />
      </section>
      <section className="panel preview-sample">
        <h3 style={{marginTop:0}}>Sample Rows (first 5)</h3>
        <div className="table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                {columns.map(c => <th key={c.name}>{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((r,i)=>(
                <tr key={i}>{columns.map(c => <td key={c.name}>{String(r[c.name] ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel preview-columns">
        <h3 style={{marginTop:0}}>Column Summary</h3>
        <ul className="column-summary-list">
          {columns.map(c => (
            <li key={c.name}>
              <strong>{c.name}</strong> — Missing: {c.missing} | Unique: {c.uniqueCount} | Outliers: {c.outliers.length}
            </li>
          ))}
        </ul>
      </section>
      <footer className="panel preview-actions">
        <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
          <button className="secondary-btn" onClick={()=>window.location.href='/'}>← Back to Upload</button>
          <button className="primary-btn" onClick={goDashboard}>Continue to Dashboard →</button>
        </div>
      </footer>
    </main>
  );
}