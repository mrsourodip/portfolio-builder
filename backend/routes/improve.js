const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

router.post('/', async (req, res) => {
  try {
    const { text, type } = req.body; // type: 'project_description' | 'experience_bullet' | 'summary'
    
    if (!text) {
      return res.status(400).json({ error: 'Missing text to improve.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompts = {
      project_description: `You are a technical writer. Improve this project description to be more impactful, concise, and professional. Include metrics or technical depth where possible. Keep it to 2-3 sentences max. Return ONLY the improved text, no quotes or explanation.\n\nOriginal: "${text}"`,
      experience_bullet: `You are a resume expert. Improve this bullet point to be more impactful using strong action verbs, quantifiable results, and technical specificity. Keep it to 1 sentence. Return ONLY the improved text, no quotes or explanation.\n\nOriginal: "${text}"`,
      summary: `You are a personal branding expert. Improve this professional summary/tagline to be more compelling and memorable. Keep it to 1-2 sentences max. Return ONLY the improved text, no quotes or explanation.\n\nOriginal: "${text}"`,
      about: `You are a personal branding expert. Improve this about/bio section to be more engaging, personal, and professional. Write in first person. Keep it to 1-2 paragraphs maximum to avoid scroll fatigue. Return ONLY the improved text, no quotes or explanation.\n\nOriginal: "${text}"`
    };

    const prompt = prompts[type] || prompts.project_description;

    let retries = 3;
    let response;
    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ text: prompt }],
        });
        break;
      } catch (err) {
        if (err.status === 503 && retries > 1) {
          await new Promise(r => setTimeout(r, 3000));
          retries--;
        } else if (err.status === 429) {
          throw new Error("AI capacity limit reached (Free Tier). Please wait 30 seconds and try again.");
        } else {
          throw err;
        }
      }
    }

    const improved = response.text?.trim();
    res.json({ improved });

  } catch (error) {
    console.error("Improve error:", error);
    res.status(500).json({ error: error.message || 'Failed to improve text.' });
  }
});

module.exports = router;
