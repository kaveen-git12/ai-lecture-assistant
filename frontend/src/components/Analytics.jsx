import React, { useEffect, useState } from 'react';
import analyticsService from '../services/analyticsService';
import searchService from '../services/searchService';
import AnalyticsOverview from './Analytics/AnalyticsOverview';
import AnalyticsDetails from './Analytics/AnalyticsDetails';
import SemanticSearch from './Analytics/SemanticSearch';
import AnalyticsExport from './Analytics/AnalyticsExport';
import './Analytics.css';

function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [retentionCurve, setRetentionCurve] = useState([]);
  const [learningCurve, setLearningCurve] = useState([]);
  const [studyPatterns, setStudyPatterns] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [errorBreakdown, setErrorBreakdown] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [strongTopics, setStrongTopics] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadAnalytics();
    loadRecommendations();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboardRes, retentionRes, learningRes, weakRes, strongRes, patternsRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRetentionCurve(),
        analyticsService.getLearningCurve(),
        analyticsService.getWeakTopics(),
        analyticsService.getStrongTopics(),
        analyticsService.getStudyPatterns(),
      ]);

      setDashboard(dashboardRes || {});
      setRetentionCurve(retentionRes.curve || retentionRes || []);
      setLearningCurve(learningRes.curve || learningRes || []);
      setWeakTopics(weakRes.topics || weakRes || []);
      setStrongTopics(strongRes.topics || strongRes || []);
      setStudyPatterns(patternsRes.pattern || patternsRes || []);
      setPeakHours(patternsRes.peakHours || []);
      setErrorBreakdown(dashboardRes.errorBreakdown || []);
    } catch (error) {
      console.error('Unable to load analytics data', error);
      setStatusMessage('Unable to load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await searchService.getRecommendations();
      setRecommendations(response.recommendations || response || []);
    } catch (error) {
      console.error('Unable to load recommendations', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setStatusMessage('Searching lectures...');

    try {
      const response = await searchService.semanticSearch({ query });
      const results = response.results || response || [];
      setSearchResults(results);
      setStatusMessage(results.length === 0 ? 'No matching lectures found.' : 'Search results loaded.');
    } catch (error) {
      console.error('Semantic search failed', error);
      setStatusMessage('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleExport = async (format) => {
    setStatusMessage(`Exporting ${format.toUpperCase()} report...`);

    try {
      const blob = await analyticsService.exportReport(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatusMessage(`${format.toUpperCase()} export completed.`);
    } catch (error) {
      console.error('Export failed', error);
      setStatusMessage('Export failed. Please try again.');
    }
  };

  const handlePracticeTopic = (topic) => {
    setStatusMessage(`Practice shortcut created for “${topic}”.`);
  };

  return (
    <div className="analytics-root">
      <header className="analytics-header">
        <div>
          <h1>Learning Analytics</h1>
          <p>Track study trends, retention, and topic performance.</p>
        </div>
        <div className="analytics-tab-buttons">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
        </div>
      </header>

      <div className="analytics-actions-panel">
        <AnalyticsExport onExport={handleExport} />
      </div>

      <div className="analytics-body">
        {loading ? (
          <div className="analytics-loading">Loading analytics dashboard…</div>
        ) : activeTab === 'overview' ? (
          <AnalyticsOverview
            dashboard={dashboard}
            weakTopics={weakTopics}
            strongTopics={strongTopics}
            recommendations={recommendations}
            onPracticeTopic={handlePracticeTopic}
          />
        ) : (
          <AnalyticsDetails
            retentionData={retentionCurve}
            learningData={learningCurve}
            studyPatterns={studyPatterns}
            peakHours={peakHours}
            errorBreakdown={errorBreakdown}
          />
        )}
      </div>

      <SemanticSearch
        onSearch={handleSearch}
        loading={searchLoading}
        results={searchResults}
        recommendations={recommendations}
      />

      {statusMessage && <div className="analytics-status-message">{statusMessage}</div>}
    </div>
  );
}

export default Analytics;
