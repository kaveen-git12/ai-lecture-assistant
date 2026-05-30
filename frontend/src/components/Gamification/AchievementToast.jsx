import React, { useEffect } from 'react';

function AchievementToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-overlay">
      <div className="toast-card">
        <div className="toast-icon">{toast.icon}</div>
        <div>
          <div className="toast-title">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      </div>
    </div>
  );
}

export default AchievementToast;
