"""AI-powered resume analysis using Google Gemini with deep insights"""

import os
import json
from typing import Dict, List
import google.generativeai as genai
from dotenv import load_dotenv
import markdown

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def analyze_with_ai(resume_text: str, job_description: str) -> Dict:
    """
    Analyze resume against job description using Gemini AI with deep insights
    
    Args:
        resume_text: Extracted text from resume
        job_description: Job description text
        
    Returns:
        Dictionary with comprehensive analysis results
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not found in environment variables")
    
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        prompt = f"""You are an expert resume analyzer and career consultant with deep knowledge of hiring practices. Analyze the following resume against the job description and provide a comprehensive, detailed assessment.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Provide a detailed JSON response with the following structure:
{{
    "score": <number between 0-100>,
    "extractedSkills": [<list of ALL technical and soft skills found in the resume>],
    "matchedSkills": [<list of skills that match the job requirements>],
    "missingSkills": [<list of important skills from job description not in resume>],
    "suggestions": [<list of 5-7 specific, actionable suggestions>],
    "deepInsights": {{
        "overallAssessment": "<2-3 sentence summary of candidate's fit>",
        "strengths": [<list of 3-5 key strengths with explanations>],
        "weaknesses": [<list of 3-5 areas for improvement with explanations>],
        "experienceLevel": "<Junior/Mid-Level/Senior/Expert>",
        "experienceAnalysis": "<detailed analysis of work experience relevance>",
        "educationFit": "<analysis of educational background relevance>",
        "cultureFit": "<assessment based on resume presentation and content>",
        "redFlags": [<list of any concerns or red flags, empty if none>],
        "standoutQualities": [<list of unique qualities that make candidate stand out>],
        "careerTrajectory": "<analysis of career progression and growth>",
        "technicalDepth": "<assessment of technical expertise depth>",
        "communicationSkills": "<assessment based on resume writing quality>",
        "recommendedActions": [<list of specific actions to improve candidacy>],
        "interviewFocus": [<list of areas to probe in interview>],
        "salaryRange": "<estimated salary range based on experience and skills>",
        "hiringRecommendation": "<Strong Hire/Hire/Maybe/Pass with reasoning>"
    }}
}}

CRITICAL INSTRUCTIONS:
1. **Accuracy**: Only include skills ACTUALLY mentioned in the resume
2. **Depth**: Provide detailed, insightful analysis, not generic statements
3. **Specificity**: Reference specific experiences, projects, or achievements from the resume
4. **Honesty**: Be truthful about weaknesses and gaps
5. **Actionability**: Make suggestions concrete and implementable
6. **Context**: Consider the job requirements in every assessment
7. **Professionalism**: Maintain objective, professional tone

For deep insights:
- Analyze career progression and growth trajectory
- Assess technical depth vs breadth
- Evaluate leadership and collaboration indicators
- Consider industry-specific requirements
- Look for passion and continuous learning signals
- Assess problem-solving capabilities from project descriptions
- Evaluate communication through resume quality

Respond ONLY with valid JSON, no additional text.
"""
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        
        result_text = result_text.strip()
        
        # Parse JSON response
        analysis = json.loads(result_text)
        
        # Validate response structure
        required_keys = ["score", "extractedSkills", "matchedSkills", "missingSkills", "suggestions", "deepInsights"]
        for key in required_keys:
            if key not in analysis:
                raise ValueError(f"Missing required key: {key}")
        
        # Validate deep insights structure
        deep_insights_keys = [
            "overallAssessment", "strengths", "weaknesses", "experienceLevel",
            "experienceAnalysis", "educationFit", "cultureFit", "redFlags",
            "standoutQualities", "careerTrajectory", "technicalDepth",
            "communicationSkills", "recommendedActions", "interviewFocus",
            "salaryRange", "hiringRecommendation"
        ]
        for key in deep_insights_keys:
            if key not in analysis["deepInsights"]:
                analysis["deepInsights"][key] = "Not analyzed"
        
        # Ensure score is within range
        analysis["score"] = max(0, min(100, int(analysis["score"])))
        
        # Convert markdown in text fields to HTML for better rendering
        if "deepInsights" in analysis:
            for key in ["overallAssessment", "experienceAnalysis", "educationFit", 
                       "cultureFit", "careerTrajectory", "technicalDepth", 
                       "communicationSkills", "hiringRecommendation"]:
                if key in analysis["deepInsights"] and isinstance(analysis["deepInsights"][key], str):
                    analysis["deepInsights"][key] = markdown.markdown(analysis["deepInsights"][key])
        
        return analysis
    
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"AI analysis failed: {str(e)}")

def is_ai_available() -> bool:
    """Check if AI service is available"""
    return GEMINI_API_KEY is not None
