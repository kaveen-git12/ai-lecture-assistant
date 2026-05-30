import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "title": "AI Lecture Assistant",
      "live_collaboration": "Live Collaboration",
      "analytics_dashboard": "Analytics Dashboard",
      "gamification_hub": "Gamification Hub",
      "create_session": "Create New Session",
      "join_session": "Join Session",
      "total_study_time": "Total Study Time",
      "average_accuracy": "Average Accuracy",
      "leaderboard": "Leaderboard",
      "achievement": "Achievement",
      "points": "Points",
      "level": "Level",
      "streak": "Streak",
      "loading": "Loading...",
      "error": "Error",
      "offline_message": "You are currently offline. Cached data is displayed."
    }
  },
  es: {
    translation: {
      "title": "Asistente de Conferencias AI",
      "live_collaboration": "Colaboración en Vivo",
      "analytics_dashboard": "Panel de Analíticas",
      "gamification_hub": "Centro de Gamificación",
      "create_session": "Crear Nueva Sesión",
      "join_session": "Unirse a Sesión",
      "total_study_time": "Tiempo Total de Estudio",
      "average_accuracy": "Precisión Promedio",
      "leaderboard": "Tabla de Clasificación",
      "achievement": "Logro",
      "points": "Puntos",
      "level": "Nivel",
      "streak": "Racha",
      "loading": "Cargando...",
      "error": "Error",
      "offline_message": "Estás offline. Se muestra información almacenada en caché."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;
