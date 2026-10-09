import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckSquare, 
  RefreshCw, 
  HelpCircle, 
  Info, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  Bell, 
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileText
} from 'lucide-react';
import { AnalysisResult, Finding, FindingCategory } from '../types';

interface HighlightsPageProps {
  analysis: AnalysisResult | null;
  onNavigateToAsk: (finding: Finding) => void;
  onCreateReminderFromFinding: (finding: Finding) => void;
  onNavigateToAnalyze: () => void;
}

export const HighlightsPage: React.FC<HighlightsPageProps> = ({
  analysis,
  onNavigateToAsk,
  onCreateReminderFromFinding,
  onNavigateToAnalyze,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [showFullRawSource, setShowFullRawSource] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="glass-panel p-12 rounded-3xl max-w-lg mx-auto space-y-4">
          <AlertTriangle className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-theme-fg">No Active Analysis Loaded</h2>
          <p className="text-xs text-theme-secondary">
            Please analyze a conversation thread or load a sample conversation to view important highlights.
          </p>
          <button
            onClick={onNavigateToAnalyze}
            className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-neon"
          >
            Analyze a Conversation
          </button>
        </div>
      </div>
    );
  }

  const categoryFilters: { id: string; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Findings', count: analysis.findings.length },
    { id: 'CRITICAL', label: 'Critical', count: analysis.findings.filter(f => f.category === 'CRITICAL').length },
    { id: 'ACTION_REQUIRED', label: 'Action Required', count: analysis.findings.filter(f => f.category === 'ACTION_REQUIRED').length },
    { id: 'DECISION_CHANGED', label: 'Decision Changed', count: analysis.findings.filter(f => f.category === 'DECISION_CHANGED').length },
    { id: 'UNANSWERED_QUESTION', label: 'Questions', count: analysis.findings.filter(f => f.category === 'UNANSWERED_QUESTION').length },
  ];

  const filteredFindings = selectedCategory === 'ALL'
    ? analysis.findings
    : analysis.findings.filter(f => f.category === selectedCategory);

  const getCategoryBadge = (category: FindingCategory) => {
    switch (category) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-lg bg-coral-500/20 text-coral-400 text-[11px] font-extrabold border border-coral-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> CRITICAL</span>;
      case 'ACTION_REQUIRED':
        return <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-[11px] font-extrabold border border-cyan-500/30 flex items-center gap-1"><CheckSquare className="w-3 h-3" /> ACTION</span>;
      case 'DECISION_CHANGED':
        return <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 text-[11px] font-extrabold border border-brand-500/30 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> DECISION CHANGED</span>;
      case 'UNANSWERED_QUESTION':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-extrabold border border-amber-500/30 flex items-center gap-1"><HelpCircle className="w-3 h-3" /> QUESTION</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-[11px] font-extrabold border border-blue-500/30 flex items-center gap-1"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  const handleViewSource = (sourceMsg: string) => {
    setShowFullRawSource(true);
    setHighlightedMsgId(sourceMsg);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Highlights & Evidence Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-theme-fg tracking-tight">
            {analysis.title}
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Analyzed {analysis.date} • {analysis.totalMessages} Messages • Mode: <span className="text-cyan-400 font-mono">LOCAL PRIVACY</span>
          </p>
        </div>

        <button
          onClick={() => setShowFullRawSource(!showFullRawSource)}
          className="glass-panel hover:bg-theme-card-hover px-4 py-2.5 rounded-xl text-xs font-semibold text-theme-fg flex items-center gap-2 border-theme"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>{showFullRawSource ? 'Hide Source Conversation' : 'View Source Thread'}</span>
        </button>
      </div>

      {/* Summary Narrative Banner */}
      <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 bg-cyan-500/5 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4" />
          <span>Executive Summary</span>
        </h3>
        <p className="text-sm text-theme-fg leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Decision Changes Section (If detected) */}
      {analysis.decisionChanges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-theme-fg flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-400 animate-spin-slow" />
            <span>Decision & Schedule Changes Timeline</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {analysis.decisionChanges.map((change) => (
              <div key={change.id} className="glass-panel p-5 rounded-2xl border-brand-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brand-300 uppercase tracking-wider">
                    Topic: {change.topic}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono">
                    CONFIDENCE: {change.confidence}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-coral-500/10 border border-coral-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-coral-400 uppercase">PREVIOUS STATEMENT</span>
                    <p className="text-xs text-theme-fg font-mono">"{change.previousDecision}"</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">LATEST REVISED DECISION</span>
                    <p className="text-xs text-theme-fg font-mono">"{change.latestDecision}"</p>
                  </div>
                </div>

                <p className="text-xs text-theme-secondary italic">
                  Change Note: {change.changeSummary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consequences Section ("What happens if I miss this?") */}
      {analysis.consequences.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border-coral-500/30 bg-coral-500/5 space-y-4">
          <div className="flex items-center gap-2 text-coral-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Consequence Detector — "What happens if I miss this?"</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.consequences.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-theme-bg/80 border border-coral-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-theme-fg">{c.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-coral-500/20 text-coral-400 text-[10px] font-mono">
                    POSSIBILITY
                  </span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">{c.explanation}</p>
                <div className="pt-2 border-t border-theme text-[11px] text-cyan-300 font-semibold">
                  Recommended Action: {c.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-theme pb-3">
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              selectedCategory === cat.id
                ? 'gradient-accent text-white shadow-lg'
                : 'glass-panel hover:bg-theme-card-hover text-theme-secondary'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-theme-bg text-theme-muted'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Findings Cards List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center text-xs text-theme-muted">
            No findings match the selected filter category.
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isExpanded = expandedFindingId === finding.id;
            return (
              <motion.div
                key={finding.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 rounded-2xl space-y-4 glass-panel-hover border-theme"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getCategoryBadge(finding.category)}
                    <span className="px-2 py-0.5 rounded bg-theme-bg text-theme-muted font-mono text-[10px] uppercase">
                      {finding.confidence}
                    </span>
                  </div>

                  {finding.deadline && (
                    <div className="text-xs font-bold text-coral-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5" />
                      <span>Deadline: {finding.deadline}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-theme-fg">{finding.title}</h3>
                  <p className="text-xs text-theme-secondary mt-1 leading-relaxed">{finding.description}</p>
                </div>

                {/* Next Step & Actions */}
                <div className="pt-3 border-t border-theme flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Next Step: {finding.suggestedNextStep || 'Review supporting source message'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleViewSource(finding.sourceMessage)}
                      className="px-3 py-1.5 rounded-lg bg-theme-bg hover:bg-theme-card-hover text-theme-secondary hover:text-theme-fg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Source</span>
                    </button>

                    {finding.deadline && (
                      <button
                        onClick={() => onCreateReminderFromFinding(finding)}
                        className="px-3 py-1.5 rounded-lg bg-coral-500/20 hover:bg-coral-500/40 text-coral-300 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Add Reminder</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigateToAsk(finding)}
                      className="px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/40 text-brand-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask DECODEIQ</span>
                    </button>

                    <button
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="p-1.5 rounded-lg hover:bg-theme-card-hover text-theme-muted hover:text-theme-fg transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Supporting Evidence */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-3 border-t border-theme/50"
                    >
                      <div className="p-3.5 rounded-xl bg-theme-bg/90 font-mono text-xs text-theme-secondary space-y-1.5">
                        <div className="text-[10px] font-bold text-theme-muted uppercase tracking-wider flex items-center justify-between">
                          <span>Original Evidence Message (Line {finding.sourceLineIndex || 'N/A'})</span>
                          <span>Timestamp: {finding.sourceTimestamp || 'N/A'}</span>
                        </div>
                        <p className="text-theme-fg leading-relaxed">"{finding.sourceMessage}"</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Raw Source Thread Modal/Viewer */}
      {showFullRawSource && (
        <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-theme pb-3">
            <h3 className="font-bold text-sm text-theme-fg flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Full Source Conversation Viewer</span>
            </h3>
            <button
              onClick={() => setShowFullRawSource(false)}
              className="text-xs text-theme-muted hover:text-theme-fg"
            >
              Close Viewer
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-theme-bg font-mono text-xs text-theme-fg max-h-96 overflow-y-auto space-y-2 leading-relaxed">
            {analysis.rawText.split(/\r?\n/).map((line, idx) => {
              const isMatch = highlightedMsgId && line.includes(highlightedMsgId.slice(0, 30));
              return (
                <div
                  key={idx}
                  className={`p-2 rounded transition ${
                    isMatch ? 'bg-cyan-500/20 text-cyan-200 border-l-4 border-cyan-400 font-bold' : 'hover:bg-theme-card-hover'
                  }`}
                >
                  <span className="text-theme-muted mr-3 text-[10px] select-none">{idx + 1}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
