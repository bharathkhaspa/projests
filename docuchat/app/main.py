from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, File, HTTPException, UploadFile  # noqa: E402
from fastapi.responses import FileResponse  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from . import answer, rag  # noqa: E402

app = FastAPI(title="DocuChat — talk to your documents")

STATIC = Path(__file__).resolve().parent.parent / "static"


class UrlRequest(BaseModel):
    url: str


class AskRequest(BaseModel):
    question: str


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")


@app.post("/api/ingest/pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")
    data = await file.read()
    try:
        return rag.ingest_pdf(data, file.filename)
    except Exception as exc:
        raise HTTPException(400, f"Could not read PDF: {exc}")


@app.post("/api/ingest/url")
def ingest_url(req: UrlRequest):
    try:
        return rag.ingest_url(req.url)
    except Exception as exc:
        raise HTTPException(400, f"Could not fetch URL: {exc}")


@app.post("/api/ask")
def ask(req: AskRequest):
    question = req.question.strip()
    if not question:
        raise HTTPException(400, "Question is empty.")
    chunks = rag.retrieve(question)
    return answer.answer_question(question, chunks)


@app.get("/api/sources")
def sources():
    return {"sources": rag.list_sources()}


@app.post("/api/reset")
def reset():
    rag.reset_store()
    return {"ok": True}
