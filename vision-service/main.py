import os
import io
import json
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

import logging
import sys

log_dir = os.environ.get("LOG_DIR", "logs")
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(log_dir, "vision-service.log")),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("vision-service")

app = FastAPI(title="Vision Service for Expense Analyzer")

# Configure CORS so the frontend can call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractedTransaction(BaseModel):
    merchant: str
    amount: float
    type: str
    transaction_date: str
    category: str
    notes: str = ""

# Instruction for the Gemini model
EXTRACTION_PROMPT = """
Analyze this screenshot of a UPI app (like GPay) transaction history.
Extract all the successful transactions you can find. 
For each transaction, extract:
- merchant (the name of the person or business paid, or the sender if money was received)
- amount (the numerical amount, positive number)
- type (must be exactly "INCOME" if the amount is shown in GREEN color or has a '+' symbol before it, meaning money was received. Must be exactly "EXPENSE" if the amount has no symbol before it or is in grey/white color, meaning money was paid)
- transaction_date (format as YYYY-MM-DD. If the year is not visible, assume 2026. For example, '8 August' -> '2026-08-08')
- category (guess the category based on the merchant name, e.g., 'Food', 'Transport', 'Shopping', 'Transfer', 'Utilities', 'Miscellaneous')
- notes (any payment description or note if present, otherwise empty string)

Return ONLY a JSON array of objects. Do not include markdown formatting or any other text. 
Example format:
[
  {
    "merchant": "Starbucks",
    "amount": 4.50,
    "type": "EXPENSE",
    "transaction_date": "2026-08-08",
    "category": "Food",
    "notes": "Coffee"
  }
]
"""

@app.post("/api/vision/extract-transactions", response_model=List[ExtractedTransaction])
async def extract_transactions(file: UploadFile = File(...)):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set on the server.")

    client = genai.Client(api_key=api_key)

    try:
        # Read the image file
        contents = await file.read()
        
        # Call Gemini 1.5 Flash (good for quick multimodal tasks)
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=[
                types.Content(parts=[
                    types.Part.from_text(text=EXTRACTION_PROMPT),
                    types.Part.from_bytes(data=contents, mime_type=file.content_type)
                ])
            ]
        )
        
        # The model should return a JSON string
        text_response = response.text.strip()
        
        # Clean up any markdown blocks if the model ignored instructions
        if text_response.startswith("```json"):
            text_response = text_response[7:-3]
        elif text_response.startswith("```"):
            text_response = text_response[3:-3]
            
        data = json.loads(text_response)
        return data

    except json.JSONDecodeError:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to parse the AI response into JSON. Response was: " + text_response)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vision/health")
def health_check():
    return {"status": "ok"}
