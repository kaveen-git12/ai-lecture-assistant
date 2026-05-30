import React from 'react';

function AnalyticsExport({ onExport }) {
  return (
    <div className="export-panel">
      <div className="panel-title">Export Report</div>
      <div className="export-buttons">
        <button type="button" className="control-button accent" onClick={() => onExport('pdf')}>
          Export as PDF
        </button>
        <button type="button" className="control-button accent" onClick={() => onExport('csv')}>
          Export as CSV
        </button>
      </div>
    </div>
  );
}

export default AnalyticsExport;
