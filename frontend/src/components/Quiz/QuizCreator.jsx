import React, { useMemo, useState } from 'react';

const questionTemplates = {
  mcq: () => ({
    id: `${Date.now()}-${Math.random()}`,
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  }),
  tf: () => ({
    id: `${Date.now()}-${Math.random()}`,
    type: 'tf',
    question: '',
    options: ['True', 'False'],
    correctAnswer: 0,
    explanation: '',
  }),
  short: () => ({
    id: `${Date.now()}-${Math.random()}`,
    type: 'short',
    question: '',
    options: [],
    correctAnswer: '',
    explanation: '',
  }),
};

function QuizCreator({ initialQuiz, onGenerateQuiz, onSaveQuiz, onCancel }) {
  const [mode, setMode] = useState('ai');
  const [sourceType, setSourceType] = useState('lecture');
  const [sourceText, setSourceText] = useState(initialQuiz?.sourceText || '');
  const [questionCount, setQuestionCount] = useState(initialQuiz?.questions?.length || 10);
  const [difficulty, setDifficulty] = useState(initialQuiz?.difficulty || 'medium');
  const [quizDraft, setQuizDraft] = useState(initialQuiz || { title: '', subject: '', questions: [] });
  const [saving, setSaving] = useState(false);

  const previewQuestions = useMemo(() => quizDraft.questions || [], [quizDraft.questions]);

  const addManualQuestion = (type = 'mcq') => {
    setQuizDraft((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), questionTemplates[type]()],
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuizDraft((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question
      ),
    }));
  };

  const updateOption = (questionId, index, value) => {
    setQuizDraft((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((question) =>
        question.id === questionId
          ? { ...question, options: question.options.map((option, optionIndex) => (optionIndex === index ? value : option)) }
          : question
      ),
    }));
  };

  const removeQuestion = (questionId) => {
    setQuizDraft((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((question) => question.id !== questionId),
    }));
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setSaving(true);
    try {
      const result = await onGenerateQuiz({
        sourceType,
        sourceText,
        questionCount,
        difficulty,
      });
      if (result) {
        setQuizDraft(result);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveQuiz({
        ...quizDraft,
        title: quizDraft.title || `${sourceType === 'lecture' ? 'Lecture' : 'Note'} Quiz`,
        subject: quizDraft.subject || 'General',
        questionCount: (quizDraft.questions || []).length,
        difficulty,
        sourceType,
        sourceText,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="quiz-panel-section quiz-creator-panel">
      <div className="quiz-panel-header">
        <div>
          <h2>Create Quiz</h2>
          <p>AI-generate from lecture/note text or build questions manually.</p>
        </div>
        <div className="quiz-panel-actions">
          <button className="control-button secondary" onClick={onCancel}>Back</button>
        </div>
      </div>

      <div className="quiz-creator-tabs">
        <button className={`tab-button ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>AI Generate</button>
        <button className={`tab-button ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>Manual Entry</button>
      </div>

      {mode === 'ai' ? (
        <div className="quiz-generator-form">
          <label>
            Source type
            <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              <option value="lecture">Lecture</option>
              <option value="note">Note</option>
            </select>
          </label>
          <label>
            Source content
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste lecture notes or note content here"
            />
          </label>
          <div className="grid-row">
            <label>
              Question count
              <input
                type="number"
                min="5"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </label>
            <label>
              Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>
          <button className="control-button" onClick={handleGenerate} disabled={saving}>Generate Quiz</button>
        </div>
      ) : (
        <div className="quiz-manual-form">
          <div className="quiz-manual-actions">
            <button className="control-button" onClick={() => addManualQuestion('mcq')}>Add MCQ</button>
            <button className="control-button" onClick={() => addManualQuestion('tf')}>Add True/False</button>
            <button className="control-button" onClick={() => addManualQuestion('short')}>Add Short Answer</button>
          </div>

          {(quizDraft.questions || []).length === 0 ? (
            <div className="quiz-empty-state">
              <p>No manual questions yet. Add one to begin.</p>
            </div>
          ) : (
            quizDraft.questions.map((question, index) => (
              <div key={question.id} className="quiz-question-edit">
                <div className="quiz-question-header">
                  <span>#{index + 1} {question.type.toUpperCase()}</span>
                  <button className="control-button secondary small" onClick={() => removeQuestion(question.id)}>Remove</button>
                </div>
                <label>
                  Question
                  <input
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  />
                </label>
                {question.type === 'mcq' && (
                  <div className="quiz-options-edit">
                    {question.options.map((option, idx) => (
                      <label key={idx}>
                        Option {idx + 1}
                        <input
                          value={option}
                          onChange={(e) => updateOption(question.id, idx, e.target.value)}
                        />
                      </label>
                    ))}
                    <label>
                      Correct answer index
                      <input
                        type="number"
                        min="0"
                        max={question.options.length - 1}
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(question.id, 'correctAnswer', Number(e.target.value))}
                      />
                    </label>
                  </div>
                )}
                {question.type === 'tf' && (
                  <label>
                    Correct answer
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(question.id, 'correctAnswer', Number(e.target.value))}
                    >
                      <option value={0}>True</option>
                      <option value={1}>False</option>
                    </select>
                  </label>
                )}
                {question.type === 'short' && (
                  <label>
                    Expected answer
                    <input
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                    />
                  </label>
                )}
                <label>
                  Explanation
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                  />
                </label>
              </div>
            ))
          )}
        </div>
      )}

      <div className="quiz-preview-panel">
        <h3>Quiz Preview</h3>
        <div className="quiz-preview-summary">
          <div>{(quizDraft.questions || []).length} questions</div>
          <div>Difficulty {difficulty}</div>
          <div>Source {sourceType}</div>
        </div>
        <button className="control-button" onClick={handleSave} disabled={saving || !(quizDraft.questions || []).length}>Save Quiz</button>
      </div>
    </section>
  );
}

export default QuizCreator;
