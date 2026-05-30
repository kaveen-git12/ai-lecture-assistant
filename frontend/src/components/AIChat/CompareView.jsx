import React from 'react';

function CompareView({ responses, loading, providers }) {
  return (
    <section className="compare-view">
      <div className="compare-header">
        <h2>Provider Comparison</h2>
        <p>Review how each provider answers the same prompt.</p>
      </div>

      {loading && <div className="compare-loading">Comparing providers…</div>}

      {!loading && (!responses || Object.keys(responses).length === 0) && (
        <div className="compare-empty">Send a prompt to compare results from all providers.</div>
      )}

      {!loading && responses && !responses.error && (
        <div className="compare-grid">
          {providers.map((provider) => (
            <div key={provider.id} className="compare-card">
              <div className="compare-card-title">{provider.label}</div>
              <div className="compare-card-body">
                {responses[provider.id] ? responses[provider.id] : 'No response available.'}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && responses && responses.error && (
        <div className="compare-error">{responses.error}</div>
      )}
    </section>
  );
}

export default CompareView;
