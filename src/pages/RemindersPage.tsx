import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Calendar, Clock, CheckCircle2, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';
import { ReminderItem, PriorityLevel } from '../types';
import { requestNotificationPermission, sendBrowserNotification, isReminderOverdue } from '../services/reminders';

interface RemindersPageProps {
  reminders: ReminderItem[];
  onSaveReminder: (reminder: ReminderItem) => void;
  onDeleteReminder: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  reminders,
  onSaveReminder,
  onDeleteReminder,
  onToggleComplete,
  onSnooze,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [notificationState, setNotificationState] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationState(granted ? 'granted' : 'denied');
    if (granted) {
      sendBrowserNotification('Notifications Enabled', 'You will now receive desktop deadline alerts from MISSED.');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder: ReminderItem = {
      id: `rem-${Date.now()}`,
      title,
      description,
      date,
      time,
      priority,
      status: 'UPCOMING',
      createdAt: new Date().toISOString()
    };

    onSaveReminder(newReminder);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const upcomingReminders = reminders.filter(r => r.status !== 'COMPLETED' && !isReminderOverdue(r));
  const overdueReminders = reminders.filter(r => r.status !== 'COMPLETED' && isReminderOverdue(r));
  const completedReminders = reminders.filter(r => r.status === 'COMPLETED');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Smart Deadline Alert System</span>
          </div>
          <h1 className="text-3xl font-black text-theme-fg tracking-tight">
            Reminders & <span className="gradient-text">Schedules</span>
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Never miss a meeting, exam, or project delivery deadline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRequestPermission}
            className="glass-panel hover:bg-theme-card-hover px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 border-cyan-500/30 flex items-center gap-2 transition"
          >
            <Bell className="w-4 h-4" />
            <span>
              {notificationState === 'granted' ? 'Notifications Active' : 'Enable Desktop Alerts'}
            </span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-neon transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {overdueReminders.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border-coral-500/40 bg-coral-500/10 space-y-3">
          <div className="flex items-center gap-2 text-coral-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue Reminders ({overdueReminders.length})</span>
          </div>
          <div className="space-y-2">
            {overdueReminders.map(rem => (
              <div key={rem.id} className="p-3 rounded-xl bg-theme-bg/90 border border-coral-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-theme-fg">{rem.title}</h4>
                  <p className="text-xs text-coral-300">Was scheduled for {rem.date} at {rem.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSnooze(rem.id, 60)}
                    className="px-2.5 py-1 rounded bg-theme-card text-xs text-cyan-300 font-semibold"
                  >
                    Snooze 1h
                  </button>
                  <button
                    onClick={() => onToggleComplete(rem.id)}
                    className="px-2.5 py-1 rounded bg-coral-500/30 text-xs text-coral-200 font-bold"
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-theme-fg">Upcoming Reminders</h2>
        {upcomingReminders.length === 0 ? (
          <div className="p-8 text-center text-xs text-theme-muted glass-panel rounded-2xl">
            No upcoming reminders scheduled. Click "Add Reminder" or create one directly from conversation findings.
          </div>
        ) : (
          upcomingReminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel-hover border-theme"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggleComplete(reminder.id)}
                  className="mt-1 w-6 h-6 rounded-lg border border-theme-secondary hover:border-cyan-400 flex items-center justify-center text-transparent hover:text-cyan-400 transition"
                  aria-label="Mark completed"
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-theme-fg">{reminder.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono">
                      {reminder.priority}
                    </span>
                  </div>
                  {reminder.description && (
                    <p className="text-xs text-theme-secondary">{reminder.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-cyan-300 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{reminder.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{reminder.time}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-theme">
                <button
                  onClick={() => onSnooze(reminder.id, 60)}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-theme-card-hover text-xs font-semibold text-cyan-300 transition"
                >
                  Snooze 1h
                </button>
                <button
                  onClick={() => onDeleteReminder(reminder.id)}
                  className="p-2 rounded-lg hover:bg-coral-500/20 text-theme-muted hover:text-coral-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Completed Reminders Section */}
      {completedReminders.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-theme">
          <h3 className="text-sm font-bold text-theme-muted">Completed ({completedReminders.length})</h3>
          <div className="space-y-2">
            {completedReminders.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-theme-bg/50 border border-theme opacity-60 flex items-center justify-between text-xs">
                <span className="line-through text-theme-muted">{r.title}</span>
                <button
                  onClick={() => onDeleteReminder(r.id)}
                  className="text-theme-muted hover:text-coral-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 border-cyan-500/40 gradient-border"
            >
              <h3 className="text-xl font-bold text-theme-fg">Create New Reminder</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-fg">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Finalize DECODEIQ Presentation"
                    className="w-full px-4 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-fg">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Notes or context..."
                    className="w-full px-4 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-fg">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-fg">Time</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-theme-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-accent text-white px-5 py-2 rounded-xl text-xs font-bold shadow-neon"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
