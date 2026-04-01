# ResuMatch

AI-powered resume analyzer with a modern React frontend and FastAPI backend.

ResuMatch compares a PDF resume against a job description and returns:
- match score
- matched/missing skills
- improvement suggestions
- optional deep AI insights (when Gemini is configured)

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS 3
- Font Awesome
- AOS (scroll animations)
- React Router

### Backend
- FastAPI
- Uvicorn
- PyPDF2 (PDF text extraction)
- Google Gemini (`google-generativeai`) for AI analysis
- Fallback keyword-based analysis if AI is unavailable/fails

---

## Project Structure

```text
ResuMatch/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── routes/
│   │   └── analyze.py
│   ├── services/
│   │   ├── ai_analyzer.py
│   │   ├── matcher.py
│   │   ├── pdf_parser.py
│   │   └── skill_extractor.py
│   └── utils/
│       └── skills_db.py
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── public/
│   │   └── logo/
│   │       └── resumatch-logo.webp
│   └── src/
│       ├── App.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── AnalyzePage.tsx
│       │   └── ResultsPage.tsx
│       ├── components/
│       │   ├── analyze/
│       │   ├── landing/
│       │   └── layout/
│       └── services/api.ts
└── README.md
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+ (or 20+ recommended)
- npm

Optional (for AI insights):
- Gemini API key

---

## Environment Variables

### Backend
Create [backend/.env](backend/.env):

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

If `GEMINI_API_KEY` is missing, backend still works using keyword-matching fallback.

### Frontend
Create [frontend/.env](frontend/.env):

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT_MS=120000
```

---

## Run Locally

### 1) Start Backend

```bash
cd backend
python -m venv .venv

# For Linux/MacOS
source .venv/bin/activate
# For Windows
.venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend URLs:
- API root: http://localhost:8000/
- Swagger docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### 2) Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://localhost:3000

---

## Frontend Routes

- `/` → Landing page
- `/analyze` → Input page (upload resume + job description)
- `/results` → Results view (navigated to after analysis)

---

## API

### `POST /api/analyze`

Analyzes resume against job description.

**Content-Type:** `multipart/form-data`

**Form fields:**
- `resume`: PDF file
- `job_description`: string

### Example Success Response

```json
{
	"score": 82,
	"extractedSkills": ["Python", "FastAPI", "React"],
	"matchedSkills": ["Python", "React"],
	"missingSkills": ["Kubernetes"],
	"suggestions": ["Add Kubernetes experience"],
	"deepInsights": {
		"overallAssessment": "...",
		"strengths": ["..."],
		"weaknesses": ["..."],
		"experienceLevel": "Mid-Level"
	}
}
```

---

## Key Behavior

- Accepts **PDF only** for resumes.
- Performs AI analysis first (when configured).
- Falls back to keyword-based analysis on AI failure.
- Frontend has client-side validation + error handling for:
	- invalid file type
	- oversized file
	- empty job description
	- network timeout/errors

---

## UI Notes

- Light-themed, glassmorphism-inspired interface
- Floating rounded navbar with progress steps
- Animated landing hero with rotating typed keyword
- Tilted score card and animated progress indicator

Logo expected at:
- [frontend/public/logo/resumatch-logo.webp](frontend/public/logo/resumatch-logo.webp)

---

## Troubleshooting

- **CORS issue**: ensure frontend runs on `http://localhost:3000` (backend CORS is configured for this).
- **Timeouts**: increase `VITE_API_TIMEOUT_MS` in [frontend/.env](frontend/.env).
- **No AI insights**: verify `GEMINI_API_KEY` in [backend/.env](backend/.env).
- **No results page data on refresh**: currently results are route-state based; refresh on `/results` clears state and shows fallback message.

---

## Scripts

### Frontend
- `npm run dev` — start Vite dev server
- `npm run typecheck` — TypeScript validation
- `npm run build` — production build
- `npm run preview` — preview build

### Backend
- `uvicorn main:app --reload --port 8000` — run API
