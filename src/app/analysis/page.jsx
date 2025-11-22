import React from 'react';
import { DataProvider } from '../../lib/DataContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import FileUpload from '../../components/FileUpload';
import QualityScore from '../../components/data/QualityScore';
import DataPreview from '../../components/data/DataPreview';
import DataVisualizations from '../../components/data/DataVisualizations';
import AIInsights from '../../components/data/AIInsights';
import ColumnDetails from '../../components/data/ColumnDetails';

export const metadata = { title: 'Analysis - Data Quality Platform' };

export default function AnalysisPage() {
  return (
    <DataProvider>
      <ErrorBoundary>
        <main className="container analysis-layout">
          <div className="panel" style={{marginBottom:'1.25rem'}}>
            <h2 style={{margin:'0 0 .5rem', fontSize:'1.15rem', fontWeight:600}}>Data Quality Analysis</h2>
            <p style={{margin:0, fontSize:'.75rem', opacity:.75}}>Upload a dataset to generate completeness, uniqueness and validity metrics, then request AI remediation insights.</p>
          </div>
          <section className="analysis-grid">
            <div className="analysis-left">
              <FileUpload />
              <QualityScore />
              <AIInsights />
            </div>
            <div className="analysis-right">
              <DataVisualizations />
              <DataPreview />
              <ColumnDetails />
            </div>
          </section>
        </main>
      </ErrorBoundary>
    </DataProvider>
  );
}
