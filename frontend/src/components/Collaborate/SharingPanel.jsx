import React from 'react';

function SharingPanel({ options, links, onChangeOptions, onGenerateLink, onExpiryChange }) {
  return (
    <section className="sharing-panel">
      <div className="panel-title">Sharing Panel</div>
      <div className="sharing-form">
        <label>
          Share Lecture
          <select value={options.access} onChange={(event) => onChangeOptions({ ...options, access: event.target.value })}>
            <option value="read-only">Read-only</option>
            <option value="edit">Edit</option>
          </select>
        </label>
        <label>
          Expiry Date
          <input type="date" value={options.expiry} onChange={(event) => onExpiryChange(event.target.value)} />
        </label>
        <button type="button" className="control-button accent" onClick={onGenerateLink}>
          Generate Link
        </button>
      </div>
      <div className="share-list">
        <div className="panel-subtitle">Generated Links</div>
        {links.length === 0 ? (
          <div className="empty-state">No links created yet.</div>
        ) : (
          links.map((link, index) => (
            <div key={index} className="share-link-item">
              <span>{link}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default SharingPanel;
