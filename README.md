# MISSED. — Your Conversations, Decoded.

> **Tagline:** *"Don't read everything. Understand what matters."*  
> **Project Name:** DECODEIQ / MISSED.  
> **Project Type:** AI-Powered Conversation Intelligence Micro-App  
> **Privacy Architecture:** Local-First Privacy Engine with zero cloud transmission by default.

---

## 🌟 Overview & Key Capabilities

**MISSED.** is a premium, privacy-first conversation intelligence micro-app built to eliminate "the unread problem". Instead of wading through hundreds of chat messages, emails, or event posters, MISSED automatically extracts:

1. **Critical Updates & Deadlines:** Time-sensitive deliverables, submission cutoffs, and meeting times.
2. **Personal Obligation Finder:** Direct tasks assigned specifically to you versus other team members.
3. **Decision Change Detector:** Identifies schedule revisions, venue relocations, and version updates across thread history.
4. **Consequence Detector:** *"What happens if I miss this?"* — maps potential risks and recommended actions.
5. **Snap & Understand (OCR Visual Intelligence):** Upload or capture photos of posters, exam timetables, hackathon announcements, or screenshots to extract readable text, extract deadlines, and get simple explanations.
6. **My Private Vault:** Secure folder for sensitive notes, summaries, and key findings protected by PIN lock and client-side encryption rules.
7. **Ask MISSED Chatbot:** Contextual assistant that answers questions about specific messages, findings, or posters based strictly on empirical evidence.
8. **Smart Reminders:** Desktop notification alerts, snooze options, and deadline tracking.

---

## 🎨 Theme & Visual Identity System

MISSED includes **6 custom visual themes**:
1. 🌌 **Midnight Aurora** (Default): Deep purple foundation, indigo backdrop, electric cyan highlights.
2. 🪻 **Lavender Dream**: Light lavender, crisp white, soft violet accents.
3. 🌊 **Ocean Glass**: Marine blue, teal panels, translucent glassmorphism.
4. 🌲 **Forest Focus**: Dark emerald, mint highlights, serene green glows.
5. 🌅 **Sunset Glow**: Coral peach, warm plum, peach gradients.
6. 🔲 **Minimal Mono**: Clean high-contrast monochrome with restrained accents.

Includes full **reduced-motion preference support** adhering to `prefers-reduced-motion`.

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- Node.js `v18+` or `v20+` / `v24+`
- npm `v9+` or `v11+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 3. Build for Production Verification
```bash
npm run build
```

---

## 🔒 Demo Mode vs. Supabase Backend Mode

- **Local Privacy Demo Mode (Default):** Runs 100% locally in your browser out-of-the-box. No Supabase credentials or cloud secrets required.
- **Supabase Cloud Mode (Optional):** To enable authenticated user storage and server-side Edge Functions:
  1. Copy `.env.example` to `.env`.
  2. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  3. Execute SQL migration file: `supabase/migrations/20261009_initial_schema.sql`.

---

## 📜 Sample Demonstration Conversation for Judges

Judges can click the **"Load Sample Thread"** button anywhere in the application to instantly test analysis.

```text
[10:15 AM, 10/09/2026] Sarah (PM): Good morning team! Let's sync on the DECODEIQ release.
[10:17 AM, 10/09/2026] Alex (Tech Lead): The core AI engine is fully functional. But we need to update the submission deadline.
[10:19 AM, 10/09/2026] Sarah (PM): Wait, wasn't the submission due today at 5:00 PM?
[10:21 AM, 10/09/2026] Alex (Tech Lead): The organizers extended the deadline. The submission is now due tomorrow at 2:00 PM instead of 5:00 PM today.
[10:24 AM, 10/09/2026] Sarah (PM): Great! @You please verify the design system and finalize the demo video before 11:00 AM tomorrow.
[10:26 AM, 10/09/2026] You: Got it. I will finish the video recording by 9:00 AM.
[10:28 AM, 10/09/2026] David (QA): Has anyone checked the browser notification API on mobile Safari?
[10:31 AM, 10/09/2026] Sarah (PM): Also, we moved the demo presentation from Room 302 to the Main Stage Auditorium at 3:00 PM on Friday.
[10:35 AM, 10/09/2026] Alex (Tech Lead): Can someone update the repository README link in the submission portal?
```

---

## ✅ List of Implemented Features

- [x] Responsive Animated Dashboard with dynamic count metrics
- [x] Local Conversation Analysis Engine (regex + deterministic context parser)
- [x] Snap & Understand (Camera capture, image drag-and-drop, Tesseract OCR, poster analysis)
- [x] Important Highlights Engine (Critical, Action Required, Decision Changed, Unanswered Questions)
- [x] Decision Change Detector (Timeline of schedule revisions)
- [x] Personal Obligation Finder (Assigned to user vs. others)
- [x] Consequence Detector ("What happens if I miss this?")
- [x] Reminders & Browser Desktop Notifications with Snooze
- [x] Message History Archive (Search, filter, rename, clear history)
- [x] My Private Vault with 4-Digit PIN Lock & Notes Management
- [x] Ask MISSED Chatbot with contextual grounding and evidence links
- [x] 6-Theme Theme Switcher System + Reduced Motion Support
- [x] Supabase SQL Migrations with RLS & Edge Function Endpoint

---

## 🛠️ Stack & Technology Standard

- **Frontend:** React 19, Vite 6, TypeScript, Tailwind CSS v3, Framer Motion v12, Lucide React, Tesseract.js v6
- **Backend & Database:** Supabase JS v2, PostgreSQL with RLS, Supabase Edge Functions
- **Local Engine:** Pure TypeScript parser and deterministic keyword analysis service (`analyzer.ts`, `parser.ts`, `posterAnalyzer.ts`)

