import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  FileText,
  Activity,
  ShieldCheck,
  HeartPulse,
  Volume2,
  VolumeX,
  Mic,
  MicOff
} from 'lucide-react';

type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
};

type QuickAction = {
  label: string;
  icon: React.ReactNode;
  prompt: string;
};

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
  }
}

const getBotReply = (input: string) => {
  const text = input.toLowerCase().trim();

  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return 'Hello. I am BoneScan Assistant. I can help explain scan results, X-ray validation, report download, and physiotherapy guidance.';
  }

  if (text.includes('fracture detected') || text === 'fracture' || text.includes('fractured')) {
    return 'Fracture detected means the AI found features that may indicate a bone fracture in the uploaded X-ray. This is an AI-assisted screening result, so a doctor should confirm it.';
  }

  if (
    text.includes('no fracture') ||
    text.includes('not fractured') ||
    text.includes('negative result')
  ) {
    return 'No fracture detected means the AI did not find strong fracture signs in the uploaded scan. A clinical review is still recommended because AI screening is not a final diagnosis.';
  }

  if (text.includes('x-ray') || text.includes('valid image') || text.includes('invalid input')) {
    return 'Before fracture analysis, the system checks whether the uploaded file looks like a real X-ray. If it is not recognized as an X-ray, the system asks the user to upload a clearer radiology image.';
  }

  if (text.includes('report') || text.includes('pdf') || text.includes('download')) {
    return 'After analysis, you can export a PDF report containing the report ID, scan summary, confidence values, recommendation, and uploaded scan preview.';
  }

  if (
    text.includes('physio') ||
    text.includes('exercise') ||
    text.includes('recovery') ||
    text.includes('rehabilitation')
  ) {
    return 'The physiotherapy section helps the user understand recovery guidance after the AI result. It can be used to show post-injury care suggestions and basic rehabilitation information.';
  }

  if (
    text.includes('what should i do next') ||
    text.includes('next step') ||
    text.includes('what next')
  ) {
    return 'Next, review the AI result, download the report if needed, and consult a medical professional for confirmation. If recovery guidance is needed, open the Physiotherapy section.';
  }

  if (text.includes('purpose of chatbot') || text.includes('why chatbot')) {
    return 'The chatbot improves usability by explaining scan results in simple language, guiding the user to reports and physiotherapy content, and helping non-technical users navigate the system.';
  }

  return 'I can help explain fracture results, X-ray validation, PDF reports, physiotherapy guidance, and next steps after analysis.';
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const nextIdRef = useRef(2);
  const replyTimeoutRef = useRef<number | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to BoneScan Assistant. Ask me about scan results, reports, or physiotherapy guidance.'
    }
  ]);

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        label: 'Explain fracture result',
        icon: <Activity size={14} />,
        prompt: 'What does fracture detected mean?'
      },
      {
        label: 'Download report help',
        icon: <FileText size={14} />,
        prompt: 'How do I download the report?'
      },
      {
        label: 'Physiotherapy guidance',
        icon: <HeartPulse size={14} />,
        prompt: 'What is the purpose of physiotherapy guidance?'
      },
      {
        label: 'X-ray validation',
        icon: <ShieldCheck size={14} />,
        prompt: 'How does X-ray validation work?'
      }
    ],
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const supportsVoiceOutput = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const supportsVoiceInput =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const speakText = (text: string) => {
    if (!voiceGuideEnabled || !supportsVoiceOutput) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (voiceGuideEnabled || !supportsVoiceOutput) return;
    window.speechSynthesis.cancel();
  }, [voiceGuideEnabled, supportsVoiceOutput]);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) window.clearTimeout(replyTimeoutRef.current);
      if (supportsVoiceOutput) window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, [supportsVoiceOutput]);

  const sendMessage = (customText?: string) => {
    const finalText = (customText ?? input).trim();
    if (!finalText || isTyping) return;

    const userMessage: Message = {
      id: nextIdRef.current++,
      sender: 'user',
      text: finalText
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    replyTimeoutRef.current = window.setTimeout(() => {
      const replyText = getBotReply(finalText);
      const botMessage: Message = {
        id: nextIdRef.current++,
        sender: 'bot',
        text: replyText
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      speakText(replyText);
    }, 450);
  };

  const toggleVoiceInput = () => {
    if (!supportsVoiceInput || isTyping) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) return;

    if (!recognitionRef.current) {
      const recognition = new RecognitionCtor();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.trim() || '';
        if (!transcript) return;
        setInput(transcript);
        sendMessage(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 w-12 h-12 z-50 flex items-center justify-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition-transform duration-200 hover:scale-105"
        aria-label="Open BoneScan Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-[4.75rem] right-5 left-5 sm:left-auto z-50 w-auto sm:w-[360px] h-[min(620px,calc(100vh-7rem))] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl flex flex-col">
          <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/20 text-cyan-300 ring-1 ring-blue-400/20">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide">BoneScan Assistant</h3>
                  <p className="text-xs text-slate-400">
                    AI help for reports, results, and recovery guidance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceGuideEnabled((prev) => !prev)}
                  disabled={!supportsVoiceOutput}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={voiceGuideEnabled ? 'Disable voice guide' : 'Enable voice guide'}
                  title={voiceGuideEnabled ? 'Disable voice guide' : 'Enable voice guide'}
                >
                  {voiceGuideEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isTyping}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-blue-400/20 bg-slate-900/80 px-2 py-2 text-[11px] font-semibold text-slate-200 transition hover:border-blue-400/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-cyan-300">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.10),_transparent_35%)] px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : 'rounded-bl-md border border-white/10 bg-slate-900 text-slate-100'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  Assistant is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 bg-slate-950 px-4 py-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-2 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about result, report, or physiotherapy..."
                disabled={isTyping}
                className="flex-1 bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!supportsVoiceInput || isTyping}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                title={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={isTyping}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-slate-500">
              AI assistant for user guidance only. Not a final medical diagnosis. Voice guide works in supported browsers.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
