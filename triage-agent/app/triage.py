"""Core triage call — messy issue text in, validated structured output back."""
import os
import time

import anthropic

from .schema import TriageResult

client = anthropic.Anthropic()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")

# $/MTok for cost reporting in evals
PRICING = {
    "claude-opus-4-8": (5.00, 25.00),
    "claude-sonnet-4-6": (3.00, 15.00),
    "claude-haiku-4-5": (1.00, 5.00),
}

SYSTEM = (
    "You are an issue-triage assistant for a software team. Read the raw issue "
    "and classify it precisely. Follow the priority definitions in the schema "
    "exactly. The response draft must be brief, warm, and specific to the issue."
)


def triage_issue(title: str, body: str) -> dict:
    started = time.perf_counter()
    response = client.messages.parse(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM,
        messages=[{
            "role": "user",
            "content": f"Triage this issue.\n\nTitle: {title}\n\nBody:\n{body}",
        }],
        output_format=TriageResult,
    )
    latency = time.perf_counter() - started

    result: TriageResult = response.parsed_output
    in_tok = response.usage.input_tokens
    out_tok = response.usage.output_tokens
    in_price, out_price = PRICING.get(MODEL, (5.00, 25.00))
    cost = (in_tok * in_price + out_tok * out_price) / 1_000_000

    return {
        "result": result.model_dump(),
        "meta": {
            "model": MODEL,
            "latency_s": round(latency, 2),
            "input_tokens": in_tok,
            "output_tokens": out_tok,
            "cost_usd": round(cost, 6),
        },
    }
