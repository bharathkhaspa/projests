import json
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.responses import FileResponse  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from .triage import triage_issue  # noqa: E402

app = FastAPI(title="Issue Triage Agent")

ROOT = Path(__file__).resolve().parent.parent


class IssueIn(BaseModel):
    title: str
    body: str = ""


@app.get("/")
def index():
    return FileResponse(ROOT / "static" / "index.html")


@app.post("/api/triage")
def triage(issue: IssueIn):
    if not issue.title.strip():
        raise HTTPException(400, "Title is required.")
    return triage_issue(issue.title, issue.body)


@app.get("/api/evals")
def evals():
    results = ROOT / "evals" / "results.json"
    if not results.exists():
        raise HTTPException(404, "No eval results yet — run: python -m evals.run_evals")
    return json.loads(results.read_text(encoding="utf-8"))
