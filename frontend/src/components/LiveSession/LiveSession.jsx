import React, { useEffect, useRef, useState } from 'react';
import * as lectureService from '../../services/lectureService';
import CapturePanel from './CapturePanel';
import SlideStrip from './SlideStrip';
import TranscriptPanel from './TranscriptPanel';
import SubtitlePanel from './SubtitlePanel';
import './LiveSession.css';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'zh', label: 'ZH' },
  { code: 'hi', label: 'HI' },
];

function LiveSession() {
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sensitivity, setSensitivity] = useState(18);
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [subtitleOutput, setSubtitleOutput] = useState([]);
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [metadata, setMetadata] = useState({ title: '', subject: '', date: '', instructor: '' });
  const [recentLectures, setRecentLectures] = useState([]);
  const [sessionMessage, setSessionMessage] = useState('Ready to capture slides and transcript.');
  const [draftLectureId, setDraftLectureId] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const transcriptTimer = useRef(null);

  useEffect(() => {
    loadRecentLectures();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      clearInterval(transcriptTimer.current);
    };
  }, []);

  const loadRecentLectures = async () => {
    try {
      const data = await lectureService.fetchRecentLectures(5);
      setRecentLectures(data.lectures || []);
    } catch (error) {
      console.error('Unable to load recent lectures', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsRecording(true);
      setIsPaused(false);
      setSessionMessage('Camera active. Smart slide capture ready.');
      createDraftLecture();
    } catch (error) {
      console.error('Camera start failed', error);
      setSessionMessage('Unable to access webcam. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    setSessionMessage('Camera stopped. Save or discard your live session.');
  };

  const togglePause = () => {
    setIsPaused((state) => !state);
  };

  const captureCurrentSlide = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(1024, video.videoWidth || 1024);
    canvas.height = Math.min(720, video.videoHeight || 720);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/png');
    const nextSlide = {
      id: `${Date.now()}`,
      image,
      label: `Slide ${slides.length + 1}`,
      notes: '',
      createdAt: new Date().toISOString(),
    };
    const updated = [...slides, nextSlide];
    setSlides(updated);
    setSelectedSlide(nextSlide.id);
    setSessionMessage('Slide captured. You can annotate or delete from the strip.');
    saveDraftSlide(nextSlide);
  };

  const saveDraftSlide = async (slide) => {
    if (!draftLectureId) return;
    try {
      await lectureService.saveSlideCapture(draftLectureId, { image: slide.image, label: slide.label });
    } catch (err) {
      console.error('Slide save failed', err);
    }
  };

  const createDraftLecture = async () => {
    if (draftLectureId) return;
    try {
      const payload = {
        title: 'Live session draft',
        subject: metadata.subject || 'Lecture capture',
        instructor: metadata.instructor || 'Unknown',
        date: metadata.date || new Date().toISOString().slice(0, 10),
        draft: true,
      };
      const created = await lectureService.createLectureSession(payload);
      if (created?.lecture?.id) {
        setDraftLectureId(created.lecture.id);
        localStorage.setItem('currentLectureId', created.lecture.id);
      }
    } catch (err) {
      console.error('Draft lecture creation failed', err);
    }
  };

  const deleteSlide = async (slideId) => {
    const updated = slides.filter((slide) => slide.id !== slideId);
    setSlides(updated);
    if (selectedSlide === slideId) {
      setSelectedSlide(updated[updated.length - 1]?.id || null);
    }
    if (draftLectureId) {
      try {
        await lectureService.deleteSlide(draftLectureId, slideId);
      } catch (error) {
        console.error('Delete slide failed', error);
      }
    }
  };

  const handleSelectLecture = (lecture) => {
    setMetadata((prev) => ({
      ...prev,
      title: lecture.title,
      subject: lecture.subject,
      instructor: lecture.instructor,
      date: lecture.date,
    }));
    setDraftLectureId(lecture.id);
    localStorage.setItem('currentLectureId', lecture.id);
    setSessionMessage('Recent lecture loaded for review.');
  };

  const handleMetadataChange = (key, value) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadAudio = async (file) => {
    if (!file || !draftLectureId) return;
    setAudioFile(file);
    setSessionMessage('Uploading audio to Whisper transcription...');
    try {
      const result = await lectureService.transcribeAudio(draftLectureId, file);
      setLiveTranscript(result.transcript || []);
      setSessionMessage('Transcription complete. Review the live transcript below.');
    } catch (error) {
      console.error('Audio transcription failed', error);
      setSessionMessage('Audio transcription failed. Try again with a clear recording.');
    }
  };

  const loadSubtitleLanguage = async (language) => {
    if (!draftLectureId) return;
    setSubtitleLoading(true);
    setSubtitleLanguage(language);
    try {
      const result = await lectureService.fetchSubtitles(draftLectureId, language);
      setSubtitleOutput(result.subtitles || []);
    } catch (error) {
      console.error('Subtitle load failed', error);
      setSessionMessage('Unable to load subtitles for that language.');
    } finally {
      setSubtitleLoading(false);
    }
  };

  const exportSubtitle = async (format) => {
    if (!draftLectureId) return;
    try {
      const result = await lectureService.exportSubtitles(draftLectureId, format);
      if (result?.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('Subtitle export failed', err);
      setSessionMessage('Could not export subtitles.');
    }
  };

  const saveSession = async () => {
    if (!draftLectureId) return;
    try {
      await lectureService.saveLectureSession(draftLectureId, { metadata, slides, transcript: liveTranscript });
      setSessionMessage('Lecture saved successfully.');
      loadRecentLectures();
    } catch (error) {
      console.error('Save session failed', error);
      setSessionMessage('Unable to save session.');
    }
  };

  const discardSession = async () => {
    if (!draftLectureId) return;
    try {
      await lectureService.discardLectureSession(draftLectureId);
      setDraftLectureId(null);
      setSlides([]);
      setLiveTranscript([]);
      setSessionMessage('Session discarded. Start a new live session when ready.');
    } catch (error) {
      console.error('Discard failed', error);
      setSessionMessage('Unable to discard the current session.');
    }
  };

  return (
    <div className="live-session-root">
      <div className="live-session-column">
        <CapturePanel
          videoRef={videoRef}
          isRecording={isRecording}
          isPaused={isPaused}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onCaptureSlide={captureCurrentSlide}
          onTogglePause={togglePause}
          sensitivity={sensitivity}
          onSensitivityChange={setSensitivity}
          sessionMessage={sessionMessage}
        />

        <SlideStrip
          slides={slides}
          selectedSlide={selectedSlide}
          onSelectSlide={setSelectedSlide}
          onDeleteSlide={deleteSlide}
        />

        <TranscriptPanel
          liveTranscript={liveTranscript}
          onUploadAudio={handleUploadAudio}
          transcriptLoading={false}
        />
      </div>

      <div className="live-session-column">
        <SubtitlePanel
          subtitleLanguage={subtitleLanguage}
          languages={LANGUAGE_OPTIONS}
          subtitleOutput={subtitleOutput}
          onLanguageChange={loadSubtitleLanguage}
          onExport={exportSubtitle}
          loading={subtitleLoading}
        />

        <section className="live-session-panel metadata-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Lecture Metadata</div>
              <div className="panel-subtitle">Save lecture title, subject, date and instructor details.</div>
            </div>
          </div>

          <div className="metadata-row">
            <input
              className="metadata-input"
              value={metadata.title}
              onChange={(e) => handleMetadataChange('title', e.target.value)}
              placeholder="Lecture title"
            />
            <input
              className="metadata-input"
              value={metadata.subject}
              onChange={(e) => handleMetadataChange('subject', e.target.value)}
              placeholder="Subject"
            />
          </div>
          <div className="metadata-row">
            <input
              className="metadata-input"
              type="date"
              value={metadata.date}
              onChange={(e) => handleMetadataChange('date', e.target.value)}
            />
            <input
              className="metadata-input"
              value={metadata.instructor}
              onChange={(e) => handleMetadataChange('instructor', e.target.value)}
              placeholder="Instructor"
            />
          </div>

          <div className="metadata-footer">
            <button className="control-button" onClick={saveSession} disabled={!draftLectureId}>Save Session</button>
            <button className="control-button danger" onClick={discardSession} disabled={!draftLectureId}>Discard Session</button>
            <span className="action-note">Recent lectures are clickable for quick review.</span>
          </div>

          <div className="panel-subtitle">Recent Lectures</div>
          <div className="slide-strip">
            {recentLectures.length === 0 && <p className="panel-subtitle">No recent lectures available yet.</p>}
            {recentLectures.map((lecture) => (
              <div key={lecture.id} className="slide-card" onClick={() => handleSelectLecture(lecture)}>
                <div className="slide-card-body">
                  <div className="slide-label">{lecture.title}</div>
                  <div className="panel-subtitle">{lecture.subject}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default LiveSession;
