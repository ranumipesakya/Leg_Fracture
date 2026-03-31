import React, { useState, useEffect, useCallback } from 'react';
import { Volume2 } from 'lucide-react';

export type ResultType = "not_xray" | "not_leg" | "fractured" | "not_fractured" | "unknown";

interface VoiceFeedbackProps {
  resultType: ResultType;
  autoPlay?: boolean;
}

type LanguageCode = 'en-US';

interface MessageMap {
  [key: string]: {
    [lang in LanguageCode]: string;
  };
}

const MESSAGES: MessageMap = {
  not_xray: {
    'en-US': "The uploaded image is not recognized as a standard X-ray. Please provide a clear radiological scan."
  },
  not_leg: {
    'en-US': "Anatomical mismatch detected. This is not a leg X-ray. Please upload a leg X-ray for analysis."
  },
  fractured: {
    'en-US': "Fracture detected in the leg."
  },
  not_fractured: {
    'en-US': "No fracture detected in the leg."
  },
  unknown: {
    'en-US': "Unable to process the image."
  }
};

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({ resultType, autoPlay = true }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakMessage = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }, 200);
  }, []);

  const currentMessage = MESSAGES[resultType]['en-US'] || MESSAGES.unknown['en-US'];

  // Auto-play when result type changes
  useEffect(() => {
    if (autoPlay && resultType) {
      const timer = setTimeout(() => {
        speakMessage(currentMessage);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [resultType, autoPlay, currentMessage, speakMessage]);

  const handleReplay = () => {
    speakMessage(currentMessage);
  };

  const getStatusStyles = () => {
    switch (resultType) {
      case 'fractured':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300';
      case 'not_fractured':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300';
      case 'not_xray':
      case 'not_leg':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300';
      default:
        return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300';
    }
  };

  return (
    <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${getStatusStyles()} shadow-sm`}>
      <div className="flex items-start gap-4">
        <div 
          className={`p-3 rounded-2xl ${
            isSpeaking ? 'bg-blue-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-blue-600 border border-slate-100 dark:border-slate-700'
          }`}
        >
          <Volume2 size={24} />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-1">
              AI Diagnostic Feedback
            </span>
            <p className="text-xl font-bold leading-relaxed tracking-tight">
              {currentMessage}
            </p>
          </div>

          <button
            onClick={handleReplay}
            disabled={isSpeaking}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10"
          >
            {isSpeaking ? 'Speaking...' : 'Replay Audio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceFeedback;
