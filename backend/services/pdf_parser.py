"""PDF text extraction service"""

import PyPDF2
from io import BytesIO

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from PDF file
    
    Args:
        file_content: PDF file content as bytes
        
    Returns:
        Extracted text as string
    """
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_text(text: str) -> str:
    """Clean extracted text"""
    # Remove extra whitespace
    text = " ".join(text.split())
    return text
