import React, { useState } from 'react';

export default function NotificationSettings() {
  const [badgeAlerts, setBadgeAlerts] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState('18:30');

  return (
    <section className="settings-card glow-border">
      <div className="settings-card-header">
        <div>
          <div className="settings-card-title">🔔 Notification Settings</div>
          <div className="settings-card-subtitle">Control alerts and reminders</div>
        </div>
      </div>
      <div className="settings-form">
        <div className="form-row switch-row">
          <label>Badge unlock alerts</label>
          <button
            type="button"
            className={`toggle-switch-button${badgeAlerts ? ' on' : ''}`}
            onClick={() => setBadgeAlerts((prev) => !prev)}
          >{badgeAlerts ? 'Enabled' : 'Disabled'}</button>
        </div>
        <div className="form-row switch-row">
          <label>Study reminders</label>
          <button
            type="button"
            className={`toggle-switch-button${studyReminders ? ' on' : ''}`}
            onClick={() => setStudyReminders((prev) => !prev)}
          >{studyReminders ? 'Enabled' : 'Disabled'}</button>
        </div>
        <div className="form-row">
          <label>Reminder time</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
