from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import nyt_api_handler

app = FastAPI(
    title="Headline Editor Backend API",
    version="1.0.0",
    description="API for the Headline Editor application, providing endpoints to fetch and manipulate news headlines.\n\nCreation Date: 2024 June 1\n\nAuthor: [Wanda McCrae](https://wandamccrae.com), Copyright 2024.",
)
app.include_router(nyt_api_handler.router, tags=["NYT_API"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("CORS_HOST", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
