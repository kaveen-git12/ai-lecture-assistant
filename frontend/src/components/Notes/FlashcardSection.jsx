import React from 'react';

function FlashcardSection({ flashcards, onGenerateFlashcards, onToggleFlip, onUpdateDifficulty }) {
  const total = flashcards.length;
  const completed = flashcards.filter((card) => card.flipped).length;
  const nextCard = flashcards.find(card => !card.flipped);

  return (
    <div className="tools-card">
      <div className="tools-card-title">Flashcards</div>
      
      {total > 0 && (
        <div className="flashcard-stats">
          <span className="stats-pill">{completed}/{total} reviewed</span>
        </div>
      )}

      {nextCard ? (
        <div className="flashcard-preview">
          <div className="preview-question">{nextCard.question}</div>
          <button className="control-button small" onClick={() => onToggleFlip(nextCard.id)}>
            Reveal
          </button>
        </div>
      ) : null}

      <button className="control-button" onClick={onGenerateFlashcards} style={{ width: '100%' }}>
        {total === 0 ? 'Generate Flashcards' : 'Review Now'}
      </button>
    </div>
  );
}

export default FlashcardSection;
