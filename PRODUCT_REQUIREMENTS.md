# PlacementOS — Product Requirements Document

## 1. Product Overview

**Product Name:** PlacementOS  
**Tagline:** "Your AI Placement Coach"  
**Vision:** Take a student from "I don't know where to start" to "I'm interview-ready for Amazon, Microsoft, TCS, Infosys, startups, and off-campus roles."

**Core Promise:** A single platform that replaces scattered WhatsApp groups, Excel trackers, YouTube playlists, and paid coaching — giving every student, regardless of college or background, a personalized AI-powered placement preparation experience.

## 2. Target Audience

| Segment | Description | Size Signal |
|---------|-------------|-------------|
| Primary | 3rd/4th year engineering students in India | 1.5M+ students/year |
| Secondary | 2nd year students starting early prep | Growing |
| Tertiary | Working professionals preparing for switch | Adjacent market |

**Geography:** India first (Hindi + English), then东南亚 (Southeast Asia) and Middle East.

## 3. User Personas

### Persona A: The Lost Beginner (Arjun, 3rd year, tier-2 college)
- Pain: "I don't know what to study. Everyone says DSA but where do I start?"
- Behavior: Has attempted 5 LeetCode questions, gave up. Watches placement vlogs.
- Need: Hand-holding, clear roadmap, progress visibility.

### Persona B: The Grinder (Priya, 4th year, tier-1 college)
- Pain: "I've done 200 LeetCode questions but still fail interviews. My resume gets no callbacks."
- Behavior: Daily LeetCode, has a resume but no interview practice.
- Need: Resume analysis, mock interviews, company-specific prep.

### Persona C: The Off-Campus Struggler (Rahul, passed out, no campus placements)
- Pain: "No companies come to my college. I need to find and apply to jobs myself."
- Behavior: Scrolling LinkedIn, Naukri, Internshala randomly.
- Need: Job aggregation, application tracking, skill gap analysis.

### Persona D: The HR Filter Victim (Neha, 4th year, low CGPA)
- Pain: "My CGPA is 6.5. Most companies filter me out before I even get a chance."
- Behavior: Avoiding placement prep, demotivated.
- Need: Off-campus focus, startup prep, project-building to compensate.

## 4. Functional Requirements

### Module 1: Placement Dashboard
**FR-01:** Display an overall Placement Score (0-100) derived from sub-scores.
**FR-02:** Show DSA progress bar with questions solved vs. target.
**FR-03:** Show Resume Score with last analysis date.
**FR-04:** Show Interview Readiness score based on mock interview history.
**FR-05:** Show Aptitude and Communication scores.
**FR-06:** Display a target score and estimated timeline to reach it.
**FR-07:** Show daily motivational quote or tip.

### Module 2: AI Roadmap Generator
**FR-08:** Onboarding flow capturing: college, branch, year, CGPA, target companies, DSA level, preferred role.
**FR-09:** AI generates a month-by-month roadmap based on input.
**FR-10:** Roadmap is editable (drag-drop topics).
**FR-11:** Roadmap progress is tracked automatically via DSA sync.
**FR-12:** Allow roadmap regeneration with updated inputs.
**FR-13:** Roadmap includes milestones (e.g., "Complete 50 questions", "First mock interview").

### Module 3: DSA Tracker
**FR-14:** Connect LeetCode, GeeksForGeeks, HackerRank via username/API.
**FR-15:** Auto-sync: questions solved, streak, difficulty distribution.
**FR-16:** AI analysis of strong/weak topics with recommendations.
**FR-17:** Topic-wise breakdown with target to reach "strong" status.
**FR-18:** Weekly DSA goal setting and streak tracking.

### Module 4: AI Coding Mentor
**FR-19:** Paste code (Python, Java, C++, JavaScript, Go).
**FR-20:** AI returns: time complexity, space complexity, better approach, optimized code.
**FR-21:** Support follow-up questions on the same code.
**FR-22:** History of pasted codes and explanations.

### Module 5: Resume Analyzer
**FR-23:** Upload PDF resume.
**FR-24:** Parse and extract sections (education, experience, projects, skills).
**FR-25:** AI scores: ATS compatibility, keywords, projects depth, skills relevance.
**FR-26:** Generate a bullet-point list of improvements.
**FR-27:** Side-by-side comparison with a "good resume" template.
**FR-28:** Track score over time (after each revision).

### Module 6: Project Builder Assistant
**FR-29:** User inputs: "I want a project for [domain] using [tech stack]."
**FR-30:** AI generates: project idea, architecture diagram (text), database schema, API endpoints, deployment plan.
**FR-31:** Export as PDF or Markdown.
**FR-32:** Suggest 3 project ideas at different difficulty levels.

### Module 7: Mock Interview System
**FR-33:** Technical interview mode: AI asks DSA/CS fundamentals questions.
**FR-34:** HR interview mode: Behavioral questions (Tell me about yourself, etc.).
**FR-35:** AI evaluates answer quality, correctness, and confidence.
**FR-36:** Score each interview (0-100) with feedback.
**FR-37:** History of all interviews with recorded answers.
**FR-38:** Timer for answers (realistic interview pressure).

