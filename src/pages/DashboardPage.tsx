import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckSquare, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight, 
  MessageSquarePlus, 
  FileText, 
  Sparkles,
  Zap,
  Trash2
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface DashboardPageProps {
  analyses: AnalysisResult[];
  onNavigate: (tab: string) => void;
  onSelectAnalysis: (analysis: AnalysisResult) => void;
  onLoadSample: () => void;
  onClearAnalyses: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  analyses,
  onNavigate,
  onSelectAnalysis,
  onLoadSample,
  onClearAnalyses,
}) => {
  // Compute real counts from saved analyses
  const criticalCount = analyses.reduce(
    (acc, a) => acc + a.findings.filter(f => f.category === 'CRITICAL').length,
    0
  );
  const pendingActionsCount = analyses.reduce(
    (acc, a) => acc + a.tasks.filter(t => !t.completed).length,
    0
  );
  const deadlineChangesCount = analyses.reduce(
    (acc, a) => acc + a.decisionChanges.length,
    0
  );
  const unansweredCount = analyses.reduce(
    (acc, a) => acc + a.findings.filter(f => f.category === 'UNANSWERED_QUESTION').length,
    0
  );

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden gradient-border"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Zap className="w-4 h-4" />
              <span>Conversation Intelligence Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-theme-fg">
              Welcome back. <span className="gradient-text">Let's catch you up.</span>
            </h1>
            <p className="text-theme-secondary text-sm max-w-2xl leading-relaxed">
              Don't spend hours reading long chat threads. DECODEIQ automatically decodes decisions, deadlines, personal commitments, and subtle schedule changes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('analyze')}
              className="gradient-accent hover:opacity-95 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-neon transition transform active:scale-95"
            >
              <MessageSquarePlus className="w-5 h-5" />
              <span>Analyze a Conversation</span>
            </button>
            <button
              onClick={onLoadSample}
              className="glass-panel hover:bg-theme-card-hover text-theme-fg px-4 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 border-cyan-500/30 text-cyan-300 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Sample Thread</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Critical Updates */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => onNavigate('highlights')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-coral-400 uppercase tracking-wider">Critical Updates</span>
            <div className="p-2 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-theme-fg">{criticalCount}</span>
            <span className="text-xs text-theme-secondary">time-sensitive items</span>
          </div>
          <p className="text-xs text-theme-muted">Urgent deadlines and high-priority alerts</p>
        </motion.div>

        {/* Card 2: Pending Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => onNavigate('tasks')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Pending Actions</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-theme-fg">{pendingActionsCount}</span>
            <span className="text-xs text-theme-secondary">action items</span>
          </div>
          <p className="text-xs text-theme-muted">Tasks and commitments assigned to you</p>
        </motion.div>

        {/* Card 3: Deadline Changes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => onNavigate('highlights')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Decision Changes</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-theme-fg">{deadlineChangesCount}</span>
            <span className="text-xs text-theme-secondary">updates detected</span>
          </div>
          <p className="text-xs text-theme-muted">Schedule, venue, or scope revisions</p>
        </motion.div>

        {/* Card 4: Unanswered Questions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('highlights')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Open Questions</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-theme-fg">{unansweredCount}</span>
            <span className="text-xs text-theme-secondary">questions</span>
          </div>
          <p className="text-xs text-theme-muted">Inquiries requiring a response</p>
        </motion.div>
      </div>

      {/* Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-theme-fg">Recent Decoded Conversations</h2>
            <p className="text-xs text-theme-secondary">Select any saved analysis to review details or ask MISSED questions</p>
          </div>
          {analyses.length > 0 && (
            <button
              onClick={onClearAnalyses}
              className="text-xs text-coral-400 hover:text-coral-300 flex items-center gap-1 font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {analyses.length === 0 ? (
          /* Empty State */
          <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border-dashed border-theme">
            <div className="w-16 h-16 rounded-2xl gradient-accent mx-auto flex items-center justify-center shadow-neon">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-theme-fg">No Decoded Conversations Yet</h3>
              <p className="text-xs text-theme-secondary">
                Paste your Slack messages, WhatsApp exports, or email threads to extract critical highlights and action items in seconds.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={onLoadSample}
                className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Conversation</span>
              </button>
              <button
                onClick={() => onNavigate('analyze')}
                className="glass-panel hover:bg-theme-card-hover text-theme-fg px-4 py-2.5 rounded-xl font-semibold text-xs"
              >
                Paste Custom Text
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {analyses.map((analysis) => {
              const pending = analysis.tasks.filter(t => !t.completed).length;
              return (
                <motion.div
                  key={analysis.id}
                  whileHover={{ y: -4 }}
                  className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 glass-panel-hover border-theme"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-theme-muted font-medium">
                      <span>{analysis.date}</span>
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 font-mono text-[10px] border border-brand-500/20">
                        {analysis.totalMessages} MSGS
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-theme-fg line-clamp-1">
                      {analysis.title}
                    </h3>
                    <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-theme flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="text-coral-400">{analysis.findings.length} findings</span>
                      <span className="text-cyan-400">{pending} pending</span>
                    </div>

                    <button
                      onClick={() => onSelectAnalysis(analysis)}
                      className="p-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/40 text-brand-300 transition flex items-center gap-1 text-xs font-bold"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

