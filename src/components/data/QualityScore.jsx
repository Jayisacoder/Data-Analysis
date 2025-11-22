"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';
import { qualityState } from '../../lib/dataAnalysis';

export default function QualityScore() {
  const { analysis } = useData();
  if (!analysis) return <div className="quality-card"><div className="quality-score neutral"><span className="score-value">--</span><div className="score-details"><span className="score-label">Neutral</span><span style={{fontSize:'.65rem',opacity:.8}}>No data loaded</span></div></div></div>;
  const state = qualityState(analysis.score);
  const scoreClass = `quality-score ${state.label.toLowerCase()}`;
  return (
    <div className="quality-card">
      <div className={scoreClass}>
        <span className="score-value" aria-label="Quality score value">{analysis.score}</span>
        <div className="score-details">
          <span className="score-label" aria-label="Quality score rating">{state.label}</span>
          <span style={{fontSize:'.65rem',opacity:.85}}>Overall data quality</span>
        </div>
      </div>
      <ul className="metric-list" aria-label="Column completeness metrics">
        {Object.entries(analysis.stats).slice(0,8).map(([col, st]) => (
          <li key={col}>{col}: {Math.round((1 - st.missing/st.total)*100)}% complete</li>
        ))}
      </ul>
    </div>
  );
}
