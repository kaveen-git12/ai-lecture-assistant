import React from 'react';
import { useTranslation } from 'react-i18next';
import AccountSettings from './AccountSettings';
import AIProviderSettings from './AIProviderSettings';
import NotificationSettings from './NotificationSettings';
import LanguageSettings from './LanguageSettings';
import DataSettings from './DataSettings';
import SmartBoardSection from './SmartBoardSection';
import './Settings.css';

export default function Settings({
  darkMode,
  setDarkMode,
  accentColor,
  accentIdx,
  accentInput,
  accentPresets,
  selectAccentPreset,
  handleAccentInput,
  launchSmartBoard,
}) {
  const { i18n } = useTranslation();

  return (
    <div className="settings-view">
      <div className="settings-grid">
        <section className="settings-card glow-border">
          <div className="settings-card-header">
            <div>
              <div className="settings-card-title">🌗 Appearance Mode</div>
              <div className="settings-card-subtitle">Choose your preferred theme</div>
              <p className="settings-card-description">
                Switches the entire app between dark and light mode. This affects sidebar, cards, topbar and all surfaces.
              </p>
            </div>
            <div className="settings-toggle-group">
              <button
                className={`settings-toggle-btn${darkMode ? ' active' : ''}`}
                onClick={() => setDarkMode(true)}
              >🌙 Dark</button>
              <button
                className={`settings-toggle-btn${!darkMode ? ' active' : ''}`}
                onClick={() => setDarkMode(false)}
              >☀️ Light</button>
            </div>
          </div>
        </section>

        <section className="settings-card glow-border">
          <div className="settings-card-header">
            <div>
              <div className="settings-card-title">🎨 Accent Color</div>
              <div className="settings-card-subtitle">Pick a preset or enter your own</div>
            </div>
          </div>
          <div className="accent-presets-row">
            {accentPresets.map((preset, index) => (
              <button
                key={preset.color}
                className={`accent-preset${accentIdx === index ? ' active' : ''}`}
                style={{ background: preset.color }}
                onClick={() => selectAccentPreset(index)}
                aria-label={preset.color}
              />
            ))}
          </div>
          <div className="accent-custom-row">
            <span className="accent-custom-label">Custom:</span>
            <div className="accent-custom-swatch" style={{ background: accentColor }} />
            <input
              className="accent-custom-input"
              type="text"
              value={accentInput}
              onChange={(e) => handleAccentInput(e.target.value)}
              placeholder="#F59E0B"
            />
          </div>
          <p className="settings-card-description">
            Accent drives border glow, active nav, CTA buttons and highlights across the dashboard.
          </p>
        </section>

        <AccountSettings />
        <AIProviderSettings />
        <NotificationSettings />
        <LanguageSettings />
        <DataSettings />
        <SmartBoardSection onLaunch={launchSmartBoard} />
      </div>
    </div>
  );
}
