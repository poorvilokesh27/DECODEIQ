import { Finding, PosterAnalysis, AnalysisResult } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'missed';
  text: string;
  timestamp: string;
  contextType?: 'finding' | 'poster' | 'conversation';
  contextTitle?: string;
  isAssumption?: boolean;
}

/**
 * Local AI conversational engine for "Ask MISSED".
 * Answers questions based on the provided evidence, findings, and poster text.
 */
export function generateChatbotResponse(
  userQuery: string,
  context?: {
    finding?: Finding;
    poster?: PosterAnalysis;
    analysis?: AnalysisResult;
  }
): { text: string; isAssumption?: boolean } {
  const queryLower = userQuery.toLowerCase();

  // Scenario 1: Ask MISSED about a specific Finding
  if (context?.finding) {
    const f = context.finding;
    if (queryLower.includes('why') && (queryLower.includes('critical') || queryLower.includes('important') || queryLower.includes('urgent'))) {
      return {
        text: `This item "${f.title}" is marked as ${f.priority} priority because it involves a time-sensitive deadline or commitment ("${f.sourceMessage}"). Missing it could disrupt your team's workflow or project timeline.`,
      };
    }
    if (queryLower.includes('what do i need to do') || queryLower.includes('next step') || queryLower.includes('action')) {
      return {
        text: f.suggestedNextStep 
          ? `Recommended Action: ${f.suggestedNextStep}` 
          : `You should verify this message with ${f.relevantPerson || 'the sender'} ("${f.sourceMessage}").`,
      };
    }
    if (queryLower.includes('who') || queryLower.includes('responsible') || queryLower.includes('assigned')) {
      return {
        text: f.relevantPerson 
          ? `${f.relevantPerson} is directly associated with this finding.` 
          : `The original message does not explicitly name an assignee, but it was sent by the speaker in the conversation source: "${f.sourceMessage}".`,
        isAssumption: !f.relevantPerson
      };
    }
    if (queryLower.includes('mean') || queryLower.includes('explain') || queryLower.includes('simple')) {
      return {
        text: `In simple terms: ${f.description} Explicit source text: "${f.sourceMessage}".`,
      };
    }
  }

  // Scenario 2: Ask MISSED about a Poster / Document Image
  if (context?.poster) {
    const p = context.poster;
    if (queryLower.includes('summary') || queryLower.includes('about') || queryLower.includes('overview')) {
      return {
        text: `Poster Summary: ${p.simpleExplanation}`,
      };
    }
    if (queryLower.includes('deadline') || queryLower.includes('date') || queryLower.includes('when')) {
      return {
        text: p.dateTimes.length > 0 
          ? `Extracted dates/times: ${p.dateTimes.join(', ')}.` 
          : `No explicit date or time was found in the poster text. Note: This could be missing context.`,
      };
    }
    if (queryLower.includes('action') || queryLower.includes('do') || queryLower.includes('what should i do')) {
      return {
        text: `Expected Action: ${p.requiredAction}\nNext steps: ${p.nextSteps.join(' ')}`,
      };
    }
    if (queryLower.includes('eligible') || queryLower.includes('who can') || queryLower.includes('audience')) {
      return {
        text: `Target Audience & Eligibility: ${p.eligibility}`,
      };
    }
    if (queryLower.includes('missing') || queryLower.includes('unclear')) {
      const details = p.missingDetails || [];
      return {
        text: details.length > 0 
          ? `Missing or ambiguous details: ${details.join(' | ')}` 
          : `All standard event fields (date, location, contact) were detected.`,
      };
    }
  }

  // Scenario 3: Ask MISSED about Full Conversation Analysis
  if (context?.analysis) {
    const a = context.analysis;
    if (queryLower.includes('summarize') || queryLower.includes('three points') || queryLower.includes('key points')) {
      return {
        text: `Here is the 3-point summary for "${a.title}":\n\n1. Overview: ${a.summary}\n2. Urgent Items: ${a.findings.length} findings (${a.tasks.length} action items).\n3. Next Steps: Check your Action Items tab to mark tasks completed.`,
      };
    }
    if (queryLower.includes('decision change') || queryLower.includes('changed') || queryLower.includes('moved')) {
      if (a.decisionChanges.length > 0) {
        const dc = a.decisionChanges[0];
        return {
          text: `Decision Change Detected (${dc.topic}): Earlier decision was "${dc.previousDecision}". The latest updated decision is "${dc.latestDecision}".`,
        };
      }
      return {
        text: `No conflicting decision changes were detected in this conversation.`,
      };
    }
    if (queryLower.includes('who') || queryLower.includes('responsible')) {
      const obligations = a.tasks.map(t => `${t.title} (Assigned to ${t.assignedTo})`).join('\n');
      return {
        text: obligations ? `Task Responsibilities:\n${obligations}` : `No specific task assignments were found.`,
      };
    }
  }

  // General Questions / Fallback Response
  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
    return {
      text: `Hello! I'm DECODEIQ AI. I decode your conversations, posters, and messages so you never miss a deadline or decision. What can I help you clarify today?`,
    };
  }

  if (queryLower.includes('how does') || queryLower.includes('privacy') || queryLower.includes('local')) {
    return {
      text: `DECODEIQ processes all your conversation text locally inside your browser by default. Your data is never sent to external servers unless you explicitly configure an AI provider secret key on your server.`,
    };
  }

  return {
    text: `Based on the current context: "${userQuery}". Here are the facts extracted from your text:\n\n` +
          `• Summary: ${context?.analysis?.summary || context?.poster?.summary || 'Text analyzed locally'}\n` +
          `• Actionable Insight: Check your timeline and highlighted cards for verified deadlines.\n\n` +
          `Would you like me to elaborate on a specific task or deadline?`,
    isAssumption: true,
  };
}
