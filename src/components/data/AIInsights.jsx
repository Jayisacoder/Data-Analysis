"use client";
import React from 'react';
import { useData } from '../../lib/DataContext';

export default function AIInsights() {
  const { insights: bundle, runInsights, analysis } = useData();
  const cards = bundle?.insights || [];
  const isLoading = bundle?.status === 'loading';
  const disabled = !analysis || isLoading;

  return (
    <div className="panel ai-insights-panel" aria-labelledby="insights-heading" aria-live="polite">
      <div className="ai-insights-head">
        <div>
          <h3>AI-Powered Insights</h3>
          <p className="ai-insights-subtext">Targeted remediation guidance based on the current analysis.</p>
        </div>
        <button
          className="cta-btn"
          disabled={disabled}
          onClick={runInsights}
          aria-busy={isLoading}
          aria-describedby={bundle?.reason ? 'insights-reason' : undefined}
        >
          {isLoading ? 'Generating…' : 'Generate Insights'}
        </button>
      </div>

      <div className="insights-meta" role="region" aria-label="insights metadata">
        <span className="insight-pill">{sourceLabel(bundle)}</span>
        {bundle?.model && <span className="insight-pill">Model: {bundle.model}</span>}
        {bundle?.generatedAt && (
          <span className="insight-pill">Generated {formatTimestamp(bundle.generatedAt)}</span>
        )}
        {bundle?.reason && <span id="insights-reason" className="insight-pill warning">{bundle.reason}</span>}
      </div>

      <div className="insights-grid">
        {!cards.length && bundle?.status !== 'loading' && (
          <p className="placeholder">Run the insight engine to see prioritized fixes.</p>
        )}
        {cards.map(card => (
          <article key={card.id} id={`insight-${card.id}`} className={`insight-card severity-${card.severity || 'medium'}`} role="article" aria-labelledby={`insight-${card.id}-title`}>
            <div className="insight-card-head">
              <span className="insight-category">{card.category || 'Insight'}</span>
              <span className="severity-indicator">{(card.severity || 'medium').toUpperCase()}</span>
            </div>
            <h4 id={`insight-${card.id}-title`}>{card.title}</h4>
            <p>{card.summary || card.recommendation}</p>
            {card.metric && (
              <div className="insight-metric">
                <span className="metric-column">{card.metric.column}</span>
                <span className="metric-data">{formatMetric(card.metric)}</span>
              </div>
            )}
            {card.actions?.length > 0 && (
              <ul className="insight-actions">
                {card.actions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function sourceLabel(bundle) {
  if (!bundle) return 'Idle';
  if (bundle.source?.includes('openai')) return 'AI generated';
  if (bundle.source?.includes('heuristic')) return 'Rule-based fallback';
  if (bundle.source?.includes('client')) return 'Client heuristic';
  return bundle.source || 'Idle';
}

function formatTimestamp(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  } catch (_) {
    return ts;
  }
}

function formatMetric(metric) {
  const parts = [];
  if (typeof metric.missing === 'number' && metric.total) {
    parts.push(`${metric.missing}/${metric.total} missing`);
  }
  if (typeof metric.unique === 'number') {
    parts.push(`${metric.unique} unique`);
  }
  if (metric.outliers) {
    parts.push(`${metric.outliers} outliers`);
  }
  return parts.join(' • ');
}
