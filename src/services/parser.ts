import { ParsedMessage } from '../types';

/**
 * Parses raw text into structured messages with speaker, timestamp, and content.
 */
export function parseConversation(rawText: string): ParsedMessage[] {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const messages: ParsedMessage[] = [];

  // Common Chat regex patterns
  // Pattern 1: [10:30 AM, 12/04/2026] Alex: Hey team
  // Pattern 2: Alex (10:30 AM): Hey team
  // Pattern 3: 10:30 Alex: Hey team
  // Pattern 4: Alex: Hey team
  const regexWhatsApp = /^\[?(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?(?:,\s*[\d/-]+)?)\]?\s*([A-Za-z0-9_\-\s]+?):\s*(.+)$/;
  const regexBracket = /^\[?([^\]]+)\]\s*([A-Za-z0-9_\-\s]+?):\s*(.+)$/;
  const regexColon = /^([A-Z][a-zA-Z0-9_\-\s]{1,20}):\s*(.+)$/;

  let currentSpeaker = 'System / Unknown';
  let currentTimestamp: string | undefined = undefined;
  let currentContent = '';
  let lineCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    lineCount++;

    let match = line.match(regexWhatsApp);
    if (match) {
      messages.push({
        id: `msg-${i}-${Date.now()}`,
        timestamp: match[1].trim(),
        speaker: match[2].trim(),
        content: match[3].trim(),
        rawText: line,
        lineIndex: i + 1,
      });
      continue;
    }

    match = line.match(regexBracket);
    if (match) {
      messages.push({
        id: `msg-${i}-${Date.now()}`,
        timestamp: match[1].trim(),
        speaker: match[2].trim(),
        content: match[3].trim(),
        rawText: line,
        lineIndex: i + 1,
      });
      continue;
    }

    match = line.match(regexColon);
    if (match) {
      messages.push({
        id: `msg-${i}-${Date.now()}`,
        speaker: match[1].trim(),
        content: match[2].trim(),
        rawText: line,
        lineIndex: i + 1,
      });
      continue;
    }

    // Fallback: If line doesn't start with a speaker pattern, append to previous message if available, else create generic message
    if (messages.length > 0) {
      messages[messages.length - 1].content += '\n' + line;
      messages[messages.length - 1].rawText += '\n' + line;
    } else {
      messages.push({
        id: `msg-${i}-${Date.now()}`,
        speaker: 'Participant',
        content: line,
        rawText: line,
        lineIndex: i + 1,
      });
    }
  }

  return messages;
}

