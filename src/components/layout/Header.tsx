import React from 'react';
import { Sparkles, Menu, PlusCircle, User, Moon, Sun, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { AppTheme } from '../../types';
import { UserSession } from '../../services/auth';

interface HeaderProps {
  onOpenAnalyze: () => void;
  session: UserSession | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  currentTheme: AppTheme;
  onThemeToggle: () => void;
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAnalyze,
  session,
  onOpenAuth,
  onSignOut,
  currentTheme,
  onThemeToggle,
  onMobileMenuToggle,
}) => {
  return (
    <header className="h-16 border-b border-theme bg-theme-sidebar backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-theme-secondary hover:text-theme-fg hover:bg-theme-card-hover"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full glass-panel border-cyan-500/30 text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>DECODEAI Intelligence Engine</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Theme Switcher */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-xl glass-panel hover:bg-theme-card-hover text-theme-secondary hover:text-theme-fg transition"
          title={`Current Theme: ${currentTheme.toUpperCase()} (Click to toggle)`}
        >
          {currentTheme === 'lavender' ? (
            <Moon className="w-4 h-4 text-brand-600" />
          ) : (
            <Sun className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Action Button */}
        <button
          onClick={onOpenAnalyze}
          className="gradient-accent hover:opacity-90 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-brand-500/20 transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Analyze Conversation</span>
          <span className="sm:hidden">Analyze</span>
        </button>

        {/* Authentication / Session Control */}
        <div className="flex items-center gap-2 pl-2 border-l border-theme">
          {session ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={onOpenAuth}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-cyan-400 font-bold text-xs border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition"
                title={`${session.displayName} (${session.isGuest ? 'Guest Session' : 'Authenticated'})`}
              >
                {session.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-theme-fg line-clamp-1">{session.displayName}</span>
                <span className="text-[9px] font-mono text-cyan-300">
                  {session.isGuest ? 'GUEST SESSION' : 'AUTHENTICATED'}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg hover:bg-coral-500/20 text-theme-muted hover:text-coral-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl glass-panel hover:bg-theme-card-hover text-xs font-bold text-cyan-300 flex items-center gap-1.5 border-cyan-500/30 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
