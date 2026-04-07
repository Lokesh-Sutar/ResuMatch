import asyncio
from io import BytesIO

import pytest
from fastapi import HTTPException
from fastapi import UploadFile

from routes import analyze as analyze_route


def test_analyze_rejects_non_pdf() -> None:
    resume = UploadFile(filename="resume.txt", file=BytesIO(b"not pdf"))

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(analyze_route.analyze_resume(resume=resume, job_description="Python developer"))

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Only PDF files are supported"


def test_analyze_rejects_empty_job_description(monkeypatch) -> None:
    monkeypatch.setattr(analyze_route, "extract_text_from_pdf", lambda _: "resume text")
    monkeypatch.setattr(analyze_route, "clean_text", lambda text: text)

    resume = UploadFile(filename="resume.pdf", file=BytesIO(b"%PDF-1.4"))

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(analyze_route.analyze_resume(resume=resume, job_description="   "))

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Job description cannot be empty"


def test_analyze_fallback_keyword_mode(monkeypatch) -> None:
    monkeypatch.setattr(analyze_route, "extract_text_from_pdf", lambda _: "Python FastAPI SQL")
    monkeypatch.setattr(analyze_route, "clean_text", lambda text: text)
    monkeypatch.setattr(analyze_route, "is_ai_available", lambda: False)
    monkeypatch.setattr(analyze_route, "extract_skills_from_resume", lambda _: ["Python", "FastAPI", "SQL"])
    monkeypatch.setattr(analyze_route, "extract_skills_from_job_description", lambda _: ["Python", "FastAPI", "Docker"])

    resume = UploadFile(filename="resume.pdf", file=BytesIO(b"%PDF-1.4"))
    payload = asyncio.run(analyze_route.analyze_resume(resume=resume, job_description="Need Python FastAPI Docker"))

    assert "score" in payload
    assert payload["matchedSkills"] == ["FastAPI", "Python"]
    assert payload["missingSkills"] == ["Docker"]
    assert isinstance(payload["suggestions"], list)
