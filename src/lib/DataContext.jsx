"use client";
import React, { createContext, useContext, useState } from 'react';
import { parseFile, analyzeData } from './dataAnalysis';
import { generateInsights } from './aiIntegration';
import { createEmptyInsightsBundle } from './insightsHeuristics';
import { useRouter } from 'next/navigation';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [fileMeta, setFileMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [insights, setInsights] = useState({ ...createEmptyInsightsBundle(), status: 'idle' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | preview | dashboard | details
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const router = useRouter();

  async function handleFile(file) {
    setLoading(true); setError(null);
    try {
      const parsed = await parseFile(file);
      setRows(parsed.rows);
      setFileMeta({ name: file.name, size: file.size, columns: parsed.meta.fields });
      const a = analyzeData(parsed.rows);
      setAnalysis(a);
      setInsights({ ...createEmptyInsightsBundle(), status: 'idle' });
      // record immediately for home recent list
      setRecentAnalyses(prev => [{
        name: file.name,
        score: a.score,
        label: a.score,
        at: new Date().toISOString()
      }, ...prev.slice(0,9)]);
      setPhase('preview');
      router.push('/preview');
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  async function runInsights() {
    if (!analysis) return;
    setInsights(prev => ({ ...prev, status: 'loading' }));
    try {
      const data = await generateInsights(analysis);
      setInsights({ ...data, status: 'ready' });
    } catch (err) {
      setInsights({
        ...createEmptyInsightsBundle(),
        status: 'error',
        reason: err.message || 'Failed to generate insights'
      });
    }
  }

  function goDashboard(){
    if (!analysis) return;
    setPhase('dashboard');
    router.push('/dashboard');
  }
  function goDetails(){
    if (!analysis) return;
    setPhase('details');
    router.push('/details');
  }
  function goHome(){
    setPhase('idle');
    router.push('/');
  }
  function restartFlow(){
    // Clear current dataset & return home
    setFileMeta(null);
    setRows([]);
    setAnalysis(null);
    setInsights({ ...createEmptyInsightsBundle(), status: 'idle' });
    setPhase('idle');
    router.push('/');
  }
  function recordAnalysis(){
    if (!analysis || !fileMeta) return;
    setRecentAnalyses(prev => [{
      name: fileMeta.name,
      score: analysis.score,
      label: analysis.score,
      at: new Date().toISOString()
    }, ...prev.slice(0,9)]);
  }

  return (
    <DataContext.Provider value={{ fileMeta, rows, analysis, insights, loading, error, phase, recentAnalyses, handleFile, runInsights, goDashboard, goDetails, goHome, restartFlow, recordAnalysis }}>
      {children}
    </DataContext.Provider>
  );
}
export function useData() { return useContext(DataContext); }
