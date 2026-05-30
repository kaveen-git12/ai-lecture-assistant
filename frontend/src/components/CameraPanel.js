import React from 'react';

function CameraPanel({ videoRef, onStartCamera, onStopCamera, onCaptureImage, onToggleAuto, slideCount, isRunning, cameraError, onRetryCamera }) {
  return (
    <div className="left-panel">
      <div className="camera-frame">
        <video ref={videoRef} autoPlay muted playsInline></video>
        <div className="controls">
          <button onClick={onStartCamera}>Start</button>
          <button onClick={onStopCamera}>Stop</button>
          <button onClick={onCaptureImage}>Capture</button>
          <button onClick={onToggleAuto}>{isRunning ? 'Pause' : 'Resume'}</button>
        </div>
      </div>

      {cameraError && (
        <div className="camera-error">
          <p>{cameraError}</p>
          <button onClick={onRetryCamera}>Retry Camera</button>
        </div>
      )}

      <p>Slides: <span>{slideCount}</span></p>
    </div>
  );
}

export default CameraPanel;