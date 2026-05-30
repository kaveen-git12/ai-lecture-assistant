import React, { useState, useEffect } from 'react';

function RecommendationPanel() {
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentLectureId = localStorage.getItem('currentLectureId');

      if (!currentLectureId) {
        setRecommendations([]);
        return;
      }

      const res = await fetch(`/api/search/recommendations/${currentLectureId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/search/search-lectures', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          topK: 5
        })
      });

      const data = await res.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendation-panel glass">
      <h3>🎓 Smart Learning Recommendations</h3>

      {/* Semantic Search */}
      <div className="semantic-search">
        <h4>🔍 Find Related Lectures</h4>
        <form onSubmit={performSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lectures by topic, keyword..."
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Searching...' : '🔎 Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h5>Search Results</h5>
            {searchResults.map(result => (
              <div key={result.id} className="search-result-item">
                <h6>{result.title}</h6>
                <p>📚 {result.subject}</p>
                <p>Relevance: <strong>{result.relevance}</strong></p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="recommendations">
        <h4>✨ Recommended for You</h4>
        {recommendations.length === 0 ? (
          <p>Learn more lectures to get personalized recommendations!</p>
        ) : (
          <div className="recommendation-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="recommendation-card glass">
                <h5>{rec.title}</h5>
                <p>📚 Subject: {rec.subject}</p>
                <div className="match-score">
                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{ width: rec.matchScore }}
                    ></div>
                  </div>
                  <span className="score-text">{rec.matchScore} match</span>
                </div>
                <button className="btn-small">View Lecture</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationPanel;
