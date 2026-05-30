import React, { useEffect, useState } from 'react';
import quizService from '../services/quizService';
import QuizList from './Quiz/QuizList';
import QuizCreator from './Quiz/QuizCreator';
import QuizPlayer from './Quiz/QuizPlayer';
import ScoreSummary from './Quiz/ScoreSummary';
import QuizHistory from './Quiz/QuizHistory';
import './Quiz/Quiz.css';

function QuizPanel() {
  const [view, setView] = useState('list');
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Select or create a quiz to begin.');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizService.listQuizzes();
      const loaded = response.quizzes || response || [];
      setQuizzes(Array.isArray(loaded) ? loaded : [loaded]);
    } catch (error) {
      console.error('Unable to load quizzes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setActiveQuiz(null);
    setResult(null);
    setMessage('Create a new quiz from lecture or note content.');
    setView('creator');
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setMessage(`Selected quiz: ${quiz.title || 'Untitled'}`);
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setResult(null);
    setMessage(`Starting quiz: ${quiz.title || 'Untitled'}`);
    setView('player');
  };

  const handleDeleteQuiz = async (quizId) => {
    setLoading(true);
    try {
      await quizService.deleteQuiz(quizId);
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
      }
      if (activeQuiz?.id === quizId) {
        setActiveQuiz(null);
        setView('list');
      }
      await loadQuizzes();
      setMessage('Quiz deleted.');
    } catch (error) {
      console.error('Unable to delete quiz', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (payload) => {
    setLoading(true);
    try {
      const response = await quizService.generateQuiz(payload);
      const generated = response.quiz || response;
      return {
        ...generated,
        questions: generated.questions || [],
        title: generated.title || `${payload.sourceType} quiz`,
        subject: generated.subject || payload.sourceType === 'lecture' ? 'Lecture' : 'Note',
      };
    } catch (error) {
      console.error('Quiz generation failed', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (quizDraft) => {
    setLoading(true);
    try {
      const payload = {
        title: quizDraft.title || `${quizDraft.sourceType === 'lecture' ? 'Lecture' : 'Note'} Quiz`,
        subject: quizDraft.subject || 'General',
        difficulty: quizDraft.difficulty || 'medium',
        questions: quizDraft.questions || [],
        sourceType: quizDraft.sourceType || 'note',
        sourceText: quizDraft.sourceText || '',
        createdAt: quizDraft.createdAt || new Date().toISOString(),
      };
      const response = await quizService.saveQuiz(quizDraft.id, payload);
      const saved = response.quiz || response;
      await loadQuizzes();
      setSelectedQuiz(saved);
      setMessage('Quiz saved successfully.');
      setView('list');
      return saved;
    } catch (error) {
      console.error('Unable to save quiz', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async (attempt) => {
    if (!activeQuiz?.id) {
      return;
    }
    setLoading(true);
    try {
      const response = await quizService.submitQuiz(activeQuiz.id, attempt);
      const submission = response.result || attempt;
      setResult(submission);
      setMessage('Quiz submitted. Review your score.');
      setView('summary');
      await loadQuizzes();
    } catch (error) {
      console.error('Unable to submit quiz', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    const quiz = selectedQuiz || activeQuiz;
    if (!quiz?.id) {
      setMessage('Select a quiz first to see history.');
      return;
    }
    setLoading(true);
    try {
      const response = await quizService.getQuizHistory(quiz.id);
      const loaded = response.history || response || [];
      setHistory(Array.isArray(loaded) ? loaded : [loaded]);
      setView('history');
    } catch (error) {
      console.error('Unable to load quiz history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (activeQuiz) {
      setView('player');
      setResult(null);
      setMessage('Retrying the last quiz attempt.');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setResult(null);
    setActiveQuiz(null);
    setMessage('Returning to quiz list.');
  };

  return (
    <div className="quiz-shell">
      {loading && <div className="quiz-loading">Loading quiz data...</div>}
      <div className="quiz-status-bar">
        <span>{message}</span>
      </div>
      {view === 'creator' && (
        <QuizCreator
          initialQuiz={selectedQuiz}
          onGenerateQuiz={handleGenerateQuiz}
          onSaveQuiz={handleSaveQuiz}
          onCancel={handleBackToList}
        />
      )}

      {view === 'player' && activeQuiz && (
        <QuizPlayer
          quiz={activeQuiz}
          onSubmit={handleSubmitQuiz}
          onCancel={handleBackToList}
        />
      )}

      {view === 'summary' && result && activeQuiz && (
        <ScoreSummary
          result={result}
          quiz={activeQuiz}
          onRetry={handleRetry}
          onBackToList={handleBackToList}
        />
      )}

      {view === 'history' && (
        <QuizHistory history={history} onBack={handleBackToList} />
      )}

      {view === 'list' && (
        <QuizList
          quizzes={quizzes}
          selectedQuiz={selectedQuiz}
          onSelectQuiz={handleSelectQuiz}
          onStartQuiz={handleStartQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onCreateQuiz={handleCreateQuiz}
          onShowHistory={handleShowHistory}
        />
      )}
    </div>
  );
}

export default QuizPanel;
