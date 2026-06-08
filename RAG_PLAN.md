# PlacementOS RAG Pipeline

## Overview

RAG powers three features:
1. **Company-specific preparation** — Retrieve past interview experiences, OA patterns, company culture
2. **Resume analyzer** — Match skills/keywords against job descriptions
3. **Career agent** — Retrieve market trends, skill demand data

---

## Architecture

```
Document Source → Chunking → Embedding → Pinecone Index
                                              ↓
User Query → Query Transformer → Embedding → Hybrid Search
                                              ↓
                                          Retrieved Chunks
                                              ↓
                                          LLM + Context
                                              ↓
                                          Response
```

---

## Vector Database: Pinecone

**Index Name**: `placementos-{env}`

| Parameter | Value |
|-----------|-------|
| Dimensions | 768 (text-embedding-3-small) |
| Metric | cosine |
| Pod type | starter (free tier) |
| Replicas | 1 (scale on Pro/Premium) |

### Namespaces (logical partitions)

| Namespace | Contents | Chunks | Update Freq |
|-----------|----------|--------|-------------|
| `company_experiences` | Student interview experiences, OA patterns | ~10K | Monthly |
| `company_jd` | Job descriptions for target companies | ~1K | Quarterly |
| `dsa_questions` | LeetCode/GFG problem patterns | ~50K | Weekly |
| `resume_keywords` | Industry role-specific keyword banks | ~2K | Monthly |
| `market_trends` | Skill demand, salary data, hiring trends | ~500 | Monthly |
| `placement_material` | Study guides, cheat sheets, resources | ~3K | Manual |

---

## Chunking Strategy

### Document Type Configurations

```
company_experiences:
  - Chunk size: 300 tokens (short experiences)
  - Overlap: 50 tokens
  - Splitter: RecursiveCharacterTextSplitter
  - Separators: ["\n\n", "\n", ". ", " "]

company_jd:
  - Chunk size: 500 tokens (structured JDs)
  - Overlap: 100 tokens
  - Splitter: RecursiveCharacterTextSplitter

dsa_questions:
  - Chunk size: 200 tokens (problem statements are short)
  - Overlap: 0 (each problem is self-contained)
  - Splitter: Fixed-size (each problem = 1 chunk)
  - Metadata: { difficulty, topic, company, platform }

resume_keywords:
  - Chunk size: 100 tokens (keyword groups)
  - Overlap: 0
  - Splitter: NLTK sentence tokenizer (grouped by category)
```

### Metadata Schema (applied to all chunks)

```json
{
  "source": "string (filename or URL)",
  "namespace": "string",
  "chunk_index": "number (position in document)",
  "total_chunks": "number",
  "company": "string | null",
  "role": "string | null",
  "topic": "string | null",
  "difficulty": "easy | medium | hard | null",
  "uploaded_at": "ISO timestamp",
  "source_type": "user_submitted | curated | web_scraped"
}
```

---

## Embedding Model

**Primary**: `text-embedding-3-small` (OpenAI)

| Metric | Value |
|--------|-------|
| Dimensions | 768 |
| Cost | $0.02/1M tokens |
| Speed | ~50ms per batch of 10 |
| Batch size | 10 documents |

**Fallback**: `text-embedding-004` (Google, free tier)

Used only if OpenAI API is down. Same dimensions via truncation.

### Embedding Cost Estimates

| Operation | Documents | Tokens/Doc | Total Tokens | Cost |
|-----------|-----------|-----------|-------------|------|
| Initial seed | 1,000 | 300 | 300,000 | $0.006 |
| Monthly update | 200 | 300 | 60,000 | $0.0012 |
| Per user query | 1 | 100 | 100 | $0.000002 |

---

## Retrieval Strategy

### Hybrid Search (Dense + Sparse)

```
Dense: Pinecone vector search → top_k=10
Sparse: BM25 over chunk text → top_k=5
Merge: Reciprocal Rank Fusion (RRF)
  Formula: RRF(d) = Σ(1 / (k + rank_i(d))) where k=60
```

### Query Types & Parameters

| Use Case | top_k | alpha (dense) | beta (sparse) | Min Score |
|----------|-------|---------------|---------------|-----------|
| Company prep | 10 | 0.7 | 0.3 | 0.5 |
| Resume JD match | 15 | 0.8 | 0.2 | 0.6 |
| Career suggestions | 8 | 0.6 | 0.4 | 0.4 |
| DSA problem search | 5 | 0.9 | 0.1 | 0.7 |

### Query Transformation

Before embedding, queries are transformed to improve retrieval:

```
Input: "Tell me about Amazon interviews"
Step 1: Expand → "Amazon SDE interview experience online assessment pattern technical questions 2024"
Step 2: Extract entities → company="Amazon", type="interview"
Step 3: Namespace filter → namespace="company_experiences"
Step 4: Embed expanded query
```

Transformation prompt (Gemini 2.5 Flash, cost: ~$0.000005):

