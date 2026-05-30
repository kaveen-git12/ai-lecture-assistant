import React, { useState } from 'react';

function MultiLLMPanel() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [content, setContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);

  const providers = [
    { id: 'openai', name: 'GPT-4o (OpenAI)', icon: '🤖' },
    { id: 'claude', name: 'Claude 3 (Anthropic)', icon: '🧠' },
    { id: 'gemini', name: 'Gemini (Google)', icon: '✨' }
  ];

  const generateWithProvider = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          provider: selectedProvider,
          systemPrompt,
          temperature: 0.7
        })
      });

      const data = await res.json();
      setResult(data.text);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareProviders = async () => {
    if (!content.trim()) return;

    setComparing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/llm/compare', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          systemPrompt
        })
      });

      const data = await res.json();
      setComparisonResults(data.results);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="multi-llm-panel glass">
      <h3>🤖 Multi-LLM Comparison</h3>
      
      {/* Provider Selection */}
      <div className="provider-selector">
        <h4>Select Provider</h4>
        <div className="provider-buttons">
          {providers.map(p => (
            <button
              key={p.id}
              className={`provider-btn ${selectedProvider === p.id ? 'active' : ''}`}
              onClick={() => setSelectedProvider(p.id)}
            >
              {p.icon} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="llm-input">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter text or question..."
          rows={4}
        />
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="System prompt (optional)..."
          rows={2}
        />
      </div>

      {/* Buttons */}
      <div className="llm-actions">
        <button
          className="btn-primary"
          onClick={generateWithProvider}
          disabled={loading || !content.trim()}
        >
          {loading ? '⏳ Generating...' : '✨ Generate with ' + providers.find(p => p.id === selectedProvider).name}
        </button>
        <button
          className="btn-secondary"
          onClick={compareProviders}
          disabled={comparing || !content.trim()}
        >
          {comparing ? '⏳ Comparing...' : '⚖️ Compare All Providers'}
        </button>
      </div>

      {/* Single Provider Result */}
      {result && (
        <div className="llm-result glass">
          <h4>{providers.find(p => p.id === selectedProvider).name} Response</h4>
          <div className="result-text">{result}</div>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResults && (
        <div className="comparison-results">
          <h4>📊 Provider Comparison</h4>
          <div className="comparison-grid">
            {Object.entries(comparisonResults).map(([provider, data]) => (
              <div key={provider} className="comparison-card glass">
                <h5>{providers.find(p => p.id === provider)?.name}</h5>
                {data.error ? (
                  <p className="error">Error: {data.error}</p>
                ) : (
                  <p>{data.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiLLMPanel;
