# PlacementOS — User Stories

## Epic 1: Onboarding & Authentication

### US-001 — Account Creation
> As a student, I want to sign up with my college email so that I can access placement resources.

**Acceptance Criteria:**
- Sign up with email + password or Google OAuth.
- College email domain validation (optional, can bypass).
- Email verification required before first login.
- On failure: clear error message (email taken, weak password, invalid email).

**Edge Cases:**
- User signs up with non-college email (Gmail) — allowed but prompts "Enter your college name manually."
- User signs up with same email twice — show "Account already exists. Log in instead?"
- Network failure during signup — retry button, no data loss.

---

### US-002 — Onboarding Questionnaire
> As a new student, I want to answer questions about my background so that the platform can personalize my experience.

**Acceptance Criteria:**
- Collect: College, Branch, Current Year, CGPA, Target Companies (multi-select), DSA Level (Beginner/Intermediate/Advanced), Preferred Role.
- Progress bar visible during onboarding.
- Can skip and fill later (dashboard will show "incomplete profile" warning).
- On completion → redirect to Dashboard with generated roadmap.

**Edge Cases:**
- User enters unrealistic CGPA (>10) — clamp to max value with a note.
- User selects 0 target companies — minimum 1 required.
- User is in 1st year — roadmap adjusts to longer timeline.
- User leaves mid-onboarding — resume from where they left off on next login.

---

## Epic 2: Placement Dashboard

### US-003 — View Placement Score
> As a student, I want to see my overall Placement Score on a dashboard so that I know where I stand.

**Acceptance Criteria:**
- Score is 0-100, calculated from weighted sub-scores (DSA 30%, Resume 20%, Interview 20%, Aptitude 15%, Communication 15%).
- Each sub-score shown as a progress bar with percentage.
- Target score shown with estimated timeline.
- Score updates automatically when any sub-score changes.
- Score is cached and refreshed on page load or manual refresh.

**Edge Cases:**
- User has no data in a category — show "Not yet assessed" with a CTA to start.
- All scores at 0 — show encouraging empty state ("Start your journey!").
- Score drops after resume re-analysis — show delta indicator (↓5 points).

---

### US-004 — Daily Tip
> As a student, I want to see a daily placement tip on my dashboard so that I learn something new every day.

**Acceptance Criteria:**
- Tip shown at top of dashboard.
- Different tip every day (rotated from a curated list + AI-generated).
- Tippable: "Not helpful" feedback dismisses and shows a different one.

---

## Epic 3: AI Roadmap Generator

### US-005 — Generate Personalized Roadmap
> As a student, I want the AI to create a month-by-month study plan based on my profile so that I know exactly what to study each week.

**Acceptance Criteria:**
- Roadmap generated after onboarding completion.
- Each month contains: topics to cover, target questions, milestone checkpoints.
- Roadmap appears as a timeline view.
- Can regenerate if user is unsatisfied (limited to 3 regens/day on free tier).
- AI uses: target company, current level, months until placement season.

**Edge Cases:**
- User's target company is not in the database — AI generates a generic top-company roadmap.
- User has only 1 month until placements — roadmap compresses to weekly plan.
- AI generation fails — fallback to a pre-built template roadmap.
- User changes target company — roadmap regenerates with confirmation dialog.

---

### US-006 — Update Roadmap Progress
> As a student, I want topics on my roadmap to auto-mark as completed when I solve related DSA questions so that I don't have to manually track.

**Acceptance Criteria:**
- When DSA tracker syncs, related roadmap topics auto-update.
- Visual indicator: checkbox, progress %, and date completed.
- Manual override: user can mark topics as complete/incomplete.
- Roadmap completion percentage shown at top.

---

## Epic 4: DSA Tracker

### US-007 — Connect Coding Platform
> As a student, I want to connect my LeetCode/GeeksForGeeks/HackerRank account so that my progress is tracked automatically.

**Acceptance Criteria:**
- Enter username for each platform.
- Verify connection by fetching public profile.
- Show "Connected" status with last sync timestamp.
- Disconnect and reconnect allowed.
- Connection persists across sessions.

**Edge Cases:**
- Username not found on platform — clear error "Check your username on [platform]."
- Platform API rate-limited — show "Sync delayed. Will retry in 30 mins."
- User changes username — re-connection required.
- Private profile / no public data — show warning "Some data may not be accessible."