```
[ROLE] You are a search query optimizer. Rewrite the user's query to maximize retrieval accuracy from a vector database.

[RULES]
- Expand abbreviations (OA → Online Assessment)
- Add synonyms (interview → technical screen, phone screen, onsite)
- Extract company names, role names, topic names
- Keep under 50 words
- Return ONLY valid JSON

[SCHEMA]
{
  "expanded_query": "string",
  "company": "string | null",
  "role": "string | null",
  "topic": "string | null",
  "namespace": "string | null",
  "filters": {}
}

[USER QUERY]
{{user_query}}
```

---

## Ingestion Pipeline

```
Source (CSV/JSON/PDF) → Preprocessor → Chunker → Embedder → Pinecone Upsert
```

### Preprocessing

```
PDF → pdfjs-extract → Clean HTML tags → Normalize Unicode → Lowercase
JSON/CSV → Pandas → Validate schema → Drop duplicates → Extract text fields
```

### Upsert Batch Strategy

```python
batch_size = 50  # Pinecone max per upsert call
rate_limit = 100  # RPM for free tier

for batch in chunks(all_chunks, batch_size):
    vectors = [
        {
            "id": f"{namespace}:{hash(chunk['text'])}",
            "values": embed(chunk["text"]),
            "metadata": chunk["metadata"]
        }
        for chunk in batch
    ]
    index.upsert(vectors=vectors, namespace=namespace)
    time.sleep(0.6)  # respect rate limit
```

---

## Retrieval Pipeline (per user request)

```
┌──────────────┐
│ User Query    │
└──────┬───────┘
       ▼
┌──────────────┐
│ Classifier    │  ← Gemini: "Which namespace(s) to search?"
│ (2 tokens)    │     Cost: ~$0.000001
└──────┬───────┘
       ▼
┌──────────────┐
│ Transformer   │  ← Gemini: Expand query, extract entities
│ (~100 tokens) │     Cost: ~$0.000005
└──────┬───────┘
       ▼
┌──────────────┐
│ Hybrid Search │  ← Dense (Pinecone) + Sparse (BM25)
│               │     Cost: ~$0.0001 (Pinecone read units)
└──────┬───────┘
       ▼
┌──────────────┐
│ Reranker      │  ← Cross-encoder (miniLM) re-rank top 20 → top 5
│               │     Cost: ~$0.00005 (local model, no API)
└──────┬───────┘
       ▼
┌──────────────┐
│ LLM + Context │  ← Gemini: Generate final answer
│ (~500 tokens) │     Cost: ~$0.000015
└──────┬───────┘
       ▼
    Response

Total cost per RAG query: ~$0.000171
```

---

## Caching Layer (Upstash Redis)

```
┌──────────┐     ┌───────────────────┐     ┌──────────┐
│ User Query│────→│ Cache Check (hash) │←────│ TTL Check │
└──────────┘     └────────┬──────────┘     └──────────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
               ┌────────┐ ┌──────────┐
               │ Cache  │ │ RAG Pipe │
               │ Hit    │ │ (miss)   │
               └────────┘ └──────────┘
```

| Cache Key Pattern | TTL | Cache On |
|-------------------|-----|----------|
| `rag:{query_hash}` | 24h | Company prep queries |
| `rag:jd:{company}:{role}` | 7d | JD-specific queries |
| `rag:trends:{skill}` | 7d | Market trend queries |
| `rag:exp:{company}` | 48h | Interview experience queries |

---

## Evaluation

| Metric | Target | Measurement |
|--------|--------|------------|
| Recall@5 | > 0.85 | Manual eval set of 100 queries |
| Precision@5 | > 0.70 | Manual eval set |
| Latency p95 | < 2s | Logflare |
| Cache hit rate | > 40% | Redis metrics |
| Cost per query | < $0.0002 | Logflare cost tracking |
| User satisfaction | > 4.0 / 5 | Thumbs up/down after each RAG response |

### Evaluation Dataset

```csv
query,expected_namespace,expected_chunks,relevance_score
"Amazon SDE interview process 2024",company_experiences,"amazon_2024_1, amazon_2024_2",1.0
"TCS NQT aptitude topics",placement_material,"tcs_nqt_1, tcs_nqt_2, tcs_nqt_3",1.0
...
```

---

## Data Sources

| Source | Type | Update Method | Legal |
|--------|------|--------------|-------|
| LeetCode problem descriptions | Public web scraping | Weekly batch | Public API |
| GeeksForGeeks articles | Public web scraping | Weekly batch | Public API |
| Company careers page JDs | Public web scraping | Monthly batch | Public info |
| User-submitted interview experiences | User input | On submission | User consent |
| Glassdoor/AmbitionBox trends | Public web scraping | Monthly batch | Public info |
| Naukri skill demand data | Public API | Monthly | Public API |

---

## Fallback Behavior

If Pinecone is down or rate-limited:

```
1. Check Redis cache → return if exists
2. If cache miss → use BM25 on local JSON index (static backup)
3. If BM25 yields nothing → LLM generates response from training data
4. Tag response as "generated" (not retrieved) in metadata
```
