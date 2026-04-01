"""Resume and job description matching service"""

def match_skills(resume_skills: list, job_skills: list) -> dict:
    """
    Match resume skills with job description skills
    
    Args:
        resume_skills: List of skills from resume
        job_skills: List of skills from job description
        
    Returns:
        Dictionary with matched and missing skills
    """
    resume_set = set(skill.lower() for skill in resume_skills)
    job_set = set(skill.lower() for skill in job_skills)
    
    # Find matched skills (case-insensitive)
    matched_lower = resume_set.intersection(job_set)
    matched_skills = [skill for skill in job_skills if skill.lower() in matched_lower]
    
    # Find missing skills
    missing_lower = job_set - resume_set
    missing_skills = [skill for skill in job_skills if skill.lower() in missing_lower]
    
    return {
        "matched": sorted(matched_skills),
        "missing": sorted(missing_skills)
    }

def calculate_match_score(resume_skills: list, job_skills: list) -> int:
    """
    Calculate match score between resume and job description
    
    Args:
        resume_skills: List of skills from resume
        job_skills: List of skills from job description
        
    Returns:
        Match score (0-100)
    """
    if not job_skills:
        return 0
    
    match_result = match_skills(resume_skills, job_skills)
    matched_count = len(match_result["matched"])
    total_required = len(job_skills)
    
    # Calculate base score
    base_score = (matched_count / total_required) * 100 if total_required > 0 else 0
    
    # Bonus points for extra skills
    extra_skills = len(resume_skills) - matched_count
    bonus = min(extra_skills * 2, 10)  # Max 10 bonus points
    
    final_score = min(int(base_score + bonus), 100)
    return final_score

def generate_suggestions(matched_skills: list, missing_skills: list, resume_skills: list) -> list:
    """
    Generate improvement suggestions
    
    Args:
        matched_skills: Skills that match
        missing_skills: Skills that are missing
        resume_skills: All skills from resume
        
    Returns:
        List of suggestions
    """
    suggestions = []
    
    # Suggestions for missing skills
    if missing_skills:
        top_missing = missing_skills[:3]  # Top 3 missing skills
        suggestions.append(f"Add experience with {', '.join(top_missing)} to your resume")
        
        if len(missing_skills) > 3:
            suggestions.append(f"Consider learning {', '.join(missing_skills[3:5])} to strengthen your profile")
    
    # Suggestions based on match rate
    match_rate = len(matched_skills) / (len(matched_skills) + len(missing_skills)) * 100 if (matched_skills or missing_skills) else 0
    
    if match_rate < 50:
        suggestions.append("Your resume matches less than 50% of required skills. Consider tailoring it more closely to the job description")
    elif match_rate < 75:
        suggestions.append("Good match! Adding the missing skills would make your resume even stronger")
    else:
        suggestions.append("Excellent match! Highlight your relevant experience prominently")
    
    # General suggestions
    if matched_skills:
        suggestions.append(f"Emphasize your experience with {', '.join(matched_skills[:2])} in your resume summary")
    
    if len(resume_skills) < 5:
        suggestions.append("Consider adding more technical skills to your resume to showcase your expertise")
    
    return suggestions
