import React, { useState } from 'react';

function SemanticSearch({ onSearch, loading, results, recommendations }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <section className="semantic-search-section">
      <div className="search-panel">
        <div className="panel-title">Semantic Search</div>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="search-input"
            value={query}
            placeholder="Search lectures by topic, concept, or goal..."
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" className="search-button" disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      <div className="search-results">
        <div className="panel-title">Search Results</div>
        {results.length === 0 ? (
          <div className="empty-state">Search for a lecture to see recommendations and relevance scores.</div>
        ) : (
          results.map((result) => (
            <div key={result.id || result.title} className="search-result-card">
              <div className="result-header">
                <div className="result-title">{result.title || result.name}</div>
                <span className="result-score">{result.relevance ? `Relevance ${Math.round(result.relevance * 100)}%` : 'No score'}</span>
              </div>
              <div className="result-copy">{result.description || result.snippet || 'No description available.'}</div>
              <div className="chip-row">
                {(result.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="result-chip">{tag}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="recommendation-panel">
        <div className="panel-title">Related Lecture Recommendations</div>
        {recommendations.length === 0 ? (
          <div className="empty-state">No personalized recommendations yet.</div>
        ) : (
          <ul className="recommendation-list">
            {recommendations.slice(0, 5).map((item) => (
              <li key={item.id || item.title} className="recommendation-item">
                <span>{item.title || item.name}</span>
                <span className="recommendation-chip">{item.score ? `Score ${item.score}` : 'Recommended'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default SemanticSearch;
