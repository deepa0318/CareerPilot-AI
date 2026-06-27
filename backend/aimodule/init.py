import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

def get_gemini_model(api_key: str = None):
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        raise ValueError("Gemini API key not configured")
    genai.configure(api_key=key)
    return genai.GenerativeModel("gemini-1.5-flash")

async def generate_content(prompt: str, api_key: str = None) -> str:
    try:
        model = get_gemini_model(api_key)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")