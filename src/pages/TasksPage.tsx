import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, User, Clock, AlertCircle, CheckCircle2, Filter, Sparkles } from 'lucide-react';
import { TaskItem, AnalysisResult } from '../types';

interface TasksPageProps {
  analysis: AnalysisResult | null;
  onToggleTaskComplete: (taskId: string) => void;
  userName: string;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  analysis,
  onToggleTaskComplete,
  userName,
}) => {
  const [filterMode, setFilterMode] = useState<'MY' | 'ALL' | 'COMPLETED'>('MY');

  if (!analysis || analysis.tasks.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="glass-panel p-12 rounded-3xl space-y-4">
          <CheckSquare className="w-12 h-12 text-cyan-400 mx-auto" />
          <h2 className="text-2xl font-bold text-theme-fg">No Action Items Extracted Yet</h2>
          <p className="text-xs text-theme-secondary">
            Analyze a conversation thread to automatically identify action items, commitments, and deadlines assigned to you or your team.
          </p>
        </div>
      </div>
    );
  }

  const allTasks = analysis.tasks;
  const myTasks = allTasks.filter(t => t.isUserObligation || t.assignedTo.toLowerCase() === userName.toLowerCase());
  const completedTasks = allTasks.filter(t => t.completed);

  const displayedTasks = filterMode === 'MY'
    ? myTasks
    : filterMode === 'COMPLETED'
    ? completedTasks
    : allTasks;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Personal Obligation Finder</span>
          </div>
          <h1 className="text-3xl font-black text-theme-fg tracking-tight">
            My <span className="gradient-text">Action Items</span>
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Displaying obligations extracted for <span className="text-cyan-400 font-bold">@{userName || 'You'}</span> and team members
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 glass-panel p-1.5 rounded-2xl border-theme">
          <button
            onClick={() => setFilterMode('MY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'MY' ? 'gradient-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-fg'
            }`}
          >
            My Obligations ({myTasks.length})
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'ALL' ? 'gradient-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-fg'
            }`}
          >
            All Team ({allTasks.length})
          </button>
          <button
            onClick={() => setFilterMode('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterMode === 'COMPLETED' ? 'gradient-accent text-white shadow-md' : 'text-theme-secondary hover:text-theme-fg'
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {displayedTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-theme-muted glass-panel rounded-2xl">
            No action items match the selected filter option.
          </div>
        ) : (
          displayedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-panel p-5 rounded-2xl transition border ${
                task.completed ? 'opacity-60 bg-theme-bg/50 border-theme' : 'border-cyan-500/30 glass-panel-hover'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggleTaskComplete(task.id)}
                  className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                    task.completed
                      ? 'bg-cyan-500 border-cyan-400 text-white'
                      : 'border-theme-secondary hover:border-cyan-400 text-transparent'
                  }`}
                  aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className={`text-base font-bold ${task.completed ? 'line-through text-theme-muted' : 'text-theme-fg'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {task.isUserObligation && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30">
                          ASSIGNED TO YOU
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        task.priority === 'HIGH' ? 'bg-coral-500/20 text-coral-400' : 'bg-theme-bg text-theme-muted'
                      }`}>
                        {task.priority} PRIORITY
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-theme-secondary font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Owner: {task.assignedTo}</span>
                    </span>

                    {task.deadline && (
                      <span className="flex items-center gap-1 text-coral-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {task.deadline}</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-theme-bg/80 font-mono text-xs text-theme-muted border border-theme">
                    <span className="text-[10px] uppercase font-bold text-theme-secondary block mb-0.5">Source Evidence:</span>
                    <p className="text-theme-fg italic">"{task.sourceMessage}"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