---

### US-008 — View DSA Analytics
> As a student, I want to see my solved questions, streaks, and topic-wise breakdown so that I know my weak areas.

**Acceptance Criteria:**
- Total questions solved (across all connected platforms, deduplicated).
- Current streak (consecutive days with at least 1 question).
- Difficulty distribution pie chart (Easy/Medium/Hard).
- Topic-wise bar chart with "Strong," "Average," "Weak" labels.
- AI recommendation: "Complete 30 Graph questions to improve."
- Weekly goal: set target questions/week, show progress.

**Edge Cases:**
- User has 0 questions solved — show "Start with Arrays & Strings!" recommended list.
- Streak broken — encouraging message ("Don't break your streak! Start with 1 easy question.")
- All topics are weak — celebrate the first topic that reaches "Average."
- Sync shows a huge batch of new questions — show "New data synced! +42 questions."

---

## Epic 5: AI Coding Mentor

### US-009 — Get Code Review
> As a student, I want to paste my code and get time/space complexity analysis and optimization suggestions so that I can write better code.

**Acceptance Criteria:**
- Paste code in editor with language auto-detection.
- AI returns: Time complexity, Space complexity, Explanation, Suggested improvement, Optimized code.
- Syntax highlighting in the code block.
- Follow-up questions allowed (chat-style).
- History of code reviews accessible.

**Edge Cases:**
- Code is over 200 lines — show "Large input may take longer." Warn at 500 lines.
- Code has syntax errors — AI can still attempt analysis but flags "Syntax errors detected."
- Empty submission — disabled button.
- AI response contains hallucinated complexity — user can flag as incorrect.
- Non-code content pasted (essay, JSON) — AI detects and asks "This doesn't look like code. Proceed anyway?"

---

## Epic 6: Resume Analyzer

### US-010 — Upload & Analyze Resume
> As a student, I want to upload my resume PDF and get an AI-powered score with improvement suggestions so that I can fix it before companies see it.

**Acceptance Criteria:**
- Drag-and-drop or click-to-upload PDF (max 5MB).
- Extract text via PDF parser.
- AI scores: ATS Compatibility (0-100), Keywords Match, Projects Quality, Skills Relevance.
- Bullet-point actionable suggestions.
- Side-by-side view: original vs. suggested improvements.
- Score history tracked over time.

**Edge Cases:**
- Uploaded file is not a PDF — reject with "Please upload a PDF file."
- Scanned image PDF (no selectable text) — show "Scanned PDF detected. Text extraction may be limited."
- File >5MB — reject with size limit message.
- Resume is in image-only format — suggest using a text-based PDF.
- Very short resume (<100 words) — flag "Resume seems incomplete."
- Multiple pages (4+) — warn "Resumes longer than 2 pages may be filtered by ATS."

---

### US-011 — Resume Score History
> As a student, I want to see how my resume score has changed over multiple analyses so that I can track improvement.

**Acceptance Criteria:**
- Line graph of score over time.
- Each analysis is a point with date stamp.
- Can click a point to see that version's suggestions.

---

## Epic 7: Mock Interview System

### US-012 — Take Technical Mock Interview
> As a student, I want the AI to conduct a technical interview with DSA questions so that I can practice before the real one.

**Acceptance Criteria:**
- AI asks DSA/CS fundamentals questions one at a time.
- Student types answer.
- AI evaluates: correctness (0-100), completeness, suggested better answer.
- Score after each question, final score at end.
- Timer (configurable: 30s/60s/120s per question).
- Session length: 5/10/15 questions.

**Edge Cases:**
- Student submits blank answer — prompt "Are you sure? You can say 'I don't know'."
- Student takes too long — auto-submit after timer expires.
- AI asks ambiguous question — student can ask for clarification (AI rephrases).
- Network drops mid-interview — progress saved, resume from last question.

---

### US-013 — Take HR Mock Interview
> As a student, I want the AI to conduct an HR interview with behavioral questions so that I can improve my soft skills.

**Acceptance Criteria:**
- AI asks HR questions ("Tell me about yourself," "Why this company?", "Strengths/Weaknesses").
- AI evaluates: confidence, structure (STAR), relevance, conciseness.
- Score and improvement tips after each answer.
- Session: 5 questions minimum.

