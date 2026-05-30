import React from 'react';

function FlashcardSection({ flashcards, onGenerateFlashcards, onToggleFlip, onUpdateDifficulty }) {
  const total = flashcards.length;
  const completed = flashcards.filter((card) => card.flipped).length;

  return (
    <section className="notes-panel flashcard-section">
      <div className="panel-header">
        <div>
          <div className="panel-title">Flashcards</div>
          <div className="panel-subtitle">Create active recall study cards from your note material.</div>
        </div>
        <button className="control-button secondary" onClick={onGenerateFlashcards}>Generate Cards</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${total === 0 ? 0 : (completed / total) * 100}%` }} />
      </div>
      <div className="progress-label">{completed}/{total} reviewed</div>

      {flashcards.length === 0 ? (
        <div className="preview-placeholder">
          <div className="preview-placeholder-icon">🧠</div>
          <p>No flashcards yet. Use the button to generate from your note.</p>
        </div>
      ) : (
        <div className="flashcard-list">
          {flashcards.map((card) => (
            <div className="flashcard" key={card.id || card.question}>
              <div className="flashcard-content">
                <strong>{card.question}</strong>
                <p>{card.flipped ? card.answer : 'Tap to reveal answer'}</p>
              </div>
              <div className="flashcard-footer">
                <button className="control-button small" onClick={() => onToggleFlip(card.id)}>
                  {card.flipped ? 'Hide' : 'Reveal'}
                </button>
                <select
                  className="difficulty-select"
                  value={card.difficulty || 'medium'}
                  onChange={(e) => onUpdateDifficulty(card.id, e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default FlashcardSection;
