"""Analysis route"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.pdf_parser import extract_text_from_pdf, clean_text
from services.skill_extractor import extract_skills_from_resume, extract_skills_from_job_description
from services.matcher import match_skills, calculate_match_score, generate_suggestions
from services.ai_analyzer import analyze_with_ai, is_ai_available

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Analyze resume against job description
    
    Args:
        resume: PDF file upload
        job_description: Job description text
        
    Returns:
        Analysis results with score, skills, and suggestions
    """
    try:
        # Validate file type
        if not resume.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read and extract text from PDF
        file_content = await resume.read()
        resume_text = extract_text_from_pdf(file_content)
        resume_text = clean_text(resume_text)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Validate job description
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description cannot be empty")
        
        # Try AI analysis first if available
        if is_ai_available():
            try:
                result = analyze_with_ai(resume_text, job_description)
                return result
            except Exception as ai_error:
                print(f"AI analysis failed, falling back to keyword matching: {str(ai_error)}")
                # Fall through to keyword-based analysis
        
        # Fallback: Keyword-based analysis
        resume_skills = extract_skills_from_resume(resume_text)
        job_skills = extract_skills_from_job_description(job_description)
        
        match_result = match_skills(resume_skills, job_skills)
        matched_skills = match_result["matched"]
        missing_skills = match_result["missing"]
        
        score = calculate_match_score(resume_skills, job_skills)
        suggestions = generate_suggestions(matched_skills, missing_skills, resume_skills)
        
        return {
            "score": score,
            "extractedSkills": resume_skills,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "suggestions": suggestions
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
