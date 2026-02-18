# ruff: noqa: INP001
import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from limmaGenie.answers_retrieval import get_response_llm
from limmaGenie.variables import LLMResponse

load_dotenv()
app = FastAPI()

origins_raw = os.environ["ORIGINS"]
origins = json.loads(origins_raw)
print("This is what we are getting", origins, "from", origins_raw)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def home() -> dict[str, str]:
    return {"status": "limmaGenie is up and running!"}


@app.get("/response")
async def response(user_query: str) -> LLMResponse:
    return get_response_llm(user_query)
