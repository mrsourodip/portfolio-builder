const { GoogleGenAI } = require("@google/genai");

const INSTRUCTION_PROMPT = `
You are an expert technical recruiter and resume analyst.
I will provide you with the raw text from a person's resume.
Your goal is to parse this text and return ONLY a valid JSON object matching the requested schema.

CRITICAL: Analyze the resume content carefully and determine the person's ACTUAL role/title.
Do NOT default to "Backend Developer". If the resume shows a Data Scientist, Frontend Developer,
DevOps Engineer, ML Engineer, Full-Stack Developer, or any other role, use that exact title.
Infer the title from skills, experience descriptions, and job titles mentioned.

Extract the following information:
1. name (string)
2. title (string) - Infer the ACTUAL professional title from the resume content.
3. summary (string) - A SHORT 1-sentence professional tagline. This appears in the left header of the portfolio. If the resume has a "Professional Summary" or "Objective" section, use that (cleaned up). If not, generate a crisp one-liner. Example: "I build scalable distributed systems and high-performance APIs."
4. about (string) - A concise 1-2 paragraph AI-generated bio written in first person. This appears in the portfolio's "About" section. Write it as if the person is describing themselves on their portfolio website. Cover their expertise, what they enjoy working on, and their professional philosophy. Make it engaging but keep it under 2 paragraphs maximum to avoid scroll fatigue. This must be DIFFERENT from summary.
5. skills (array of strings) - clean, standard tech names (e.g., "Node.js", "Docker", "TensorFlow").
6. experience (array of objects) - Each experience MUST have:
   - id (string, e.g. "e1")
   - company (string)
   - role (string)
   - date (string, use em dash like "2021 — Present")
   - description (ARRAY of strings) - provide 3-4 bullet points per experience. Each bullet should be a concise, impactful statement. Use action verbs and include metrics where possible.
7. certifications (array of objects) - if present, extract certifications. Each must have: id, title, issuer, date. Exclude this if nothing is found.
8. projects (array of objects) - id, title, description, tech (string array), and link (string). 
9. contact (object) - email, linkedin, github, portfolio (extract personal website or portfolio links here).

IMPORTANT PROJECT RULES:
- HIGHEST PRIORITY: If the input contains raw HTML (from DOCX) or an "EXTRACTED_HYPERLINKS" section (from PDF), use these exact URLs for projects and contact info.
- MAP HYPERLINKS: If text like "[Live]" or "[Github]" is found near a project description, map it to the corresponding URL from the EXTRACTED_HYPERLINKS list.
- SECOND PRIORITY: If no specific link metadata exists, look for plain text URLs (e.g., github.com/user/repo, http://...) within the project section.
- If multiple links are found, prioritize GitHub repos for the tech stack and Live Demos for the main link.
- Do NOT assign general profile links (like a personal GitHub home page) to individual projects. Only use links that point to the specific project.
- You MUST always return a non-empty "projects" array with at least 1 project.
- If projects are found on the resume, tag them with source: "from_resume", clean up their descriptions, and list tech stack.
- If NO explicit projects are found, but the user has job experience, generate 1-2 projects derived from that experience. Tag them with source: "derived_from_experience".
- If the resume is completely devoid of projects AND experience, generate 2 realistic projects based strictly on the skills they listed. Tag them with source: "ai_generated".

Ensure every returned project has the 'source' field correctly set.

OUTPUT THE RAW DATA IN THIS EXACT JSON SCHEMA (do NOT output markdown blocks, just the JSON string):
{
  "name": "",
  "title": "",
  "summary": "",
  "about": "",
  "skills": [],
  "projects": [
    {
      "id": "1",
      "title": "",
      "description": "",
      "tech": [],
      "source": "from_resume | derived_from_experience | ai_generated",
      "link": ""
    }
  ],
  "certifications": [
    {
      "id": "c1",
      "title": "",
      "issuer": "",
      "date": "",
      "link": ""
    }
  ],
  "experience": [
    {
      "id": "e1",
      "company": "",
      "role": "",
      "date": "",
      "description": ["bullet point 1", "bullet point 2", "bullet point 3"]
    }
  ],
  "contact": {
    "email": "",
    "linkedin": "",
    "github": "",
    "portfolio": ""
  }
}
`;

async function parseResumeToJSON(rawText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  let retries = 3;
  let response;
  
  while (retries > 0) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: INSTRUCTION_PROMPT },
          { text: "RESUME RAW TEXT:\\n" + rawText }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      break; // Success!
      } catch (err) {
      if (err.status === 503 && retries > 1) {
        console.log(`Model high demand (503). Retries left: ${retries - 1}. Waiting 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
        retries--;
      } else if (err.status === 429) {
        throw new Error("AI capacity limit reached (Free Tier). Please wait 30 seconds and try again.");
      } else {
        throw err;
      }
    }
  }

  const textOutput = response.text;
  try {
    const parsed = JSON.parse(textOutput);
    
    // Ensure projects array always exists
    if (!parsed.projects || !Array.isArray(parsed.projects)) {
      parsed.projects = [];
    }
    
    // Ensure about field exists
    if (!parsed.about && parsed.summary) {
      parsed.about = parsed.summary;
    }

    // Ensure certifications exists
    if (!parsed.certifications || !Array.isArray(parsed.certifications)) {
      parsed.certifications = [];
    }
    
    // Ensure experience descriptions are arrays
    if (parsed.experience && Array.isArray(parsed.experience)) {
      parsed.experience = parsed.experience.map(exp => ({
        ...exp,
        description: Array.isArray(exp.description) ? exp.description : 
          (typeof exp.description === 'string' ? [exp.description] : [""])
      }));
    }
    
    return parsed;
  } catch (err) {
    throw new Error("LLM did not return proper JSON: " + textOutput);
  }
}

module.exports = {
  parseResumeToJSON
};
