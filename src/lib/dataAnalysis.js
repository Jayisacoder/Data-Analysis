// Basic data analysis utilities for tabular datasets.
// Parses CSV (via PapaParse) and JSON; Excel via exceljs.
import Papa from 'papaparse';
import ExcelJS from 'exceljs';

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
          let rows;

          // column-major JSON: { colA: [..], colB: [..], ... }
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            const keys = Object.keys(data);
            const allArrays = keys.length > 0 && keys.every(k => Array.isArray(data[k]));
            if (allArrays) {
              // find longest array length, convert to row-oriented structure
              const lengths = keys.map(k => data[k].length);
              const maxLen = Math.max(...lengths);
              rows = Array.from({ length: maxLen }, (_, i) => {
                const row = {};
                keys.forEach(k => {
                  row[k] = data[k][i] !== undefined ? data[k][i] : null;
                });
                return row;
              });
            } else {
              rows = [data];
            }
          } else {
            rows = Array.isArray(data) ? data : [data];
          }
          resolve({ rows, meta: { fields: Object.keys(rows[0] || {}) } });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(e.target.result);
          const worksheet = workbook.worksheets[0];
          const json = [];
          const headers = [];
          
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              row.eachCell((cell) => {
                headers.push(cell.value);
              });
            } else {
              const rowData = {};
              row.eachCell((cell, colNumber) => {
                rowData[headers[colNumber - 1]] = cell.value !== null ? cell.value : '';
              });
              json.push(rowData);
            }
          });
          
          resolve({ rows: json, meta: { fields: headers } });
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
  // Industry standard data quality thresholds
  if (score >= 85) return { label: 'Excellent', color: '#10b981' }; // Green: 85-100
  if (score >= 70) return { label: 'Good', color: '#06b6d4' };      // Blue-Green: 70-84
  if (score >= 50) return { label: 'Fair', color: '#f59e0b' };      // Amber: 50-69
  if (score > 0) return { label: 'Poor', color: '#ef4444' };        // Red: 0-49
  return { label: 'Neutral', color: '#64748b' };
}
