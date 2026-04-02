"""
Shared fixtures and setup for backend tests.

Sets NYT_API_KEY in the environment before any application modules are
imported, so the module-level `NYT_API_KEY = os.environ.get(...)` in
nyt_api_handler.py picks up a non-empty test value.
"""
import os
import sys

# Must be set before importing the FastAPI app so that the module-level
# NYT_API_KEY variable in nyt_api_handler is populated.
os.environ.setdefault("NYT_API_KEY", "test-api-key-12345")
os.environ.setdefault("ENV", "production")  # keep docs disabled by default
os.environ.setdefault("CORS_HOST", "http://localhost:3000")

# Ensure the backend package root is on the path when tests are run from
# outside the backend/ directory (e.g. from the repo root).
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)
