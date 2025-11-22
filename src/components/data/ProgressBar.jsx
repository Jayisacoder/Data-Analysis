"use client";
import React from 'react';

// current: 0 Upload, 1 Preview, 2 Dashboard, 3 Details
export default function ProgressBar({ current=0 }){
  const steps = ['Upload','Preview','Dashboard','Details'];
  return (
    <div className="progress-bar" aria-label="Workflow progress">
      {steps.map((s,i)=>(
        <div key={s} className={`progress-step ${i<=current?'active':''}`}> 
          <span className="step-index">{i+1}</span>
          <span className="step-label">{s}</span>
        </div>
      ))}
    </div>
  );
}