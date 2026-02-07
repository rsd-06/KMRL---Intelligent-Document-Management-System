import os
import json
from pathlib import Path
from dotenv import load_dotenv
import re

import google.generativeai as genai
import PyPDF2
from PIL import Image
import pytesseract
from langdetect import detect, LangDetectException

# --- 1. SETUP & CONFIGURATION ---
print("🚀 Starting document processing script...")
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Error: GEMINI_API_KEY not found. Please check your .env file.")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Configure Tesseract OCR path (if specified in .env)
tesseract_path = os.getenv("TESSERACT_CMD_PATH")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

# --- 2. TEXT EXTRACTION LOGIC ---
def extract_text_from_local_file(filepath: Path) -> str:
    """Extracts raw text from a local PDF or Image file."""
    if not filepath.is_file():
        raise FileNotFoundError(f"Error: File not found at '{filepath}'")

    print(f"📄 Extracting text from '{filepath.name}'...")
    extension = filepath.suffix.lower()
    text = ""
    try:
        if extension == '.pdf':
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
        elif extension in ['.png', '.jpg', '.jpeg', '.tiff']:
            text = pytesseract.image_to_string(Image.open(filepath))
        else:
            raise ValueError(f"Unsupported file type: '{extension}'")
    except Exception as e:
        print(f"  -> Could not extract text. Error: {e}")
        return ""
    
    print("  -> Text extraction successful.")
    return text.strip()

# --- 3. AI PROCESSING LOGIC ---
def process_content_with_ai(text: str, filename: str) -> dict:
    """Processes extracted text using Gemini to generate a structured JSON."""
    
    # Step 3a: Translate if necessary
    try:
        if detect(text[:500]) != 'en':
            print("🌐 Non-English text detected. Translating...")
            translation_prompt = f"Translate the following document text into professional, clear English:\n\n---\n{text[:2000]}\n---"
            response = model.generate_content(translation_prompt)
            text = response.text.strip()
            print("  -> Translation successful.")
        else:
            print("✅ Text is in English. No translation needed.")
    except LangDetectException:
        print("⚠️ Could not determine language. Assuming English.")
    
    print("🧠 Sending content to Gemini for analysis...")
    # Step 3b: Use a single, powerful prompt for all data extraction
    structured_prompt = f"""
        You are a strict JSON generator.
        Analyze the document text and return ONLY valid JSON (no explanations, no markdown).
        Follow this format exactly:

        {{
          "summary": {{
            "short": "...",
            "long": "..."
          }},
          "tags": ["...", "..."],
          "dates": {{
            "issued": "YYYY-MM-DD or null",
            "deadline": "YYYY-MM-DD or null",
            "review_date": "YYYY-MM-DD or null"
          }},
          "department": "...",
          "category": "..."
        }}

        --- DOCUMENT TEXT ---
        {text[:4000]}
        ---
        """

    try:
        response = model.generate_content(structured_prompt)
        raw_output = response.text.strip()
        print("🔍 Raw Gemini output:", raw_output[:300]) # Debug print
        
        # This block will find the JSON even if Gemini adds extra text
        match = re.search(r"\{.*\}", raw_output, re.DOTALL)
        if match:
            ai_json_part = json.loads(match.group(0))
        else:
            raise ValueError("Gemini did not return a parsable JSON object.")

        # This is the section that was previously commented out
        final_document_json = {
            "_id": "local_test_id_12345", # Placeholder ID
            "filename": filename,
            "content": text, # Using the potentially translated text
            "summary": ai_json_part.get("summary", {}),
            "tags": ai_json_part.get("tags", []),
            "dates": ai_json_part.get("dates", {}),
            "department": ai_json_part.get("department", "Unknown"),
            "category": ai_json_part.get("category", "Uncategorized")
        }
        print("  -> AI analysis successful.")
        return final_document_json # This return statement is crucial

    except Exception as e:
        print(f"  -> Could not process with AI. Error: {e}")
        return {"error": "Failed to generate structured data from AI", "details": str(e)}

# --- 4. MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    # --- 📍 POINT THIS TO YOUR LOCAL DOCUMENT ---
    document_path = Path("documents\EDDR-Final-R1-31-01-24.pdf")
    
    
    # Run the full pipeline
    extracted_text = extract_text_from_local_file(document_path)
    
    if extracted_text:
        final_json_output = process_content_with_ai(extracted_text, document_path.name)
        
        # Print the final, pretty-formatted JSON
        print("\n" + "="*50)
        print("🎉 FINAL PROCESSED DOCUMENT (JSON) 🎉")
        print("="*50)
        print(json.dumps(final_json_output, indent=2))
    else:
        print("\n❌ Script finished with errors. Could not process document.")