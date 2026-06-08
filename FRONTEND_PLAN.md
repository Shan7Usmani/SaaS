# PlacementOS Frontend Plan

## Page Hierarchy

```
/                          → Landing / Dashboard
├── /dashboard             → Placement Score overview + quick actions
├── /resume-analyzer       → Upload PDF → AI analysis → suggestions
├── /roadmap               → Profile form → AI-generated roadmap
├── /mock-interview        → Select type → AI interview session
├── /coding-mentor         → Paste code → AI review
├── /career                → AI career suggestions
├── /dsa-tracker           → LeetCode sync + progress charts
├── /aptitude              → AI-generated practice sets
├── /company               → Company-specific preparation
├── /applications          → Application tracker CRM
└── /settings              → Profile, preferences
```

### MVP Pages (Phase 1)

| Page | Route | Priority |
|------|-------|----------|
| Dashboard | `/dashboard` | P0 |
| Resume Analyzer | `/resume-analyzer` | P0 |
| Roadmap Generator | `/roadmap` | P0 |
| Mock Interview | `/mock-interview` | P0 |

---

## Component Hierarchy

```
RootLayout
├── Sidebar (collapsible navigation)
│   ├── NavItem (icon + label)
│   └── UserMenu (avatar, logout)
├── TopBar (breadcrumb, notification bell)
└── MainContent
    │
    ├── DashboardPage
    │   ├── PlacementScoreCard (circular progress)
    │   ├── ScoreBreakdown (radar chart)
    │   ├── QuickActionGrid
    │   │   ├── ActionCard ("Analyze Resume")
    │   │   ├── ActionCard ("Generate Roadmap")
    │   │   ├── ActionCard ("Mock Interview")
    │   │   └── ActionCard ("Review Code")
    │   └── RecentActivity (timeline list)
    │
    ├── ResumeAnalyzerPage
    │   ├── FileUploader (drag & drop PDF)
    │   ├── AnalysisStatus (progress indicator)
    │   ├── ResumeScoreCard (overall score)
    │   ├── ATSBreakdown (score bars per category)
    │   ├── MissingKeywords (tag list)
    │   └── SuggestionsList (priority cards)
    │
    ├── RoadmapPage
    │   ├── ProfileForm (college, branch, CGPA, targets)
    │   ├── RoadmapTimeline (month accordion)
    │   │   └── WeekCard (topics, tasks, resources)
    │   ├── ProgressBar (overall completion)
    │   └── CompanyTips (expandable cards)
    │
    └── MockInterviewPage
        ├── InterviewSetup (type, company, duration selectors)
        ├── InterviewSession
        │   ├── QuestionDisplay (timer, question text)
        │   ├── AnswerInput (textarea / voice)
        │   ├── SubmitButton
        │   └── FeedbackDisplay (scores per category)
        └── InterviewSummary
            ├── OverallScore
            ├── SkillRadar (radar chart)
            ├── StrengthsWeaknesses
            └── ImprovementPlan
```

### Shared Components

```
/ui
├── Button (variants: primary, secondary, ghost, danger)
├── Card (with optional header, footer)
├── Progress (linear + circular)
├── Badge (status, difficulty, category)
├── Input, Textarea, Select, Label
├── Dialog (modal overlay)
├── Tabs (horizontal tab switcher)
├── Toast (success/error notifications)
├── Skeleton (loading placeholders)
├── Tooltip
└── Avatar
```

---

## State Management Plan

### Global State (Zustand Store)

```typescript
// store/auth.ts
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
}

// store/placement.ts
interface PlacementState {
  score: PlacementScore | null;
  dsaProgress: number;
  resumeScore: number;
  interviewReadiness: number;
  aptitudeScore: number;
  communicationScore: number;
  refresh: () => Promise<void>;
}
```

### Server State (React Query / TanStack Query)

| Query Key | Data | Stale Time |
|-----------|------|------------|
| `["resume", userId]` | Resume analysis results | 24h |
| `["roadmap", profileHash]` | Generated roadmap | 7d |
| `["interview", sessionId]` | Interview session data | session |
| `["user", "progress"]` | Placement dashboard scores | 5min |

