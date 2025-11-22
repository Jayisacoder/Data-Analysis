"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function AIInsights() {
  const { insights, runInsights, analysis } = useData();
  return (
    <div className="panel">
      <h3>AI-Powered Insights</h3>
      <button className="cta-btn" disabled={!analysis} onClick={runInsights}>Generate Insights</button>
      <div className="insights-list">
        {insights.length === 0 && <p className="placeholder">No insights yet.</p>}
        {insights.map((line,i)=>(<p key={i} className="insight-line">{line}</p>))}
      </div>
    </div>
  );
}
