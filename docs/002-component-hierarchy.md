# Component Hierarchy

## Provider Tree (Root Layout)
```
<html>
  <ThemeProvider>           // Theme context (light/dark)
    <AuthProvider>          // Supabase auth session context
      <QueryProvider>       // TanStack Query for server state
        {children}
      </QueryProvider>
    </AuthProvider>
  </ThemeProvider>
</html>
```

## Shared UI Components (src/components/ui/)
- `Button` - Variants: primary, secondary, outline, ghost, danger, sizes
- `Card` - Container with header, content, footer slots
- `Input` - Text input with label, error, icon support
- `Badge` - Status/tag indicators (success, warning, error, info)
- `Progress` - Progress bar with label
- `Avatar` - User avatar with fallback initials
- `Modal` - Overlay modal with header, body, footer
- `Select` - Dropdown select with label
- `Textarea` - Multi-line text input
- `Toast` - Notification toast component
- `Skeleton` - Loading skeleton placeholders

## Feature Components (src/components/features/)

### Dashboard
```
<DashboardShell>
  <PlacementScoreCard />     // Overall placement readiness score
  <ProgressBreakdown>        // DSA, Resume, Aptitude, Communication bars
    <ProgressBar />
  </ProgressBreakdown>
  <TargetGoalCard />         // Target score vs current
  <QuickActions />           // Links to modules
</DashboardShell>
```

### Onboarding
```
<OnboardingWizard>
  <StepCollege />
  <StepBranch />
  <StepYear />
  <StepCGPA />
  <StepTargetCompanies />
  <StepDSALevel />
  <StepRole />
  <StepReview />
</OnboardingWizard>
```

### Auth
```
<AuthForm>                   // Shared auth layout
  <LoginForm />
  <RegisterForm />
  <ForgotPasswordForm />
  <SocialLoginButtons />
</AuthForm>
```

### Roadmap
```
<RoadmapView>
  <RoadmapTimeline />
  <ModuleCard />             // Month/week module with topics
  <ProgressIndicator />
  <TopicBadge />
</RoadmapView>
```

### DSA Tracker
```
<DSATracker>
  <PlatformConnect />        // LeetCode/GFG/HackerRank connect
  <StatsOverview />
  <DifficultyDistribution />
  <StrengthWeakness />
  <Recommendations />
</DSATracker>
```

### Resume Analyzer
```
<ResumeAnalyzer>
  <UploadZone />
  <ScoreCard />
  <MissingKeywords />
  <ImprovementSuggestions />
</ResumeAnalyzer>
```

### Mock Interview
```
<MockInterview>
  <InterviewSession>
    <QuestionDisplay />
    <AnswerInput />
    <Timer />
    <FeedbackPanel />
  </InterviewSession>
  <TypeSelector />           // Technical / HR
</MockInterview>
```

### Jobs / Application Tracker
```
<JobTracker>
  <KanbanBoard>
    <KanbanColumn status="saved" />
    <KanbanColumn status="applied" />
    <KanbanColumn status="oa-received" />
    <KanbanColumn status="interview" />
    <KanbanColumn status="offer" />
    <KanbanColumn status="rejected" />
  </KanbanBoard>
  <JobCard />
</JobTracker>
```

### Settings
```
<SettingsPage>
  <ProfileSection />
  <NotificationPreferences />
  <ConnectedAccounts />
  <SubscriptionPlan />
</SettingsPage>
```

## Layout Components (src/components/layout/)
- `Sidebar` - Navigation sidebar with module links
- `Header` - Top bar with user menu, notifications
- `DashboardShell` - Page wrapper with sidebar + header + content
- `MobileNav` - Mobile bottom navigation

## Component Composition Rules
1. Feature components compose shared UI components
2. Pages compose feature components
3. Layout wraps pages
4. No business logic in UI components (custom hooks instead)
5. Forms use React Hook Form + Zod schemas