### Local State (React useState/useReducer)

| Feature | State |
|---------|-------|
| Resume Upload | `file: File, isUploading, progress` |
| Roadmap Form | `formData: ProfileForm, step: number` |
| Mock Interview | `questions: [], currentIndex, answers: [], isRecording` |
| AI Streaming | `streamingText, isStreaming, error` |

### Form State (React Hook Form + Zod)

All forms use `react-hook-form` with `zod` validation schemas.

---

## UI Implementation Roadmap

### Phase 1: Foundation (Week 1, Days 1-2)

```
Day 1:
  - Initialize Next.js 15 with TypeScript + Tailwind
  - Install ShadCN component library
  - Configure dark/light theme
  - Build shared /ui component primitives (Button, Card, Input, etc.)
  - Create RootLayout with sidebar navigation

Day 2:
  - Build Sidebar + TopBar components
  - Create Dashboard page with placement score overview
  - Build QuickActionCards
  - Add responsive breakpoints (mobile drawer sidebar)
```

### Phase 2: Resume Analyzer (Week 1, Days 3-4)

```
Day 3:
  - Build FileUploader with drag-and-drop
  - Create upload progress indicator
  - Build placeholder analysis status with skeleton animation

Day 4:
  - Build ResumeScoreCard with circular progress
  - Build ATSBreakdown with animated score bars
  - Build MissingKeywords tag cloud
  - Build SuggestionsList with priority indicators
  - Wire up mock data flows
```

### Phase 3: Roadmap Generator (Week 1, Days 5-6)

```
Day 5:
  - Build multi-step ProfileForm with validation
  - College, Branch, Year, CGPA, Target Companies, DSA Level
  - Add form persistence (localStorage on step change)

Day 6:
  - Build RoadmapTimeline with month accordion
  - Build WeekCard with expandable topics
  - Build ProgressBar
  - Build CompanyTips section
```

### Phase 4: Mock Interview (Week 2, Days 7-8)

```
Day 7:
  - Build InterviewSetup with type/company/duration selectors
  - Build QuestionDisplay with animated timer
  - Build AnswerInput with auto-resize textarea

Day 8:
  - Build FeedbackDisplay with score animations
  - Build InterviewSummary with radar chart
  - Wire up sequential question flow
  - Add keyboard shortcuts (Enter to submit)
```

### Phase 5: Polish (Week 2, Days 9-10)

```
Day 9:
  - Error boundaries on all AI pages
  - Loading skeletons for every data state
  - Empty states with illustrations
  - Toast notifications for all actions
  - Responsive testing (320px → 1920px)

Day 10:
  - Performance audit (Lighthouse)
  - Accessibility pass (aria labels, keyboard nav)
  - Animations (Framer Motion entrance + transitions)
  - Final integration testing
```

---

## Design System

### Colors

| Token | Light | Dark |
|-------|-------|------|
| `--primary` | Blue-600 (#2563eb) | Blue-400 (#60a5fa) |
| `--background` | White (#fff) | Gray-950 (#030712) |
| `--card` | White (#fff) | Gray-900 (#111827) |
| `--muted` | Gray-100 (#f3f4f6) | Gray-800 (#1f2937) |
| Score Low (0-40) | Red-500 | Red-400 |
| Score Mid (40-70) | Amber-500 | Amber-400 |
| Score High (70-100) | Emerald-500 | Emerald-400 |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Display (score) | 5xl | 800 |
| Page title | 3xl | 700 |
| Section heading | xl | 600 |
| Card title | base | 600 |
| Body | sm | 400 |
| Small/caption | xs | 400 |

### Spacing

| Token | Value |
|-------|-------|
| Page padding | 6 (24px) |
| Card padding | 6 (24px) |
| Section gap | 8 (32px) |
| Element gap | 4 (16px) |
| Component gap | 3 (12px) |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| TTI | < 3.5s |
| First load JS | < 150KB |
| Lighthouse score | > 90 |
| API response cached | > 60% of requests |
