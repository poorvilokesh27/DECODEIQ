import { PosterAnalysis } from '../types';

/**
 * Local deterministic analysis engine for posters, announcements, schedules, and event images.
 */
export function analyzePosterText(
  extractedText: string,
  posterTitle: string = 'Uploaded Poster / Document'
): PosterAnalysis {
  const cleanText = extractedText.trim();
  if (!cleanText) {
    return {
      id: `poster-${Date.now()}`,
      title: posterTitle,
      summary: 'No readable text was provided for analysis.',
      mainPurpose: 'Unspecified',
      highlights: [],
      dateTimes: [],
      location: 'Unspecified',
      audience: 'General Audience',
      requiredAction: 'None specified',
      eligibility: 'Open to all unless stated otherwise',
      contactRegistration: 'No registration details detected',
      missingDetails: ['Extracted text is empty. Please verify image or manually enter details.'],
      simpleExplanation: 'No text was found in the image. You can type or paste text manually into the editor.',
      nextSteps: ['Check if the image is clear or re-upload a higher resolution image.'],
      extractedText: '',
      createdAt: new Date().toISOString()
    };
  }

  const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const textLower = cleanText.toLowerCase();

  // Extract Dates & Times
  const dateRegex = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\b\d{1,2}-\d{1,2}-\d{2,4})\b[^\n,.]*/gi;
  const timeRegex = /\b(?:\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm)|midnight|noon|hrs)\b/gi;

  const foundDates = cleanText.match(dateRegex) || [];
  const foundTimes = cleanText.match(timeRegex) || [];

  const dateTimesCombined: string[] = [];
  foundDates.forEach(d => dateTimesCombined.push(d.trim()));
  foundTimes.forEach(t => {
    if (!dateTimesCombined.some(d => d.includes(t))) {
      dateTimesCombined.push(t.trim());
    }
  });

  // Extract Location / Venue
  let location = 'Not explicitly mentioned';
  const locMatch = cleanText.match(/(?:venue|location|room|hall|auditorium|building|campus|online|zoom|meet|at|place):\s*([^\n]+)/i);
  if (locMatch) {
    location = locMatch[1].trim();
  } else if (textLower.includes('online') || textLower.includes('zoom') || textLower.includes('google meet')) {
    location = 'Virtual / Online';
  } else if (textLower.includes('auditorium') || textLower.includes('hall') || textLower.includes('lab')) {
    const matchedLine = lines.find(l => /auditorium|hall|lab|room|campus/i.test(l));
    if (matchedLine) location = matchedLine.trim();
  }

  // Purpose Detection
  let mainPurpose = 'General Information Announcement';
  if (textLower.includes('hackathon') || textLower.includes('coding') || textLower.includes('competition')) {
    mainPurpose = 'Competition / Hackathon Announcement';
  } else if (textLower.includes('exam') || textLower.includes('timetable') || textLower.includes('schedule')) {
    mainPurpose = 'Exam / Test Schedule';
  } else if (textLower.includes('internship') || textLower.includes('hiring') || textLower.includes('job')) {
    mainPurpose = 'Internship & Career Opportunity';
  } else if (textLower.includes('workshop') || textLower.includes('webinar') || textLower.includes('session')) {
    mainPurpose = 'Workshop / Educational Session';
  } else if (textLower.includes('deadline') || textLower.includes('submission')) {
    mainPurpose = 'Submission Deadline Notice';
  }

  // Registration & Contact
  let contactRegistration = 'No specific contact info detected';
  const regMatch = cleanText.match(/(?:register|apply|link|contact|website|email|qr code|form):\s*([^\n]+)/i);
  if (regMatch) {
    contactRegistration = regMatch[0].trim();
  } else {
    const urlMatch = cleanText.match(/https?:\/\/[^\s]+/gi);
    const emailMatch = cleanText.match(/[\w.-]+@[\w.-]+\.\w+/gi);
    if (urlMatch || emailMatch) {
      contactRegistration = [...(urlMatch || []), ...(emailMatch || [])].join(' | ');
    }
  }

  // Eligibility
  let eligibility = 'Open to participants';
  if (textLower.includes('students') || textLower.includes('undergraduate') || textLower.includes('batch')) {
    const eligLine = lines.find(l => /student|undergraduate|batch|year|eligibil/i.test(l));
    if (eligLine) eligibility = eligLine.trim();
  }

  // Highlights extraction
  const highlights: string[] = [];
  lines.forEach(line => {
    if (line.length > 15 && line.length < 120 && !highlights.includes(line)) {
      if (/date|time|prize|reward|winner|speaker|topic|rule|fee|entry|free|contact/i.test(line)) {
        highlights.push(line.trim());
      }
    }
  });

  if (highlights.length === 0) {
    highlights.push(...lines.slice(0, 4).map(l => l.trim()));
  }

  // Required Action
  let requiredAction = 'Review key dates and check eligibility.';
  if (textLower.includes('register') || textLower.includes('apply')) {
    requiredAction = 'Complete registration before the specified deadline.';
  } else if (textLower.includes('submit')) {
    requiredAction = 'Prepare and submit required assignments/documents.';
  } else if (textLower.includes('attend') || textLower.includes('join')) {
    requiredAction = 'Mark your calendar and attend the scheduled session.';
  }

  // Missing or Unclear Details
  const missingDetails: string[] = [];
  if (dateTimesCombined.length === 0) missingDetails.push('Exact date or deadline time is not clearly mentioned.');
  if (location === 'Not explicitly mentioned') missingDetails.push('Venue or event location is omitted.');
  if (contactRegistration.includes('No specific contact')) missingDetails.push('Registration link or contact email is missing.');

  // Simple Explanation
  const simpleExplanation = `This poster is a ${mainPurpose.toLowerCase()}. ${dateTimesCombined.length > 0 ? `Key date mentioned is: ${dateTimesCombined[0]}.` : ''} ${requiredAction}`;

  // Summary
  const headline = lines[0] ? lines[0].slice(0, 60) : 'Poster Announcement';
  const summary = `Announcement regarding "${headline}". ${mainPurpose}. Target audience: ${eligibility}.`;

  // Next Steps
  const nextSteps: string[] = [
    `Verify registration and deadline details (${dateTimesCombined[0] || 'Check poster text'}).`,
    `Set a reminder if you plan to attend or participate.`,
    `Share with relevant peers or teammates.`
  ];

  return {
    id: `poster-${Date.now()}`,
    title: headline,
    summary,
    mainPurpose,
    highlights: highlights.slice(0, 6),
    dateTimes: dateTimesCombined.slice(0, 5),
    location,
    audience: eligibility,
    requiredAction,
    eligibility,
    contactRegistration,
    missingDetails,
    simpleExplanation,
    nextSteps,
    extractedText: cleanText,
    createdAt: new Date().toISOString()
  };
}

