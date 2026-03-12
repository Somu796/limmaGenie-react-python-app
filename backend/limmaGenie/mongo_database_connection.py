import logging
from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

logger = logging.getLogger(__name__)


class AtlasClient:
    def __init__(self, atlas_uri: str, dbname: str) -> None:
        """
        Initialize MongoDB client with error handling.

        Args:
            atlas_uri: Connection string for MongoDB
            dbname: Name of the database

        """
        try:
            self.mongodb_client: MongoClient = MongoClient(atlas_uri)
            self.database: Database = self.mongodb_client[dbname]
            logging_message = f"Connected to database: {dbname}"
            logger.info(logging_message)
        except Exception as e:
            logging_message = f"Failed to connect to database: {e}"
            logger.exception(logging_message)
            raise

    def ping(self) -> None:
        """
        Quick method to test Atlas instance connection.

        Raises:
            ConnectionError if ping fails

        """
        try:
            self.mongodb_client.admin.command("ping")
            logger.info("Successfully pinged the database")
        except Exception as e:
            logging_message = f"Ping failed: {e}"
            logger.exception(logging_message)
            raise

    def get_collection(self, collection_name: str) -> Collection:
        """
        Retrieve a specific collection.

        Args:
            collection_name: Name of the collection

        Returns:
            MongoDB collection object

        """
        return self.database[collection_name]

    def find(
        self,
        collection_name: str,
        query_filter: dict[str, Any] | None = None,
        limit: float = 10,
    ) -> list[dict[str, Any]]:
        """
        Find documents in a collection.

        Args:
            collection_name: Name of the collection
            query_filter: Query filter
            limit: Maximum number of documents to return

        Returns:
            List of documents

        """
        query_filter = query_filter or {}
        collection = self.database[collection_name]
        return list(collection.find(filter=query_filter, limit=limit))

    def vector_search(
        self,
        collection_name: str,
        index_name: str,
        attr_name: str,
        embedding_vector: list[float],
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """
        Perform vector search on a collection.

        Args:
            collection_name: Name of the collection
            index_name: Name of the vector search index
            attr_name: Attribute to search on
            embedding_vector: Query embedding vector
            limit: Maximum number of results

        Returns:
            List of search results

        """
        collection = self.database[collection_name]
        try:
            results = collection.aggregate(
                [
                    {
                        "$vectorSearch": {
                            "index": index_name,
                            "path": attr_name,
                            "queryVector": embedding_vector,
                            "numCandidates": 50,
                            "limit": limit,
                        },
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "url": 1,
                            "title": 1,
                            "question": 1,
                            "answers": 1,
                            "code": 1,
                            "search_score": {"$meta": "vectorSearchScore"},
                        },
                    },
                ],
            )
            return list(results)
        except Exception as e:
            logging_message = f"Vector search failed: {e}"
            logger.exception(logging_message)
            return []

    def close_connection(self) -> None:
        """Close the MongoDB client connection."""
        try:
            self.mongodb_client.close()
            logger.info("MongoDB connection closed")
        except Exception as e:
            logging_message = f"Error closing connection: {e}"
            logger.exception(logging_message)
