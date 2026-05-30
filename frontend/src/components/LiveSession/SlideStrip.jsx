import React from 'react';

function SlideStrip({ slides, selectedSlide, onSelectSlide, onDeleteSlide }) {
  return (
    <section className="live-session-panel slide-strip-section">
      <div className="panel-header">
        <div>
          <div className="panel-title">Slide Strip</div>
          <div className="panel-subtitle">Browse captured slides and choose what to keep.</div>
        </div>
        <span className="panel-meta">{slides.length} slides</span>
      </div>

      <div className="slide-strip">
        {slides.length === 0 ? (
          <div className="slide-empty-state">No slides captured yet.</div>
        ) : (
          slides.map((slide, index) => (
            <button
              key={slide.id || index}
              className={`slide-card ${selectedSlide === slide.id ? 'selected' : ''}`}
              onClick={() => onSelectSlide(slide.id)}
              type="button"
            >
              <img src={slide.thumbnailUrl || '/images/placeholder-slide.png'} alt={`Slide ${index + 1}`} />
              <div className="slide-card-footer">
                <span>Slide {index + 1}</span>
                <button className="delete-slide" onClick={(event) => { event.stopPropagation(); onDeleteSlide(slide.id); }}>
                  ×
                </button>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

export default SlideStrip;
