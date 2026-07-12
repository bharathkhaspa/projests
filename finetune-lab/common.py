"""Shared config: the 10 support-ticket intents we fine-tune on (from banking77)."""

BASE_MODEL = "distilbert-base-uncased"
ZERO_SHOT_MODEL = "typeform/distilbert-base-uncased-mnli"
MODEL_DIR = "model"

# 10 real customer-support intents from the banking77 dataset
TARGET_INTENTS = [
    "card_arrival",
    "card_not_working",
    "lost_or_stolen_card",
    "declined_card_payment",
    "direct_debit_payment_not_recognised",
    "pending_transfer",
    "top_up_failed",
    "exchange_rate",
    "atm_support",
    "passcode_forgotten",
]

# human-readable versions for the zero-shot baseline's candidate labels
READABLE = {t: t.replace("_", " ") for t in TARGET_INTENTS}


def load_split(split: str):
    """Load banking77, keep only our 10 intents, remap labels to 0..9."""
    from datasets import load_dataset

    # mteb/banking77 is a parquet mirror (the PolyAI original uses a legacy
    # loading script that datasets>=3.0 no longer supports)
    ds = load_dataset("mteb/banking77", split=split)
    idx = {t: i for i, t in enumerate(TARGET_INTENTS)}
    ds = ds.filter(lambda ex: ex["label_text"] in idx)
    return ds.map(lambda ex: {"labels": idx[ex["label_text"]]})