---

## Epic 8: Company-Specific Preparation

### US-014 — View Company Prep Page
> As a student preparing for Amazon, I want to see Amazon's interview pattern, frequently asked topics, and past experiences so that I can prepare specifically for Amazon.

**Acceptance Criteria:**
- Company page with: OA pattern, interview rounds, DSA topic frequency, system design topics (for SDE-2+).
- Crowdsourced interview experiences from other users.
- Weighted DSA topics: "Must Do," "High Frequency," "Nice to Have."
- Link to relevant roadmap for this company.

**Edge Cases:**
- Company not in database — user can request addition, admin reviews.
- No interview experiences yet — show "Be the first to share your experience."
- Conflicting information — show with disclaimer "Based on user reports. May vary."

---

## Epic 9: Aptitude Preparation

### US-015 — Practice Aptitude Questions
> As a student, I want the AI to generate infinite aptitude practice sets so that I can master each topic.

**Acceptance Criteria:**
- Select topic: Percentages, Probability, Time & Work, P&C, etc.
- AI generates 10 questions per set.
- Timed mode (60s/question) vs. practice mode (no timer).
- Instant feedback with explanation.
- Accuracy tracking per topic.

**Edge Cases:**
- User answers all 10 correctly — celebrate and suggest harder difficulty.
- User fails same topic 3 times — recommend revisiting theory first (link to resource).
- AI generates duplicate question in same session — unlikely but de-duplicate.

---

## Epic 10: Job Finder

### US-016 — Find Matching Jobs
> As a student looking for off-campus opportunities, I want to see jobs aggregated from multiple portals that match my profile so that I don't miss any opportunity.

**Acceptance Criteria:**
- Jobs pulled from LinkedIn, Internshala, Wellfound, Naukri.
- Filter: role, location, experience, company, salary range.
- "Match Score" based on user's profile vs. job requirements.
- One-click redirect to original listing.
- Save/bookmark jobs.

**Edge Cases:**
- No jobs match filters — show "No results. Try broadening your filters."
- Job listing expired — mark as "Expired" with date.
- API fetch fails — show cached results from last successful fetch with "May be outdated" banner.
- Duplicate listings from multiple sources — deduplicate by company + role + location.

---

## Epic 11: Application Tracker

### US-017 — Track Job Applications
> As a student, I want to track all my job applications in a Kanban board so that I know where each application stands.

**Acceptance Criteria:**
- Stages: Saved → Applied → OA Received → Interview → Offer / Rejected.
- Drag-and-drop between stages.
- Add notes per application.
- Stats: total applied, interview rate, offer rate.
- Manual add or auto-add from Job Finder.

**Edge Cases:**
- User has 0 applications — empty state with "Find jobs to start tracking."
- User moves application to "Offer" but hasn't removed others — allow but flag "Pending applications still active."
- Duplicate application — detect and merge.

---

## Epic 12: Study Groups

### US-018 — Join a Study Group
> As a student preparing for Google, I want to join a group of other Google aspirants so that we can motivate each other.

**Acceptance Criteria:**
- Browse groups by target company or topic.
- Join group (open) or request to join (moderated).
- Group dashboard: members, shared progress, leaderboard.
- Group chat thread.

---

## Epic 13: Placement Analytics

### US-019 — View Analytics Dashboard
> As a student, I want to see graphs of my study hours, questions solved, and scores over time so that I can visualize my progress.

**Acceptance Criteria:**
- Daily/weekly/monthly views.
- Graphs: Questions solved over time, Study hours, Score trends (resume, interview, aptitude).
- Export analytics as PDF (pro feature).

---

## Epic 14: AI Agents

### US-020 — Chat with AI Career Agent
> As a student, I want to ask the AI career agent questions like "What skills should I learn for AI engineering?" so that I get personalized career advice.

**Acceptance Criteria:**
- Chat interface with the AI agent.
- Agent has context of user's profile and progress.
- 20 free chats/day on free tier, unlimited on Pro.
- Chat history saved and searchable.

**Edge Cases:**
- User hits daily limit — show "Upgrade to Pro for unlimited chats" with timer showing reset.
- AI gives incorrect advice — user can flag "Incorrect."
- Inappropriate query — AI redirects to placement-related topics.
