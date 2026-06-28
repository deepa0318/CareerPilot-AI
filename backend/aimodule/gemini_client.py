import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

def get_gemini_model(api_key=None):
    key = api_key or os.getenv("GEMINI_API_KEY")

    if not key:
        raise ValueError("Gemini API key not configured")

    genai.configure(api_key=key)

    return genai.GenerativeModel("gemini-2.0-flash")


async def generate_content(prompt, api_key=None):
    model = get_gemini_model(api_key)
    response = model.generate_content(prompt)
    return response.text