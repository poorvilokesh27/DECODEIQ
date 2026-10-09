import { AnalysisResult, ReminderItem, VaultItem, UserPreferences, PosterAnalysis, TaskItem } from '../types';
import { analyzeConversation } from './analyzer';
import { supabase, isSupabaseConfigured } from './supabase';

const KEYS = {
  ANALYSES: 'missed_analyses_v1',
  REMINDERS: 'missed_reminders_v1',
  VAULT: 'missed_vault_v1',
  PREFERENCES: 'missed_user_prefs_v1',
  POSTERS: 'missed_posters_v1',
  VAULT_PIN: 'missed_vault_pin_hash_v1', // Simple hashed representation or standard PIN check
};

export const SAMPLE_CONVERSATION_1 = `[10:15 AM, 10/09/2026] Sarah (PM): Good morning team! Let's sync on the DECODEIQ release.
[10:17 AM, 10/09/2026] Alex (Tech Lead): The core AI engine is fully functional. But we need to update the submission deadline.
[10:19 AM, 10/09/2026] Sarah (PM): Wait, wasn't the submission due today at 5:00 PM?
[10:21 AM, 10/09/2026] Alex (Tech Lead): The organizers extended the deadline. The submission is now due tomorrow at 2:00 PM instead of 5:00 PM today.
[10:24 AM, 10/09/2026] Sarah (PM): Great! @You please verify the design system and finalize the demo video before 11:00 AM tomorrow.
[10:26 AM, 10/09/2026] You: Got it. I will finish the video recording by 9:00 AM.
[10:28 AM, 10/09/2026] David (QA): Has anyone checked the browser notification API on mobile Safari?
[10:31 AM, 10/09/2026] Sarah (PM): Also, we moved the demo presentation from Room 302 to the Main Stage Auditorium at 3:00 PM on Friday.
[10:35 AM, 10/09/2026] Alex (Tech Lead): Can someone update the repository README link in the submission portal?`;

export const SAMPLE_CONVERSATION_2 = `[02:00 PM] Professor Martinez: Class, please note the final exam schedule change.
[02:02 PM] Student Rep: Was the exam originally scheduled for Monday, March 16th?
[02:05 PM] Professor Martinez: Yes. The exam is moved to Wednesday, March 18th at 10:00 AM in Hall B.
[02:08 PM] Student Rep: @You please submit the group project report by Friday midnight.
[02:10 PM] You: Sure, I will upload the PDF report before 11:59 PM on Friday.
[02:12 PM] Professor Martinez: Who is responsible for printing the lab code submissions?`;

export function getInitialPreferences(): UserPreferences {
  const saved = localStorage.getItem(KEYS.PREFERENCES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse user preferences:', e);
    }
  }
  return {
    theme: 'midnight',
    userName: 'You',
    reducedMotion: false,
    defaultProcessingMode: 'LOCAL',
    enableBrowserNotifications: false,
    autoLockVaultMinutes: 5,
  };
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
  document.documentElement.setAttribute('data-theme', prefs.theme);
  if (prefs.reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  } else {
    document.documentElement.classList.remove('reduced-motion');
  }
}

// Local Analysis Store
export function getSavedAnalyses(): AnalysisResult[] {
  const saved = localStorage.getItem(KEYS.ANALYSES);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved analyses:', e);
    }
  }
  // Initialize with sample analysis if empty without calling saveAnalysis recursively
  const sample = analyzeConversation(SAMPLE_CONVERSATION_1, 'Hackathon Submission & Schedule Sync', 'You');
  localStorage.setItem(KEYS.ANALYSES, JSON.stringify([sample]));
  return [sample];
}

export function saveAnalysis(analysis: AnalysisResult): void {
  const list = getSavedAnalyses();
  const index = list.findIndex(a => a.id === analysis.id);
  if (index >= 0) {
    list[index] = analysis;
  } else {
    list.unshift(analysis);
  }
  localStorage.setItem(KEYS.ANALYSES, JSON.stringify(list));

  // Sync to Supabase if authenticated
  if (isSupabaseConfigured() && supabase) {
    supabase.from('conversations').insert([
      {
        id: analysis.id,
        title: analysis.title,
        summary: analysis.summary,
        raw_text: analysis.rawText,
        created_at: analysis.createdAt,
      },
    ]).then(({ error }) => {
      if (error) console.log('Supabase sync note:', error.message);
    });
  }
}

export function deleteAnalysis(id: string): void {
  const list = getSavedAnalyses().filter(a => a.id !== id);
  localStorage.setItem(KEYS.ANALYSES, JSON.stringify(list));
}

export function clearAllAnalyses(): void {
  localStorage.removeItem(KEYS.ANALYSES);
}

// Reminders Store
export function getSavedReminders(): ReminderItem[] {
  const saved = localStorage.getItem(KEYS.REMINDERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load reminders:', e);
    }
  }
  return [
    {
      id: 'rem-sample-1',
      title: 'Verify Design System & Finalize Demo Video',
      description: 'Deadline: Tomorrow at 11:00 AM (Assigned by Sarah)',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '11:00',
      priority: 'HIGH',
      relatedConversation: 'Hackathon Submission & Schedule Sync',
      status: 'UPCOMING',
      createdAt: new Date().toISOString()
    }
  ];
}

export function saveReminder(reminder: ReminderItem): void {
  const list = getSavedReminders();
  const idx = list.findIndex(r => r.id === reminder.id);
  if (idx >= 0) {
    list[idx] = reminder;
  } else {
    list.unshift(reminder);
  }
  localStorage.setItem(KEYS.REMINDERS, JSON.stringify(list));
}

export function deleteReminder(id: string): void {
  const list = getSavedReminders().filter(r => r.id !== id);
  localStorage.setItem(KEYS.REMINDERS, JSON.stringify(list));
}

// Vault Store
export function getSavedVaultItems(): VaultItem[] {
  const saved = localStorage.getItem(KEYS.VAULT);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load vault items:', e);
    }
  }
  return [
    {
      id: 'vault-sample-1',
      title: 'Confidential Keynote Presentation Notes',
      category: 'NOTE',
      content: 'Main Stage Auditorium confirmed for Friday at 3:00 PM. Demo video to be finalized by 9:00 AM tomorrow.',
      isEncrypted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export function saveVaultItem(item: VaultItem): void {
  const list = getSavedVaultItems();
  const idx = list.findIndex(v => v.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  localStorage.setItem(KEYS.VAULT, JSON.stringify(list));
}

export function deleteVaultItem(id: string): void {
  const list = getSavedVaultItems().filter(v => v.id !== id);
  localStorage.setItem(KEYS.VAULT, JSON.stringify(list));
}

// Vault Security PIN
export function getVaultPin(): string | null {
  return localStorage.getItem(KEYS.VAULT_PIN);
}

export function setVaultPin(pin: string): void {
  // Store simple hash/value
  localStorage.setItem(KEYS.VAULT_PIN, btoa(pin));
}

export function verifyVaultPin(pin: string): boolean {
  const stored = getVaultPin();
  if (!stored) return true; // Unset means unlocked or setup needed
  return stored === btoa(pin);
}

// Poster Analyses Store
export function getSavedPosterAnalyses(): PosterAnalysis[] {
  const saved = localStorage.getItem(KEYS.POSTERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load poster analyses:', e);
    }
  }
  return [];
}

export function savePosterAnalysis(poster: PosterAnalysis): void {
  const list = getSavedPosterAnalyses();
  list.unshift(poster);
  localStorage.setItem(KEYS.POSTERS, JSON.stringify(list));
}

