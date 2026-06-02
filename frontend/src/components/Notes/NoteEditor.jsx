import React, { useState } from 'react';

function NoteEditor({ note, onChange, onSave, onDelete, onCreateNew, saving }) {
  const [tagInput, setTagInput] = useState('');

  if (!note) {
    return (
      <div className="note-editor-empty">
        <div className="preview-placeholder-icon">📝</div>
        <p>Select or create a note to begin.</p>
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
      {/* Formatting toolbar */}
      <div className="editor-toolbar">
        <button className="toolbar-button" title="Bold" onClick={() => {
          const textarea = document.querySelector('.note-content-textarea');
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = note.content.substring(start, end);
            const before = note.content.substring(0, start);
            const after = note.content.substring(end);
            onChange('content', `${before}**${selected}**${after}`);
          }
        }}>
          B
        </button>
        <button className="toolbar-button" title="Italic" onClick={() => {
          const textarea = document.querySelector('.note-content-textarea');
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = note.content.substring(start, end);
            const before = note.content.substring(0, start);
            const after = note.content.substring(end);
            onChange('content', `${before}*${selected}*${after}`);
          }
        }}>
          I
        </button>
        <button className="toolbar-button" title="Heading 1" onClick={() => {
          const textarea = document.querySelector('.note-content-textarea');
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = note.content.substring(start, end);
            const before = note.content.substring(0, start);
            const after = note.content.substring(end);
            onChange('content', `${before}# ${selected}${after}`);
          }
        }}>
          H1
        </button>
        <button className="toolbar-button" title="Bullet List" onClick={() => {
          const textarea = document.querySelector('.note-content-textarea');
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = note.content.substring(start, end);
            const before = note.content.substring(0, start);
            const after = note.content.substring(end);
            onChange('content', `${before}• ${selected}${after}`);
          }
        }}>
          List
        </button>
        <button className="toolbar-button" title="Link" onClick={() => {
          const textarea = document.querySelector('.note-content-textarea');
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = note.content.substring(start, end);
            const before = note.content.substring(0, start);
            const after = note.content.substring(end);
            onChange('content', `${before}[${selected}](url)${after}`);
          }
        }}>
          Link
        </button>
      </div>

      {/* Rich text editor */}
      <textarea
        className="note-content-textarea"
        value={note.content}
        onChange={(e) => onChange('content', e.target.value)}
        placeholder="Write lecture notes, ideas, and summaries here..."
      />

      {/* Tags editor - hidden but functional */}
      <div className="tag-editor" style={{ display: 'none' }}>
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
    </section>
  );
}

export default NoteEditor;
