import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from 'recharts';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const renderHeatmapSquare = (props) => {
  const { cx, cy, payload } = props;
  const intensity = payload.value || 0;
  const color = intensity >= 0.85 ? 'var(--accent)' : intensity >= 0.6 ? '#6cb4ff' : intensity >= 0.35 ? '#4a6b9f' : '#1f2a44';
  return <rect x={cx - 10} y={cy - 10} width={20} height={20} rx={4} fill={color} />;
};

function AnalyticsDetails({ retentionData, learningData, studyPatterns, peakHours, errorBreakdown }) {
  const heatmapData = studyPatterns.map((item) => ({
    ...item,
    dayIndex: dayNames.indexOf(item.day),
  }));

  return (
    <section className="details-section">
      <div className="chart-row">
        <div className="chart-card">
          <div className="card-title">Retention Curve</div>
          <p className="card-copy">Predicted memory decay across the next 30 days.</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={retentionData}> 
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
              <XAxis dataKey="day" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{ background: '#111826', borderColor: '#2a3a58' }} itemStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="retention" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3, fill: 'var(--accent)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-title">Learning Curve</div>
          <p className="card-copy">Accuracy improvement for recent sessions.</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={learningData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
              <XAxis dataKey="session" tick={{ fill: '#fff' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{ background: '#111826', borderColor: '#2a3a58' }} itemStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="accuracy" stroke="rgba(255, 180, 50, 0.96)" strokeWidth={3} dot={{ r: 3, fill: 'rgba(255, 180, 50, 1)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-card wide-card">
          <div className="card-title">Study Patterns Heatmap</div>
          <p className="card-copy">When and how often you study each day.</p>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
              <XAxis type="number" dataKey="hour" name="Hour" tick={{ fill: '#fff' }} domain={[0, 23]} />
              <YAxis type="number" dataKey="dayIndex" name="Day" tickFormatter={(value) => dayNames[value] || value} tick={{ fill: '#fff' }} domain={[0, 6]} />
              <ZAxis type="number" dataKey="value" range={[120, 600]} />
              <Tooltip contentStyle={{ background: '#111826', borderColor: '#2a3a58' }} formatter={(value) => [`${Math.round(value * 100)}%`, 'Intensity']} labelFormatter={(label) => `Hour ${label}`} />
              <Scatter data={heatmapData} shape={renderHeatmapSquare} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <div className="card-title">Peak Hours</div>
          <p className="card-copy">Hours when your study sessions are most effective.</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
              <XAxis dataKey="hour" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{ background: '#111826', borderColor: '#2a3a58' }} itemStyle={{ color: '#fff' }} />
              <Bar dataKey="score" fill="var(--accent)">
                {peakHours.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent)' : '#ffb347'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card summary-card">
          <div className="card-title">Error Analysis</div>
          <p className="card-copy">Breakdown of the topics with the most mistakes.</p>
          <div className="breakdown-list">
            {errorBreakdown.length === 0 ? (
              <div className="empty-state">No error breakdown available yet.</div>
            ) : (
              errorBreakdown.map((item) => (
                <div key={item.topic} className="breakdown-row">
                  <span className="breakdown-topic">{item.topic}</span>
                  <span className="breakdown-value">{item.errors || item.count || 0} errors</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsDetails;
