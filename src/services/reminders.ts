import { ReminderItem } from '../types';

/**
 * Browser notification permission helper
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Triggers a browser desktop notification if permitted
 */
export function sendBrowserNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`DECODEIQ: ${title}`, {
        body,
        icon: '/logo.svg',
        tag: 'missed-reminder',
      });
    } catch (e) {
      console.error('Failed to trigger notification:', e);
    }
  }
}

/**
 * Checks if a reminder date/time is past
 */
export function isReminderOverdue(reminder: ReminderItem): boolean {
  if (reminder.status === 'COMPLETED') return false;
  const remDateTime = new Date(`${reminder.date}T${reminder.time || '00:00'}`);
  return remDateTime.getTime() < Date.now();
}

