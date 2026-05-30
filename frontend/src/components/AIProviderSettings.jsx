import React, { useState } from 'react';

const PROVIDERS = ['GPT-4o-mini', 'Claude 3 Sonnet', 'Gemini 1.5 Flash'];

export default function AIProviderSettings() {
  const [defaultProvider, setDefaultProvider] = useState(PROVIDERS[0]);
  const [apiKeys, setApiKeys] = useState({
    'GPT-4o-mini': '',
    'Claude 3 Sonnet': '',
    'Gemini 1.5 Flash': '',
  });
  const [showKeys, setShowKeys] = useState({
    'GPT-4o-mini': false,
    'Claude 3 Sonnet': false,
    'Gemini 1.5 Flash': false,
  });
  const [temperature, setTemperature] = useState(0.45);

  const updateKey = (provider, value) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const toggleShowKey = (provider) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <section className="settings-card glow-border">
      <div className="settings-card-header">
        <div>
          <div className="settings-card-title">🤖 AI Provider Settings</div>
          <div className="settings-card-subtitle">Choose the default model and manage keys</div>
        </div>
      </div>
      <div className="settings-form">
        <div className="form-row">
          <label>Default LLM</label>
          <select value={defaultProvider} onChange={(e) => setDefaultProvider(e.target.value)}>
            {PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>
        {PROVIDERS.map((provider) => (
          <div key={provider} className="form-row api-key-row">
            <label>{provider} API Key</label>
            <div className="api-key-input-group">
              <input
                type={showKeys[provider] ? 'text' : 'password'}
                value={apiKeys[provider]}
                onChange={(e) => updateKey(provider, e.target.value)}
                placeholder="Enter API key"
              />
              <button
                type="button"
                className="toggle-key-btn"
                onClick={() => toggleShowKey(provider)}
              >{showKeys[provider] ? 'Hide' : 'Show'}</button>
            </div>
          </div>
        ))}
        <div className="form-row">
          <label>Default Temperature {temperature.toFixed(2)}</label>
          <input
            className="slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </section>
  );
}
