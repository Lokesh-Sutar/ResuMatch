"""Skill extraction service"""

from utils.skills_db import find_skills_in_text

def extract_skills(text: str) -> list:
    """
    Extract skills from text
    
    Args:
        text: Text to extract skills from
        
    Returns:
        List of found skills
    """
    skills = find_skills_in_text(text)
    return sorted(skills)  # Return sorted for consistency

def extract_skills_from_resume(resume_text: str) -> list:
    """Extract skills from resume text"""
    return extract_skills(resume_text)

def extract_skills_from_job_description(job_description: str) -> list:
    """Extract skills from job description"""
    return extract_skills(job_description)
