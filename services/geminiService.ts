import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { Job, AiAnalysis, Recommendation } from '../types';

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fit_score: { type: Type.INTEGER, description: "A score from 0 to 100 representing candidate fit." },
    recommendation: { 
      type: Type.STRING, 
      enum: ["Apply", "Avoid", "Network First"],
      description: "The final verdict on the application."
    },
    pros_cons: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "A list of bullet points detailing strengths and weaknesses."
    },
    growth_verdict: { 
      type: Type.STRING,
      description: "Analysis of the company's financial outlook."
    }
  },
  required: ["fit_score", "recommendation", "pros_cons", "growth_verdict"]
};

export const analyzeJobMatch = async (job: Job, resumeText: string): Promise<AiAnalysis> => {
  const modelId = 'gemini-3-pro-preview'; // Using Pro for complex reasoning as requested

  const prompt = `
    You are an AI analyst evaluating a job opportunity for a Tech + Sales hybrid candidate.
    
    Candidate Resume Summary:
    ${resumeText.substring(0, 2000)}... (truncated for context)

    Job Details:
    Title: ${job.title}
    Company: ${job.company}
    Description: ${job.description}
    
    Company Financials:
    Type: ${job.financials?.isPrivate ? 'Private' : 'Public'}
    Market Cap: ${job.financials?.marketCap}
    Revenue Growth (YoY): ${(job.financials?.revenueGrowth || 0) * 100}%
    
    Task:
    Analyze the fit based on the job description, company financials, and candidate profile.
    Emphasize hybrid commercial/technical competence and growth trajectory.
    Filter out low-potential or misaligned roles.
    
    Return a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more analytical results
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AiAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback in case of error
    return {
      fit_score: 0,
      recommendation: Recommendation.AVOID,
      pros_cons: ["Error analyzing job data"],
      growth_verdict: "Unable to determine."
    };
  }
};

export const tailorResume = async (job: Job, resumeText: string): Promise<string> => {
  const modelId = 'gemini-3-pro-preview';

  const prompt = `
    You are an expert career strategist.
    
    JOB TARGET:
    Title: ${job.title}
    Company: ${job.company}
    Description: ${job.description}
    
    CANDIDATE RESUME:
    ${resumeText}
    
    TASK:
    Rewrite the candidate's resume summary and key bullet points to perfectly align with this specific job description.
    - Highlight the most relevant skills found in the job description that the candidate possesses.
    - Adjust terminology to match the company's language.
    - Focus on "Tech + Sales" hybrid strengths.
    - Return the response as Markdown text, starting with a new "Tailored Summary" and then "Key Experience Highlights".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });
    
    return response.text || "Could not generate tailored resume.";
  } catch (error) {
    console.error("Resume Tailor Error:", error);
    return "Error generating tailored resume.";
  }
};

export const createChatSession = (resumeText: string): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are a helpful AI Career Coach for the following candidate. 
      
      CANDIDATE CONTEXT:
      ${resumeText}
      
      Your goal is to help them navigate their job search, analyze opportunities, and provide strategic advice.
      Be concise, professional, and encouraging.`,
    }
  });
};