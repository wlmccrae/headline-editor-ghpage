"""
Tests for FastAPI app configuration: CORS middleware and API docs visibility.
"""
import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient


# --- CORS ---

def test_cors_allows_configured_origin(client):
    """Requests from the allowed origin should receive CORS headers."""
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_preflight_allowed_origin_returns_200(client):
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200


def test_cors_rejects_unknown_origin(client):
    """Requests from an unlisted origin must NOT receive a wildcard CORS header."""
    response = client.get(
        "/health",
        headers={"Origin": "https://attacker.example.com"},
    )
    allow_origin = response.headers.get("access-control-allow-origin", "")
    assert allow_origin != "https://attacker.example.com"
    assert allow_origin != "*"


def test_cors_multiple_origins_from_env():
    """Comma-separated CORS_HOST env var should allow multiple origins."""
    with patch.dict(
        os.environ,
        {"CORS_HOST": "http://localhost:3000,https://myapp.example.com"},
    ):
        # Re-import to pick up patched env (create a fresh app instance)
        import importlib
        import main as main_module
        importlib.reload(main_module)
        test_client = TestClient(main_module.app)

    response = test_client.get(
        "/health",
        headers={"Origin": "https://myapp.example.com"},
    )
    assert response.headers.get("access-control-allow-origin") == "https://myapp.example.com"


# --- API docs visibility ---

def test_docs_are_disabled_in_production(client):
    """/docs should return 404 when ENV != 'development'."""
    response = client.get("/docs")
    assert response.status_code == 404


def test_redoc_is_disabled_in_production(client):
    """/redoc should return 404 when ENV != 'development'."""
    response = client.get("/redoc")
    assert response.status_code == 404


def test_docs_are_enabled_in_development():
    """/docs should be reachable when ENV=development."""
    with patch.dict(os.environ, {"ENV": "development"}):
        import importlib
        import main as main_module
        importlib.reload(main_module)
        test_client = TestClient(main_module.app)

    response = test_client.get("/docs")
    assert response.status_code == 200


def test_redoc_is_enabled_in_development():
    """/redoc should be reachable when ENV=development."""
    with patch.dict(os.environ, {"ENV": "development"}):
        import importlib
        import main as main_module
        importlib.reload(main_module)
        test_client = TestClient(main_module.app)

    response = test_client.get("/redoc")
    assert response.status_code == 200
