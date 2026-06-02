import React, { useEffect, useMemo, useState } from 'react';
import noteService from '../services/noteService';
import NoteEditor from './Notes/NoteEditor';
import AIGenerationPanel from './Notes/AIGenerationPanel';
import FlashcardSection from './Notes/FlashcardSection';
import ExportPanel from './Notes/ExportPanel';
import './Notes/Notes.css';

const defaultNoteTemplate = {
  title: 'Untitled note',
  content: '',
  tags: [],
  linkedLecture: 'None',
  flashcards: [],
};

function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortMode, setSortMode] = useState('recent');
  const [aiOutput, setAiOutput] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('Select or create a note to begin.');
  const [error, setError] = useState('');
  const [exportOptions, setExportOptions] = useState({ enhancedLayout: true, toc: true });
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await noteService.fetchNotes();
      const fetchedNotes = response.notes || response || [];
      setNotes(Array.isArray(fetchedNotes) ? fetchedNotes : [fetchedNotes]);
      if (Array.isArray(fetchedNotes) && fetchedNotes.length > 0) {
        setSelectedNoteId(fetchedNotes[0].id);
        setNoteDraft(fetchedNotes[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load notes.');
    }
  };

  const sortedNotes = useMemo(() => {
    const copy = [...notes];
    if (sortMode === 'title') {
      return copy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return copy.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  }, [notes, sortMode]);

  const filteredNotes = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return sortedNotes.filter((note) => {
      const matchesTitle = note.title?.toLowerCase().includes(lowerQuery);
      const matchesContent = note.content?.toLowerCase().includes(lowerQuery);
      const matchesTag = tagFilter ? note.tags?.includes(tagFilter) : true;
      return (matchesTitle || matchesContent) && matchesTag;
    });
  }, [searchQuery, tagFilter, sortedNotes]);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    notes.forEach((note) => (note.tags || []).forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [notes]);

  const selectNote = (note) => {
    setSelectedNoteId(note.id);
    setNoteDraft(note);
    setAiOutput({});
    setMessage('Editing note: ' + note.title);
  };

  const handleNoteChange = (field, value) => {
    setNoteDraft((prev) => ({ ...prev, [field]: value }));
  };

  const createNote = async () => {
    setSaving(true);
    try {
      const payload = { ...defaultNoteTemplate, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const response = await noteService.createNote(payload);
      const note = response.note || response;
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      setSelectedNoteId(note.id);
      setNoteDraft(note);
      setMessage('New note created. Start writing or generate AI insights.');
    } catch (err) {
      console.error(err);
      setError('Unable to create note.');
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!noteDraft?.id) return;
    setSaving(true);
    try {
      const payload = { ...noteDraft, updatedAt: new Date().toISOString() };
      const response = await noteService.updateNote(noteDraft.id, payload);
      const updated = response.note || response;
      setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
      setNoteDraft(updated);
      setMessage('Note saved successfully.');
    } catch (err) {
      console.error(err);
      setError('Unable to save note.');
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async () => {
    if (!noteDraft?.id) return;
    setSaving(true);
    try {
      await noteService.deleteNote(noteDraft.id);
      const remaining = notes.filter((note) => note.id !== noteDraft.id);
      setNotes(remaining);
      const next = remaining[0] || null;
      setSelectedNoteId(next?.id || null);
      setNoteDraft(next);
      setMessage('Note deleted.');
    } catch (err) {
      console.error(err);
      setError('Unable to delete note.');
    } finally {
      setSaving(false);
    }
  };

  const runAiCommand = async (type) => {
    if (!noteDraft?.id) return;
    setAiLoading(true);
    setError('');
    try {
      let response;
      const payload = { content: noteDraft.content, title: noteDraft.title };
      if (type === 'summary') {
        response = await noteService.generateSummary(noteDraft.id, payload);
        setAiOutput((prev) => ({ ...prev, summary: response.summary || response.text || '' }));
      } else if (type === 'concepts') {
        response = await noteService.generateKeyConcepts(noteDraft.id, payload);
        setAiOutput((prev) => ({ ...prev, concepts: response.concepts || response.items || [] }));
      } else if (type === 'topics') {
        response = await noteService.generateTopicExtraction(noteDraft.id, payload);
        setAiOutput((prev) => ({ ...prev, topics: response.topics || response.items || [] }));
      } else if (type === 'studyPlan') {
        response = await noteService.generateStudyPlan(noteDraft.id, payload);
        setAiOutput((prev) => ({ ...prev, studyPlan: response.studyPlan || response.plan || '' }));
      } else if (type === 'examPrediction') {
        response = await noteService.generateExamPrediction(noteDraft.id, payload);
        setAiOutput((prev) => ({ ...prev, examPrediction: response.prediction || response.summary || '' }));
      }
      setMessage('AI results are ready for review.');
    } catch (err) {
      console.error(err);
      setError('Failed to generate AI insights.');
    } finally {
      setAiLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!noteDraft?.id) return;
    setAiLoading(true);
    setError('');
    try {
      const response = await noteService.generateFlashcards(noteDraft.id, { content: noteDraft.content });
      const cards = response.flashcards || response.cards || [];
      setNoteDraft((prev) => ({ ...prev, flashcards: cards }));
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === noteDraft.id ? { ...note, flashcards: cards } : note)));
      setMessage('Flashcards generated from the selected note.');
    } catch (err) {
      console.error(err);
      setError('Unable to generate flashcards.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleFlashcardFlip = (cardId) => {
    setNoteDraft((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((card) => card.id === cardId ? { ...card, flipped: !card.flipped } : card),
    }));
  };

  const updateFlashcardDifficulty = (cardId, difficulty) => {
    setNoteDraft((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((card) => card.id === cardId ? { ...card, difficulty } : card),
    }));
  };

  const handleExport = async (format) => {
    if (!noteDraft?.id) return;
    setError('');
    try {
      const response = await noteService.exportNote(noteDraft.id, format, exportOptions);
      const downloadUrl = response.downloadUrl || response.url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
      setMessage(`${format.toUpperCase()} export started.`);
    } catch (err) {
      console.error(err);
      setError('Export failed.');
    }
  };

  const toggleExportLayout = () => {
    setExportOptions((prev) => ({ ...prev, enhancedLayout: !prev.enhancedLayout }));
  };

  const toggleExportToc = () => {
    setExportOptions((prev) => ({ ...prev, toc: !prev.toc }));
  };

  return (
    <div className={`notes-view ${isPanelOpen ? 'panel-open' : ''}`}>
      {/* Left sidebar: note list */}
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">Notes</div>
        
        <input
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
        />

        <div className="notes-list">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              className={`note-list-item ${selectedNoteId === note.id ? 'selected' : ''}`}
              onClick={() => selectNote(note)}
            >
              <div className="note-list-title">{note.title || 'Untitled note'}</div>
              <div className="note-list-meta">
                {note.updatedAt && <span className="note-date">{new Date(note.updatedAt).toLocaleDateString()}</span>}
                {note.flashcards?.length > 0 && <span className="note-flashcards">🧠 {note.flashcards.length}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Add notes button at bottom */}
        <button className="add-note-button" onClick={createNote} disabled={saving}>
          [add notes]
        </button>
      </div>

      {/* Middle column: editor */}
      <div className="notes-main">
        <div className="editor-top-bar">
          <h2 className="editor-title">{noteDraft?.title || 'New Note'}</h2>
          <div className="editor-top-actions">
            <button className="control-button small" onClick={createNote} disabled={saving}>+ New</button>
            <button 
              className="hamburger-button"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              title={isPanelOpen ? 'Close tools panel' : 'Open tools panel'}
            >
              ☰
            </button>
          </div>
        </div>

        <NoteEditor
          note={noteDraft}
          onChange={handleNoteChange}
          onSave={saveNote}
          onDelete={deleteNote}
          onCreateNew={createNote}
          saving={saving}
        />
      </div>

      {/* Right sidebar: collapsible tools panel */}
      <div className={`notes-tools-panel ${!isPanelOpen ? 'closed' : ''}`}>
        <div className="tools-content">
          <AIGenerationPanel
            onGenerateSummary={() => runAiCommand('summary')}
            onGenerateConcepts={() => runAiCommand('concepts')}
            onGenerateTopics={() => runAiCommand('topics')}
            onGenerateStudyPlan={() => runAiCommand('studyPlan')}
            onGenerateExam={() => runAiCommand('examPrediction')}
            aiLoading={aiLoading}
            aiOutput={aiOutput}
          />
          <FlashcardSection
            flashcards={noteDraft?.flashcards || []}
            onGenerateFlashcards={generateFlashcards}
            onToggleFlip={toggleFlashcardFlip}
            onUpdateDifficulty={updateFlashcardDifficulty}
          />
          <ExportPanel
            noteId={noteDraft?.id}
            exportOptions={exportOptions}
            onToggleLayout={toggleExportLayout}
            onToggleToc={toggleExportToc}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
}

export default Notes;
