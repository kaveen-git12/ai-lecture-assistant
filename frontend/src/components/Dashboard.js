import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import GamificationPanel from './GamificationPanel';

function Dashboard() {
  const [lectures, setLectures] = useState([]);
  const [stats, setStats] = useState({
    totalLectures: 0,
    totalStudyTime: 0,
    avgRetention: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchLectures();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/lectures/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setLectures(data);
        
        // Fetch analytics for accurate stats
        const analyticsRes = await fetch('/api/analytics/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setStats({
            totalLectures: analyticsData.totalLectures || data.length,
            totalStudyTime: analyticsData.totalStudyMinutes || 0,
            avgRetention: analyticsData.averageAccuracy || 0
          });
        } else {
          setStats({
            totalLectures: data.length,
            totalStudyTime: 0,
            avgRetention: 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLecture = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/lectures/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setLectures(lectures.filter(l => l._id !== id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="dashboard glass">
      <h2>📊 My Learning Dashboard</h2>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'gamification' ? 'active' : ''}`}
          onClick={() => setActiveTab('gamification')}
        >
          Gamification
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div
            className="stats-grid"
          >
            {[
              { label: 'Total Lectures', value: stats.totalLectures },
              { label: 'Study Time', value: `${Math.round(stats.totalStudyTime / 60)}h` },
              { label: 'Avg Accuracy', value: `${stats.avgRetention}%` }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.4, type: 'spring' }}
                whileHover={{ y: -5 }}
              >
                <h4>{stat.value}</h4>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <h3>Recent Lectures</h3>
          {loading ? (
            <p>Loading...</p>
          ) : lectures.length === 0 ? (
            <p>No lectures yet. Start recording!</p>
          ) : (
            <div
              className="lectures-list"
            >
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {lectures.map((lecture, idx) => (
                <div
                  key={lecture._id}
                  className="lecture-item"
                >
                  <div className="lecture-info">
                    <h4>{lecture.title}</h4>
                    <p>{lecture.subject}</p>
                    <small>{new Date(lecture.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="lecture-actions">
                    <button className="btn-small">📝 View</button>
                    <button className="btn-small btn-danger" onClick={() => deleteLecture(lecture._id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {/* Gamification Tab */}
      {activeTab === 'gamification' && (
        <GamificationPanel />
      )}
    </div>
  );
}

export default Dashboard;
