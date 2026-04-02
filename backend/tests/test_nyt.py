"""
Tests for GET /nyt.

All tests mock the outbound httpx call so no real network requests are made.
"""
import os
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

NYT_ROUTE = "/nyt"

MOCK_NYT_RESPONSE = {
    "copyright": "Copyright The New York Times Company.",
    "response": {"docs": [{"_id": "abc", "headline": {"main": "Test Story"}}]},
}


def make_mock_http_response(status_code=200, json_data=None):
    """Build a mock httpx Response object."""
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    mock_resp.json.return_value = json_data or MOCK_NYT_RESPONSE
    mock_resp.text = "error text"
    return mock_resp


def patch_httpx(mock_response):
    """Context manager that patches httpx.AsyncClient used by the router."""
    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_response)

    mock_class = MagicMock()
    mock_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
    mock_class.return_value.__aexit__ = AsyncMock(return_value=None)

    return patch("routers.nyt_api_handler.httpx.AsyncClient", mock_class), mock_client


# --- Happy path ---

def test_valid_request_returns_200(client):
    ctx, _ = patch_httpx(make_mock_http_response())
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 200


def test_valid_request_proxies_nyt_json(client):
    ctx, _ = patch_httpx(make_mock_http_response())
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    data = response.json()
    assert "copyright" in data
    assert "response" in data


def test_valid_request_calls_nyt_api_with_api_key(client):
    mock_resp = make_mock_http_response()
    ctx, mock_client = patch_httpx(mock_resp)
    with ctx:
        client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    call_kwargs = mock_client.get.call_args
    assert "api-key" in call_kwargs.kwargs.get("params", {})


def test_valid_request_calls_correct_nyt_archive_url(client):
    mock_resp = make_mock_http_response()
    ctx, mock_client = patch_httpx(mock_resp)
    with ctx:
        client.get(NYT_ROUTE, params={"year": 1969, "month": 7})
    url_called = mock_client.get.call_args.args[0]
    assert "1969/7" in url_called
    assert "api.nytimes.com" in url_called


def test_boundary_year_1851_is_accepted(client):
    ctx, _ = patch_httpx(make_mock_http_response())
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 1851, "month": 1})
    assert response.status_code == 200


def test_boundary_month_1_is_accepted(client):
    ctx, _ = patch_httpx(make_mock_http_response())
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 1})
    assert response.status_code == 200


def test_boundary_month_12_is_accepted(client):
    ctx, _ = patch_httpx(make_mock_http_response())
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 12})
    assert response.status_code == 200


# --- Year validation ---

def test_year_below_1851_returns_400(client):
    response = client.get(NYT_ROUTE, params={"year": 1850, "month": 6})
    assert response.status_code == 400


def test_year_1850_error_detail(client):
    response = client.get(NYT_ROUTE, params={"year": 1850, "month": 6})
    assert "invalid" in response.json()["detail"].lower()


def test_year_0_returns_400(client):
    response = client.get(NYT_ROUTE, params={"year": 0, "month": 6})
    assert response.status_code == 400


def test_non_integer_year_returns_422(client):
    response = client.get(NYT_ROUTE, params={"year": "abcd", "month": 6})
    assert response.status_code == 422


def test_float_year_returns_422(client):
    response = client.get(NYT_ROUTE, params={"year": "2020.5", "month": 6})
    assert response.status_code == 422


# --- Month validation ---

def test_month_0_returns_400(client):
    response = client.get(NYT_ROUTE, params={"year": 2020, "month": 0})
    assert response.status_code == 400


def test_month_13_returns_400(client):
    response = client.get(NYT_ROUTE, params={"year": 2020, "month": 13})
    assert response.status_code == 400


def test_month_negative_returns_400(client):
    response = client.get(NYT_ROUTE, params={"year": 2020, "month": -1})
    assert response.status_code == 400


def test_non_integer_month_returns_422(client):
    response = client.get(NYT_ROUTE, params={"year": 2020, "month": "june"})
    assert response.status_code == 422


# --- Missing parameters ---

def test_missing_year_returns_422(client):
    response = client.get(NYT_ROUTE, params={"month": 6})
    assert response.status_code == 422


def test_missing_month_returns_422(client):
    response = client.get(NYT_ROUTE, params={"year": 2020})
    assert response.status_code == 422


def test_missing_both_params_returns_422(client):
    response = client.get(NYT_ROUTE)
    assert response.status_code == 422


# --- Missing API key ---

def test_missing_api_key_returns_500(client):
    with patch("routers.nyt_api_handler.NYT_API_KEY", None):
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 500


def test_missing_api_key_error_detail(client):
    with patch("routers.nyt_api_handler.NYT_API_KEY", None):
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert "nyt api key" in response.json()["detail"].lower()


# --- Upstream NYT API errors ---

def test_nyt_api_401_is_forwarded(client):
    mock_resp = make_mock_http_response(status_code=401)
    ctx, _ = patch_httpx(mock_resp)
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 401


def test_nyt_api_429_is_forwarded(client):
    mock_resp = make_mock_http_response(status_code=429)
    ctx, _ = patch_httpx(mock_resp)
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 429


def test_nyt_api_503_is_forwarded(client):
    mock_resp = make_mock_http_response(status_code=503)
    ctx, _ = patch_httpx(mock_resp)
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 503


def test_nyt_api_error_response_truncates_error_text(client):
    """Error detail must not expose more than 200 chars of upstream response."""
    long_text = "x" * 500
    mock_resp = make_mock_http_response(status_code=500)
    mock_resp.text = long_text
    ctx, _ = patch_httpx(mock_resp)
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert len(response.json()["detail"]) <= 250  # label + 200 chars of text


# --- Edge cases ---

# Bug fix: previously no upper bound on year; year > current_year now returns 400
def test_future_year_returns_400(client):
    from datetime import datetime
    future_year = datetime.now().year + 1
    response = client.get(NYT_ROUTE, params={"year": future_year, "month": 6})
    assert response.status_code == 400


def test_far_future_year_returns_400(client):
    response = client.get(NYT_ROUTE, params={"year": 9999, "month": 6})
    assert response.status_code == 400


def test_current_year_is_accepted(client):
    from datetime import datetime
    ctx, _ = patch_httpx(make_mock_http_response())
    with ctx:
        response = client.get(NYT_ROUTE, params={"year": datetime.now().year, "month": 1})
    assert response.status_code == 200


# Bug fix: httpx.RequestError previously propagated as an unhandled 500 with
# FastAPI's generic body. Now caught explicitly and returns 503.
def test_httpx_network_error_returns_503(client):
    with patch("routers.nyt_api_handler.httpx.AsyncClient") as mock_class:
        mock_instance = AsyncMock()
        mock_instance.get.side_effect = httpx.ConnectError("Connection refused")
        mock_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_class.return_value.__aexit__ = AsyncMock(return_value=None)
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 503


def test_httpx_network_error_detail_message(client):
    with patch("routers.nyt_api_handler.httpx.AsyncClient") as mock_class:
        mock_instance = AsyncMock()
        mock_instance.get.side_effect = httpx.ConnectTimeout("Timed out")
        mock_class.return_value.__aenter__ = AsyncMock(return_value=mock_instance)
        mock_class.return_value.__aexit__ = AsyncMock(return_value=None)
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert "ny times api" in response.json()["detail"].lower()


# Empty-string API key is falsy in Python, so the existing guard catches it
def test_empty_string_api_key_returns_500(client):
    with patch("routers.nyt_api_handler.NYT_API_KEY", ""):
        response = client.get(NYT_ROUTE, params={"year": 2020, "month": 6})
    assert response.status_code == 500
