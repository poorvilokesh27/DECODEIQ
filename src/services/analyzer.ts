import { ParsedMessage, Finding, DecisionChange, TaskItem, RiskConsequence, AnalysisResult, PriorityLevel, ConfidenceType } from '../types';
import { parseConversation } from './parser';

// Helper date & keyword patterns
const DEADLINE_REGEX = /\b(by|before|until|due|deadline|scheduled for|moved to|rescheduled to|pushed to)\s+([A-Za-z0-9\s,:\-/]+?\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|am|pm|\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?))\b/i;

const TASK_KEYWORDS = [
  'please', 'need to', 'must', 'can you', 'should', 'action item', 'deliver',
  'submit', 'finish', 'send', 'review', 'verify', 'update', 'complete', 'prepare', 'assigned'
];

const DECISION_CHANGE_KEYWORDS = [
  'moved to', 'rescheduled', 'changed', 'updated', 'correction', 'instead of',
  'scrapped', 'postponed', 'cancelled', 'canceled', 'new plan', 'revised', 'actually'
];

/**
 * Main analysis function that runs deterministic local analysis on conversation text.
 */
export function analyzeConversation(
  rawText: string,
  title: string = 'Untitled Analysis',
  userName: string = 'You'
): AnalysisResult {
  const parsedMessages = parseConversation(rawText);

  const findings: Finding[] = [];
  const decisionChanges: DecisionChange[] = [];
  const tasks: TaskItem[] = [];
  const consequences: RiskConsequence[] = [];

  const analysisId = `analysis-${Date.now()}`;
  const normalizedUserName = userName.trim().toLowerCase();

  // 1. Scan messages for Tasks & Obligations
  parsedMessages.forEach((msg) => {
    const textLower = msg.content.toLowerCase();
    
    // Check if task exists
    const hasTaskKeyword = TASK_KEYWORDS.some(kw => textLower.includes(kw));
    const isQuestion = msg.content.includes('?');

    if (hasTaskKeyword && !isQuestion) {
      // Determine assignment
      let isUserObligation = false;
      let assignedTo = msg.speaker;

      if (
        normalizedUserName &&
        normalizedUserName !== 'you' &&
        textLower.includes(normalizedUserName)
      ) {
        isUserObligation = true;
        assignedTo = userName;
      } else if (
        textLower.includes('you ') ||
        textLower.includes('can you') ||
        textLower.includes('please ') ||
        textLower.includes('your ')
      ) {
        // If someone is telling another speaker "can you...", then recipient is assigned
        isUserObligation = true;
        assignedTo = userName;
      } else if (textLower.includes('i will') || textLower.includes("i'll")) {
        assignedTo = msg.speaker;
        isUserObligation = msg.speaker.toLowerCase() === normalizedUserName;
      }

      // Check deadline in message
      const deadlineMatch = msg.content.match(DEADLINE_REGEX);
      const deadlineText = deadlineMatch ? deadlineMatch[2].trim() : undefined;

      const priority: PriorityLevel = (textLower.includes('asap') || textLower.includes('urgent') || textLower.includes('critical') || deadlineText) 
        ? 'HIGH' 
        : 'MEDIUM';

      const taskTitle = extractTaskTitle(msg.content);

      const taskItem: TaskItem = {
        id: `task-${tasks.length + 1}-${Date.now()}`,
        analysisId,
        title: taskTitle,
        assignedTo,
        isUserObligation,
        deadline: deadlineText,
        priority,
        completed: false,
        sourceMessage: msg.rawText,
        sourceMessageId: msg.id,
        createdAt: new Date().toISOString()
      };

      tasks.push(taskItem);

      // Create finding for Action Required
      findings.push({
        id: `finding-action-${findings.length + 1}`,
        analysisId,
        category: 'ACTION_REQUIRED',
        title: `Task: ${taskTitle}`,
        description: `Action assigned to ${assignedTo}. "${msg.content.slice(0, 100)}..."`,
        priority: isUserObligation ? (priority === 'HIGH' ? 'URGENT' : 'HIGH') : priority,
        confidence: 'CONFIRMED',
        relevantPerson: assignedTo,
        deadline: deadlineText,
        sourceMessage: msg.rawText,
        sourceMessageId: msg.id,
        sourceTimestamp: msg.timestamp,
        sourceLineIndex: msg.lineIndex,
        suggestedNextStep: isUserObligation ? `Review task requirements and mark completed when done.` : `Follow up with ${assignedTo}.`
      });
    }

    // 2. Scan for Unanswered Questions
    if (isQuestion && (textLower.includes('can someone') || textLower.includes('who has') || textLower.includes('where is') || textLower.includes('what is the status') || textLower.includes('has anyone'))) {
      findings.push({
        id: `finding-q-${findings.length + 1}`,
        analysisId,
        category: 'UNANSWERED_QUESTION',
        title: `Open Question from ${msg.speaker}`,
        description: `"${msg.content}"`,
        priority: 'MEDIUM',
        confidence: 'CONFIRMED',
        relevantPerson: msg.speaker,
        sourceMessage: msg.rawText,
        sourceMessageId: msg.id,
        sourceTimestamp: msg.timestamp,
        sourceLineIndex: msg.lineIndex,
        suggestedNextStep: `Provide a response or check if a team member answered.`
      });
    }
  });

  // 3. Scan for Decision Changes & Schedule Updates across messages
  for (let i = 0; i < parsedMessages.length; i++) {
    const msg = parsedMessages[i];
    const textLower = msg.content.toLowerCase();

    const isChangeNotice = DECISION_CHANGE_KEYWORDS.some(kw => textLower.includes(kw));
    if (isChangeNotice) {
      // Look back for an earlier message on similar topic
      for (let j = 0; j < i; j++) {
        const prevMsg = parsedMessages[j];
        const topicMatch = findTopicOverlap(prevMsg.content, msg.content);
        if (topicMatch) {
          const changeItem: DecisionChange = {
            id: `change-${decisionChanges.length + 1}`,
            topic: topicMatch.topic,
            previousDecision: prevMsg.content,
            latestDecision: msg.content,
            changeSummary: topicMatch.summary,
            previousMessage: prevMsg.rawText,
            latestMessage: msg.rawText,
            previousMessageId: prevMsg.id,
            latestMessageId: msg.id,
            confidence: 'INFERRED'
          };
          decisionChanges.push(changeItem);

          findings.push({
            id: `finding-change-${findings.length + 1}`,
            analysisId,
            category: 'DECISION_CHANGED',
            title: `Decision Updated: ${topicMatch.topic}`,
            description: `Earlier: "${prevMsg.content.slice(0, 70)}..." → Updated to: "${msg.content.slice(0, 70)}..."`,
            priority: 'URGENT',
            confidence: 'INFERRED',
            relevantPerson: msg.speaker,
            sourceMessage: msg.rawText,
            sourceMessageId: msg.id,
            sourceTimestamp: msg.timestamp,
            sourceLineIndex: msg.lineIndex,
            suggestedNextStep: `Confirm new details with ${msg.speaker} and adjust calendar or notes.`
          });
          break;
        }
      }
    }
  }

  // 4. Scan for Critical Deadlines
  parsedMessages.forEach((msg) => {
    const deadlineMatch = msg.content.match(DEADLINE_REGEX);
    if (deadlineMatch) {
      const deadlineVal = deadlineMatch[2].trim();
      // Avoid duplicate deadline findings if already covered in task
      const alreadyCovered = findings.some(f => f.sourceMessage === msg.rawText && f.category === 'CRITICAL');
      if (!alreadyCovered) {
        findings.push({
          id: `finding-critical-${findings.length + 1}`,
          analysisId,
          category: 'CRITICAL',
          title: `Deadline Highlight: ${deadlineVal}`,
          description: `${msg.speaker} mentioned deadline: "${msg.content}"`,
          priority: 'URGENT',
          confidence: 'CONFIRMED',
          relevantPerson: msg.speaker,
          deadline: deadlineVal,
          sourceMessage: msg.rawText,
          sourceMessageId: msg.id,
          sourceTimestamp: msg.timestamp,
          sourceLineIndex: msg.lineIndex,
          suggestedNextStep: `Add reminder for ${deadlineVal}.`
        });
      }
    }
  });

  // 5. Generate Consequences ("What happens if I miss this?")
  if (findings.some(f => f.category === 'CRITICAL' || f.category === 'DECISION_CHANGED') && tasks.length > 0) {
    consequences.push({
      id: `risk-1`,
      title: `Potential Misalignment on Project Schedule`,
      explanation: `Decisions or deadlines were revised in recent messages. Continuing with obsolete assumptions may lead to missed deliverables or duplicated work.`,
      riskLevel: 'HIGH',
      connectedFindings: findings.slice(0, 2).map(f => f.id),
      supportingMessages: parsedMessages.slice(-2).map(m => m.rawText),
      recommendedAction: `Verify updated deadlines with your team before completing pending tasks.`,
      isPossibility: true
    });
  }

  if (tasks.some(t => t.isUserObligation && !t.completed)) {
    consequences.push({
      id: `risk-2`,
      title: `Overdue Action Items`,
      explanation: `There are direct commitments or requests assigned to you in the discussion that have not yet been marked completed.`,
      riskLevel: 'MEDIUM',
      connectedFindings: tasks.filter(t => t.isUserObligation).map(t => t.id),
      supportingMessages: tasks.filter(t => t.isUserObligation).map(t => t.sourceMessage),
      recommendedAction: `Review personal obligations in the "My Action Items" tab.`,
      isPossibility: true
    });
  }

  // 6. Generate Summary
  const summary = generateSummaryText(parsedMessages, findings, tasks, decisionChanges);

  return {
    id: analysisId,
    title,
    userName,
    summary,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    processingMode: 'LOCAL',
    totalMessages: parsedMessages.length,
    findings,
    decisionChanges,
    tasks,
    consequences,
    rawText,
    createdAt: new Date().toISOString()
  };
}

