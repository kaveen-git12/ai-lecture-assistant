import React from 'react';

function CollabNotes({ notes, onChangeNotes, participants }) {
  return (
    <section className="collab-notes-panel">
      <div className="panel-title">Shared Notes</div>
      <div className="notes-header">
        <span>{participants.length} people editing</span>
      </div>
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={(event) => onChangeNotes(event.target.value)}
      />
    </section>
  );
}

export default CollabNotes;
