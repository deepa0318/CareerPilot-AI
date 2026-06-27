import pdfplumber
import re
import json
from pathlib import Path

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise Exception(f"PDF extraction failed: {str(e)}")
    return text.strip()

def parse_resume_sections(text: str) -> dict:
    sections = {
        "contact": {},
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "certifications": []
    }

    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    phone_pattern = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
    linkedin_pattern = re.compile(r'linkedin\.com/in/[\w-]+', re.IGNORECASE)
    github_pattern = re.compile(r'github\.com/[\w-]+', re.IGNORECASE)

    emails = email_pattern.findall(text)
    phones = phone_pattern.findall(text)
    linkedins = linkedin_pattern.findall(text)
    githubs = github_pattern.findall(text)

    sections["contact"] = {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else "",
        "linkedin": linkedins[0] if linkedins else "",
        "github": githubs[0] if githubs else ""
    }

    lines = text.split('\n')
    if lines:
        sections["contact"]["name"] = lines[0].strip()

    return sections