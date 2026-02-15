# ruff: noqa: INP001

from fastapi import FastAPI
from limmaGenie.answers_retrieval import get_response_llm
from limmaGenie.variables import LLMResponse

app = FastAPI()


@app.get("/")
async def home() -> dict[str, str]:
    return {"status": "limmaGenie is up and running!"}


@app.get("/response")
async def response(user_query: str) -> LLMResponse:
    return get_response_llm(user_query)
