// Basic data analysis utilities for tabular datasets.
// Parses CSV (via PapaParse) and JSON; Excel placeholder.
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseFile(file) {
  const name = file.name.toLowerCase();
  return new Promise((resolve, reject) => {
    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => resolve({ rows: results.data, meta: results.meta }),
        error: err => reject(err)
      });
    } else if (name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          const rows = Array.isArray(data) ? data : [data];
          resolve({ rows, meta: { fields: Object.keys(rows[0] || {}) } });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const sheetName = wb.SheetNames[0];
          const sheet = wb.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          resolve({ rows: json, meta: { fields: Object.keys(json[0] || {}) } });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}

export function analyzeData(rows) {
  if (!rows || rows.length === 0) return { columns: [], stats: {}, score: 0, qualityMetrics: {} };
  const colNames = Object.keys(rows[0]);
  const colStats = {};
  const detailed = [];
  colNames.forEach(col => {
    let missing = 0;
    const values = [];
    rows.forEach(r => {
      const v = r[col];
      if (v === null || v === undefined || v === '') missing += 1; else values.push(v);
    });
    const unique = new Set(values).size;
    const numericValues = values.filter(v => typeof v === 'number');
    const mean = numericValues.length ? numericValues.reduce((a,b)=>a+b,0)/numericValues.length : null;
    const outlierValues = numericValues.filter(v => mean !== null && (v > mean*3 || v < mean/3));
    const type = detectType(values);
    colStats[col] = { missing, unique, total: rows.length, outliers: outlierValues.length, type, numericOutliers: outlierValues.length };
    detailed.push({ name: col, missing, uniqueCount: unique, outliers: outlierValues, type });
  });
  const score = computeQualityScore(colStats, rows.length);
  const qualityMetrics = computeQualityMetrics(colStats, rows.length);
  return { columns: detailed, stats: colStats, score, qualityMetrics };
}

function detectType(values) {
  if (values.every(v => typeof v === 'number')) return 'number';
  if (values.every(v => typeof v === 'boolean')) return 'boolean';
  return 'text';
}

export function computeQualityScore(colStats, totalRows) {
  if (!totalRows) return 0;
  let completenessSum = 0;
  let uniquenessSum = 0;
  let validitySum = 0; // simplified as inverse of outlier ratio for numeric columns
  Object.values(colStats).forEach(stat => {
    completenessSum += 1 - stat.missing / stat.total;
    uniquenessSum += stat.unique / stat.total;
    if (stat.type === 'number') {
      const outlierRatio = stat.outliers / stat.total;
      validitySum += 1 - outlierRatio;
    } else {
      validitySum += 1;
    }
  });
  const n = Object.keys(colStats).length || 1;
  const completeness = completenessSum / n;
  const uniqueness = uniquenessSum / n;
  const validity = validitySum / n;
  // weighted average
  const score = Math.round((completeness*0.5 + uniqueness*0.25 + validity*0.25) * 100);
  return score;
}

function computeQualityMetrics(colStats, totalRows){
  if(!totalRows) return {};
  const names = Object.keys(colStats);
  let completeness=0, consistency=0, accuracy=0, validity=0;
  names.forEach(n => {
    const s = colStats[n];
    completeness += 1 - s.missing / s.total;
    const typeUniform = 1; // placeholder assuming consistent parsing
    consistency += typeUniform;
    if (s.type === 'number') {
      const outlierRatio = s.outliers / s.total;
      accuracy += 1 - outlierRatio;
    } else {
      accuracy += 1;
    }
    validity += s.unique / s.total; // heuristic proxy
  });
  const d = names.length || 1;
  return {
    completeness: completeness/d,
    consistency: consistency/d,
    accuracy: accuracy/d,
    validity: validity/d
  };
}

export function qualityState(score) {
  if (score >= 90) return { label: 'Excellent', color: '#10b981' };
  if (score >= 70) return { label: 'Good', color: '#f59e0b' };
  if (score > 0) return { label: 'Poor', color: '#ef4444' };
  return { label: 'Neutral', color: '#6b7280' };
}
