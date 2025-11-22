"use client";
import React from 'react';

export default function DetailedInsightsAccordion({ analysis, expanded, onToggle }){
  if(!analysis) return <div className="panel"><p style={{margin:0, opacity:.6}}>No analysis yet.</p></div>;
  const cols = analysis.columns;
  return (
    <div className="panel detailed-accordion">
      <h3 className="panel-title">Per-Column Details</h3>
      <ul className="accordion-list">
        {cols.map(c => {
          const isOpen = expanded === c.name;
          const total = analysis.rows || 0; // not stored currently
          return (
            <li key={c.name} className={`acc-item ${isOpen?'open':''}`}> 
              <button className="acc-toggle" onClick={()=>onToggle(isOpen?null:c.name)} aria-expanded={isOpen}>{c.name}</button>
              {isOpen && (
                <div className="acc-panel">
                  <div className="acc-row"><strong>Missing:</strong> {c.missing}</div>
                  <div className="acc-row"><strong>Distinct:</strong> {c.uniqueCount}</div>
                  <div className="acc-row"><strong>Outliers:</strong> {c.outliers.length}</div>
                  {c.outliers.length>0 && (
                    <div className="acc-row"><strong>Outlier Values:</strong> {c.outliers.slice(0,10).join(', ')}{c.outliers.length>10?'…':''}</div>
                  )}
                  {renderRecommendations(c)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function renderRecommendations(c){
  const recs = [];
  if(c.missing>0) recs.push('Consider imputing missing values or dropping rows if coverage critical.');
  if(c.outliers.length>0) recs.push('Validate extreme values; apply clipping or investigate source system anomalies.');
  const density = c.uniqueCount; // simple proxy
  if(c.uniqueCount > 0.95) recs.push('High cardinality may hinder grouping operations; evaluate need to bucket or encode.');
  if(recs.length===0) return <div className="acc-row"><em>No remediation suggestions — column appears clean.</em></div>;
  return (
    <div className="acc-row"><strong>Suggestions:</strong> <ul className="suggest-list">{recs.map((r,i)=><li key={i}>{r}</li>)}</ul></div>
  );
}