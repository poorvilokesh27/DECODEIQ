import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HighlightsPage } from './pages/HighlightsPage';
import { TasksPage } from './pages/TasksPage';
import { RemindersPage } from './pages/RemindersPage';
import { HistoryPage } from './pages/HistoryPage';
import { VaultPage } from './pages/VaultPage';
import { ChatPage } from './pages/ChatPage';
import { SnapPage } from './pages/SnapPage';
import { AppearancePage } from './pages/AppearancePage';
import { SettingsPage } from './pages/SettingsPage';

import { 
  AnalysisResult, 
  ReminderItem, 
  VaultItem, 
  UserPreferences, 
  Finding, 
  PosterAnalysis,
  AppTheme 
} from './types';

import { 
  getInitialPreferences, 
  savePreferences, 
  getSavedAnalyses, 
  saveAnalysis, 
  deleteAnalysis, 
  clearAllAnalyses,
  getSavedReminders,
  saveReminder,
  deleteReminder,
  getSavedVaultItems,
  saveVaultItem,
  deleteVaultItem,
  verifyVaultPin,
  setVaultPin,
  getVaultPin,
  SAMPLE_CONVERSATION_1
} from './services/storage';

import { analyzeConversation } from './services/analyzer';
import { isSupabaseConfigured } from './services/supabase';
import { UserSession, getStoredSession, signOutUser } from './services/auth';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [preferences, setPreferences] = useState<UserPreferences>(getInitialPreferences);
  const [session, setSession] = useState<UserSession | null>(getStoredSession);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [vaultPin, setVaultPinState] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Chat Context state
  const [chatFinding, setChatFinding] = useState<Finding | null>(null);
  const [chatPoster, setChatPoster] = useState<PosterAnalysis | null>(null);

  const isCloud = isSupabaseConfigured();

  const lockVault = useCallback(() => {
    setIsVaultUnlocked(false);
    setVaultPinState(null);
    setVaultItems([]);
  }, []);

  // Initialize data and apply theme
  useEffect(() => {
    savePreferences(preferences);
    const loadedAnalyses = getSavedAnalyses();
    setAnalyses(loadedAnalyses);
    if (loadedAnalyses.length > 0) {
      setActiveAnalysis(loadedAnalyses[0]);
    }
    setReminders(getSavedReminders());
  }, []);

  useEffect(() => {
    if (!isVaultUnlocked || !vaultPin) return;
    let timeout = 0;
    const resetTimer = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(lockVault, Math.max(1, preferences.autoLockVaultMinutes) * 60_000);
    };
    const onVisibilityChange = () => {
      if (document.hidden) lockVault();
    };
    resetTimer();
    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isVaultUnlocked, vaultPin, preferences.autoLockVaultMinutes, lockVault]);

  useEffect(() => {
    if (activeTab !== 'vault' && isVaultUnlocked) lockVault();
  }, [activeTab, isVaultUnlocked, lockVault]);

  const handleSessionChange = (newSession: UserSession) => {
    setSession(newSession);
    // Sync display name in preferences if available
    handleUpdatePreferences({ ...preferences, userName: newSession.displayName });
  };

  const handleSignOut = async () => {
    await signOutUser();
    const guestSession = getStoredSession();
    setSession(guestSession);
    lockVault();
  };

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleThemeToggle = () => {
    const themeCycle: AppTheme[] = ['midnight', 'lavender', 'ocean', 'forest', 'sunset', 'minimal'];
    const nextIdx = (themeCycle.indexOf(preferences.theme) + 1) % themeCycle.length;
    handleUpdatePreferences({ ...preferences, theme: themeCycle[nextIdx] });
  };

  // Analysis Actions
  const handleAnalysisComplete = (result: AnalysisResult) => {
    saveAnalysis(result);
    const updated = getSavedAnalyses();
    setAnalyses(updated);
    setActiveAnalysis(result);
    setActiveTab('highlights');
  };

  const handleLoadSample = () => {
    const sampleResult = analyzeConversation(
      SAMPLE_CONVERSATION_1,
      'Hackathon Submission & Schedule Sync',
      session?.displayName || preferences.userName
    );
    handleAnalysisComplete(sampleResult);
  };

  const handleDeleteAnalysis = (id: string) => {
    deleteAnalysis(id);
    const updated = getSavedAnalyses();
    setAnalyses(updated);
    if (activeAnalysis?.id === id) {
      setActiveAnalysis(updated[0] || null);
    }
  };

  const handleClearAllAnalyses = () => {
    clearAllAnalyses();
    setAnalyses([]);
    setActiveAnalysis(null);
  };

  // Task Actions
  const handleToggleTaskComplete = (taskId: string) => {
    if (!activeAnalysis) return;
    const updatedTasks = activeAnalysis.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedAnalysis = { ...activeAnalysis, tasks: updatedTasks };
    saveAnalysis(updatedAnalysis);
    setActiveAnalysis(updatedAnalysis);
    setAnalyses(getSavedAnalyses());
  };

  // Reminder Actions
  const handleSaveReminder = (rem: ReminderItem) => {
    saveReminder(rem);
    setReminders(getSavedReminders());
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
    setReminders(getSavedReminders());
  };

  const handleToggleReminderComplete = (id: string) => {
    const rem = reminders.find(r => r.id === id);
    if (rem) {
      const updated: ReminderItem = {
        ...rem,
        status: rem.status === 'COMPLETED' ? 'UPCOMING' : 'COMPLETED',
      };
      saveReminder(updated);
      setReminders(getSavedReminders());
    }
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    const rem = reminders.find(r => r.id === id);
    if (rem) {
      const newTime = new Date(Date.now() + minutes * 60000);
      const updated: ReminderItem = {
        ...rem,
        date: newTime.toISOString().split('T')[0],
        time: newTime.toTimeString().slice(0, 5),
        status: 'SNOOZED',
      };
      saveReminder(updated);
      setReminders(getSavedReminders());
    }
  };

  // Vault Actions
  const handleUnlockVault = async (pin: string) => {
    const valid = await verifyVaultPin(pin);
    if (valid) {
      try {
        const items = await getSavedVaultItems(pin);
        setVaultItems(items);
        setVaultPinState(pin);
        setIsVaultUnlocked(true);
      } catch (error) {
        console.error('Unable to unlock vault:', error);
        return false;
      }
    }
    return valid;
  };

  const handleSaveVaultItem = async (item: VaultItem) => {
    if (!vaultPin) return;
    await saveVaultItem(item, vaultPin);
    setVaultItems(await getSavedVaultItems(vaultPin));
  };

  const handleDeleteVaultItem = async (id: string) => {
    if (!vaultPin) return;
    await deleteVaultItem(id, vaultPin);
    setVaultItems(await getSavedVaultItems(vaultPin));
  };

  // Navigation handlers from components
  const handleNavigateToAskFinding = (finding: Finding) => {
    setChatFinding(finding);
    setChatPoster(null);
    setActiveTab('chat');
  };

  const handleNavigateToAskPoster = (poster: PosterAnalysis) => {
    setChatPoster(poster);
    setChatFinding(null);
    setActiveTab('chat');
  };

  const handleCreateReminderFromFinding = (finding: Finding) => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: finding.title,
      description: finding.description,
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      priority: finding.priority,
      status: 'UPCOMING',
      createdAt: new Date().toISOString(),
    };
    handleSaveReminder(newRem);
    setActiveTab('reminders');
  };

  const currentDisplayName = session?.displayName || preferences.userName || 'You';

  return (
    <div className="flex min-h-screen bg-theme-bg text-theme-fg relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Desktop Sidebar & Mobile Overlay */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:static inset-0 z-40 bg-black/60 md:bg-transparent`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }}
          isCloudConfigured={isCloud}
          currentTheme={preferences.theme}
        />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenAnalyze={() => setActiveTab('analyze')}
          session={session}
          onOpenAuth={() => setAuthModalOpen(true)}
          onSignOut={handleSignOut}
          currentTheme={preferences.theme}
          onThemeToggle={handleThemeToggle}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              analyses={analyses}
              onNavigate={setActiveTab}
              onSelectAnalysis={(a) => { setActiveAnalysis(a); setActiveTab('highlights'); }}
              onLoadSample={handleLoadSample}
              onClearAnalyses={handleClearAllAnalyses}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzePage
              onAnalysisComplete={handleAnalysisComplete}
              userName={currentDisplayName}
            />
          )}

          {activeTab === 'snap' && (
            <SnapPage
              onSavePosterToHistory={(poster) => {
                const sampleResult = analyzeConversation(poster.extractedText, poster.title, currentDisplayName);
                handleAnalysisComplete(sampleResult);
              }}
              onSavePosterToVault={(poster) => {
                const item: VaultItem = {
                  id: `vault-poster-${Date.now()}`,
                  title: poster.title,
                  category: 'SUMMARY',
                  content: `${poster.simpleExplanation}\nMain Purpose: ${poster.mainPurpose}\nRequired Action: ${poster.requiredAction}`,
                  isEncrypted: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                handleSaveVaultItem(item);
                setActiveTab('vault');
              }}
              onCreateReminder={(rem) => {
                handleSaveReminder(rem);
                setActiveTab('reminders');
              }}
              onAskMissedAboutPoster={handleNavigateToAskPoster}
            />
          )}

          {activeTab === 'highlights' && (
            <HighlightsPage
              analysis={activeAnalysis}
              onNavigateToAsk={handleNavigateToAskFinding}
              onCreateReminderFromFinding={handleCreateReminderFromFinding}
              onNavigateToAnalyze={() => setActiveTab('analyze')}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksPage
              analysis={activeAnalysis}
              onToggleTaskComplete={handleToggleTaskComplete}
              userName={currentDisplayName}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersPage
              reminders={reminders}
              onSaveReminder={handleSaveReminder}
              onDeleteReminder={handleDeleteReminder}
              onToggleComplete={handleToggleReminderComplete}
              onSnooze={handleSnoozeReminder}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              analyses={analyses}
              onSelectAnalysis={(a) => { setActiveAnalysis(a); setActiveTab('highlights'); }}
              onDeleteAnalysis={handleDeleteAnalysis}
              onClearAll={handleClearAllAnalyses}
              isCloudConnected={isCloud}
            />
          )}

          {activeTab === 'vault' && (
            <VaultPage
              items={vaultItems}
              onSaveItem={handleSaveVaultItem}
              onDeleteItem={handleDeleteVaultItem}
              isUnlocked={isVaultUnlocked}
              onUnlock={handleUnlockVault}
              onLock={lockVault}
              onSetPin={async (pin) => {
                await setVaultPin(pin);
                setVaultPinState(pin);
              }}
              hasPin={Boolean(getVaultPin())}
            />
          )}

          {activeTab === 'chat' && (
            <ChatPage
              initialFinding={chatFinding}
              initialPoster={chatPoster}
              initialAnalysis={activeAnalysis}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearancePage
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onClearAllData={() => {
                clearAllAnalyses();
                setAnalyses([]);
                setActiveAnalysis(null);
                setReminders([]);
                setVaultItems([]);
              }}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSessionChange={handleSessionChange}
        currentSession={session}
      />
    </div>
  );
};
