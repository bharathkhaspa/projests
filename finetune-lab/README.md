# FineTune Lab 🧪 — I Don't Just Call APIs, I Train Models

Fine-tunes **DistilBERT** to classify customer-support tickets into 10 intents
(from the real-world banking77 dataset), then shows a **before/after
comparison UI**: a generic zero-shot model vs the fine-tuned one, side by side,
with measured accuracy on a held-out test set.

**The point:** most "AI developers" only call a hosted API. This project shows
the full ML workflow — data preparation, training, evaluation on a held-out
set, and shipping the trained model behind a UI.

## The workflow

1. **Data** — `banking77` (13k real customer-support queries), filtered to 10
   intents like `lost_or_stolen_card`, `declined_card_payment`, `top_up_failed`.
2. **Train** — `train.py` fine-tunes `distilbert-base-uncased` (3 epochs,
   ~10-25 min on CPU, ~1 min on GPU) and reports test accuracy per epoch.
3. **Evaluate** — `evaluate.py` runs a fair head-to-head on 200 held-out
   tickets: generic zero-shot model vs the fine-tuned one. Typical result:
   ~55-70% zero-shot → **~95%+ fine-tuned**.
4. **Demo** — `app.py` is a Gradio UI showing both models' top-3 predictions
   side by side, with the measured accuracy displayed up top.

## Run it

```bash
cd finetune-lab
python -m venv .venv
.venv\Scripts\activate          # source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt

python train.py       # fine-tune (downloads dataset + base model first run)
python evaluate.py    # measured before/after accuracy → results.json
python app.py         # side-by-side demo UI at http://localhost:7860
```

No API key needed — everything runs locally.

## Why fine-tune instead of prompting an LLM?

For a narrow, high-volume task like ticket routing:

| | Fine-tuned DistilBERT | LLM API call |
|---|---|---|
| Cost per 1M tickets | ~$0 (self-hosted, 66M params) | hundreds of dollars |
| Latency | ~10 ms | ~1-3 s |
| Offline / private | ✅ | ❌ |
| Broad reasoning | ❌ | ✅ |

The right tool depends on the job — knowing when to train vs when to call an
API is exactly the judgment clients pay an ML engineer for.
