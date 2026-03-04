from dataclasses import dataclass
from typing import Literal


# Naming data classes
@dataclass
class LLMResponse:
    message: str
    status: Literal["successful", "warning", "no_context", "error"]


# Database
CONFIG = {
    "DB_NAME": "limmaGenie_Database",
    "COLLECTION_NAME": "merged_data",
    "INDEX_NAME": "merged_data_index",
    "NO_MATCH_RETURN": 5,
}

greeting_keywords = [
    "hello",
    "hi",
    "hey",
    "greetings",
    "good morning",
    "good afternoon",
    "good evening",
    "howdy",
    "what's up",
    "hola",
]

greetings = [
    "Hi there! I am *limmaGenie*. How can I help you today?",
    "Hello! *limmaGenie* here. How may I assist you today?",
    "Hey! I'm *limmaGenie*. What can I do for you today?",
    "Greetings! I'm *limmaGenie*. How can I assist you?",
    "Hi! This is *limmaGenie*. How may I help you today?",
    "Hello! I am *limmaGenie*, here to help. What do you need assistance with?",
    "Hey there! *limmaGenie* at your service. How can I support you today?",
    "Hi! *limmaGenie* here. Let me know how I can help!",
    "Good day! I'm *limmaGenie*. How may I assist you today?",
    "Hi there! This is *limmaGenie* speaking. How can I help?",
]
