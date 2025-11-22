"use client";
import React, { useState } from 'react';
import { useData } from '../../lib/DataContext';
import ProgressBar from '../../components/data/ProgressBar';
import DetailedInsightsAccordion from '../../components/data/DetailedInsightsAccordion';
import DataPreview from '../../components/data/DataPreview';

export default function DetailsPage(){
  const { fileMeta, analysis, restartFlow } = useData();
  const [expanded, setExpanded] = useState(null);
  if(!fileMeta) return <main className="container"><p>No file loaded. Upload on home page.</p></main>;
  return (
    <main className="container details-screen">
      <ProgressBar current={3} />
      <header className="panel details-header">
        <h1 style={{margin:'0 0 .25rem'}}>Column-Level Insights — {fileMeta.name}</h1>
        <p style={{margin:0, fontSize:'.8rem', opacity:.75}}>Drill into per-column statistics, anomalies and remediation suggestions.</p>
      </header>
      <DataPreview highlight title="Highlighted Data Preview" />
      <DetailedInsightsAccordion expanded={expanded} onToggle={setExpanded} analysis={analysis} />
      <footer className="panel details-actions">
        <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
          <button className="secondary-btn" onClick={()=>window.location.href='/dashboard'}>← Back to Dashboard</button>
          <button className="secondary-btn" onClick={restartFlow}>Start Over</button>
        </div>
      </footer>
    </main>
  );
}