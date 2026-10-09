import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ShieldCheck, User, CloudOff, Cloud, Bell, Trash2, Key, Check } from 'lucide-react';
import { UserPreferences } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onClearAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onClearAllData,
}) => {
  const [userName, setUserName] = useState(preferences.userName);
  const [savedNotice, setSavedNotice] = useState(false);
  const isCloudAvailable = isSupabaseConfigured();

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({ ...preferences, userName });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleModeChange = (mode: 'LOCAL' | 'CLOUD_AI') => {
    onUpdatePreferences({ ...preferences, defaultProcessingMode: mode });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-theme pb-6">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-3xl font-black text-theme-fg tracking-tight">
          App <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-xs text-theme-secondary">
          Manage your personal profile, local processing rules, and privacy mode.
        </p>
      </div>

      {/* Profile Name Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border-theme">
        <h3 className="font-bold text-base text-theme-fg flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>User Profile Display Name</span>
        </h3>
        <form onSubmit={handleSaveName} className="flex gap-3">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Alex"
            className="flex-1 px-4 py-2.5 rounded-xl bg-theme-bg border border-theme text-theme-fg text-sm focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="gradient-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-neon flex items-center gap-1"
          >
            {savedNotice ? <Check className="w-4 h-4" /> : null}
            <span>{savedNotice ? 'Saved' : 'Save Name'}</span>
          </button>
        </form>
      </div>

      {/* Processing Engine Privacy Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border-theme">
        <h3 className="font-bold text-base text-theme-fg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Conversation Processing Engine Mode</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => handleModeChange('LOCAL')}
            className={`p-4 rounded-2xl cursor-pointer space-y-2 border transition ${
              preferences.defaultProcessingMode === 'LOCAL'
                ? 'border-cyan-400 bg-cyan-500/10 shadow-neon'
                : 'border-theme glass-panel-hover'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold text-cyan-400">
              <span className="flex items-center gap-1.5"><CloudOff className="w-4 h-4" /> LOCAL PRIVACY (DEFAULT)</span>
              {preferences.defaultProcessingMode === 'LOCAL' && <Check className="w-4 h-4" />}
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              Processes 100% of conversation messages and poster text in browser memory. Zero external API calls.
            </p>
          </div>

          <div
            onClick={() => isCloudAvailable && handleModeChange('CLOUD_AI')}
            className={`p-4 rounded-2xl space-y-2 border transition ${
              !isCloudAvailable
                ? 'opacity-50 cursor-not-allowed border-theme'
                : preferences.defaultProcessingMode === 'CLOUD_AI'
                ? 'border-brand-400 bg-brand-500/10 shadow-neon cursor-pointer'
                : 'border-theme glass-panel-hover cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold text-brand-300">
              <span className="flex items-center gap-1.5"><Cloud className="w-4 h-4" /> CLOUD AI (SUPABASE EDGE)</span>
              {preferences.defaultProcessingMode === 'CLOUD_AI' && <Check className="w-4 h-4" />}
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              Uses server-side Supabase Edge Functions with secret API keys. Requires backend configuration.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Status Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-3 border-theme">
        <h3 className="font-bold text-base text-theme-fg flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span>Backend Cloud Connection Status</span>
        </h3>
        <div className="p-3 rounded-xl bg-theme-bg border border-theme flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isCloudAvailable ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="font-mono text-theme-fg">
              {isCloudAvailable ? 'Supabase Backend Connected' : 'Local Demo Mode Active (Unconfigured Cloud)'}
            </span>
          </div>
          <span className="text-[10px] text-theme-muted font-mono">
            {isCloudAvailable ? 'AUTH & DB READY' : 'NO CREDENTIALS REQUIRED'}
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border-coral-500/30 bg-coral-500/5">
        <h3 className="font-bold text-base text-coral-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Clear Local Data & Cache</span>
        </h3>
        <p className="text-xs text-theme-secondary">
          Deletes all locally saved analyses, reminders, vault items, and custom preferences.
        </p>
        <button
          onClick={onClearAllData}
          className="px-4 py-2.5 rounded-xl bg-coral-500/20 hover:bg-coral-500/40 text-coral-300 text-xs font-bold transition"
        >
          Clear All Application Data
        </button>
      </div>
    </div>
  );
};

