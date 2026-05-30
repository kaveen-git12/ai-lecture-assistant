import React, { useState } from 'react';

export default function DataSettings() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const exportData = () => {
    const payload = {
      account: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      },
      settings: {
        notifications: true,
        language: 'en',
      },
      notes: [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-lecture-assistant-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = () => {
    setDeleted(true);
    setConfirmOpen(false);
  };

  return (
    <section className="settings-card glow-border">
      <div className="settings-card-header">
        <div>
          <div className="settings-card-title">🗃️ Data Settings</div>
          <div className="settings-card-subtitle">Export or remove your account data</div>
        </div>
      </div>
      <div className="settings-form data-action-grid">
        <button type="button" className="settings-button" onClick={exportData}>
          Export all my data
        </button>
        <button
          type="button"
          className="settings-button danger"
          onClick={() => setConfirmOpen(true)}
        >
          Delete account
        </button>
        {deleted && <div className="danger-note">Account deletion requested.</div>}
      </div>

      {confirmOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Account Deletion</h3>
            <p>Are you sure you want to permanently delete your account? This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="settings-button danger" onClick={confirmDelete}>
                Yes, delete account
              </button>
              <button type="button" className="settings-button secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
