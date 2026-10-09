import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Eye, Sparkles } from 'lucide-react';
import { AppTheme, UserPreferences } from '../types';

interface AppearancePageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
}

export const AppearancePage: React.FC<AppearancePageProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  const themes: { id: AppTheme; name: string; description: string; colors: string[] }[] = [
    {
      id: 'midnight',
      name: 'Midnight Aurora',
      description: 'Deep purple foundation, indigo backdrop, and electric cyan highlights.',
      colors: ['#0B0819', '#8B5CF6', '#06B6D4'],
    },
    {
      id: 'lavender',
      name: 'Lavender Dream',
      description: 'Light lavender digital space, crisp white cards, and soft violet accents.',
      colors: ['#F4F1FA', '#7C3AED', '#2563EB'],
    },
    {
      id: 'ocean',
      name: 'Ocean Glass',
      description: 'Deep marine navy, oceanic teal panels, and brilliant blue glows.',
      colors: ['#071324', '#06B6D4', '#3B82F6'],
    },
    {
      id: 'forest',
      name: 'Forest Focus',
      description: 'Dark emerald background, mint highlights, and serene green panel glows.',
      colors: ['#061712', '#10B981', '#34D399'],
    },
    {
      id: 'sunset',
      name: 'Sunset Glow',
      description: 'Deep plum foundation, warm coral highlights, and peach gradients.',
      colors: ['#180914', '#F43F5E', '#FB923C'],
    },
    {
      id: 'minimal',
      name: 'Minimal Mono',
      description: 'Clean high-contrast monochrome with restrained accent highlights.',
      colors: ['#121212', '#E4E4E7', '#A1A1AA'],
    },
  ];

  const handleSelectTheme = (themeId: AppTheme) => {
    const updated = { ...preferences, theme: themeId };
    onUpdatePreferences(updated);
  };

  const handleToggleReducedMotion = () => {
    const updated = { ...preferences, reducedMotion: !preferences.reducedMotion };
    onUpdatePreferences(updated);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-theme pb-6">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Palette className="w-4 h-4" />
          <span>Visual Identity & Themes</span>
        </div>
        <h1 className="text-3xl font-black text-theme-fg tracking-tight">
          Appearance & <span className="gradient-text">Personalization</span>
        </h1>
        <p className="text-xs text-theme-secondary">
          Customize your private digital workspace with custom-engineered color themes and motion preferences.
        </p>
      </div>

      {/* Theme Cards Selection Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-theme-fg">Choose Application Theme</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.map((t) => {
            const isSelected = preferences.theme === t.id;
            return (
              <motion.div
                key={t.id}
                whileHover={{ y: -4 }}
                onClick={() => handleSelectTheme(t.id)}
                className={`glass-panel p-5 rounded-2xl cursor-pointer space-y-4 transition border ${
                  isSelected ? 'border-cyan-400 shadow-neon bg-theme-card-hover' : 'border-theme glass-panel-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-theme-fg">{t.name}</h3>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-theme-secondary leading-relaxed">{t.description}</p>

                {/* Color Swatch Dots */}
                <div className="flex items-center gap-2 pt-2 border-t border-theme">
                  {t.colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reduced Motion Toggle Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-theme-fg flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Accessibility & Motion Preferences</span>
          </h3>
          <p className="text-xs text-theme-secondary">
            Reduce UI animations and float transitions to respect system accessibility settings.
          </p>
        </div>

        <button
          onClick={handleToggleReducedMotion}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            preferences.reducedMotion
              ? 'gradient-accent text-white shadow-neon'
              : 'glass-panel text-theme-secondary hover:text-theme-fg'
          }`}
        >
          {preferences.reducedMotion ? 'Reduced Motion Enabled' : 'Enable Reduced Motion'}
        </button>
      </div>
    </div>
  );
};

