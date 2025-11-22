"use client";
import React from 'react';
import Link from 'next/link';
import { useData } from '../lib/DataContext';

export default function NavBar(){
  const { fileMeta, phase } = useData();
  return (
    <nav className="nav-bar" aria-label="Main navigation">
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/preview" aria-disabled={!fileMeta}>Preview</Link></li>
        <li><Link href="/dashboard" aria-disabled={!fileMeta}>Dashboard</Link></li>
        <li><Link href="/details" aria-disabled={!fileMeta}>Details</Link></li>
        <li><Link href="/docs" aria-disabled>Docs</Link></li>
      </ul>
      <div className="nav-status">{fileMeta ? `${fileMeta.name} • ${phase}` : 'No file loaded'}</div>
    </nav>
  );
}
