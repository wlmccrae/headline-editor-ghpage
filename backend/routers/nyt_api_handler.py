import os
import httpx
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

NYT_API_KEY = os.environ.get("NYT_API_KEY")

@router.get("/nyt")
async def get_nyt_data(year: int = Query(...), month: int = Query(...)):
    if not NYT_API_KEY:
        raise HTTPException(status_code=500, detail="NYT API key not configured.")
    current_year = datetime.now().year
    if year < 1851 or year > current_year or month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid year or month.")

    url = f"https://api.nytimes.com/svc/archive/v1/{year}/{month}.json"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params={"api-key": NYT_API_KEY})
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to reach the NY Times API.")

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"NYT API error: {response.status_code} {response.text[:200]}")

    return response.json()

@router.get("/health", tags=["Public"])
def health():
    """
    Health check endpoint. No authentication required.

    Returns `{"status": "ok"}` when the API is reachable. Intended for
    container health checks and uptime monitoring.
    """
    return {"status": "ok"}
