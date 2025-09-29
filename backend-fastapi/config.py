# config.py
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# --- API Keys and Connection Strings ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

# --- Model Names ---
GEMINI_MODEL_NAME = "gemini-2.5-flash"
EMBEDDING_MODEL_NAME = "models/text-embedding-004"
EMBEDDING_DIMENSIONS = 768

# --- Database Details ---
DB_NAME = "kmrl_db"
DOCUMENTS_COLLECTION_NAME = "documents"