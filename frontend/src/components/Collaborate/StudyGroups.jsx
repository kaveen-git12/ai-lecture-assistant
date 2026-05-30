import React, { useState } from 'react';

function StudyGroups({ groups, onCreateGroup, onInvite, meeting, onMeetingChange, onScheduleMeeting }) {
  const [groupName, setGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <section className="study-groups-panel">
      <div className="panel-title">Study Groups</div>
      <div className="group-form">
        <input
          type="text"
          placeholder="New group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button type="button" className="control-button accent" onClick={() => { onCreateGroup(groupName); setGroupName(''); }}>
          Create Group
        </button>
      </div>
      <div className="groups-grid">
        {groups.length === 0 ? (
          <div className="empty-state">No study groups yet.</div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-name">{group.name}</div>
              <div className="group-resources">
                {(group.resources || []).slice(0, 3).map((resource) => (
                  <div key={resource.id} className="resource-chip">{resource.title || resource}</div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="invite-row">
        <input
          type="email"
          placeholder="Invite by email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <button type="button" className="control-button" onClick={() => { onInvite(inviteEmail); setInviteEmail(''); }}>
          Invite
        </button>
      </div>
      <div className="meeting-scheduler">
        <div className="panel-subtitle">Schedule a Meeting</div>
        <div className="scheduler-row">
          <input
            type="date"
            value={meeting.date}
            onChange={(e) => onMeetingChange((prev) => ({ ...prev, date: e.target.value }))}
          />
          <input
            type="time"
            value={meeting.time}
            onChange={(e) => onMeetingChange((prev) => ({ ...prev, time: e.target.value }))}
          />
          <button type="button" className="control-button accent" onClick={onScheduleMeeting}>
            Schedule
          </button>
        </div>
      </div>
    </section>
  );
}

export default StudyGroups;
