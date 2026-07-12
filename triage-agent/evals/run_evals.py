"""Run the triage agent over the labeled test set and report accuracy, cost, latency.

Usage:  python -m evals.run_evals
"""
import json
import statistics
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

from app.triage import MODEL, triage_issue  # noqa: E402

FIELDS = ["issue_type", "priority", "component"]


def main() -> None:
    cases = [
        json.loads(line)
        for line in (ROOT / "evals" / "testset.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    print(f"Running {len(cases)} cases against {MODEL}...\n")

    rows = []
    for i, case in enumerate(cases, 1):
        out = triage_issue(case["title"], case["body"])
        result, meta = out["result"], out["meta"]
        per_field = {f: result[f] == case["expected"][f] for f in FIELDS}
        rows.append({
            "title": case["title"],
            "expected": case["expected"],
            "predicted": {f: result[f] for f in FIELDS},
            "correct": per_field,
            "all_correct": all(per_field.values()),
            "latency_s": meta["latency_s"],
            "cost_usd": meta["cost_usd"],
        })
        mark = "PASS" if rows[-1]["all_correct"] else "MISS"
        print(f"  [{i:>2}/{len(cases)}] {mark}  {case['title'][:60]}")

    summary = {
        "model": MODEL,
        "run_at": datetime.now(timezone.utc).isoformat(),
        "cases": len(rows),
        "exact_match_accuracy": round(sum(r["all_correct"] for r in rows) / len(rows), 3),
        "field_accuracy": {
            f: round(sum(r["correct"][f] for r in rows) / len(rows), 3) for f in FIELDS
        },
        "total_cost_usd": round(sum(r["cost_usd"] for r in rows), 4),
        "avg_latency_s": round(statistics.mean(r["latency_s"] for r in rows), 2),
        "p95_latency_s": round(sorted(r["latency_s"] for r in rows)[int(len(rows) * 0.95) - 1], 2),
    }

    (ROOT / "evals" / "results.json").write_text(
        json.dumps({"summary": summary, "rows": rows}, indent=2), encoding="utf-8"
    )

    print("\n=== Summary ===")
    for key, value in summary.items():
        print(f"  {key}: {value}")
    print("\nSaved to evals/results.json — view it in the web UI under 'Evals'.")


if __name__ == "__main__":
    main()
