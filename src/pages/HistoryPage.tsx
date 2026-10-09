import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Trash2, ArrowRight, Calendar, MessageSquare, AlertTriangle, CheckSquare, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';

interface HistoryPageProps {
  analyses: AnalysisResult[];
  onSelectAnalysis: (analysis: AnalysisResult) => void;
  onDeleteAnalysis: (id: string) => void;
  onClearAll: () => void;
  isCloudConnected: boolean;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  analyses,
  onSelectAnalysis,
  onDeleteAnalysis,
  onClearAll,
  isCloudConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnalyses = analyses.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Decoded Conversation Archives</span>
          </div>
          <h1 className="text-3xl font-black text-theme-fg tracking-tight">
            Message <span className="gradient-text">History</span>
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Access past analyses, findings, and commitments saved locally or synced to your account.
          </p>
        </div>

        {analyses.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-coral-400 hover:text-coral-300 font-semibold flex items-center gap-1.5 p-2 rounded-xl glass-panel hover:bg-coral-500/10 border-coral-500/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by thread title, keywords, or summary..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400 transition"
        />
        <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-3.5" />
      </div>

      {/* History Items Grid */}
      <div className="space-y-4">
        {filteredAnalyses.length === 0 ? (
          <div className="p-12 text-center text-xs text-theme-muted glass-panel rounded-3xl space-y-2">
            <p className="text-sm font-bold text-theme-fg">No Decoded Analyses Found</p>
            <p>Try searching for a different keyword or decode a new conversation.</p>
          </div>
        ) : (
          filteredAnalyses.map((analysis) => {
            const pendingTasks = analysis.tasks.filter(t => !t.completed).length;
            return (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel-hover border-theme"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3 text-xs text-theme-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{analysis.date}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[10px]">
                      {analysis.totalMessages} MSGS
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px]">
                      {analysis.processingMode} MODE
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-theme-fg">{analysis.title}</h3>
                  <p className="text-xs text-theme-secondary leading-relaxed line-clamp-2">
                    {analysis.summary}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                    <span className="text-coral-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{analysis.findings.length} findings</span>
                    </span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{pendingTasks} pending tasks</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-theme">
                  <button
                    onClick={() => onDeleteAnalysis(analysis.id)}
                    className="p-2.5 rounded-xl hover:bg-coral-500/20 text-theme-muted hover:text-coral-400 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectAnalysis(analysis)}
                    className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-neon transition transform active:scale-95"
                  >
                    <span>Open Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

