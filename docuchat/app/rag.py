"""Document ingestion and retrieval over a Chroma vector store."""
import io
import re
import uuid
from pathlib import Path

import chromadb
import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

_client = chromadb.PersistentClient(path=str(DATA_DIR / "chroma"))
_collection = _client.get_or_create_collection("docs")

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200


def _chunk_text(text: str) -> list[str]:
    text = re.sub(r"[ \t]+", " ", text).strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        # try to break on a sentence/paragraph boundary
        if end < len(text):
            window = text[start:end]
            cut = max(window.rfind("\n\n"), window.rfind(". "), window.rfind("\n"))
            if cut > CHUNK_SIZE // 2:
                end = start + cut + 1
        chunks.append(text[start:end].strip())
        start = max(end - CHUNK_OVERLAP, start + 1)
        if end >= len(text):
            break
    return [c for c in chunks if c]


def _store_chunks(chunks: list[dict], source: str) -> int:
    if not chunks:
        return 0
    _collection.add(
        ids=[str(uuid.uuid4()) for _ in chunks],
        documents=[c["text"] for c in chunks],
        metadatas=[{"source": source, "page": c.get("page", 0)} for c in chunks],
    )
    return len(chunks)


def ingest_pdf(data: bytes, filename: str) -> dict:
    reader = PdfReader(io.BytesIO(data))
    chunks = []
    for page_no, page in enumerate(reader.pages, start=1):
        for piece in _chunk_text(page.extract_text() or ""):
            chunks.append({"text": piece, "page": page_no})
    count = _store_chunks(chunks, filename)
    return {"source": filename, "pages": len(reader.pages), "chunks": count}


def ingest_url(url: str) -> dict:
    resp = httpx.get(url, follow_redirects=True, timeout=30,
                     headers={"User-Agent": "docuchat/1.0"})
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    chunks = [{"text": piece} for piece in _chunk_text(text)]
    count = _store_chunks(chunks, url)
    return {"source": url, "chunks": count}


def retrieve(question: str, k: int = 6) -> list[dict]:
    if _collection.count() == 0:
        return []
    result = _collection.query(query_texts=[question], n_results=min(k, _collection.count()))
    chunks = []
    for text, meta in zip(result["documents"][0], result["metadatas"][0]):
        chunks.append({"text": text, "source": meta["source"], "page": meta.get("page", 0)})
    return chunks


def list_sources() -> list[dict]:
    if _collection.count() == 0:
        return []
    metas = _collection.get(include=["metadatas"])["metadatas"]
    counts: dict[str, int] = {}
    for m in metas:
        counts[m["source"]] = counts.get(m["source"], 0) + 1
    return [{"source": s, "chunks": n} for s, n in sorted(counts.items())]


def reset_store() -> None:
    global _collection
    _client.delete_collection("docs")
    _collection = _client.get_or_create_collection("docs")
