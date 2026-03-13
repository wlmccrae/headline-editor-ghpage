from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import nyt_api_handler

is_dev = os.environ.get("ENV", "production") == "development"

app = FastAPI(
    title="Headline Editor Backend API",
    version="1.0.0",
    description="API for the Headline Editor application, providing endpoints to fetch and manipulate news headlines.\n\nCreation Date: 2026 March 13\n\nAuthor: [Wanda McCrae](https://wandamccrae.com), Copyright 2026.",
    docs_url="/docs" if is_dev else None,
    redoc_url="/redoc" if is_dev else None,
)
app.include_router(nyt_api_handler.router, tags=["NYT_API"])


cors_origins = [o.strip() for o in os.environ.get("CORS_HOST", "http://localhost:3000").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
