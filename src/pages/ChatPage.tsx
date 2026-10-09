import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, AlertTriangle, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { Finding, PosterAnalysis, AnalysisResult } from '../types';
import { generateChatbotResponse, ChatMessage } from '../services/chatbot';

interface ChatPageProps {
  initialFinding?: Finding | null;
  initialPoster?: PosterAnalysis | null;
  initialAnalysis?: AnalysisResult | null;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  initialFinding,
  initialPoster,
  initialAnalysis,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation with context greeting
  useEffect(() => {
    let contextTitle = 'General Assistant';
    let welcomeText = `Hello! I'm ASK DECODEIQ. I decode confusing messages, explain urgent deadlines, and clarify task responsibilities. What would you like to know?`;

    if (initialFinding) {
      contextTitle = `Finding: ${initialFinding.title}`;
      welcomeText = `I see you have questions about "${initialFinding.title}". I have the original supporting evidence: "${initialFinding.sourceMessage}". Ask me anything about this highlight!`;
    } else if (initialPoster) {
      contextTitle = `Poster: ${initialPoster.title}`;
      welcomeText = `I'm ready to answer questions about your poster "${initialPoster.title}". What details would you like me to explain?`;
    } else if (initialAnalysis) {
      contextTitle = `Thread: ${initialAnalysis.title}`;
      welcomeText = `I have loaded context for "${initialAnalysis.title}". I can summarize the conversation, trace decision changes, or list team obligations.`;
    }

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'missed',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextTitle,
      }
    ]);
  }, [initialFinding, initialPoster, initialAnalysis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Generate response using chatbot service
    setTimeout(() => {
      const response = generateChatbotResponse(query, {
        finding: initialFinding || undefined,
        poster: initialPoster || undefined,
        analysis: initialAnalysis || undefined,
      });

      const missedMsg: ChatMessage = {
        id: `missed-${Date.now()}`,
        sender: 'missed',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAssumption: response.isAssumption,
      };

      setMessages(prev => [...prev, missedMsg]);
    }, 400);
  };

  const quickPrompts = [
    "What does this message mean?",
    "Why is this deadline marked critical?",
    "What do I need to do next?",
    "Explain the decision change simply.",
    "Who is responsible for this task?",
    "Summarize this conversation in three points."
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Interactive Contextual Assistant</span>
          </div>
          <h1 className="text-2xl font-black text-theme-fg tracking-tight">
            ASK <span className="gradient-text">DECODEIQ</span>
          </h1>
          <p className="text-xs text-theme-secondary">"Confused about a message? Let's figure it out."</p>
        </div>

        {(initialFinding || initialPoster || initialAnalysis) && (
          <div className="px-3 py-1.5 rounded-xl glass-panel text-xs font-mono text-cyan-300 border-cyan-500/30">
            CONTEXT: {initialFinding?.title || initialPoster?.title || initialAnalysis?.title}
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'missed' && (
              <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center shadow-neon shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed space-y-1.5 ${
              msg.sender === 'user'
                ? 'gradient-accent text-white font-medium rounded-tr-none shadow-lg'
                : 'glass-panel text-theme-fg border-theme rounded-tl-none'
            }`}>
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                <span className="font-bold">{msg.sender === 'user' ? 'You' : 'DECODEIQ AI'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.isAssumption && (
                <div className="text-[10px] text-amber-300 font-mono pt-1 italic">
                  Note: Contains inferred reasoning based on available thread evidence.
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-theme-bg border border-theme flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto py-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl glass-panel hover:bg-theme-card-hover text-theme-secondary hover:text-theme-fg text-xs font-medium whitespace-nowrap border-theme shrink-0 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your conversation or poster..."
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-theme-bg border border-theme text-theme-fg text-xs focus:outline-none focus:border-cyan-400 transition"
        />
        <button
          type="submit"
          className="absolute right-2 p-2 rounded-xl gradient-accent text-white hover:opacity-90 transition shadow-neon"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

