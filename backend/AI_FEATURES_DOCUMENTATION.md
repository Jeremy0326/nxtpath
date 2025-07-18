# AI Features & Local LLM Documentation

This document outlines the architecture and technology stack for the AI-powered features in the nxtpath application, focusing on the local AI integration.

## 1. Core Technology Stack

- **Primary Framework:** Django Rest Framework (for backend API)
- **AI Orchestration:** `LangChain` - Used to structure prompts, interact with LLMs, and parse outputs.
- **Local LLM Server:** `LM Studio` - Provides an OpenAI-compatible API endpoint for running local language models.
- **Primary Local LLM:** `Llama 3 13B Instruct` - A powerful, general-purpose model used for CV parsing and job matching analysis. Other models like Mixtral can be swapped in.
- **Semantic Search:** `Sentence-Transformers` (`all-MiniLM-L6-v2`) - Used to create vector embeddings for skills and job descriptions for efficient similarity searching.
-   **Fallback NLP:** `spaCy` - Used for basic entity recognition (like names and emails) if the primary LLM fails.

## 2. Configuration

All AI-related configurations are managed in the `backend/.env` file. This file **must be saved with UTF-8 encoding**.

- `USE_LOCAL_LLM=true`: Enables the connection to LM Studio.
- `LOCAL_LLM_BASE_URL=http://127.0.0.1:1234/v1`: The endpoint for your LM Studio server.
- `LLM_MODEL=llama-3-13b-instruct-v0.1`: The identifier for the model loaded in LM Studio. **This must match the model you have active.**
- `USE_OPENAI=false`: Set to `true` to use the OpenAI API as a fallback (requires `OPENAI_API_KEY`).

## 3. CV Parsing (`cv_parser.py`)

- **Goal:** To extract structured JSON data from a user's uploaded CV.
- **Process:**
    1.  The system sends the full text of the CV to the local LLM.
    2.  A detailed **system prompt** with a "one-shot" example is used to guide the LLM. This prompt strictly enforces the output JSON structure.
    3.  The prompt explicitly instructs the model on how to handle missing data (e.g., for projects and technologies) to avoid null values.
    4.  The returned JSON is validated using a Pydantic model (`CVData`) for data integrity.
    5.  A post-processing step provides additional checks to ensure key fields are never empty.

## 4. Job Matching (`job_matcher.py`)

- **Goal:** To provide a detailed, weighted match analysis between a candidate's parsed CV and a job description.
- **Process:**
    1.  **Semantic Search (Pre-filtering):** First, the `Sentence-Transformer` embedding service is used to find the most semantically similar jobs from the database. This is a fast and efficient way to narrow down the candidates for the more resource-intensive LLM analysis.
    2.  **Detailed LLM Analysis:** For the top semantically similar jobs, the `JobMatcher` sends the candidate's CV data and the job description to the local LLM.
    3.  The prompt asks the LLM to act as a senior recruiter and provide a structured analysis, including separate scores for skills, experience, and education.
    4.  **Weighted Scoring:** The final `overall_match_score` is calculated in the Python code, not by the LLM. It uses weights defined by the employer in the new `EmployerMatchingPreferences` model. If no custom weights are set, it uses default values (e.g., 50% skills, 30% experience, 20% education). This makes the scoring transparent, consistent, and customizable.

## 5. Adjustable Scoring

- The new `EmployerMatchingPreferences` model in the `accounts` app allows employers to specify weights for `skills_weight`, `experience_weight`, and `education_weight`.
- The system validates that these weights always sum to 1.0.
- The `AIJobMatchView` will eventually be updated to fetch these preferences and pass them to the `JobMatcher` to influence the final score. (Note: The UI for this is a future implementation).

# AI Features Checklist & Roadmap

## Core Matching System
- [x] Local LLM integration (LM Studio, Llama 3)
- [x] Robust prompt engineering and JSON extraction
- [x] Employer-adjustable scoring weights (skills, experience, education)
- [ ] Per-job, per-employer dynamic weightage support *(in progress)*
- [ ] Two-stage matching workflow (fast pre-filter, detailed LLM analysis) *(in progress)*
- [ ] Accurate, per-job match scores and analysis in frontend *(in progress)*

## User Experience
- [ ] Fast job list loading with quick match scores *(planned)*
- [ ] Detailed match analysis on demand (modal) *(planned)*
- [ ] Top job recommendations for students *(planned)*
- [ ] Candidate ranking for employers *(planned)*

## Advanced Features
- [ ] LinkedIn profile parser integration *(planned)*
- [ ] Student portfolio enrichment (projects, comments, etc.) *(planned)*
- [ ] Bias mitigation (multi-source profile) *(planned)*

## System Features
- [ ] Complete authentication and user roles *(prototype, needs productionization)*
- [ ] Job posting and management *(prototype, needs productionization)*
- [ ] Application tracking and messaging *(prototype, needs productionization)*
- [ ] Employer admin UI for weightages *(in progress)*

## Documentation & Best Practices
- [x] AI features documentation
- [ ] End-to-end workflow diagrams *(planned)*
- [ ] API and prompt examples *(planned)*

---

## Roadmap
- [ ] Optimize performance and scalability (two-stage matching, caching, async processing)
- [ ] Add more explainable AI features (detailed breakdowns, suggestions)
- [ ] Continuous model and prompt tuning
- [ ] Integrate LinkedIn and portfolio enrichment
- [ ] Complete and polish all system features for production

---

## Current Status
- The backend and LM Studio communicate, with strict JSON output and robust parsing.
- Employer-adjustable scoring is supported in the backend (per-job and per-employer in progress).
- Two-stage matching and frontend/backend integration for unique scores and analyses are being implemented.
- Documentation and best practices are up to date.

---

*This checklist is updated as features are completed or planned. See codebase and issues for implementation details.* 