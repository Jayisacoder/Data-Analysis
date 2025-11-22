"use client";
import React, { useRef, useState } from 'react';
import { useData } from '../lib/DataContext';

export default function FileUpload() {
  const { handleFile, loading, error, fileMeta } = useData();
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  function onSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }
  function prevent(e){ e.preventDefault(); }

  return (
    <div
      className={`upload-zone ${dragging? 'dragging':''}`}
      onDragEnter={()=>setDragging(true)}
      onDragOver={prevent}
      onDragLeave={()=>setDragging(false)}
      onDrop={onDrop}
      role="group"
      aria-label="File upload area"
      tabIndex={0}
      onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') { inputRef.current.click(); e.preventDefault(); } }}
    >
      <p className="upload-title" aria-live="polite">📤 Drag & Drop File Here</p>
      <p className="upload-or">or</p>
      <button type="button" className="cta-btn" onClick={()=>inputRef.current.click()} aria-label="Choose a file to upload">Choose File</button>
      <input ref={inputRef} type="file" accept=".csv,.json,.xlsx,.xls" className="hidden-input" onChange={onSelect} aria-hidden="true" />
      <p className="upload-formats">Supported: CSV, JSON, Excel (max 50MB)</p>
      {loading && <p className="upload-status" role="status">Processing...</p>}
      {error && <p className="upload-error" role="alert">{error}</p>}
      {fileMeta && <p className="upload-success" role="status">Loaded {fileMeta.name} ({fileMeta.columns.length} columns)</p>}
    </div>
  );
}
