# Projects — Bharath K

A collection of my portfolio projects, each in its own folder with its own README, setup instructions, and screenshots.

| Project | What it is | Stack |
|---|---|---|
| [passandpay](passandpay/) | Truck-booking & goods-transport platform connecting shippers with truck owners — bookings, payments, live tracking | Django, SQLite, Bootstrap |
| [snapscan](snapscan/) | Receipt scanner mobile app: point your camera at a receipt, AI extracts a structured expense | React Native (Expo), Node.js, Claude Vision |
| [docuchat](docuchat/) | RAG web app — upload PDFs or URLs, ask questions, get answers with citations back to the exact source passage | FastAPI, ChromaDB, Claude API |
| [triage-agent](triage-agent/) | AI agent that turns messy GitHub-style issues into schema-validated structured output, with an evals harness | Python, Claude API, Pydantic |
| [finetune-lab](finetune-lab/) | Fine-tunes DistilBERT on banking77 ticket-intent classification, with a before/after comparison UI | PyTorch, Transformers, Gradio |
| [portfolio](portfolio/) | My personal portfolio site showcasing all of the above | HTML, CSS, JS (no build step) |

## Notes

- Each project folder has its own `README.md` with run instructions.
- Secrets are never committed — copy each project's `.env.example` to `.env` and fill in your keys.
- `finetune-lab/model/model.safetensors` (~255 MB trained weights) is excluded from the repo due to GitHub's file-size limit; run `finetune-lab/train.py` to regenerate it.
