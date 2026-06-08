# PlacementOS AI Architecture

## Design Principles

1. **API Cost < $0.005 per free-tier user/day**
2. **Model routing** — 80% of requests hit Gemini 2.5 Flash ($0.015/1M input), 20% hit GPT-5 ($2.50/1M input)
3. **Structured outputs** — Every AI response is validated JSON, minimizing parsing errors and retries
4. **Prompt caching** — System prompts are static and cached; only user context changes
5. **Streaming** — All user-facing generation streams to reduce perceived latency

---

## Model Routing Strategy

```
                    ┌─────────────────────┐
                    │   Request Router     │
                    │  (if-else, no LLM)   │
                    └──────┬──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Gemini   │ │ Gemini   │ │  GPT-5   │
        │ 2.5 Flash│ │ 2.5 Flash│ │ (complex │
        │ (simple) │ │ (RAG)    │ │ reason.) │
        └──────────┘ └──────────┘ └──────────┘
```

| Route | Model | Cost/1M tokens | When |
|-------|-------|---------------|------|
| Resume parsing | Gemini 2.5 Flash | $0.015/$0.06 | Always |
| Roadmap gen | Gemini 2.5 Flash | $0.015/$0.06 | Always |
| Coding review | Gemini 2.5 Flash | $0.015/$0.06 | Always |
| Mock interview eval | GPT-5 | $2.50/$10.00 | 1st pass Gemini + fallback GPT-5 |
| Behavioral coach | Gemini 2.5 Flash | $0.015/$0.06 | Always |
| ATS keyword matching | Gemini 2.5 Flash | $0.015/$0.06 | Always |
| DSA weak/strong analysis | Gemini 2.5 Flash | $0.015/$0.06 | Always |

### Fallback Chain

```
Gemini 2.5 Flash → JSON valid? → Yes → Return
         ↓ No
Gemini 2.5 Flash (retry w/ stricter prompt) → valid? → Return
         ↓ No × 2
GPT-5 mini → Return
```

---

## Cost Budget Per User (Monthly)

| Tier | Daily requests | Model | Cost/user/month |
|------|---------------|-------|----------------|
| Free | 20 (95% Gemini, 5% GPT-5) | Mix | ~$0.09 |
| Pro (₹499) | 200 (85% Gemini, 15% GPT-5) | Mix | ~$0.75 |
| Premium (₹999) | 500 (75% Gemini, 25% GPT-5) | Mix | ~$2.10 |

---

## Agent Architecture

### 1. Resume Analyzer Agent

```
PDF Upload → pdfjs extract text → Clean → Chunk (500 tokens)
       ↓
Classifier: "Is this a resume?" (Gemini, 10 tokens)
       ↓
Pass 1 — Extraction: Name, email, phone, education, skills, projects, experience
       ↓
Pass 2 — ATS Scoring: Keyword match against target role JD
       ↓
Pass 3 — Improvement Gen: Weak areas → suggestions
       ↓
Output: { score, sections, missing_keywords, suggestions, ats_score }
```

**Cost per analysis**: ~2,000 input tokens + ~300 output tokens = **~$0.000045** (Gemini)

### 2. Roadmap Generator Agent

```
User Profile → Template → Gemini generate → Validate JSON
       ↓
Step 1 — Profile Analysis: Extract DSA weakness from synced LeetCode data
       ↓
Step 2 — Roadmap Generation: 4-month plan with weekly topics
       ↓
Step 3 — Resource Mapping: Attach YouTube/Article links per topic
       ↓
Output: { months: [{ name, topics: [{ name, duration, resources, milestones }] }] }
```

**Cost per generation**: ~1,500 input tokens + ~800 output tokens = **~$0.00006** (Gemini)

### 3. Mock Interview Agent

```
User selects type (Tech/HR) → Gemini generates first question
       ↓
User answers → Gemini evaluates (correctness, clarity, confidence)
       ↓
Adapt difficulty based on performance → Next question
       ↓
After N questions → GPT-5 final summary + score
       ↓
Output: { questions: [{ q, user_a, score, feedback }], overall_score, strengths, weaknesses }
```

**Cost per session (6 questions)**: ~3,000 input + ~1,500 output = **~$0.00012** for Gemini questions + **~$0.005** for GPT-5 final eval = **~$0.00512 total**

### 4. Coding Mentor Agent

```
User pastes code + problem statement
       ↓
Gemini: Analyze time/space complexity → O-notation
       ↓
Gemini: Identify inefficiencies → Suggest optimization
       ↓
Gemini: Generate optimized code if requested
       ↓
Output: { time_complexity, space_complexity, issues: [{ line, severity, msg }], suggestion }
```

**Cost per review**: ~1,200 input + ~400 output = **~$0.000036** (Gemini)

---

## Token Optimization

| Technique | Implementation | Savings |
|-----------|---------------|---------|
| **Static system prompts** | Load once, cache in-memory | ~40% per request |
| **Structured output** | JSON mode, no markdown in responses | ~30% output tokens |
| **Chunking** | Split long resumes/docs into 500-token windows | Avoids context overflow |
| **Prompt compression** | Strip whitespace, use concise instructions | ~20% input tokens |
| **Batch embedding** | Group 10+ documents for single embedding call | ~50% on embedding costs |
| **Caching** | Redis cache for roadmap/resources/Topics | ~60% repeat queries saved |

---

## Data Flow

```
Client (Next.js) → Supabase Edge Function → AI Router
                                              ↓
                        ┌─────────────────────┴──────────────┐
                        ▼                                    ▼
                  Gemini 2.5 Flash                      GPT-5
                        ↓                                    ↓
                  Structured JSON ←── Validation ──→ Structured JSON
                        ↓                                    ↓
                  Return to client ←── Supabase ←── Store in DB
```

All AI calls happen in **Supabase Edge Functions** (Deno) to:
- Avoid cold starts from client
- Keep API keys server-side
- Enable streaming via Server-Sent Events
- Cache responses in Redis (Upstash)

---

## Streaming Architecture

```
Client (SSE) → /api/ai/stream
    ↓
Edge Function → Stream from Gemini/GPT-5
    ↓
Client progressively renders:
  - Roadmap: Section by section
  - Interview: One question at a time
  - Resume: Score then breakdown then suggestions
```

---

## Evaluation & Monitoring

| Metric | Tool | Action |
|--------|------|--------|
| Latency p95 | Logflare | Alert if > 3s |
| Cost/user | Logflare | Cap at $0.50/day |
| JSON parse failures | Sentry | Retry w/ fallback model |
| User feedback (thumbs) | DB | Fine-tune prompts |
