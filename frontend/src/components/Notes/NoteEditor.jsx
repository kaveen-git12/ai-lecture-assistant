import React, { useState } from 'react';

function NoteEditor({ note, onChange, onSave, onDelete, onCreateNew, saving }) {
  const [tagInput, setTagInput] = useState('');

  if (!note) {
    return (
      <div className="note-editor-empty">
        <div className="preview-placeholder-icon">📝</div>
        <p>Select an existing note or create a new one to begin.</p>
        <button className="control-button" onClick={onCreateNew}>Create New Note</button>
      </div>
    );
  }

  const handleTagAdd = () => {
    const nextTag = tagInput.trim();
    if (nextTag && !note.tags.includes(nextTag)) {
      onChange('tags', [...note.tags, nextTag]);
    }
    setTagInput('');
  };

  return (
    <section className="note-editor">
      <div className="editor-header">
        <div>
          <input
            className="note-title-input"
            value={note.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Note title"
          />
          <div className="note-meta">Linked lecture: {note.linkedLecture || 'None'}</div>
        </div>
        <div className="editor-actions">
          <button className="control-button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Note'}
          </button>
          <button className="control-button danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="tag-editor">
        <div className="tag-label">Tags</div>
        <div className="tag-input-row">
          <input
            className="tag-input"
            placeholder="Add a tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTagAdd(); } }}
          />
          <button className="control-button secondary" onClick={handleTagAdd}>Add</button>
        </div>
        <div className="tag-list">
          {note.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </div>

      <textarea
        className="note-content-textarea"
        value={note.content}
        onChange={(e) => onChange('content', e.target.value)}
        placeholder="Write lecture notes, ideas, and summaries here..."
      />
    </section>
  );
}

export default NoteEditor;
