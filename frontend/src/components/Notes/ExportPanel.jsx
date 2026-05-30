import React from 'react';

function ExportPanel({ noteId, exportOptions, onToggleLayout, onToggleToc, onExport }) {
  return (
    <section className="notes-panel export-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Export Notes</div>
          <div className="panel-subtitle">Download your note content in multiple formats.</div>
        </div>
      </div>

      <div className="export-options">
        <label className="export-toggle">
          <input type="checkbox" checked={exportOptions.enhancedLayout} onChange={onToggleLayout} />
          Enhanced layout
        </label>
        <label className="export-toggle">
          <input type="checkbox" checked={exportOptions.toc} onChange={onToggleToc} />
          Include table of contents
        </label>
      </div>

      <div className="export-buttons">
        <button className="control-button" onClick={() => onExport('pdf')} disabled={!noteId}>Export PDF</button>
        <button className="control-button" onClick={() => onExport('docx')} disabled={!noteId}>Export DOCX</button>
        <button className="control-button" onClick={() => onExport('md')} disabled={!noteId}>Export Markdown</button>
        <button className="control-button secondary" onClick={() => onExport('png')} disabled={!noteId}>Export Image</button>
      </div>
    </section>
  );
}

export default ExportPanel;
