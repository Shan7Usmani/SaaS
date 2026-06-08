# UI Implementation Roadmap

## Phase 1: Foundation (Current Sprint)
**Goal**: Establish design system, auth, and core layouts

### Step 1.1: Dependencies & Config
- [x] Next.js 15 app created (tp/)
- [x] Tailwind v4 configured
- [x] TypeScript strict mode
- [x] ESLint configured
- [ ] Install ShadCN UI (or manual UI primitives)
- [ ] Install TanStack Query
- [ ] Install React Hook Form + Zod
- [ ] Install Lucide React (icons)
- [ ] Install Supabase client library
- [ ] Configure path aliases

### Step 1.2: Shared UI Components
- [ ] `Button` with variants (primary, secondary, outline, ghost, danger)
- [ ] `Input` with label, error state, icon slot
- [ ] `Card` with header, content, footer
- [ ] `Badge` for status indicators
- [ ] `Progress` bar
- [ ] `Select` dropdown
- [ ] `Textarea`
- [ ] `Avatar` with fallback
- [ ] `Modal` dialog
- [ ] `Toast` notification system
- [ ] `Skeleton` loading
- [ ] `Container` max-width wrapper

### Step 1.3: Provider Layer
- [ ] `QueryProvider` - TanStack Query client
- [ ] `AuthProvider` - Supabase session + profile context
- [ ] `ThemeProvider` - light/dark toggle
- [ ] `ToastProvider` - notification queue

### Step 1.4: Layouts
- [ ] `PublicLayout` - clean layout for landing
- [ ] `AuthLayout` - centered card with logo
- [ ] `DashboardLayout` - sidebar + header + content area
- [ ] `Sidebar` with navigation items + collapsed state
- [ ] `Header` with user avatar, notifications, search
- [ ] Responsive sidebar (drawer on mobile)

### Step 1.5: Auth Pages
- [ ] Login page with email/password + social providers
- [ ] Register page with validation
- [ ] Auth callback handler for email confirmation
- [ ] Forgot password flow
- [ ] Route protection via middleware

## Phase 2: Core Features (Next Sprint)

### Step 2.1: Onboarding
- [ ] Multi-step wizard form
- [ ] College, branch, year, CGPA inputs
- [ ] Target companies multi-select
- [ ] DSA level self-assessment
- [ ] Role selection cards
- [ ] Review & submit step
- [ ] Progress indicator

### Step 2.2: Dashboard
- [ ] Placement Score gauge/indicator
- [ ] Progress breakdown bars (DSA, Resume, Aptitude, Communication)
- [ ] Target goal display
- [ ] Quick action cards to other modules
- [ ] Weekly activity summary

### Step 2.3: Roadmap
- [ ] Timeline view with months/weeks
- [ ] Expandable module cards
- [ ] Topic badges with completion status
- [ ] Progress indicator per module

### Step 2.4: DSA Tracker
- [ ] Platform connect buttons (LeetCode, GFG, HackerRank)
- [ ] Stats overview cards
- [ ] Difficulty distribution pie/bar
- [ ] Strengths/weaknesses list
- [ ] AI recommendation section

## Phase 3: AI Features (Future Sprint)

### Step 3.1: Resume Analyzer
- [ ] Drag-and-drop upload zone
- [ ] PDF preview
- [ ] Score card with ATS compatibility
- [ ] Missing keywords tag list
- [ ] Improvement suggestions accordion

### Step 3.2: Mock Interview
- [ ] Interview type selector (Technical/HR)
- [ ] Question display with timer
- [ ] Voice/text answer input
- [ ] Real-time feedback panel
- [ ] Session history

### Step 3.3: Code Mentor
- [ ] Code editor (read-only)
- [ ] AI analysis output
- [ ] Complexity display
- [ ] Better approach suggestion

## Phase 4: Advanced Features (Future Sprint)

### Step 4.1: Job Tracker
- [ ] Kanban board with drag-and-drop
- [ ] Job card with company, role, status
- [ ] Add job manually/auto-import
- [ ] Stats summary

### Step 4.2: Company Prep
- [ ] Company selector grid
- [ ] OA pattern display
- [ ] Interview pattern tabs
- [ ] FAQ accordion

### Step 4.3: Analytics
- [ ] Time-series charts
- [ ] Performance radar
- [ ] Progress over time
- [ ] Export/share

## Design Tokens
```css
/* Color scheme */
--primary: #6366f1 (indigo)
--primary-foreground: #ffffff
--secondary: #f1f5f9
--success: #22c55e
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6

/* Border radius */
--radius-sm: 0.375rem
--radius-md: 0.5rem
--radius-lg: 0.75rem
--radius-xl: 1rem

/* Spacing scale: Tailwind defaults */
```

## Responsive Breakpoints
- Mobile: < 640px (sidebar becomes drawer)
- Tablet: 640-1024px (sidebar icons only)
- Desktop: > 1024px (full sidebar)
