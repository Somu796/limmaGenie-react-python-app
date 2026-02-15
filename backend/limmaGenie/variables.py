from dataclasses import dataclass
from typing import Literal


# Naming data classes
@dataclass
class LLMResponse:
    message: str
    status: Literal["successful", "warning", "no_context", "error"]
