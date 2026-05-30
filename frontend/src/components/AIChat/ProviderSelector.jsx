import React from 'react';

function ProviderSelector({ providers, activeProvider, onSelectProvider }) {
  return (
    <div className="provider-selector">
      {providers.map((provider) => (
        <button
          key={provider.id}
          className={`provider-btn ${activeProvider === provider.id ? 'active' : ''}`}
          onClick={() => onSelectProvider(provider.id)}
          type="button"
        >
          {provider.label}
        </button>
      ))}
    </div>
  );
}

export default ProviderSelector;
