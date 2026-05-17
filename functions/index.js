const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.matchPlumber = onCall({ secrets: [GEMINI_API_KEY] }, async (request) => {
  const { jobData, plumbers } = request.data;

  // Basic validation
  if (!jobData || !plumbers || !Array.isArray(plumbers)) {
    throw new HttpsError("invalid-argument", "Missing jobData or plumbers array.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a plumber-matching assistant for FlowFix, which is a NYC-based plumbing service platform.

Given the user's job details and the list of available plumbers, return ONLY a valid JSON object with no markdown, no explanation, and no extra text.

The JSON must follow this exact format:
{
  "name": "Plumber's full name",
  "specialties": ["specialty1", "specialty2"],
  "rating": 4.9,
  "eta": "20 mins",
  "reason": "One concise sentence explaining why this plumber is the best match for the user."
}

User job details:
- Job type: ${jobData.jobType}
- Description: ${jobData.description}
- Urgency: ${jobData.urgency}
- Location: ${jobData.location}

Available plumbers:
${JSON.stringify(plumbers, null, 2)}

Pick the single best match based on specialty fit, urgency, and rating. Return only the JSON.
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

   //markdown 
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const matched = JSON.parse(cleaned);
    return matched;
  } catch (err) {
    console.error("Gemini error:", err);
    throw new HttpsError("internal", "Failed to match a plumber. Please try again.");
  }
});