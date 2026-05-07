import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
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

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const nextIdRef = useRef(2);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to BoneScan AI Assistant. I am here to help you understand your reports and recovery journey. How can I assist you today?'
    }
  ]);

  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        label: 'Explain fracture',
        icon: <Activity size={14} />,
        prompt: 'Can you explain what a bone fracture is and the different types?'
      },
      {
        label: 'Recovery Tips',
        icon: <HeartPulse size={14} />,
        prompt: 'What are some general tips for a faster bone recovery?'
      },
      {
        label: 'How it works',
        icon: <ShieldCheck size={14} />,
        prompt: 'How does BoneScan AI detect fractures in X-rays?'
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
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!voiceGuideEnabled && supportsVoiceOutput) {
      window.speechSynthesis.cancel();
    }
  }, [voiceGuideEnabled, supportsVoiceOutput]);

  useEffect(() => {
    return () => {
      if (supportsVoiceOutput) window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, [supportsVoiceOutput]);

  const sendMessage = async (customText?: string) => {
    const finalText = (customText ?? input).trim();
    if (!finalText || isTyping) return;

    const wantsUploadPage =
      /(upload|submit).*(x-?ray|scan)|(x-?ray|scan).*(upload|submit)/i.test(finalText) ||
      /(go to|move to|take me to|open).*(upload|x-?ray)/i.test(finalText);
    const wantsDashboardPage =
      /(go to|move to|take me to|open).*(dashboard|home)|\bdashboard\b|\bhome\b/i.test(finalText);
    const wantsPhysioPage =
      /(go to|move to|take me to|open).*(physio|physiotherapy|physiotheraphy|pysiotheraphy|physiootheraphy|therapy)/i.test(finalText) ||
      /\bphysio\b|\bphysiotherapy\b|\bphysiotheraphy\b|\bpysiotheraphy\b|\bphysiootheraphy\b/i.test(finalText);

    let targetRoute: string | null = null;
    if (wantsUploadPage) targetRoute = '/upload';
    else if (wantsPhysioPage) targetRoute = '/physio';
    else if (wantsDashboardPage) targetRoute = '/dashboard';

    if (targetRoute && window.location.hash !== `#${targetRoute}`) {
      window.location.hash = targetRoute;
    }

    const userMessage: Message = {
      id: nextIdRef.current++,
      sender: 'user',
      text: finalText
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Backend chat history must start with a "user" message.
      const history = messages
        .filter((m) => m.id !== 1)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const response = await axios.post('http://localhost:5000/api/chat', {
        message: finalText,
        history: history
      });

      const replyText = response.data.text;
      
      const botMessage: Message = {
        id: nextIdRef.current++,
        sender: 'bot',
        text: replyText
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(replyText);
    } catch (error) {
      console.error('Chat error:', error);
      const backendError =
        axios.isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : null;
      const errorMessage: Message = {
        id: nextIdRef.current++,
        sender: 'bot',
        text: backendError
          ? `I hit a server issue: ${backendError}.`
          : "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
        if (transcript) {
          setInput(transcript);
          sendMessage(transcript);
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
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
        className="fixed bottom-6 right-6 w-12 h-12 z-50 flex items-center justify-center rounded-full border border-blue-400/30 bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_10px_40px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-[5.5rem] right-6 left-6 sm:left-auto z-50 w-auto sm:w-[380px] h-[min(650px,calc(100vh-8rem))] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-2xl flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-blue-900/40 to-slate-900 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-400/20 text-blue-400 shadow-inner">
                  <Bot size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight">BoneScan AI</h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-[11px] text-slate-400 font-medium">Assistant is Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setVoiceGuideEnabled(p => !p)}
                className={`p-2 rounded-xl transition-all ${voiceGuideEnabled ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}
                title={voiceGuideEnabled ? "Disable Voice" : "Enable Voice"}
              >
                {voiceGuideEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-3 border-b border-white/5 bg-slate-900/30">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isTyping}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/50 px-3 py-1.5 text-[11px] font-bold text-slate-300 transition-all hover:border-blue-400/30 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <span className="text-blue-400">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-scroll flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.05),_transparent_40%)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-white/5'
                  }`}>
                    {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-3 max-w-[85%] items-center">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                    <Bot size={14} className="text-blue-400" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-950/80 border-t border-white/10 backdrop-blur-md">
            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 group focus-within:border-blue-500/50 transition-all p-1.5 shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                disabled={isTyping}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1.5 px-1">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={!supportsVoiceInput || isTyping}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={isTyping || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 active:scale-90 disabled:opacity-30 disabled:hover:bg-blue-600"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Protected by BoneScan Security
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                AI Guidance Only
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
