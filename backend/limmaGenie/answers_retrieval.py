import logging
import os
import random
from collections.abc import Callable
from typing import Any

from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable

from limmaGenie.imported_apis import embeddings, llm
from limmaGenie.process_vectorsearch import process_vector_search_results
from limmaGenie.variables import CONFIG, LLMResponse, greeting_keywords, greetings
from limmaGenie.web_search import search_query

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
os.getenv("LLM_RESPONSE_DEPLOYMENT", "Not Found")


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a Biostatistics assistant named **"limmaGenie"**, an expert in performing limma (Linear Models for Microarray or Omics Data) analyses across omics types (e.g., RNA-seq, microarray, proteomics, ChIP-seq, ATAC-seq, BS-seq, Hi-C).

## Behavior Rules

- If `user_input` is exactly `"greeting"`, respond with a short greeting and **stop**.
- If the user query is **not related to limma**, return only this exact signal: `__NOT_LIMMA__` and **do not answer**.
- If **no relevant RAG context** is found:
  - Do not generate a response.
  - Return this exact signal only: `__TRIGGER_WEBSEARCH__`
- If a **web search is attempted but still no results**:
  - Return this exact signal only: `__NO_ANSWER_FOUND__`
- If returning a special keyword signal (e.g., __NOT_LIMMA__, __TRIGGER_WEBSEARCH__, __NO_ANSWER_FOUND__),
  return the keyword **as plain text only** (not inside quotes, backticks, or code blocks).
---

## Rules for Context Use

1. **Extract relevant facts** from the provided RAG context only.
2. **Never reference or copy names or usernames** from the context. Avoid author attributions or signatures.
3. **Construct the response** using:
   - Markdown formatting.
   - Code blocks where applicable (`r` for R code).
   - Citations in `[X]` format based on context source numbers (use each source once per key point).
4. If the user requests **limma code for a multifactor design**, always combine factors with:
   ```r
   group <- paste(factor1, factor2, sep = "_")
    ```
   - Then build the design matrix using this `group`.

---

## Format Rules

- Use **Markdown** for the full response.
- Use syntax-highlighted code blocks: ```r for R code.
- Keep language clear and beginner-friendly.
- Never include a separate references section — use inline citations.

---

Now answer user's latest query using the same language the user used,
incorporating the citations.

`CONTEXT`: {context}
""",
        ),
        (
            "human",
            """
`User Message`:
{user_input}

Reply for `User Message`. If code is requested, explain the code also in detail in a simple way,
and include the appropriate citations from the context.
""",
        ),
    ],
)

# Create the chain
chain = prompt | llm


def get_response_llm(
    user_query: str,
    # topic: str = "limma",
    process_vector_search_results: Callable[
        ...,
        dict[str, Any],
    ] = process_vector_search_results,
    chain: Runnable = chain,  # type: ignore[assignment]
) -> LLMResponse:  # TODO (#2): Add guardrails and context
    try:
        # GREETING DETECTION

        if user_query.lower().strip() == "greeting" or any(
            k in user_query.lower() for k in greeting_keywords
        ):
            return LLMResponse(
                random.choice(greetings),
                "successful",
            )

        # VECTOR SEARCH
        answer = process_vector_search_results(
            query=user_query,
            embeddings_func=embeddings,
            config=CONFIG,
        )

        if answer["status"] != "successful":
            logger.error(f"Vector search failed! Full output: {answer}")
            return LLMResponse(
                "We are facing connection issues... \n Please try after some time.",
                "warning",
            )

        # FIRST LLM PASS
        input_json = {"user_input": user_query, "context": answer["content"]}

        llm_response = chain.invoke(input_json)
        response_content = str(llm_response.content).strip()
        match response_content:
            case "__NOT_LIMMA__":
                return LLMResponse(
                    "Your question doesn't seem to be related to limma. Please ask me about limma analysis.",
                    "successful",
                )

            case "__TRIGGER_WEBSEARCH__":
                log_message = f"[WEBSEARCH_TRIGGERED] Query: {user_query}"
                logger.info(log_message)
                web_result = search_query(user_query)

                if web_result["status"] != "successful":
                    return LLMResponse(
                        "Web search failed. Please try again later.",
                        "warning",
                    )

                # Re-invoke chain with web context
                input_json["context"] = web_result["content"]
                new_response = str(chain.invoke(input_json).content).strip()
                if new_response == "__NOT_LIMMA__":
                    return LLMResponse(
                        "Your question doesn't seem to be related to limma. Please ask me about limma analysis.",
                        "successful",
                    )

                if new_response == "__NO_ANSWER_FOUND__":
                    return LLMResponse(
                        "*To Note*: No matching context found. This is LLM-generated advice.",
                        "no_context",
                    )

                return LLMResponse(
                    f"{new_response}\n\nReferences:\n{web_result['urls']}",
                    "successful",
                )

            case "__NO_ANSWER_FOUND__":
                return LLMResponse(
                    "*To Note*: No matching context found. This is LLM-generated advice.",
                    "no_context",
                )

            case _:  # Default case (Normal successful response)
                return LLMResponse(
                    f"{response_content}\n\nReferences:\n{answer['urls']}",
                    "successful",
                )

    except Exception as e:
        logging_message = f"Unexpected error in get_response_llm: {e}"
        logger.exception(logging_message)
        return LLMResponse("An unexpected error occurred.", "error")


# # Example usage
# if __name__ == "__main__":
#     query = "Perform 2*2*2 limma analysis"  # "Differential gene expression analysis on haplotype-resolved diploid assemblyedgeRDESeq2haplotypelimma"
#     answers = get_response_llm(user_query=query)
#     print(answers)
