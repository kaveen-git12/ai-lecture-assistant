import React, { useState } from 'react';

export default function AccountSettings() {
  const [displayName, setDisplayName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="settings-card glow-border">
      <div className="settings-card-header">
        <div>
          <div className="settings-card-title">👤 Account Settings</div>
          <div className="settings-card-subtitle">Update your profile and password</div>
        </div>
      </div>
      <form className="settings-form" onSubmit={handleSave}>
        <div className="form-row">
          <label>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
          />
        </div>
        <div className="form-row">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="form-row">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="form-row">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="form-row">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="form-actions">
          <button className="settings-button" type="submit">Save Account Settings</button>
          {saved && <span className="form-success">Saved successfully</span>}
        </div>
      </form>
    </section>
  );
}
