import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'zh', label: '中文' },
  { value: 'hi', label: 'हिंदी' },
];

export default function LanguageSettings() {
  const { i18n } = useTranslation();
  const [uiLanguage, setUiLanguage] = useState(i18n.language || 'en');
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');

  useEffect(() => {
    if (uiLanguage) {
      i18n.changeLanguage(uiLanguage);
    }
  }, [uiLanguage, i18n]);

  return (
    <section className="settings-card glow-border">
      <div className="settings-card-header">
        <div>
          <div className="settings-card-title">🌐 Language Settings</div>
          <div className="settings-card-subtitle">Choose the UI and subtitle languages</div>
        </div>
      </div>
      <div className="settings-form">
        <div className="form-row">
          <label>UI Language</label>
          <select value={uiLanguage} onChange={(e) => setUiLanguage(e.target.value)}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Default Subtitle Language</label>
          <select value={subtitleLanguage} onChange={(e) => setSubtitleLanguage(e.target.value)}>
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
