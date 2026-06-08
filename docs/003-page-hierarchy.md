# Page Hierarchy

## Route Structure (App Router)

### Public Routes
| Path            | Layout        | Page Purpose                          |
|-----------------|---------------|---------------------------------------|
| `/`             | `PublicLayout`| Landing page                          |
| `/auth/login`   | `AuthLayout`  | Email/password + social login         |
| `/auth/register`| `AuthLayout`  | Registration with email confirmation  |
| `/auth/callback`| -             | Supabase auth redirect handler        |

### Protected Routes (require auth)
| Path                        | Layout             | Page Purpose                          | Module     |
|-----------------------------|--------------------|---------------------------------------|------------|
| `/onboarding`               | `OnboardingLayout` | Collect student profile information   | -          |
| `/dashboard`                | `DashboardLayout`  | Main placement dashboard              | 1          |
| `/roadmap`                  | `DashboardLayout`  | AI-generated personalized roadmap     | 2          |
| `/roadmap/[id]`             | `DashboardLayout`  | Specific module details               | 2          |
| `/dsa`                      | `DashboardLayout`  | DSA tracker + platform connect        | 3          |
| `/dsa/questions`            | `DashboardLayout`  | Question list with filters            | 3          |
| `/code-mentor`              | `DashboardLayout`  | AI code review / mentor               | 4          |
| `/resume`                   | `DashboardLayout`  | Resume upload and analysis            | 5          |
| `/projects`                 | `DashboardLayout`  | Project builder assistant             | 6          |
| `/projects/new`             | `DashboardLayout`  | New project wizard                    | 6          |
| `/projects/[id]`            | `DashboardLayout`  | Project detail + AI suggestions       | 6          |
| `/interview`                | `DashboardLayout`  | Mock interview dashboard              | 7          |
| `/interview/technical`      | `DashboardLayout`  | Technical interview session           | 7          |
| `/interview/hr`             | `DashboardLayout`  | HR interview session                  | 7          |
| `/interview/history`        | `DashboardLayout`  | Past interview results                | 7          |
| `/company/[slug]`           | `DashboardLayout`  | Company-specific prep                 | 8          |
| `/aptitude`                 | `DashboardLayout`  | Aptitude practice sets                | 9          |
| `/behavioral`               | `DashboardLayout`  | Behavioral coaching                   | 10         |
| `/jobs`                     | `DashboardLayout`  | Job finder aggregated listings        | 11         |
| `/applications`             | `DashboardLayout`  | Application tracker kanban            | 12         |
| `/studygroups`              | `DashboardLayout`  | Study groups/cohorts                  | 13         |
| `/analytics`                | `DashboardLayout`  | Placement analytics & graphs          | 14         |
| `/settings`                 | `DashboardLayout`  | Profile, preferences, subscription    | -          |

## Layout Hierarchy
```
RootLayout (html, body, fonts)
+-- PublicLayout (landing)
|   +-- LandingPage (/)
|
+-- AuthLayout (centered card)
|   +-- LoginPage (/auth/login)
|   +-- RegisterPage (/auth/register)
|
+-- OnboardingLayout (stepper)
|   +-- OnboardingPage (/onboarding)
|
+-- DashboardLayout (sidebar + header)
    +-- All protected pages listed above
```

## Auth Guarding
- `/onboarding` redirects to `/dashboard` if onboarding is complete
- All protected routes redirect to `/auth/login` if no session
- Middleware handles session refresh via Supabase SSR
- Unauthenticated users see public routes only

## Navigation Priority (Sidebar Order)
1. Dashboard (home)
2. Roadmap
3. DSA Tracker
4. Code Mentor
5. Resume Analyzer
6. Project Builder
7. Mock Interview
8. Company Prep
9. Aptitude
10. Behavioral Coach
11. Job Finder
12. Application Tracker
13. Study Groups
14. Analytics
15. Settings
