# Phase 3 Quick Reference

## 🎮 Three Major Features

### 1️⃣ Analytics Dashboard
**Purpose:** Deep insights into learning patterns  
**API Prefix:** `/api/analytics/`  
**Component:** `<AnalyticsDashboard />`  

Key Endpoints:
- `GET /api/analytics/dashboard` - Full overview
- `GET /api/analytics/retention/:lectureId` - Ebbinghaus curve
- `GET /api/analytics/weak-topics/:lectureId` - Areas to improve
- `GET /api/analytics/strong-topics/:lectureId` - Areas of mastery

Metrics Tracked:
- Study time, session count, average accuracy
- Retention curve (30-day forgetting curve)
- Weak/strong topics with error analysis
- Study patterns (productive hours, weekly avg)
- Learning curve (accuracy improvement)

### 2️⃣ Gamification System
**Purpose:** Increase engagement through rewards  
**API Prefix:** `/api/gamification/`  
**Component:** `<GamificationPanel />`  

Key Endpoints:
- `GET /api/gamification/status` - Current stats
- `POST /api/gamification/award-points` - Add points
- `POST /api/gamification/unlock-achievement` - Unlock badge
- `GET /api/gamification/leaderboard` - Global rankings
- `POST /api/gamification/update-streak` - Daily streak

Achievements Available:
- First Steps (50 pts) - Complete first lecture
- Perfect Score (75 pts) - 100% quiz score
- Week Warrior (300 pts) - 7-day streak
- Monthly Champion (1000 pts) - 30-day streak
- Quiz Master (200 pts) - 10 perfect quizzes
- Top Performer (500 pts) - Top 10% rank
- Retention Master (400 pts) - 80%+ retention

Level System:
- 0 XP = Level 1
- 1000 XP = Level 2
- 2000 XP = Level 3
- Pattern: +1000 XP per level

### 3️⃣ WebRTC Collaboration
**Purpose:** Real-time video conferencing  
**API Prefix:** `/api/webrtc/`  
**Component:** `<WebRTCPanel />`  

Key Endpoints:
- `POST /api/webrtc/session` - Create session → Returns sessionId + publicLink
- `POST /api/webrtc/join` - Join conference
- `POST /api/webrtc/leave` - Exit session
- `POST /api/webrtc/media` - Toggle video/audio
- `POST /api/webrtc/screen-share/start` - Share screen
- `POST /api/webrtc/chat` - Send message
- `GET /api/webrtc/sessions/active` - List active sessions

Features:
- Multi-participant video grid
- Screen sharing (one at a time)
- Synchronized notes
- Chat with message history
- Emoji reactions
- Cursor position tracking
- Session recording capability

---

## 🔧 Common Integration Patterns

### Pattern 1: Award Points After Quiz

```javascript
if (quizScore === 100) {
  // Award points
  await fetch('/api/gamification/award-points', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      points: 75,
      action: 'perfect-score',
      description: 'Perfect score on quiz'
    })
  });
  
  // Try to unlock achievement
  await fetch('/api/gamification/unlock-achievement', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ achievementId: 'perfect-score' })
  });
}
```

### Pattern 2: Update Daily Streak

```javascript
// Call once per day when user logs in
window.addEventListener('load', async () => {
  await fetch('/api/gamification/update-streak', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
});
```

### Pattern 3: Show Analytics for Lecture

```javascript
const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  fetch(`/api/analytics/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(data => setAnalytics(data));
}, []);

return <AnalyticsDashboard data={analytics} />;
```

### Pattern 4: Create Study Session

```javascript
const createStudySession = async () => {
  const res = await fetch('/api/webrtc/session', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      lectureId: currentLecture._id,
      sessionName: 'Study Group'
    })
  });
  
  const { sessionId, publicLink } = await res.json();
  
  // Share publicLink with other students
  copyToClipboard(publicLink);
};
```

---

## 📊 Database Models Summary

### Analytics Model
```
/models/Analytics.js
├── studyMetrics (total time, sessions, avg duration)
├── performanceMetrics (quizzes, accuracy, pass rate)
├── retentionCurve (30-day forgetting curve)
├── weakTopics (error analysis)
├── strongTopics (mastery tracking)
└── studyPatterns (when user studies best)
```

### Gamification Model
```
/models/Gamification.js
├── points (totalPoints, pointsHistory)
├── achievements (locked/unlocked badges)
├── badges (tier 1-5)
├── streaks (current, longest, history)
├── leaderboard stats (global rank, percentile)
├── challenges (active and completed)
└── level system (XP to next level)
```

### CollaborationSession Model
```
/models/CollaborationSession.js
├── sessionId (UUID)
├── host & participants (roles, media state)
├── iceServers (NAT traversal)
├── synchronizedNotes (shared doc)
├── chatMessages (message history)
├── screenShareHistory (who shared when)
├── reactions (emoji reactions)
└── recording (if enabled)
```

---

## 🚀 Utility Functions

### analyticsEngine.js

```javascript
updateAnalytics(userId, lectureId)
  ↓ Recalculates all metrics

calculateRetentionCurve(userId, lectureId)
  ↓ Ebbinghaus 30-day curve

extractWeakTopics(userId, lectureId)
  ↓ Topics with >30% error rate

