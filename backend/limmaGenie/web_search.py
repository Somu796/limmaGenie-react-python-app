import logging
import random
import time
from typing import Any
from urllib.parse import urlparse

import requests  # type: ignore[import-untyped]
from bs4 import BeautifulSoup
from langchain_community.tools import DuckDuckGoSearchResults

# Export only searchQuery
__all__ = ["search_query"]

# module-level logger
logger = logging.getLogger(__name__)


# --- Helpers ---
class _BioconductorScraper:
    """
    Internal scraper for retrieving and parsing Q&A content from support.bioconductor.org.

    Uses DuckDuckGo to search for relevant threads, filters results to Bioconductor
    support links, then scrapes each thread for its question and answer content.

    This class is intended for internal use by ``search_query`` and should not be
    instantiated directly by external callers.
    """

    def __init__(self) -> None:
        """Initialize the scraper with a DuckDuckGo search backend."""
        self.search = DuckDuckGoSearchResults(output_format="list", num_results=5)

    def filter_links(self, websearch_output: list) -> list:
        """
        Extract Bioconductor support URL paths from raw DuckDuckGo search results.

        Filters entries whose ``"link"`` field contains ``support.bioconductor.org``
        and returns only the URL path component (e.g. ``"/questions/12345/..."``),
        suitable for constructing full URLs later.

        Args:
            websearch_output: List of result dicts from DuckDuckGo, each expected
                to have a ``"link"`` key.

        Returns:
            - A list of URL path strings for matching Bioconductor support pages.
            - Returns an empty list if input is malformed or no matches are found.

        """
        try:
            return [
                urlparse(entry["link"]).path
                for entry in websearch_output
                if "https://support.bioconductor.org" in entry["link"]
            ]
        except (KeyError, TypeError):  # Ruff: Avoid broad Exception
            return []

    def clean_text(self, text: str) -> str:
        """

        Normalise raw scraped text by removing common HTML artefacts and escape sequences.

        Performs the following substitutions:
            - single space
            - ``'``
            - empty string
            - empty string (non-breaking space)

        Args:
            text: Raw string to clean. Non-string values are returned unchanged.

        Returns:
            The cleaned string, or the original value if it was not a string.

        """
        if isinstance(text, str):
            return (
                text.replace("\n", " ")
                .replace("\\'", "'")
                .replace("\\", "")
                .replace("\xa0", "")
            )
        return text

    def clean_after_session_info(self, text: str) -> str:
        """
        Truncate text at the first occurrence of ``sessioninfo()``.

        Bioconductor posts frequently end with a ``sessionInfo()`` dump that adds
        noise to LLM context. This method strips everything from that call onward.
        The match is case-insensitive.

        Args:
            text: The post body to truncate. Non-string values are returned unchanged.

        Returns:
            The text up to (but not including) ``sessioninfo()``, stripped of
            trailing whitespace, or the original text if the token is not found.

        """
        if not isinstance(text, str):
            return text
        idx = text.lower().find("sessioninfo()")
        return text[:idx].strip() if idx != -1 else text

    def scrape_question_answers(self, question_links: list) -> list:
        """
        Scrape question and answer content from a list of Bioconductor support paths.

        Args:
            question_links: List of URL path strings as returned by ``filter_links``.

        Returns:
            A list of dicts, one per successfully scraped page, each containing:

            - ``"url"`` (str): The full page URL.
            - ``"title"`` (str): Page title, or ``"No title"`` if not found.
            - ``"question"`` (list[str]): Cleaned text of the opening post.
            - ``"answers"`` (list[str]): Cleaned text of all reply segments.

        """
        all_data = []
        for link in question_links:
            url = f"https://support.bioconductor.org{link}"
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()  # Ruff: check for HTTP errors
                soup = BeautifulSoup(response.text, "html.parser")

                question = []
                discussion = []

                segments = soup.find_all("div", class_="ui vertical segment")
                for i, segment in enumerate(segments):
                    text_block = segment.find("span", itemprop="text")
                    if text_block:
                        cleaned = self.clean_after_session_info(
                            self.clean_text(text_block.get_text()),
                        )
                        if i == 0:
                            question.append(cleaned)
                        else:
                            discussion.append(cleaned)

                page_data = {
                    "url": url,
                    "title": (
                        soup.find("div", class_="title").get_text(strip=True)  # type: ignore
                        if soup.find("div", class_="title")
                        else "No title"
                    ),
                    "question": question,
                    "answers": discussion,
                }
                all_data.append(page_data)
                time.sleep(round(0.1 + random.uniform(0, 0.3), 2))

            except Exception as e:  # Ruff: Specific logging for broad exception
                logging_exception = f"Exception processing {url}: {e}"
                logger.exception(logging_exception)
                continue

        return all_data


def search_query(query: str) -> dict[str, Any]:
    """
    Search Bioconductor support for a query and return scraped Q&A content.

    Args:
        query: The search string to look up (typically a user's bioinformatics question).

    Returns:
        A dict with the following keys:

        - ``"content"`` (list[str]): Formatted Q&A blocks, one per scraped thread.
        - ``"urls"`` (list[str]): Source URLs corresponding to each content block.
        - ``"status"`` (str): ``"successful"`` if at least one thread was scraped,
          ``"failed"`` if no Bioconductor results were found or an exception occurred.
        - ``"error"`` (str): Present only on failure; a human-readable error message.

    """
    scraper = _BioconductorScraper()
    try:
        websearch_output = scraper.search.invoke(query)
        filtered_links = scraper.filter_links(websearch_output)

        if not filtered_links:
            return {
                "content": [],
                "urls": [],
                "status": "failed",
                "error": "No relevant Bioconductor results found.",
            }

        data = scraper.scrape_question_answers(filtered_links)
        content_blocks = []
        source_urls = []

        for item in data:
            if item.get("question") or item.get("answers"):
                block = ""
                if item["question"]:
                    block += f"Q: {item['question'][0]}\n"
                if item["answers"]:
                    block += "\n".join(f"A: {a}" for a in item["answers"])
                content_blocks.append(block)
                source_urls.append(item["url"])

    except Exception as e:
        logger.exception("Search query failed")
        return {"content": [], "urls": [], "status": "failed", "error": str(e)}

    # This is effectively the 'else' logic
    return {"content": content_blocks, "urls": source_urls, "status": "successful"}


# if __name__ == "__main__":
#     test_query = "site:support.bioconductor.org limma topTable"
#     result = search_query(test_query)
#     if result["status"] == "successful":
#         print(f"\nFound {len(result['content'])} results:")
#         for url in result["urls"]:
#             print(f"- {url}")
#     else:
#         print(f"Error: {result.get('error')}")
