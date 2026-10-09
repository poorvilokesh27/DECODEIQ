import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquarePlus, 
  Sparkles, 
  Upload, 
  Trash2, 
  User, 
  FileText, 
  ShieldCheck, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzeConversation } from '../services/analyzer';
import { SAMPLE_CONVERSATION_1 } from '../services/storage';

interface AnalyzePageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  userName: string;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({
  onAnalysisComplete,
  userName,
}) => {
  const [title, setTitle] = useState('Hackathon Team Sync');
  const [userDisplayName, setUserDisplayName] = useState(userName || 'You');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setErrorMsg('Please paste conversation text or load a sample thread.');
      return;
    }
    setErrorMsg('');
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = analyzeConversation(inputText, title || 'Untitled Conversation', userDisplayName || 'You');
      setIsAnalyzing(false);
      onAnalysisComplete(result);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      setErrorMsg('Only plain text (.txt) and (.csv) files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      if (!title || title === 'Hackathon Team Sync') {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setErrorMsg('');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_CONVERSATION_1);
    setTitle('Hackathon Project & Submission Update');
    setErrorMsg('');
  };

  const handleClear = () => {
    setInputText('');
    setTitle('');
    setErrorMsg('');
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <MessageSquarePlus className="w-4 h-4" />
          <span>Conversation Input & Analysis</span>
        </div>
        <h1 className="text-3xl font-black text-theme-fg tracking-tight">
          Decode Your <span className="gradient-text">Conversations</span>
        </h1>
        <p className="text-sm text-theme-secondary">
          Paste chat logs, Slack threads, WhatsApp messages, or email strings. Local privacy rules process the text entirely on your device.
        </p>
      </div>

      {/* Input Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 gradient-border"
      >
        {/* Form Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-fg uppercase tracking-wider">
              Conversation Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Release Standup"
              className="w-full px-4 py-2.5 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-fg uppercase tracking-wider flex items-center justify-between">
              <span>Your Display Name</span>
              <span className="text-[10px] text-theme-muted font-normal">Used to identify your obligations</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={userDisplayName}
                onChange={(e) => setUserDisplayName(e.target.value)}
                placeholder="e.g. Alex or You"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400 transition"
              />
              <User className="w-4 h-4 text-theme-muted absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Textarea Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-theme-fg uppercase tracking-wider">
              Pasted Conversation Messages
            </label>
            <div className="flex items-center gap-3 text-xs">
              <label className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload TXT/CSV</span>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleLoadSample}
                className="text-brand-300 hover:text-white font-semibold flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste conversation lines here...&#10;Example:&#10;[10:15 AM] Sarah: Deadline is moved to tomorrow at 2 PM&#10;[10:17 AM] Alex: @You please review the demo before noon"
              className="w-full p-4 rounded-2xl bg-theme-bg border border-theme text-theme-fg text-sm font-mono focus:outline-none focus:border-cyan-400 transition resize-y leading-relaxed"
            />
            {inputText.length > 0 && (
              <button
                onClick={handleClear}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-theme-card hover:bg-theme-card-hover text-theme-muted hover:text-coral-400 transition"
                title="Clear text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-coral-500/10 border border-coral-500/30 text-coral-300 text-xs font-medium flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-theme-muted font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Local privacy parsing engine: zero external server requests</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl glass-panel hover:bg-theme-card-hover text-theme-secondary text-xs font-semibold w-full sm:w-auto transition"
            >
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gradient-accent hover:opacity-95 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-neon w-full sm:w-auto transition transform active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Decoding Messages...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Analyze Conversation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

