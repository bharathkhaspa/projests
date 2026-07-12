"""Answer questions over retrieved chunks with Claude, returning verifiable citations."""
import os

import anthropic

client = anthropic.Anthropic()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")

SYSTEM = (
    "You are a document Q&A assistant. Answer using ONLY the provided document "
    "context. If the answer is not in the context, say you don't know — never "
    "guess or use outside knowledge. Be concise and cite the passages you rely on."
)


def answer_question(question: str, chunks: list[dict]) -> dict:
    """Ask Claude with citations enabled; map citations back to source chunks."""
    if not chunks:
        return {
            "answer": "No documents have been ingested yet. Upload a PDF or add a URL first.",
            "segments": [{"text": "No documents ingested yet.", "citations": []}],
            "sources": [],
        }

    # Each chunk becomes one content block; citations come back as block indices.
    document = {
        "type": "document",
        "source": {
            "type": "content",
            "content": [{"type": "text", "text": c["text"]} for c in chunks],
        },
        "title": "Retrieved context",
        "citations": {"enabled": True},
    }

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=SYSTEM,
        messages=[{
            "role": "user",
            "content": [document, {"type": "text", "text": question}],
        }],
    )

    segments = []
    used_chunks: dict[int, dict] = {}
    for block in response.content:
        if block.type != "text":
            continue
        cited = []
        for citation in (block.citations or []):
            start = citation.start_block_index
            end = citation.end_block_index
            for idx in range(start, end):
                if 0 <= idx < len(chunks):
                    used_chunks[idx] = chunks[idx]
                    cited.append(idx)
        segments.append({"text": block.text, "citations": sorted(set(cited))})

    return {
        "answer": "".join(s["text"] for s in segments),
        "segments": segments,
        "sources": [
            {"index": idx, "source": c["source"], "page": c.get("page", 0),
             "text": c["text"][:300]}
            for idx, c in sorted(used_chunks.items())
        ],
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        },
    }
