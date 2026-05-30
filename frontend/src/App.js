import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import './styles.css';
import BoardMonitorPanel from './components/BoardMonitorPanel';
import LiveSession from './components/LiveSession/LiveSession';
import Notes from './components/Notes';
import AIChat from './components/AIChat';
import Analytics from './components/Analytics';
import Gamification from './components/Gamification';
import Collaborate from './components/Collaborate';
import QuizPanel from './components/QuizPanel';
import Settings from './components/Settings';

import {
  getSummary,
  extractTopics,
  completeNotes,
  predictExam,
  studyPlan as getStudyPlan,
  generatePDF as generatePDFFromSlides,
  generateSmartPDF as generateSmartPDFUtil,
  askAI,
} from './utils/aiAssistant';

/* ─────────────────────────────────
   CONSTANTS
   ───────────────────────────────── */

const NavIco = {
  dashboard: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24">
      <path d="M21 15a3 3 0 0 1-3 3H7.5L4 21v-3.5A3 3 0 0 1 3 12a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3z" />
      <rect x="7" y="11" width="6" height="4" rx="1" />
      <polygon points="13 13 16 11 16 15 13 13" />
      <line x1="18" y1="6" x2="19" y2="4" />
      <line x1="20.5" y1="7.5" x2="22" y2="7" />
      <line x1="16" y1="5" x2="16.5" y2="3" />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 24 24">
      <path d="M6 18a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6z" />
      <path d="M2 5h4M2 9h4M2 13h4M2 17h4" />
      <path d="M10 15l6-6 2 2-6 6-3 1 1-3z" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24">
      <path d="M18 13c0 1.1-.9 2-2 2H6.5L3 18v-3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h13c1.1 0 2 .9 2 2v8z" />
      <rect x="5" y="6" width="8" height="5" rx="1.5" />
      <circle cx="7.5" cy="8.5" r="0.8" fill="currentColor" />
      <circle cx="10.5" cy="8.5" r="0.8" fill="currentColor" />
      <path d="M8.5 10c.5.3 1 .3 1.5 0" />
      <line x1="9" y1="6" x2="9" y2="4" />
      <circle cx="9" cy="4" r="0.5" fill="currentColor" />
      <path d="M21 10.5c0 .8-.7 1.5-1.5 1.5H18v1.5l-1.5-1.5h-1c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5h4c.8 0 1.5.7 1.5 1.5v3z" />
      <circle cx="16" cy="9.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="9.5" r="0.5" fill="currentColor" />
      <circle cx="19" cy="9.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <rect x="8" y="7" width="3" height="3" rx="0.5" />
      <line x1="13" y1="8.5" x2="16" y2="8.5" />
      <rect x="8" y="11" width="3" height="3" rx="0.5" />
      <line x1="13" y1="12.5" x2="16" y2="12.5" />
      <rect x="8" y="15" width="3" height="3" rx="0.5" />
      <line x1="13" y1="16.5" x2="16" y2="16.5" />
      <path d="M14 18l4-4 1.5 1.5-4 4-2 0.5 0.5-2z" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24">
      <line x1="3" y1="20" x2="21" y2="20" />
      <line x1="3" y1="4" x2="3" y2="20" />
      <rect x="6" y="15" width="2" height="5" rx="0.5" />
      <rect x="10" y="12" width="2" height="8" rx="0.5" />
      <rect x="14" y="9" width="2" height="11" rx="0.5" />
      <rect x="17" y="6" width="2" height="14" rx="0.5" />
      <path d="M7 14l4-3 4-3 3-3" />
      <polyline points="15 5 18 5 18 8" />
    </svg>
  ),
  gamification: (
    <svg viewBox="0 0 24 24">
      <path d="M6 9H4.5A1.5 1.5 0 0 1 3 7.5v-1A1.5 1.5 0 0 1 4.5 5H6" />
      <path d="M18 5h1.5A1.5 1.5 0 0 1 21 6.5v1a1.5 1.5 0 0 1-1.5 1.5H18" />
      <path d="M6 5v5a6 6 0 0 0 12 0V5H6z" />
      <line x1="12" y1="16" x2="12" y2="19" />
      <line x1="9" y1="19" x2="15" y2="19" />
      <polygon points="12 7.5 13 9 14.5 9.2 13.5 10.2 13.8 11.7 12 11 10.2 11.7 10.5 10.2 9.5 9.2 11 9" fill="currentColor" stroke="none" />
      <path d="M5 2l0.5 1 1 0.5-1 0.5-0.5 1-0.5-1-1-0.5 1-0.5z" fill="currentColor" stroke="none" />
      <path d="M20 2l0.5 1 1 0.5-1 0.5-0.5 1-0.5-1-1-0.5 1-0.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  collaborate: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="6" r="2.5" />
      <path d="M8 11c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5" />
      <circle cx="6" cy="16" r="2.5" />
      <path d="M2 21c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5" />
      <circle cx="18" cy="16" r="2.5" />
      <path d="M14 21c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5" />
      <path d="M9 8.5a6.5 6.5 0 0 1 6 0" strokeDasharray="3,3" />
      <path d="M16.5 14.5a6.5 6.5 0 0 1-3.5 3.5" strokeDasharray="3,3" />
      <path d="M11 18a6.5 6.5 0 0 1-3.5-3.5" strokeDasharray="3,3" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
};