extractStrongTopics(userId, lectureId)
  ↓ Topics with >80% mastery

calculateStudyPatterns(userId)
  ↓ Most productive time, weekly avg

getAnalyticsSummary(userId, lectureId)
  ↓ Full dashboard snapshot
```

### gamificationEngine.js

```javascript
awardPoints(userId, points, action, description)
  ↓ Add points + check level up

unlockAchievement(userId, achievementId)
  ↓ Award achievement + bonus points

updateStreak(userId)
  ↓ Update daily streak + check milestones

getLeaderboard(classId, limit)
  ↓ Get top N ranked users

getUserRank(userId)
  ↓ Get rank and percentile

getGamificationStatus(userId)
  ↓ Full user gamification snapshot
```

### webrtcSignaling.js

```javascript
createSession(lectureId, hostId, name, desc)
  ↓ New collaboration session

addParticipant(sessionId, userId, peerId)
  ↓ Join session

startScreenShare(sessionId, userId)
  ↓ Share screen (one at a time)

addChatMessage(sessionId, userId, message)
  ↓ Send mesage

addSynchronizedNote(sessionId, userId, content)
  ↓ Shared note editing

endSession(sessionId)
  ↓ Close session
```

---

## 🧪 Quick Test Queries

### Test Analytics
```bash
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Gamification
```bash
curl -X GET http://localhost:3000/api/gamification/status \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:3000/api/gamification/award-points \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points":50,"action":"test","description":"Testing"}'
```

### Test WebRTC
```bash
curl -X POST http://localhost:3000/api/webrtc/session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lectureId":"LECTURE_ID","sessionName":"Test"}'
```

---

## 🎯 Implementation Checklists

### Minimum Viable Product

- [ ] Analytics dashboard shows in study page
- [ ] Gamification status displays in profile
- [ ] WebRTC panel allows video calls
- [ ] Points awarded for quiz completion
- [ ] Achievements unlock on milestones
- [ ] Leaderboard accessible

### Production Ready

- [ ] Analytics exports to PDF/CSV
- [ ] Gamification has notification system
- [ ] WebRTC has backup ICE servers
- [ ] Database indices for performance
- [ ] Rate limiting on APIs
- [ ] Error handling throughout
- [ ] Analytics calculations optimized
- [ ] Leaderboard cached/updated hourly

### Advanced Features

- [ ] Custom challenges per class
- [ ] Peer-to-peer recommendation based on analytics
- [ ] AI-powered improvement suggestions
- [ ] Session recording and playback
- [ ] Whiteboard annotations in sessions
- [ ] Badge customization per institution

---

## 📈 Performance Considerations

### Analytics Queries
- Cache analytics data (update hourly)
- Use database indices on userId, lectureId
- Batch calculate metrics
- Archive old data (>1 year)

### Gamification Queries
- Cache leaderboard (update every 15 min)
- Index on totalPoints for rankings
- Limit achievement checks to necessary actions
- Archive old challenge history

### WebRTC Queries
- Limit chat message retrieval to last 100 msgs
- Archive old sessions (>30 days)
- Clean up inactive participants
- Use connection pooling

---

## 🔐 Security Notes

- All analytics endpoints protected with authMiddleware
- Gamification data personal (don't expose in list APIs)
- WebRTC sessions require join permission
- Validate input in all POST endpoints
- Rate limit point awarding (prevent farming)
- Encrypt sensitive data at rest

---

## 📚 File Structure

```
Phase 3 Files Added:
├── models/
│   ├── Analytics.js
│   ├── Gamification.js
│   └── CollaborationSession.js
├── utils/
│   ├── analyticsEngine.js
│   ├── gamificationEngine.js
│   └── webrtcSignaling.js
├── routes/
│   ├── analytics.js (9 endpoints)
│   ├── gamification.js (11 endpoints)
│   └── webrtc.js (14 endpoints)
├── src/components/
│   ├── AnalyticsDashboard.js
│   ├── GamificationPanel.js
│   └── WebRTCPanel.js
└── Documentation/
    ├── PHASE3_GUIDE.md (this file)
    └── PHASE3_QUICK_REFERENCE.md
```

---

## 🎓 Total Achievement Points

- 8 achievements with rarity tiers
- 50-1000 points per achievement
- Level progression: +1000 pts per level
- Unlimited badge tiers (1-5)

**Example Path:**
Perfect Score (75) + Lecture Complete (50) + Daily Streak (varies) = Level Progress

---

## 💬 Quick API Examples

### Get User Dashboard
```
GET /api/analytics/dashboard
Response: { totalStudyTime, totalLectures, averageAccuracy, topWeakAreas, topStrengths }
```

### Award Points
```
POST /api/gamification/award-points
Body: { points: 50, action: "lecture-complete", description: "..." }
Response: { totalPoints, level, experienceToNextLevel }
```

### Create Study Session
```
POST /api/webrtc/session
Body: { lectureId: "...", sessionName: "Study Group" }
Response: { sessionId: "uuid", publicLink: "share/uuid", iceServers: [...] }
```

---

**Last Updated:** March 31, 2026  
**Quick Reference for:** Analytics | Gamification | WebRTC Collaboration
