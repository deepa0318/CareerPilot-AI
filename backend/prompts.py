def resume_analysis_prompt(resume_text: str) -> str:
    return f"""
You are an expert career coach and professional resume reviewer with 15+ years of experience in talent acquisition.

Analyze the following resume comprehensively and return a JSON response with this exact structure:
{{
  "overall_score": <0-100 integer>,
  "summary": "<2-3 sentence professional summary of the resume>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improvements": [
    {{"section": "<section name>", "issue": "<issue>", "fix": "<specific fix>"}}
  ],
  "missing_sections": ["<section>"],
  "keywords_found": ["<keyword>"],
  "impact_statements": {{
    "present": <count>,
    "missing": <count>,
    "examples": ["<example of weak statement>"]
  }},
  "formatting_score": <0-100>,
  "content_score": <0-100>,
  "experience_score": <0-100>,
  "skills_score": <0-100>,
  "education_score": <0-100>,
  "top_recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}}

Resume Text:
{resume_text}

Return ONLY valid JSON. No markdown, no explanation.
"""

def ats_analysis_prompt(resume_text: str, job_description: str = "") -> str:
    jd_section = f"\nJob Description:\n{job_description}" if job_description else "\nNo job description provided. Analyze for general ATS compatibility."
    return f"""
You are an ATS (Applicant Tracking System) expert with deep knowledge of how enterprise hiring software parses resumes.

Analyze the resume for ATS compatibility and return this exact JSON structure:
{{
  "ats_score": <0-100 integer>,
  "parse_score": <0-100>,
  "keyword_score": <0-100>,
  "format_score": <0-100>,
  "matched_keywords": ["<keyword>"],
  "missing_keywords": ["<keyword>"],
  "high_priority_missing": ["<keyword>"],
  "section_scores": {{
    "contact_info": <0-100>,
    "work_experience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "summary": <0-100>
  }},
  "formatting_issues": ["<issue>"],
  "suggestions": [
    {{"priority": "high|medium|low", "suggestion": "<actionable suggestion>"}}
  ],
  "ats_friendly_tips": ["<tip>"]
}}

Resume:
{resume_text}
{jd_section}

Return ONLY valid JSON. No markdown, no explanation.
"""

def interview_question_prompt(role: str, difficulty: str = "medium", count: int = 5) -> str:
    return f"""
You are a senior technical interviewer at a top-tier tech company.

Generate {count} realistic interview questions for a {role} position at {difficulty} difficulty level.

Return this exact JSON structure:
{{
  "questions": [
    {{
      "id": <integer>,
      "question": "<question text>",
      "type": "behavioral|technical|situational",
      "difficulty": "{difficulty}",
      "category": "<e.g. System Design, Algorithms, Leadership>",
      "hints": ["<hint 1>", "<hint 2>"]
    }}
  ]
}}

Return ONLY valid JSON. No markdown, no explanation.
"""

def interview_evaluation_prompt(role: str, question: str, answer: str) -> str:
    return f"""
You are an expert interviewer evaluating a candidate for a {role} position.

Evaluate this interview answer and return exact JSON:
{{
  "score": <0-100 integer>,
  "grade": "A|B|C|D|F",
  "feedback": "<detailed 2-3 sentence feedback>",
  "ideal_answer": "<comprehensive model answer>",
  "strengths": ["<strength>"],
  "improvements": ["<area to improve>"],
  "keywords_used": ["<keyword>"],
  "missing_keywords": ["<important keyword not used>"],
  "communication_score": <0-100>,
  "technical_accuracy": <0-100>,
  "structure_score": <0-100>
}}

Role: {role}
Question: {question}
Candidate Answer: {answer}

Return ONLY valid JSON. No markdown, no explanation.
"""

def skill_gap_prompt(target_role: str, current_skills: list) -> str:
    skills_str = ", ".join(current_skills) if current_skills else "Not specified"
    return f"""
You are a career development expert and talent strategist.

Analyze the skill gap for someone targeting a {target_role} role.

Current Skills: {skills_str}

Return this exact JSON:
{{
  "target_role": "{target_role}",
  "readiness_score": <0-100>,
  "required_skills": [
    {{"skill": "<name>", "importance": "critical|important|nice-to-have", "category": "<category>"}}
  ],
  "missing_skills": [
    {{"skill": "<name>", "priority": "high|medium|low", "time_to_learn": "<e.g. 2 weeks>", "reason": "<why needed>"}}
  ],
  "existing_strengths": ["<skill that's already good>"],
  "quick_wins": ["<skill learnable in < 1 week>"],
  "summary": "<2-sentence assessment>"
}}

Return ONLY valid JSON. No markdown, no explanation.
"""

def roadmap_prompt(target_role: str, missing_skills: list, timeline_weeks: int = 12) -> str:
    skills_str = ", ".join(missing_skills[:10]) if missing_skills else "General skills"
    return f"""
You are a professional career roadmap architect.

Create a detailed learning roadmap for someone targeting {target_role} who needs to learn: {skills_str}

Timeline: {timeline_weeks} weeks

Return this exact JSON:
{{
  "title": "<Roadmap title>",
  "overview": "<2-sentence overview>",
  "weekly_plan": [
    {{
      "week": <number>,
      "theme": "<week theme>",
      "goals": ["<goal>"],
      "tasks": ["<specific task>"],
      "resources": [
        {{"type": "course|book|video|project", "name": "<name>", "url": "<url if known>", "free": true|false}}
      ],
      "milestone": "<week milestone>"
    }}
  ],
  "monthly_milestones": [
    {{"month": <number>, "milestone": "<milestone>", "skills_covered": ["<skill>"]}}
  ],
  "final_projects": ["<project idea>"],
  "estimated_job_ready": "<timeline estimate>"
}}

Return ONLY valid JSON. No markdown, no explanation.
"""

def career_chat_prompt(user_message: str, context: str = "", user_profile: dict = None) -> str:
    profile_str = ""
    if user_profile:
        profile_str = f"""
User Profile:
- Target Role: {user_profile.get('target_role', 'Not specified')}
- Experience: {user_profile.get('experience_years', 0)} years
- Location: {user_profile.get('location', 'Not specified')}
"""
    return f"""
You are CareerPilot AI, an expert career advisor with deep knowledge of tech industry hiring, career development, resume writing, interview preparation, and salary negotiation.

{profile_str}

Previous Context:
{context if context else "No previous context."}

User Message: {user_message}

Respond in a helpful, professional, and encouraging tone. Be specific and actionable. Keep responses concise but comprehensive. Format with bullet points when listing items.
"""