/**
 * Helper to clean up task title from message line
 */
function extractTaskTitle(content: string): string {
  let clean = content.replace(/^\[.*?\]\s*[A-Za-z0-9_\-\s]+:\s*/, '');
  if (clean.length > 80) {
    clean = clean.slice(0, 77) + '...';
  }
  return clean;
}

/**
 * Detects common topic overlaps between earlier and later messages (e.g. meeting time, location, draft version)
 */
function findTopicOverlap(msg1: string, msg2: string): { topic: string; summary: string } | null {
  const m1Lower = msg1.toLowerCase();
  const m2Lower = msg2.toLowerCase();

  if ((m1Lower.includes('meeting') || m1Lower.includes('call') || m1Lower.includes('sync')) &&
      (m2Lower.includes('meeting') || m2Lower.includes('call') || m2Lower.includes('sync') || m2Lower.includes('moved') || m2Lower.includes('time'))) {
    return {
      topic: 'Meeting Schedule',
      summary: 'Meeting date or time was updated in a subsequent message.'
    };
  }

  if ((m1Lower.includes('deadline') || m1Lower.includes('due') || m1Lower.includes('submit')) &&
      (m2Lower.includes('deadline') || m2Lower.includes('extended') || m2Lower.includes('postponed') || m2Lower.includes('pushed'))) {
    return {
      topic: 'Submission Deadline',
      summary: 'Submission timeline was updated.'
    };
  }

  if ((m1Lower.includes('design') || m1Lower.includes('doc') || m1Lower.includes('version') || m1Lower.includes('link')) &&
      (m2Lower.includes('new link') || m2Lower.includes('updated doc') || m2Lower.includes('v2') || m2Lower.includes('instead'))) {
    return {
      topic: 'Document / Design Asset',
      summary: 'Reference link or asset version was revised.'
    };
  }

  return null;
}

/**
 * Generates structured summary narrative
 */
function generateSummaryText(
  messages: ParsedMessage[],
  findings: Finding[],
  tasks: TaskItem[],
  changes: DecisionChange[]
): string {
  if (messages.length === 0) return 'No conversation messages found.';

  const speakers = Array.from(new Set(messages.map(m => m.speaker))).join(', ');
  let summaryParts: string[] = [];

  summaryParts.push(`Discussion involving ${speakers} (${messages.length} messages analyzed).`);

  if (changes.length > 0) {
    summaryParts.push(`Key updates detected: ${changes.map(c => c.topic).join(', ')}.`);
  }

  if (tasks.length > 0) {
    summaryParts.push(`${tasks.length} action item(s) extracted across the thread.`);
  } else {
    summaryParts.push('No direct pending action items detected.');
  }

  if (findings.some(f => f.category === 'CRITICAL')) {
    summaryParts.push('Note: Thread contains time-sensitive deadlines requiring attention.');
  }

  return summaryParts.join(' ');
}

