# Issue Triage Agent 🤖

A one-job AI agent: paste a messy GitHub-style issue, get back **reliable,
schema-validated structured output** — type, priority, component, labels, a
one-line summary, and a drafted first response. Ships with an **evals harness**
that measures accuracy, cost, and latency on a labeled test set.

**Why the evals matter:** anyone can demo an LLM call that works once. The
evals view proves the agent is *reliable* — per-field accuracy on 15 labeled
cases, total cost, and p95 latency, visible right in the UI.

## How it works

- **Structured outputs** — uses the Claude API's `messages.parse()` with a
  Pydantic schema (`TriageResult`), so the model's answer is guaranteed to
  validate: enums for type/priority/component, no free-text drift, no JSON
  parsing errors. Priority definitions are encoded in the schema itself.
- **Evals** — `evals/testset.jsonl` holds 15 labeled issues (crashes, feature
  requests, security reports, doc typos...). The runner computes exact-match
  and per-field accuracy, per-case cost from real token usage, and avg/p95
  latency, then saves `results.json` which the web UI renders.

## Run it

```bash
cd triage-agent
python -m venv .venv
.venv\Scripts\activate          # source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt

copy .env.example .env           # put your real ANTHROPIC_API_KEY in .env

# Web UI
uvicorn app.main:app --reload    # open http://localhost:8000

# Evals (runs 15 live API calls, costs a few cents)
python -m evals.run_evals
```

## Extending it

The same pattern (schema + parse + evals) applies to any messy-input →
structured-output job: voicemail → task, meeting notes → action items,
email → CRM entry, invoice → ledger row. Swap the Pydantic schema and the
test set; the harness stays.
