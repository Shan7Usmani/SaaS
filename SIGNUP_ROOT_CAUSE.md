# Signup Failure — Root Cause Analysis

## Failure Chain

```
register/page.tsx:41         onSubmit() calls signUp()
        │
        ▼
providers/auth-provider.tsx:70   supabase.auth.signUp() throws
        │                              ↑
        ▼                              │
lib/supabase/client.ts:3-7    createBrowserClient(URL, KEY)
        │                              ↑
        ▼                              │
.env.local:1                  NEXT_PUBLIC_SUPABASE_URL
                                   = "https://placeholder.supabase.co"
        │
        ▼
Browser fetch() → POST https://placeholder.supabase.co/auth/v1/signup
        │
        ▼
DNS Resolution → FAILS (domain does not exist)
        │
        ▼
TypeError: Failed to fetch  ← thrown (not returned in { error })
```

## Root Cause

**`.env.local` contains placeholder values instead of real Supabase project credentials.**

| Variable | Current Value | Required |
|----------|--------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://placeholder.supabase.co` | Real Supabase project URL (e.g. `https://xyzabc.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `placeholder-anon-key` | Real anon/public key from Supabase project settings |

## Detailed Breakdown

### Step 1: Auth provider initializes client
`providers/auth-provider.tsx:30` → `createClient()` reads env vars

### Step 2: Env vars are placeholders
`lib/supabase/client.ts:5-6` receives:
- `process.env.NEXT_PUBLIC_SUPABASE_URL` = `"https://placeholder.supabase.co"` 
- `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` = `"placeholder-anon-key"`

### Step 3: Supabase SSR constructs auth endpoint
`@supabase/ssr`'s `createBrowserClient` builds the GoTrue auth URL as:
```
https://placeholder.supabase.co/auth/v1/signup
```

### Step 4: Browser makes HTTP request
`fetch("https://placeholder.supabase.co/auth/v1/signup", { method: "POST", body: ... })`

### Step 5: DNS resolution fails
`placeholder.supabase.co` does not resolve to any IP address.
- Verified via `Resolve-DnsName`: **DNS_RESOLUTION_FAILED**
- Verified via `curl.exe`: **HTTP status 000** (no connection)

### Step 6: Network error thrown as exception
The `fetch()` call throws `TypeError: Failed to fetch`.

### Step 7: Exception is NOT caught
`auth-provider.tsx:69-76` — `signUp()` has **no try/catch block**. The Supabase client SDK throws on network error (it does not return `{ error }` for transport failures — only for API-level errors).

```typescript
// providers/auth-provider.tsx:69-76
async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({  // ← throws on network failure
      email, password, options: { data: { name } },
    })
    return { error: error?.message ?? null }  // ← never reached
  }
```

### Step 8: Caller also has no try/catch
`register/page.tsx:41` — `const { error } = await signUp(...)` — destructuring on a thrown exception, so `error` is never assigned. The exception becomes an unhandled promise rejection.

## Evidence

| Check | Result |
|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` value | `"https://placeholder.supabase.co"` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` value | `"placeholder-anon-key"` |
| DNS lookup `placeholder.supabase.co` | **FAILED** — domain does not exist |
| HTTP request to `https://placeholder.supabase.co/auth/v1/signup` | **Status 000** — no connection |
| Is `signUp()` wrapped in try/catch? | **No** — exception propagates uncaught |
| Is caller `onSubmit()` wrapped in try/catch? | **No** — exception becomes unhandled rejection |

## Secondary Issue

Even after fixing the env vars, the `signUp()` function in `auth-provider.tsx:69-76` will continue to throw unhandled exceptions on any transient network error. The function signature promises `Promise<{ error: string | null }>`, but it can throw instead. The caller in `register/page.tsx:41` also trusts this promise and does not guard against throws.

## Fix Required

1. **Immediate**: Replace `.env.local` values with real Supabase project credentials
2. **Robustness**: Wrap `supabase.auth.signUp()` (and `signIn()`) in try/catch to return network errors as `{ error }` instead of throwing

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-actual-anon-key>
```
