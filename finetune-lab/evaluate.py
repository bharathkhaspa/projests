"""Head-to-head: generic zero-shot model vs our fine-tuned model on the test set.

Usage:  python evaluate.py          (run train.py first)
"""
import json
import random

from transformers import pipeline

from common import MODEL_DIR, READABLE, TARGET_INTENTS, ZERO_SHOT_MODEL, load_split

SAMPLE = 200  # evaluated test examples (zero-shot is slow on CPU)


def main() -> None:
    test = list(load_split("test"))
    random.seed(42)
    sample = random.sample(test, min(SAMPLE, len(test)))
    readable_labels = [READABLE[t] for t in TARGET_INTENTS]
    to_intent = {v: k for k, v in READABLE.items()}

    print(f"Evaluating {len(sample)} test examples...\n")

    print("1/2 Zero-shot baseline (generic model, never saw this data)...")
    zero_shot = pipeline("zero-shot-classification", model=ZERO_SHOT_MODEL)
    zs_correct = 0
    for i, ex in enumerate(sample, 1):
        out = zero_shot(ex["text"], candidate_labels=readable_labels)
        if to_intent[out["labels"][0]] == TARGET_INTENTS[ex["labels"]]:
            zs_correct += 1
        if i % 50 == 0:
            print(f"   {i}/{len(sample)}")

    print("2/2 Fine-tuned model...")
    tuned = pipeline("text-classification", model=MODEL_DIR)
    ft_correct = 0
    for ex in sample:
        if tuned(ex["text"])[0]["label"] == TARGET_INTENTS[ex["labels"]]:
            ft_correct += 1

    results = {
        "cases": len(sample),
        "zero_shot_accuracy": round(zs_correct / len(sample), 3),
        "fine_tuned_accuracy": round(ft_correct / len(sample), 3),
    }
    json.dump(results, open("results.json", "w"), indent=2)

    print("\n=== Before / After ===")
    print(f"  Generic zero-shot : {results['zero_shot_accuracy']:.1%}")
    print(f"  Fine-tuned        : {results['fine_tuned_accuracy']:.1%}")
    print("\nSaved to results.json")


if __name__ == "__main__":
    main()
