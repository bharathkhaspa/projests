# DocuChat — Talk to Your Documents 📄

A RAG (Retrieval-Augmented Generation) web app: upload PDFs or paste URLs, ask
questions, and get answers **with citations that link back to the exact source
passage**. Built with FastAPI, ChromaDB, and the Claude API.

**Why the citations matter:** the model is instructed to answer only from the
retrieved context, and every claim in the answer carries a verifiable citation
back to the chunk (and PDF page) it came from — the guardrail layer that
separates a production document-QA system from a raw LLM call.

## Architecture

```
PDF / URL ──▶ text extraction ──▶ chunking (1200 chars, 200 overlap)
                                        │
                                        ▼
                              ChromaDB vector store
                                        │  top-k semantic retrieval
                                        ▼
question ──▶ Claude (citations enabled) ──▶ answer + block-level citations
                                             mapped back to source chunks
```

- **Retrieval:** ChromaDB with its default local embedding model (downloads
  once on first ingest, then fully offline).
- **Citations:** retrieved chunks are passed to Claude as a custom-content
  document with `citations: {enabled: true}` — the API returns block-level
  citations natively, which the app maps back to file name + page number.
- **Guardrail:** system prompt restricts answers to retrieved context; the
  model says "I don't know" instead of hallucinating.

## Run it

```bash
cd docuchat
python -m venv .venv
.venv\Scripts\activate          # source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt

copy .env.example .env           # then put your real ANTHROPIC_API_KEY in .env

uvicorn app.main:app --reload
```

Open http://localhost:8000 — upload a PDF, then ask it questions.

Get an API key at https://console.anthropic.com. Each question costs a fraction
of a cent to a few cents depending on document size (model: `claude-opus-4-8`;
set `CLAUDE_MODEL=claude-haiku-4-5` in `.env` for cheaper demo traffic).

## API

| Endpoint | Method | Body |
|---|---|---|
| `/api/ingest/pdf` | POST | multipart file |
| `/api/ingest/url` | POST | `{"url": "..."}` |
| `/api/ask` | POST | `{"question": "..."}` → answer, segments, cited sources, token usage |
| `/api/sources` | GET | list of ingested sources |
| `/api/reset` | POST | clear the store |

## Roadmap

- [ ] Streaming answers (SSE)
- [ ] Multi-user collections + auth
- [ ] DOCX / TXT ingestion
- [ ] Deployed live demo
