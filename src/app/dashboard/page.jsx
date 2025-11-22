"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';
import FileUpload from '../../components/FileUpload';
import QualityScore from '../../components/data/QualityScore';
import DataVisualizations from '../../components/data/DataVisualizations';
import AIInsights from '../../components/data/AIInsights';
import MetricsBars from '../../components/data/MetricsBars';
import ColumnStatsSummary from '../../components/data/ColumnStatsSummary';
import ColumnIssues from '../../components/data/ColumnIssues';
import ProgressBar from '../../components/data/ProgressBar';

export default function DashboardPage(){
  const { fileMeta, analysis, goDetails, restartFlow } = useData();
  if(!fileMeta) return <main className="container"><p>No file loaded. Upload on home page.</p></main>;
  return (
    <main className="container dashboard-screen">
      <ProgressBar current={2} />
      <header className="panel dash-header">
        <h1 style={{margin:'0 0 .25rem'}}>{fileMeta.name} — Data Quality Dashboard</h1>
        <p style={{margin:0, fontSize:'.8rem', opacity:.75}}>Explore overall quality metrics, AI insights & detected issues.</p>
      </header>
      <section className="dash-top-grid">
        <div className="score-recommend">
          <QualityScore />
          <MetricsBars />
        </div>
        <div className="recommend-panel">
          <AIInsights />
        </div>
      </section>
      <section className="dash-mid-grid">
        <DataVisualizations />
      </section>
      <section className="dash-bottom-grid">
        <ColumnStatsSummary />
        <ColumnIssues />
      </section>
      <footer className="panel dash-actions">
        <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
          <button className="secondary-btn" onClick={()=>window.location.href='/preview'}>← Back to Preview</button>
          <button className="primary-btn" onClick={goDetails} disabled={!analysis}>View Detailed Column Insights →</button>
          <button className="secondary-btn" onClick={restartFlow}>Start Over</button>
        </div>
      </footer>
    </main>
  );
}