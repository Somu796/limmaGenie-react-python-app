import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from pydantic import SecretStr

load_dotenv()

llm = ChatOpenAI(
    model=os.environ["OPENAI_MODEL_NAME"],  # e.g., "gpt-4" or "gpt-3.5-turbo"
    api_key=SecretStr(os.environ["LIMMAGENIE_OPENAI_API_KEY"]),
)
# Initialize the embeddings model
embeddings = OpenAIEmbeddings(
    model=os.environ["EMBEDDING_MODEL_NAME"],
    api_key=SecretStr(os.environ["LIMMAGENIE_OPENAI_API_KEY"]),
)
