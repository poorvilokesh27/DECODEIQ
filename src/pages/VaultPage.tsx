import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Key, Plus, Trash2, Edit3, ShieldAlert, FileText, Search, Sparkles } from 'lucide-react';
import { VaultItem } from '../types';

interface VaultPageProps {
  items: VaultItem[];
  onSaveItem: (item: VaultItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  isUnlocked: boolean;
  onUnlock: (pin: string) => Promise<boolean>;
  onLock: () => void;
  onSetPin: (pin: string) => Promise<void>;
  hasPin: boolean;
}

export const VaultPage: React.FC<VaultPageProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  isUnlocked,
  onUnlock,
  onLock,
  onSetPin,
  hasPin,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'NOTE' | 'FINDING' | 'SUMMARY'>('NOTE');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUnlock(pinInput);
    if (success) {
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
  };

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinError('PIN must be at least 4 digits.');
      return;
    }
    await onSetPin(pinInput);
    await onUnlock(pinInput);
    setPinInput('');
    setPinError('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newItem: VaultItem = {
      id: `vault-${Date.now()}`,
      title,
      category,
      content,
      isEncrypted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSaveItem(newItem);
    setShowAddModal(false);
    setTitle('');
    setContent('');
  };

  // Locked View
  if (!isUnlocked) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 space-y-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-8 rounded-3xl text-center space-y-6 border-cyan-500/30 gradient-border shadow-neon"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 text-brand-300 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-theme-fg">MY PRIVATE VAULT</h2>
            <p className="text-xs text-theme-secondary mt-1">
              {hasPin ? 'Enter your Security PIN to access confidential notes and findings.' : 'Set up a 4-digit PIN to secure your Private Vault.'}
            </p>
          </div>

          <form onSubmit={hasPin ? handleUnlockSubmit : handleSetupPin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter PIN..."
                className="w-full text-center tracking-widest font-mono text-xl py-3 rounded-2xl bg-theme-bg border border-theme text-theme-fg focus:outline-none focus:border-cyan-400"
              />
              {pinError && <p className="text-xs text-coral-400 mt-1.5 font-medium">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full gradient-accent text-white py-3 rounded-xl font-bold text-sm shadow-neon flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{hasPin ? 'Unlock Vault' : 'Set PIN & Unlock'}</span>
            </button>
          </form>

          <p className="text-[10px] text-theme-muted italic">
            Honest Privacy Notice: Vault content is stored locally with client-side isolation and protected by Supabase Row Level Security when logged in.
          </p>
        </motion.div>
      </div>
    );
  }

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Unlock className="w-4 h-4" />
            <span>Private & Encrypted Folder</span>
          </div>
          <h1 className="text-3xl font-black text-theme-fg tracking-tight">
            My Private <span className="gradient-text">Vault</span>
          </h1>
          <p className="text-xs text-theme-secondary mt-1">
            Store sensitive notes, key summaries, and confidential project findings safely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLock}
            className="glass-panel hover:bg-theme-card-hover px-4 py-2.5 rounded-xl text-xs font-semibold text-coral-300 border-coral-500/30 flex items-center gap-2 transition"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Vault</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-accent text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-neon transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search vault items..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400 transition"
        />
        <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-3.5" />
      </div>

      {/* Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-theme-muted glass-panel rounded-3xl">
            No items in your private vault yet. Click "New Note" to save a confidential note.
          </div>
        ) : (
          filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 rounded-2xl space-y-3 glass-panel-hover border-theme flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono font-bold">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-theme-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-base text-theme-fg">{item.title}</h3>
                <p className="text-xs text-theme-secondary leading-relaxed whitespace-pre-line">{item.content}</p>
              </div>

              <div className="pt-3 border-t border-theme flex justify-end">
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg hover:bg-coral-500/20 text-theme-muted hover:text-coral-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 border-cyan-500/40 gradient-border"
            >
              <h3 className="text-xl font-bold text-theme-fg">Add Private Vault Note</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-fg">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Confidential Project Keynote"
                    className="w-full px-4 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-fg">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none"
                  >
                    <option value="NOTE">Private Note</option>
                    <option value="FINDING">Key Finding</option>
                    <option value="SUMMARY">Executive Summary</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-fg">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Enter confidential details..."
                    className="w-full px-4 py-2 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
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
                    Save Note
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
