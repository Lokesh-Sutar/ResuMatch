import asyncio

from main import health_check, root


def test_root_endpoint() -> None:
    payload = asyncio.run(root())
    assert payload["message"] == "Welcome to ResuMatch API"
    assert payload["docs"] == "/docs"


def test_health_endpoint() -> None:
    payload = asyncio.run(health_check())
    assert payload == {"status": "healthy"}
