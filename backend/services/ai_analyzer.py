"""AI-powered resume analysis using Google Gemini with deep insights"""

import os
import json
import re
import threading
from typing import Dict, List
import google.generativeai as genai
from dotenv import load_dotenv
import markdown

# Load environment variables
load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-pro")


def _load_gemini_api_keys() -> List[str]:
    """Load Gemini API keys from env with support for round-robin key pools."""
    keys: List[str] = []

    csv_keys = os.getenv("GEMINI_API_KEYS", "").strip()
    if csv_keys:
        keys.extend([value.strip() for value in csv_keys.split(",") if value.strip()])

    # Support explicit numbered keys: GEMINI_API_KEY_1..GEMINI_API_KEY_3 (or more)
    for i in range(1, 11):
        value = os.getenv(f"GEMINI_API_KEY_{i}", "").strip()
        if value:
            keys.append(value)

    # Backward-compatible single key
    single_key = os.getenv("GEMINI_API_KEY", "").strip()
    if single_key:
        keys.append(single_key)

    # De-duplicate while preserving order
    unique_keys: List[str] = []
    seen = set()
    for key in keys:
        if key not in seen:
            seen.add(key)
            unique_keys.append(key)

    return unique_keys


GEMINI_API_KEYS = _load_gemini_api_keys()
_ROUND_ROBIN_INDEX = 0
_ROUND_ROBIN_LOCK = threading.Lock()
_GENAI_CALL_LOCK = threading.Lock()


def _keys_for_attempt_order() -> List[str]:
    """Return keys in round-robin start order for this request."""
    if not GEMINI_API_KEYS:
        return []

    global _ROUND_ROBIN_INDEX
    with _ROUND_ROBIN_LOCK:
        start = _ROUND_ROBIN_INDEX
        _ROUND_ROBIN_INDEX = (_ROUND_ROBIN_INDEX + 1) % len(GEMINI_API_KEYS)

    return [GEMINI_API_KEYS[(start + offset) % len(GEMINI_API_KEYS)] for offset in range(len(GEMINI_API_KEYS))]

if GEMINI_API_KEYS:
    genai.configure(api_key=GEMINI_API_KEYS[0])


def _parse_ai_json(result_text: str) -> Dict:
    """Parse AI output into JSON, tolerating fences and trailing content."""
    text = result_text.strip()

    # Remove code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    # Fast path: valid pure JSON
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
        raise ValueError("AI response JSON root must be an object")
    except json.JSONDecodeError:
        pass

    # Recovery path: find first JSON object and decode only that segment
    object_start = text.find("{")
    if object_start == -1:
        raise json.JSONDecodeError("No JSON object found in AI response", text, 0)

    decoder = json.JSONDecoder()
    parsed, _ = decoder.raw_decode(text[object_start:])
    if not isinstance(parsed, dict):
        raise ValueError("AI response JSON root must be an object")

    return parsed


def _generate_with_json_mode(model: genai.GenerativeModel, prompt: str):
    """Generate content with JSON-biased config when supported."""
    return model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    )


def _repair_json_with_ai(model: genai.GenerativeModel, raw_text: str) -> Dict:
    """Ask model to repair malformed JSON into a valid single JSON object."""
    repair_prompt = f"""You are a strict JSON repair tool.
Take the following malformed JSON-like text and return ONLY ONE valid JSON object.
Do not add markdown fences. Do not add explanations.
Preserve original meaning as much as possible.

TEXT TO REPAIR:
{raw_text}
"""
    repaired = _generate_with_json_mode(model, repair_prompt)
    repaired_text = (repaired.text or "").strip()
    return _parse_ai_json(repaired_text)


def _analyze_with_single_key(api_key: str, prompt: str) -> Dict:
    """Run a single analysis attempt with one specific API key."""
    with _GENAI_CALL_LOCK:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)

        try:
            response = _generate_with_json_mode(model, prompt)
        except Exception:
            # Fallback if model/version does not support response_mime_type
            response = model.generate_content(prompt)

        result_text = (response.text or "").strip()

        # Parse JSON response robustly; attempt AI-based repair on malformed JSON
        try:
            return _parse_ai_json(result_text)
        except json.JSONDecodeError:
            return _repair_json_with_ai(model, result_text)

def analyze_with_ai(resume_text: str, job_description: str) -> Dict:
    """
    Analyze resume against job description using Gemini AI with deep insights
    
    Args:
        resume_text: Extracted text from resume
        job_description: Job description text
        
    Returns:
        Dictionary with comprehensive analysis results
    """
    if not GEMINI_API_KEYS:
        raise Exception("Gemini API key not found. Set GEMINI_API_KEYS or GEMINI_API_KEY_1..3 in environment variables")
    
    try:
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

        analysis = None
        attempt_errors: List[str] = []

        for index, api_key in enumerate(_keys_for_attempt_order(), start=1):
            try:
                analysis = _analyze_with_single_key(api_key, prompt)
                break
            except Exception as key_error:
                key_tail = api_key[-6:] if len(api_key) >= 6 else api_key
                attempt_errors.append(f"key#{index}(...{key_tail}): {str(key_error)}")

        if analysis is None:
            raise Exception("All configured Gemini API keys failed. " + " | ".join(attempt_errors))

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
        if not isinstance(analysis.get("deepInsights"), dict):
            analysis["deepInsights"] = {}

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
    return len(GEMINI_API_KEYS) > 0