const NAV_GROUPS = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard',    label: 'Dashboard',    iconKey: 'dashboard' },
      { id: 'live',         label: 'Live Session',  iconKey: 'live' },
      { id: 'notes',        label: 'Notes',         iconKey: 'notes' },
      { id: 'chat',         label: 'AI Chat',       iconKey: 'chat' },
      { id: 'quiz',         label: 'Quiz',          iconKey: 'quiz' },
    ]
  },
  {
    title: 'TOOLS',
    items: [
      { id: 'analytics',    label: 'Analytics',     iconKey: 'analytics' },
      { id: 'gamification', label: 'Gamification',  iconKey: 'gamification' },
      { id: 'collaborate',  label: 'Collaborate',   iconKey: 'collaborate' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings',     label: 'Settings',      iconKey: 'settings' },
    ]
  }
];

const ACCENT_COLORS = [
  { color: '#00bcd4', rgb: '0,188,212' },
  { color: '#f44336', rgb: '244,67,54' },
  { color: '#9c27b0', rgb: '156,39,176' },
  { color: '#4caf50', rgb: '76,175,80' },
  { color: '#f59e0b', rgb: '245,158,11' },
  { color: '#ec407a', rgb: '236,64,122' },
  { color: '#3b82f6', rgb: '59,130,246' },
  { color: '#fb8c00', rgb: '251,140,0' },
  { color: '#14b8a6', rgb: '20,184,166' },
  { color: '#7c3aed', rgb: '124,58,237' },
  { color: '#dc2626', rgb: '220,38,38' },
  { color: '#facc15', rgb: '250,204,21' },
];

const TAB_TITLES = {
  dashboard:    'Dashboard',
  live:         'Live Session',
  notes:        'Notes',
  chat:         'AI Chat',
  quiz:         'Quiz',
  analytics:    'Analytics',
  gamification: 'Gamification',
  collaborate:  'Collaborate',
  settings:     'Settings',
};

/* SVG Icons */
const Ico = {
  videocam:    <svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  play:        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  stop:        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  camera:      <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  pause:       <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  skip:        <svg viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>,
  fileText:    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  alignLeft:   <svg viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  hash:        <svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  download:    <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  filePlus:    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  bookOpen:    <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  calendar:    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  target:      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
};

/* ─────────────────────────────────
   APP COMPONENT
   ───────────────────────────────── */

