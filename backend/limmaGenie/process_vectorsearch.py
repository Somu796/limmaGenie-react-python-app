import logging
import os
from typing import Any

from langchain_openai import OpenAIEmbeddings

from limmaGenie.mongo_database_connection import AtlasClient

# Export only process_vector_search_results
__all__ = ["process_vector_search_results"]

# module-level logger
logger = logging.getLogger(__name__)


def process_vector_search_results(
    query: str,
    embeddings_func: OpenAIEmbeddings,
    config: dict[str, Any],
    # seed: int = 42,  # Add deterministic seed for reranker logic
) -> dict[str, str] | dict[str, Any]:
    """
    Perform vector search with improved relevance filtering.

    :param query: Search query string
    :param embeddings_func: Function to generate embeddings
    :param config: Configuration dictionary
    :param seed: Random seed for reproducibility
    :return: Dictionary with processed search results
    """
    # Set random seed for reproducibility
    # np.random.seed(seed)

    # Clean up query
    query = query.lower().strip()

    # Generate embeddings
    try:
        query_embedding = embeddings_func.embed_query(query)
    except Exception as e:
        logging_message = f"Embedding generation failed: {e}"
        logger.exception(logging_message)
        return {
            "question": query,
            "content": "",
            "urls": "",
            "status": f"Embedding Error: {e}",
        }

    # Perform vector search
    atlas_client = None
    try:
        atlas_client = AtlasClient(
            os.environ["MONGODB_CONNECTION_STRING"],
            config["DB_NAME"],
        )

        # Retrieve documents
        answers = atlas_client.vector_search(
            collection_name=config["COLLECTION_NAME"],
            index_name=config["INDEX_NAME"],
            attr_name="embedding",
            embedding_vector=query_embedding,
            limit=config.get(
                "NO_MATCH_RETURN",
                3,
            ),  # TODO(#1): increase when reranker is added
        )

        # print(str(answers).encode("utf-8", errors="ignore").decode("utf-8"))

        # # Filter and rank results
        # filtered_answers = filter_and_rank_results(
        #     answers,
        #     query_embedding,
        #     top_k=3,  # Limit to top 3 most relevant results
        # )

    except Exception as e:
        logging_message = f"Vector search failed: {e}"
        logger.exception(logging_message)
        return {
            "question": query,
            "content": "",
            "urls": "",
            "status": f"Search Error: {e}",
        }
    finally:
        if atlas_client:
            atlas_client.close_connection()

    # Process results with improved citation support
    content_with_citations = []
    reference_map = {}

    # Track URLs already added
    # seen_urls = set()

    for idx, answer in enumerate(answers, 1):  # filtered_answers
        # Create a unique reference entry
        url = answer.get("url", "N/A")

        if url != "N/A" and "," in url:
            # seen_urls.add(url)
            # Split URL if it contains multiple parts
            url = url.split(",")[0] + "  " + url.split(",")[1]
        reference_map[idx] = url

        # Process answers with citations
        if answer.get("answers"):
            for answer_text in answer["answers"]:
                cited_answer = {
                    "text": answer_text.strip().replace(chr(10), ""),
                    "citation": f"[{idx}]",
                    "url": url,
                }

                content_with_citations.append(cited_answer)

    # Format content and references
    formatted_content = "\n".join(
        [f"{entry['text']} {entry['citation']}" for entry in content_with_citations],
    )

    formatted_urls = "\n".join(
        [f"{citation_num}. {url}" for citation_num, url in reference_map.items()],
    )

    return {
        "question": query,
        "content": formatted_content,
        "urls": formatted_urls,
        "reference_map": reference_map,
        "status": "successful",
    }
