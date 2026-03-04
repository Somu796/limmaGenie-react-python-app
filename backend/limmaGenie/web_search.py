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
    def __init__(self) -> None:
        self.search = DuckDuckGoSearchResults(output_format="list", num_results=5)

    def filter_links(self, websearch_output: list) -> list:
        try:
            return [
                urlparse(entry["link"]).path
                for entry in websearch_output
                if "https://support.bioconductor.org" in entry["link"]
            ]
        except (KeyError, TypeError):  # Ruff: Avoid broad Exception
            return []

    def clean_text(self, text: str) -> str:
        if isinstance(text, str):
            return (
                text.replace("\n", " ")
                .replace("\\'", "'")
                .replace("\\", "")
                .replace("\xa0", "")
            )
        return text

    def clean_after_session_info(self, text: str) -> str:
        if not isinstance(text, str):
            return text
        idx = text.lower().find("sessioninfo()")
        return text[:idx].strip() if idx != -1 else text

    def scrape_question_answers(self, question_links: list) -> list:
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