### Module 8: Company-Specific Preparation
**FR-39:** Select target company (Amazon, Microsoft, Google, TCS, Infosys, etc.).
**FR-40:** Show company: OA pattern, interview rounds, frequently asked topics.
**FR-41:** Curated DSA topic list weighted by company frequency.
**FR-42:** Past interview experiences from other students (crowdsourced).

### Module 9: Aptitude Preparation
**FR-43:** Topics: Percentages, Probability, Time & Work, P&C, etc.
**FR-44:** AI generates infinite practice sets with varying difficulty.
**FR-45:** Track accuracy and speed per topic.
**FR-46:** Mistake bank — review incorrect answers with explanations.

### Module 10: Behavioral Coach
**FR-47:** AI teaches communication frameworks (STAR, etc.).
**FR-48:** Practice sessions with AI feedback on phrasing.
**FR-49:** Body language tips (video mode — stretch goal).
**FR-50:** HR answer templates that adapt to user's background.

### Module 11: Job Finder
**FR-51:** Aggregate jobs from LinkedIn, Internshala, Wellfound, Naukri.
**FR-52:** Filter by role, location, experience, company.
**FR-53:** Match jobs to user's profile automatically.
**FR-54:** "Quick Apply" redirect to original listing.

### Module 12: Application Tracker
**FR-55:** Add applications manually or via job finder.
**FR-56:** Track stages: Applied → OA Received → Interview → Offer → Rejected.
**FR-57:** Kanban-style board view.
**FR-58:** Stats: conversion rate, average response time, offers.

### Module 13: Study Groups
**FR-59:** Create/join groups by target company or topic.
**FR-60:** Group dashboard: shared progress, active members.
**FR-61:** Group chat or discussion thread.
**FR-62:** Leaderboard within groups.

### Module 14: Placement Analytics
**FR-63:** Track study hours (manual log or timer).
**FR-64:** Track questions solved over time (daily/weekly/monthly).
**FR-65:** Resume score history graph.
**FR-66:** Interview performance trend.

## 5. Non-Functional Requirements

### Performance
**NFR-01:** Dashboard loads in <2 seconds on 3G.
**NFR-02:** AI responses in <5 seconds (streaming preferred).
**NFR-03:** DSA sync completes in <10 seconds.
**NFR-04:** PDF resume parsing in <15 seconds.

### Scalability
**NFR-05:** Support 10,000 concurrent users for MVP.
**NFR-06:** Horizontal scaling via Supabase + Vercel edge functions.
**NFR-07:** AI requests queued to avoid rate-limit saturation.

### Security
**NFR-08:** OAuth for platform connections (no password storage for LeetCode, etc.).
**NFR-09:** Resume PDFs stored securely (Cloudflare R2, signed URLs).
**NFR-10:** API keys for AI providers stored in environment variables.
**NFR-11:** Rate limiting on AI endpoints (20 req/day free, unlimited pro).

### Availability
**NFR-12:** 99.5% uptime (Vercel + Supabase SLA).
**NFR-13:** Graceful degradation: if AI is down, cached roadmaps and static content still serve.

### Data
**NFR-14:** All user data exportable as JSON.
**NFR-15:** Account deletion within 48 hours of request.
**NFR-16:** Backups every 24 hours (Supabase native).

## 6. Tech Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind + ShadCN | Fast iterations, SEO-ready, vast ecosystem |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) | Single provider, scales to millions, reduces ops |
| AI (Phase 1) | Gemini 2.5 Flash + OpenAI GPT-5 API | Cost-effective flash + powerful reasoning |
| AI (Phase 2) | Open-source models (Llama, Mistral) | Cost reduction, data privacy |
| Vector DB | Pinecone | RAG for interview Q&A, company experiences |
| File Storage | Cloudflare R2 | S3-compatible, free tier, no egress fees |
| Deployment | Vercel (frontend), Supabase (backend) | Zero-ops, student-friendly |

## 7. Success Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| DAU | 500 | 5,000 |
| MAU | 2,000 | 20,000 |
| DSA accounts connected | 60% of users | 75% of users |
| Mock interviews completed | 1,000/month | 10,000/month |
| Resumes analyzed | 500 | 5,000 |
| Free → Pro conversion | 3% | 5% |
| 7-day retention | 30% | 45% |
| NPS | 40 | 60 |

## 8. Constraints & Assumptions

**Assumptions:**
- Students have reliable internet (4G+).
- Students use LeetCode/GFG/HackerRank already or are willing to start.
- AI model costs will decrease over time (Gemini Flash is already $0.08/1M tokens).
- Users will pay ₹499-999/month for placement prep (validated by existing coaching market).

**Constraints:**
- Solo or small team (2-3 devs max).
- No budget for paid ads initially (organic growth via college ambassadors).
- Must launch before placement season (July–September for most Indian colleges).
- AI rate limits on free tier (Gemini: 60 req/min, OpenAI: variable).