function App() {
  const { i18n } = useTranslation();

  /* ── UI state ── */
  const [activeTab, setActiveTab]       = useState('dashboard');
  const [darkMode, setDarkMode]         = useState(true);
  const [accentIdx, setAccentIdx]       = useState(4);
  const [accentColor, setAccentColor]   = useState(ACCENT_COLORS[4].color);
  const [accentInput, setAccentInput]   = useState(ACCENT_COLORS[4].color);
  const [showSmartBoard, setShowSmartBoard] = useState(false);
  const [showBoardMonitor, setShowBoardMonitor] = useState(false);

  /* ── server health ── */
  const [healthStatus, setHealthStatus] = useState('unknown');

  /* ── session state ── */
  const [slides, setSlides]               = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);
  const [extractedText, setExtractedText] = useState('');
  const [topicData, setTopicData]         = useState([]);
  const [isRunning, setIsRunning]         = useState(false);
  const [awaitingNextSlide, setAwaitingNextSlide] = useState(false);
  const [model, setModel]                 = useState(null);
  const [stream, setStream]               = useState(null);
  const [summaryText, setSummaryText]     = useState('');
  const [studyPlanText, setStudyPlanText] = useState('');
  const [studySubject, setStudySubject]   = useState('');
  const [lastFrame, setLastFrame]         = useState(null);

  /* ── lifted PDF notes state ── */
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [pdfSummary, setPdfSummary] = useState('');
  const [extractingText, setExtractingText] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [uploadedPDFs, setUploadedPDFs] = useState([]);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  /* ── Apply theme + accent to CSS vars ── */
  useEffect(() => {
    const body = document.body;
    if (darkMode) body.classList.remove('light-mode');
    else body.classList.add('light-mode');
  }, [darkMode]);

  useEffect(() => {
    const hex = accentColor.startsWith('#') ? accentColor : `#${accentColor}`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-rgb', `${r},${g},${b}`);
    
    // YIQ brightness formula to determine contrast color
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    const contrast = yiq >= 128 ? '#111111' : '#ffffff';
    document.documentElement.style.setProperty('--accent-contrast', contrast);
  }, [accentColor]);

  const selectAccentPreset = (index) => {
    setAccentIdx(index);
    setAccentColor(ACCENT_COLORS[index].color);
    setAccentInput(ACCENT_COLORS[index].color);
  };

  const handleAccentInput = (value) => {
    setAccentInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setAccentColor(value);
      setAccentIdx(null);
    }
  };

  /* ── Health check ── */
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/health');
        setHealthStatus(res.ok ? 'online' : 'error');
      } catch { setHealthStatus('offline'); }
    };
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, []);

  /* ── TensorFlow ── */
  useEffect(() => {
    (async () => {
      try {
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        setModel(await cocoSsd.load());
      } catch (e) { console.error('Model load error', e); }
    })();
  }, []);

  /* ── Auto capture loop ── */
  useEffect(() => {
    if (!model || !isRunning || !videoRef.current || !canvasRef.current) return;
    const id = setInterval(autoCapture, 2000);
    return () => clearInterval(id);
  }, [model, isRunning, slides, currentSlideIndex]);

  const detectPerson = async () => {
    if (!model || !videoRef.current) return false;
    try {
      const preds = await model.detect(videoRef.current);
      return preds.some(p => p.class === 'person');
    } catch { return false; }
  };

  const getFrameDifference = (f1, f2) => {
    let diff = 0;
    for (let i = 0; i < f1.data.length; i += 4) {
      diff += Math.abs(f1.data[i] - f2.data[i]);
      diff += Math.abs(f1.data[i+1] - f2.data[i+1]);
      diff += Math.abs(f1.data[i+2] - f2.data[i+2]);
    }
    return diff / (f1.data.length / 4);
  };

  const autoCapture = async () => {
    if (!model || !isRunning || !videoRef.current || !canvasRef.current) return;
    if (await detectPerson()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const cx = Math.round(canvas.width * 0.2);
    const cy = Math.round(canvas.height * 0.2);
    const cw = Math.max(1, Math.round(canvas.width * 0.6));
    const ch = Math.max(1, Math.round(canvas.height * 0.6));
    const currentFrame = ctx.getImageData(cx, cy, cw, ch);
    if (!lastFrame) { setLastFrame(currentFrame); return; }
    if (getFrameDifference(currentFrame, lastFrame) > 15) {
      const img = canvas.toDataURL('image/png');
      if (awaitingNextSlide || slides.length === 0) {
        const ns = [...slides, { image: img }];
        setSlides(ns); setCurrentSlideIndex(ns.length - 1); setAwaitingNextSlide(false);
      } else {
        const us = [...slides]; us[currentSlideIndex] = { ...us[currentSlideIndex], image: img }; setSlides(us);
      }
      setLastFrame(currentFrame);
    }
  };

  /* ── Camera controls ── */
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(ms);
      if (videoRef.current) { videoRef.current.srcObject = ms; await videoRef.current.play(); }
      setIsRunning(true);
    } catch (e) { console.error('Camera error', e); }
  };
  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    setIsRunning(false);
  };
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    canvas.width = Math.min(800, video.videoWidth || 800);
    canvas.height = Math.min(600, video.videoHeight || 600);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const ns = [...slides, { image: canvas.toDataURL('image/png') }];
    setSlides(ns); setCurrentSlideIndex(ns.length - 1);
  };
  const togglePause = () => setIsRunning(r => !r);
  const nextSlide   = () => { setAwaitingNextSlide(true); setCurrentSlideIndex(slides.length); };

  /* -- Board Monitor import handler -- */
  const handleBoardMonitorImport = (slideData) => {
    const ns = [...slides, slideData];
    setSlides(ns);
    setCurrentSlideIndex(ns.length - 1);
  };

  /* ── AI Handlers ── */
  const extractText = async () => {
    if (!slides.length) return;
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      let full = '';
      for (const s of slides) { const { data: { text } } = await worker.recognize(s.image); full += text + ' '; }
      await worker.terminate();
      setExtractedText(full);
    } catch (e) { console.error(e); }
  };
  const generateSummary      = async () => { if (!extractedText) return; try { setSummaryText(await getSummary(extractedText)); } catch(e){console.error(e);} };
  const generateTopics       = async () => { if (!extractedText) return; try { const t = await extractTopics(extractedText); setTopicData(t.split(/\n|,|;/).map(s=>s.trim()).filter(Boolean).map(title=>({title}))); } catch(e){console.error(e);} };
  const generatePDF          = async () => { try { await generatePDFFromSlides(slides); } catch(e){console.error(e);} };
  const handleSmartPDF       = async () => { try { await generateSmartPDFUtil(summaryText, extractedText, topicData); } catch(e){console.error(e);} };
  const completeLectureNotes = async () => { if (!extractedText) return; try { setExtractedText(await completeNotes(extractedText)); } catch(e){console.error(e);} };
  const generateStudyPlan    = async () => { if (!studySubject) return; try { setStudyPlanText(await getStudyPlan(studySubject, 7)); } catch(e){console.error(e);} };
  const generateExamPredict  = async () => { if (!extractedText) return; try { await predictExam(extractedText); } catch(e){console.error(e);} };

  const AI_TOOLS = [
    { label: 'Extract Notes',  icon: Ico.fileText,  action: extractText },
    { label: 'Summary',        icon: Ico.alignLeft,  action: generateSummary },
    { label: 'Topics',         icon: Ico.hash,       action: generateTopics },
    { label: 'Export PDF',     icon: Ico.download,   action: generatePDF },
    { label: 'Smart PDF',      icon: Ico.filePlus,   action: handleSmartPDF },
    { label: 'Complete Notes', icon: Ico.bookOpen,   action: completeLectureNotes },
    { label: 'Study Plan',     icon: Ico.calendar,   action: generateStudyPlan },
    { label: 'Exam Predict',   icon: Ico.target,     action: generateExamPredict },
  ];

  /* ─────────────────────────────────
     RENDER SECTIONS
     ───────────────────────────────── */

  const renderDashboard = () => (
    <div className="dashboard-view">
      {/* Hero card */}
      <div className="hero-card glow-border">
        <div className="hero-icon">🎓</div>
        <h2 className="hero-title">Welcome back!</h2>
        <p className="hero-subtitle">
          Your AI-powered lecture assistant is ready. Start a live session to capture slides, extract notes, and generate study materials automatically.
        </p>
        <button className="cta-button" onClick={() => setActiveTab('live')}>
          {/* Camera + sparkle icon matching screenshot */}
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 7h-2.5l-1.5-2h-8L6.5 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 11c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          Open Live Session
        </button>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <div className="stat-card glow-border">
          <div className="stat-icon-wrap">📁</div>
          <div className="stat-value">{slides.length}</div>
          <div className="stat-label">Slides Taken</div>
        </div>
        <div className="stat-card glow-border">
          <div className="stat-icon-wrap">📝</div>
          <div className="stat-value">{extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0}</div>
          <div className="stat-label">Notes Extracted</div>
        </div>
        <div className="stat-card glow-border">
          <div className="stat-icon-wrap">⏱️</div>
          <div className="stat-value">0h</div>
          <div className="stat-label">Study Time</div>
        </div>
      </div>
    </div>
  );

  const renderLiveSession = () => (
    <div className="live-session">
      <div className="live-left">
        {/* Camera */}
        <div className="camera-container">
          <div className="camera-grid"/>
          <div className="camera-scanline"/>
          <div className="live-badge"><span className="live-badge-dot"/> LIVE</div>
          <div className="corner-bracket tl"/><div className="corner-bracket tr"/>
          <div className="corner-bracket bl"/><div className="corner-bracket br"/>
          <div className="ripple-container">
            <div className="ripple-ring"/><div className="ripple-ring"/>
            <div className="ripple-ring"/><div className="ripple-ring"/>
            <div className="camera-icon-circle">{Ico.videocam}</div>
          </div>
          <video ref={videoRef} playsInline muted/>
          <div className="camera-controls">
            <button className="control-btn start" onClick={startCamera}>{Ico.play} Start</button>
            <button className="control-btn stop"  onClick={stopCamera}>{Ico.stop} Stop</button>
            <button className="control-btn"       onClick={captureImage}>{Ico.camera} Capture</button>
            <button className="control-btn"       onClick={togglePause}>{Ico.pause} {isRunning ? 'Pause' : 'Resume'}</button>
            <button className="control-btn"       onClick={nextSlide}>{Ico.skip} Next Slide</button>
          </div>
        </div>
        {/* AI Tools */}
        <div>
          <div className="ai-tools-section-title">⚡ AI Tools</div>
          <div className="ai-tools-grid">
            {AI_TOOLS.map((t, i) => (
              <div key={i} className="ai-tool-card" onClick={t.action}>
                <div className="ai-tool-icon">{t.icon}</div>
                <div className="ai-tool-label">{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Board Monitor Toggle + Panel */}
        <div className="bm-toggle-section">
          <button
            className={`bm-toggle-btn${showBoardMonitor ? ' active' : ''}`}
            onClick={() => setShowBoardMonitor(s => !s)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            {showBoardMonitor ? 'Hide Board Monitor' : 'Show Board Monitor'}
          </button>
        </div>
        {showBoardMonitor && (
          <BoardMonitorPanel onImportSlide={handleBoardMonitorImport} />
        )}
      </div>

      <div className="live-right">
        <div className="side-panel">
          <div className="side-panel-title">📊 Session Status</div>
          <div className="slide-counter">{slides.length}</div>
          <div className="auto-capture-status"><span className="pulsing-dot"/> Auto-capture active</div>
        </div>
        <div className="side-panel">
          <div className="side-panel-title">📋 Summary</div>
          {summaryText
            ? <div style={{fontSize:13,color:'#aaa',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{summaryText}</div>
            : <div className="empty-state">Generate a summary from captured slides…</div>}
        </div>
        <div className="side-panel">
          <div className="side-panel-title">🏷️ Topics</div>
          {topicData.length
            ? topicData.map((t,i)=><div key={i} style={{fontSize:13,color:'#aaa',padding:'4px 0',borderBottom:'1px solid #222'}}>{t.title}</div>)
            : <div className="empty-state">Topics will appear after extraction…</div>}
        </div>
        <div className="side-panel">
          <div className="side-panel-title">📅 Study Plan</div>
          <div className="study-plan-form">
            <input className="study-plan-input" type="text" placeholder="Enter subject…"
              value={studySubject} onChange={e=>setStudySubject(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&generateStudyPlan()}/>
            <button className="btn-generate" onClick={generateStudyPlan}>Generate</button>
          </div>
          {studyPlanText && <div style={{marginTop:10,fontSize:13,color:'#aaa',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{studyPlanText}</div>}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <Settings
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      accentColor={accentColor}
      accentIdx={accentIdx}
      accentInput={accentInput}
      accentPresets={ACCENT_COLORS}
      selectAccentPreset={selectAccentPreset}
      handleAccentInput={handleAccentInput}
      launchSmartBoard={() => setShowSmartBoard(true)}
    />
  );

  const placeholder = (icon, title, sub) => (
    <div className="tab-placeholder">
      <div className="tab-placeholder-icon">{icon}</div>
      <div className="tab-placeholder-title">{title}</div>
      <div className="tab-placeholder-subtitle">{sub}</div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':    return renderDashboard();
      case 'live':         return <LiveSession />;
      case 'notes':
        return (
          <Notes
            pdfFile={pdfFile}
            setPdfFile={setPdfFile}
            pdfUrl={pdfUrl}
            setPdfUrl={setPdfUrl}
            pdfText={pdfText}
            setPdfText={setPdfText}
            summary={pdfSummary}
            setSummary={setPdfSummary}
            extractingText={extractingText}
            setExtractingText={setExtractingText}
            extractError={extractError}
            setExtractError={setExtractError}
            uploadedPDFs={uploadedPDFs}
            setUploadedPDFs={setUploadedPDFs}
          />
        );
      case 'chat':
        return <AIChat />;
      case 'quiz':         return <QuizPanel />;
      case 'analytics':    return <Analytics />;
      case 'gamification': return <Gamification />;
      case 'collaborate':  return <Collaborate />;
      case 'settings':     return renderSettings();
      default:             return renderDashboard();
    }
  };

  /* ─────────────────────────────────
     JSX
     ───────────────────────────────── */
  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-grid">
            <div className="logo-grid-cell"/>
            <div className="logo-grid-cell"/>
            <div className="logo-grid-cell"/>
            <div className="logo-grid-cell"/>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">AI Lecture</span>
            <span className="sidebar-logo-subtitle">Assistant</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-title">{group.title}</div>
              {group.items.map(item => (
                <div
                  key={item.id}
                  className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-item-icon">{NavIco[item.iconKey]}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="topbar-title">{TAB_TITLES[activeTab]}</h1>
          <div className={`server-badge ${healthStatus}`}>
            <span className="server-dot"/>
            Server {healthStatus === 'online' ? 'Online' : healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
          </div>
        </div>
        <div className="topbar-right">
          <button
            className={`topbar-btn${showSmartBoard ? ' active' : ''}`}
            onClick={() => setShowSmartBoard(s => !s)}
          >Smart Board</button>
          <button
            className={`topbar-btn${i18n.language === 'en' ? ' active' : ''}`}
            onClick={() => i18n.changeLanguage('en')}
          >EN</button>
          <button
            className={`topbar-btn${i18n.language === 'es' ? ' active' : ''}`}
            onClick={() => i18n.changeLanguage('es')}
          >ES</button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="main-content">
        {renderContent()}
      </main>

      <canvas ref={canvasRef} style={{display:'none'}}/>
    </div>
  );
}

export default App;