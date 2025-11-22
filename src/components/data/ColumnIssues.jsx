"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function ColumnIssues(){
  const { analysis, rows } = useData();
  if(!analysis) return <div className="panel"><p style={{margin:0, opacity:.6}}>No issues yet.</p></div>;
  const totalRows = rows.length || 1;
  const issues = [];
  analysis.columns.forEach(c => {
    if(c.missing>0) issues.push({ col:c.name, type:'Missing Values', detail:`${c.missing} missing (${((c.missing/totalRows)*100).toFixed(1)}%)`, severity: severity(c.missing/totalRows)});
    if(c.outliers.length>0) issues.push({ col:c.name, type:'Outliers', detail:`${c.outliers.length} potential numeric anomalies`, severity: severity(c.outliers.length/totalRows)});
    const distinctRatio = c.uniqueCount/totalRows;
    if(distinctRatio > 0.95 && totalRows > 20) issues.push({ col:c.name, type:'High Cardinality', detail:`Distinct ratio ${(distinctRatio*100).toFixed(1)}%`, severity:'low' });
  });
  return (
    <div className="panel column-issues">
      <h3 className="panel-title">Column Issues</h3>
      {issues.length===0? <p style={{margin:0}}>No notable issues detected.</p> : (
        <ul className="issues-list">
          {issues.map((i,idx)=>(
            <li key={idx} className={`issue-item sev-${i.severity}`}> 
              <strong>{i.col}</strong> — {i.type}: {i.detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function severity(r){
  if(r>0.2) return 'high';
  if(r>0.05) return 'med';
  if(r>0) return 'low';
  return 'none';
}