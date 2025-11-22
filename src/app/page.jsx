"use client";
import React from 'react';
import FileUpload from '../components/FileUpload';
import { useData } from '../lib/DataContext';
import ProgressBar from '../components/data/ProgressBar';

export default function Home() {
  const { recentAnalyses } = useData();
  return (
    <main className="container home-screen">
      <ProgressBar current={0} />
      <div className="panel headline-panel">
        <h1 className="home-title">Upload Your Dataset</h1>
        <p className="home-sub">Instant AI-Powered Quality Analysis</p>
      </div>
      <div className="panel upload-panel">
        <FileUpload />
      </div>
      <div className="panel recent-panel">
        <h3 style={{marginTop:0}}>Recent Analyses:</h3>
        <ul className="recent-list">
          {recentAnalyses.length === 0 && <li className="recent-empty">None yet. Upload a file to begin.</li>}
          {recentAnalyses.map((r,i)=>(
            <li key={i}><span className="dot" /> {r.name} - Score: {r.score} (Analyzed {relativeTime(r.at)})</li>
          ))}
        </ul>
        <div className="quick-tips">
          <strong>Quick Tips:</strong>
          <ul>
            <li>Ensure column headers are in first row</li>
            <li>Limit file size & remove unused columns</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function relativeTime(iso){
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff/3600000);
  if (hrs < 1) return 'just now';
  if (hrs === 1) return '1 hour ago';
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs/24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
