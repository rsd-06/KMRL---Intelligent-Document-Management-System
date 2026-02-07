import os
from dotenv import load_dotenv
from llama_index.core import Document, VectorStoreIndex
from llama_index.llms.gemini import Gemini
from llama_index.embeddings.gemini import GeminiEmbedding

# 1. Setup Environment
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY must be set in the .env file.")

# 2. Input Data
document_text = """
Internal Circular for KMRL Staff.
Subject: Implementation of New Safety Protocols.
Circular Number: KMRL/SEC/2025/09/29.
Issued Date: 29/09/2025.

This document outlines the mandatory new safety guidelines for all Kochi Metro stations.
An emergency response drill is scheduled for all staff on October 15th, 2025.
The deadline for the submission of the safety equipment audit report is October 5th, 2025.
These new protocols will become fully effective starting November 1st, 2025.
All department heads are responsible for ensuring their teams are compliant.
"""

user_query = "What is the deadline for the audit report?"

print("Initializing LlamaIndex...")

# 3. Configure LLM + Embeddings
llm = Gemini(model_name="models/gemini-2.5-flash", api_key=GEMINI_API_KEY)
embedding_model = GeminiEmbedding(model_name="models/gemini-2.5-flash", api_key=GEMINI_API_KEY)

# 4. Document + Index
llama_document = Document(text=document_text)
index = VectorStoreIndex.from_documents([llama_document], embed_model=embedding_model)
print("Index created successfully.")

# 5. Query Engine
query_engine = index.as_query_engine(llm=llm)

# 6. Execute Query
print(f"\nExecuting query: '{user_query}'")
response = query_engine.query(user_query)

# 7. Output Response
print("\nResponse:")
print(str(response))
