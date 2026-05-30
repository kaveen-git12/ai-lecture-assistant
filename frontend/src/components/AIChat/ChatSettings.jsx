import React, { useState } from 'react';

function ChatSettings({ settings, onChange }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="chat-settings-panel">
      <div className="panel-header" onClick={() => setOpen((prev) => !prev)}>
        <div>
          <div className="panel-title">Chat Settings</div>
          <div className="panel-subtitle">Customize tone, fallback behavior and system guidance.</div>
        </div>
        <button type="button" className="toggle-button">{open ? 'Hide' : 'Show'}</button>
      </div>

      {open && (
        <div className="settings-content">
          <div className="setting-row">
            <label htmlFor="temperature">Temperature</label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => onChange({ temperature: Number(e.target.value) })}
            />
            <span>{settings.temperature.toFixed(2)}</span>
          </div>

          <div className="setting-row">
            <label htmlFor="system-prompt">System prompt</label>
            <textarea
              id="system-prompt"
              rows={3}
              value={settings.systemPrompt}
              onChange={(e) => onChange({ systemPrompt: e.target.value })}
            />
          </div>

          <div className="setting-row switch-row">
            <span>Auto fallback</span>
            <button
              type="button"
              className={`switch-button ${settings.autoFallback ? 'on' : 'off'}`}
              onClick={() => onChange({ autoFallback: !settings.autoFallback })}
            >
              {settings.autoFallback ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ChatSettings;
