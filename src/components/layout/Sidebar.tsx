import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  AlertTriangle, 
  CheckSquare, 
  Bell, 
  History, 
  Lock, 
  Bot, 
  Camera, 
  Palette, 
  Settings,
  ShieldCheck,
  CloudOff,
  Cloud
} from 'lucide-react';
import { AppTheme } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCloudConfigured: boolean;
  currentTheme: AppTheme;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCloudConfigured,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Conversation', icon: MessageSquarePlus },
    { id: 'snap', label: 'Snap & Understand', icon: Camera, badge: 'NEW' },
    { id: 'highlights', label: 'Important Highlights', icon: AlertTriangle },
    { id: 'tasks', label: 'My Action Items', icon: CheckSquare },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'history', label: 'Message History', icon: History },
    { id: 'vault', label: 'Private Vault', icon: Lock },
    { id: 'chat', label: 'Ask DECODEIQ', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-theme-sidebar border-r border-theme flex flex-col justify-between h-screen sticky top-0 z-30 backdrop-blur-xl">
      <div>
        {/* Logo Section */}
        <div className="p-6 border-b border-theme flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-neon">
            <span className="font-black text-white text-xl tracking-tighter">D.</span>
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-wider text-theme-fg flex items-center gap-1">
              DECODEIQ<span className="text-cyan-400">.</span>
            </h1>
            <p className="text-xs text-theme-secondary font-medium tracking-tight">
              Your conversations, decoded
            </p>
          </div>
        </div>

        {/* Processing Mode Indicator */}
        <div className="px-4 py-3">
          <div className="glass-panel rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isCloudConfigured ? (
                <>
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span className="text-theme-fg font-medium">Cloud AI Mode</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-brand-400" />
                  <span className="text-theme-fg font-medium">Local Privacy Mode</span>
                </>
              )}
            </div>
            <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[10px]">
              {isCloudConfigured ? 'CONNECTED' : '100% LOCAL'}
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'gradient-accent text-white shadow-lg shadow-brand-500/20 font-semibold'
                    : 'text-theme-secondary hover:text-theme-fg hover:bg-theme-card-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-theme-secondary'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Tagline */}
      <div className="p-4 border-t border-theme text-center">
        <p className="text-[11px] text-theme-muted font-medium italic">
          "Don't read everything. Understand what matters."
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-theme-secondary">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zero Cloud Transmission by default</span>
        </div>
      </div>
    </aside>
  );
};

