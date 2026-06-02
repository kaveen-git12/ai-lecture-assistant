import React from 'react';

function ExportPanel({ noteId, exportOptions, onToggleLayout, onToggleToc, onExport }) {
  return (
    <div className="tools-card">
      <div className="tools-card-title">Export</div>

      <div className="export-buttons-stack">
        <button className="control-button" onClick={() => onExport('pdf')} disabled={!noteId}>Export PDF</button>
        <button className="control-button" onClick={() => onExport('docx')} disabled={!noteId}>Export DOCX</button>
        <button className="control-button" onClick={() => onExport('md')} disabled={!noteId}>Export Markdown</button>
      </div>
    </div>
  );
}

export default ExportPanel;
