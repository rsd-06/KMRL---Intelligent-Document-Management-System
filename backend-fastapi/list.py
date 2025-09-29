import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- SETUP ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Error: GEMINI_API_KEY not found in your .env file.")
genai.configure(api_key=GEMINI_API_KEY)


# --- LIST MODELS ---
print("🔍 Fetching available models...")

for m in genai.list_models():
  # Check if the model supports the 'generateContent' method
  if 'generateContent' in m.supported_generation_methods:
    print(f"  -> Model Name: {m.name}")

print("\n✅ Done. Use one of the model names listed above in your script.")