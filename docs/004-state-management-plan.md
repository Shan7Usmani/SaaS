# State Management Plan

## State Categories

### 1. Auth State (Supabase + React Context)
```
AuthContext {
  user: User | null
  session: Session | null
  profile: StudentProfile | null
  isLoading: boolean
  signIn(email, password): Promise
  signUp(email, password): Promise
  signOut(): Promise
  refreshProfile(): Promise
}
```
- Source of truth: Supabase `auth.users` + `public.profiles` table
- Persisted via: Supabase SSR cookies (httpOnly)
- Hydrated: In `AuthProvider` via `supabase.auth.getSession()` on mount
- Strategy: Context with `useReducer` for complex state transitions

### 2. Server State (TanStack Query)
All data from Supabase/API endpoints:
- Dashboard metrics
- Roadmap data
- DSA progress
- Resume analyses
- Interview history
- Job listings
- Applications
- Study groups

| Feature           | Query Key Pattern                     | Stale Time | Cache Time |
|-------------------|---------------------------------------|------------|------------|
| Dashboard         | `['dashboard', userId]`               | 30s        | 5min       |
| Roadmap           | `['roadmap', userId]`                 | 5min       | 30min      |
| DSA Stats         | `['dsa', 'stats', userId]`            | 1min       | 5min       |
| Resume            | `['resume', userId]`                  | 10min      | 1hr        |
| Interviews        | `['interviews', userId, filters]`     | 1min       | 5min       |
| Jobs              | `['jobs', filters]`                   | 15min      | 1hr        |
| Applications      | `['applications', userId]`            | 30s        | 5min       |

### 3. Form State (React Hook Form + Zod)
- Each form is isolated (no global form state)
- Validation schemas defined per-form with Zod
- Submission state tracked per-form (idle, loading, success, error)
- Forms reset on successful submission

### 4. UI State (React State / Context)
- **Theme**: `ThemeContext` (light/dark/system), persisted in localStorage
- **Sidebar**: `useState` in DashboardLayout (collapsed/expanded)
- **Modal/Dialog**: `useState` in parent component
- **Toast notifications**: `ToastContext` with reducer
- **Onboarding step**: `useState` in wizard component

### 5. Real-time State (Supabase Realtime)
Used sparingly for high-urgency updates:
- Study group chat messages
- Collaborative interview sessions
- Application status changes (via broadcast)

## Data Flow

```
User Action → React Hook Form → API Route (Next.js) → Supabase Query → Response
                              ↕ (Optimistic Update)
                         TanStack Query Cache
                              ↓
                        React Component
```

## Mutation Strategy
1. Use `useMutation` from TanStack Query
2. On mutate: optimistically update cache
3. On success: invalidate related queries
4. On error: rollback optimistic update + show toast

## Example Mutation Flow
```typescript
// Application status update
const mutation = useMutation({
  mutationFn: (appId, status) => supabase.from('applications').update({ status }).eq('id', appId),
  onMutate: async (variables) => {
    await queryClient.cancelQueries(['applications'])
    const prev = queryClient.getQueriesData(['applications'])
    queryClient.setQueryData(['applications'], old => updateOptimistic(old, variables))
    return { prev }
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['applications'], context.prev)
    toast.error('Failed to update')
  },
  onSettled: () => queryClient.invalidateQueries(['applications'])
})
```

## Directory Structure
```
src/
  lib/
    supabase/
      client.ts         // Browser client
      server.ts         // Server/admin client
      middleware.ts     // SSR middleware
  providers/
    AuthProvider.tsx
    ThemeProvider.tsx
    QueryProvider.tsx
    ToastProvider.tsx
  hooks/
    useAuth.ts
    useProfile.ts
    useDashboard.ts
    useRoadmap.ts
    useDSAStats.ts
    useResume.ts
    useInterviews.ts
    useJobs.ts
    useApplications.ts
    useDebounce.ts
    useMediaQuery.ts
  schemas/              // Zod validation schemas
    auth.ts
    profile.ts
    resume.ts
    interview.ts
```
