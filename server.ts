import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. All AI operations will run in safe mock fallback mode.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const ai = getGeminiClient();

// MOCK FALLBACK DATA (in case GEMINI_API_KEY is not set)
const mockJobs = (city: string, title: string): any[] => {
  const cleanCity = city || "Bengaluru, Karnataka";
  const cleanTitle = title || "React Front-End Engineer";
  return [
    {
      id: "mock-1",
      title: `Senior ${cleanTitle}`,
      company: "InnovateTech Bengaluru",
      location: `${cleanCity}`,
      salary: "18 LPA - 24 LPA",
      description: `We are seeking a senior teammate to lead our client-facing initiatives. You will work on scalable system architecture, mentor junior developers, and coordinate with product owners to deliver stunning user experiences.`,
      type: "Full-time",
      skillsRequired: ["React", "TypeScript", "Node.js", "System Design", "Cloud Infrastructure"],
      matchScore: 85,
      matchingSkills: ["React", "TypeScript"],
      missingSkills: ["System Design", "Cloud Infrastructure"],
      analysisNotes: "Strong technical alignment on the client-side. Some gaps in System Design and cloud deployments can easily be framed as high-potential adapter areas."
    },
    {
      id: "mock-2",
      title: `${cleanTitle} (Mid-Level)`,
      company: "DevSols India",
      location: `${cleanCity}`,
      salary: "12 LPA - 16 LPA",
      description: `Join an agile, dynamic software development squad creating next-generation analytical panels. Excellent culture, with focus on automated testing, clean code, and fast-paced agile iterations.`,
      type: "Full-time",
      skillsRequired: ["React", "Tailwind CSS", "RESTful APIs", "Git", "Jest"],
      matchScore: 92,
      matchingSkills: ["React", "Tailwind CSS", "RESTful APIs"],
      missingSkills: ["Jest"],
      analysisNotes: "Excellent overlap with core layout style and APIs. Mentioning your testing experience with other tooling will close the gap easily."
    },
    {
      id: "mock-3",
      title: `Contract ${cleanTitle} Specialist`,
      company: "Apex Tech Labs",
      location: `${cleanCity}`,
      salary: "14 LPA - 18 LPA",
      description: `Looking for a fast execution consultant to port custom internal dashboards over to modern component structures. Must be comfortable stepping in to existing codebases and converting fast.`,
      type: "Contract",
      skillsRequired: ["React", "TypeScript", "Tailwind CSS", "Figma integration"],
      matchScore: 95,
      matchingSkills: ["React", "TypeScript", "Tailwind CSS"],
      missingSkills: ["Figma integration"],
      analysisNotes: "A direct match for your core stack! Focus your application pitch on quick turnaround times and modular layout construction."
    }
  ];
};

const mockOptimizePackage = (jobTitle: string): any => {
  return {
    optimizedSummary: `Highly motivated professional with extensive experience aligning project requirements using robust systems in order to succeed as a ${jobTitle}. Skilled at turning visual guidelines into interactive web solutions, collaborating across squads, and structuring robust, scalable applications.`,
    enhancedBullets: [
      "Engineered responsive components using React and TypeScript, optimizing client navigation and reducing load latency by 25%.",
      "Collaborated with design and product teams to translate layouts into pixel-perfect structures, adopting rigorous tailwind specifications.",
      "Established comprehensive integration flows with backend APIs, ensuring perfect type alignment and robust validation handling."
    ],
    coverLetter: `Dear Hiring Team,\n\nI am thrilled to submit my interest for the ${jobTitle} opening. Your company's commitment to high quality user experiences and fast-paced technological innovation strongly aligns with my goals.\n\nThroughout my career as a developer, I have focused on constructing responsive client modules, refining API contracts, and ensuring visual consistency. Your listed challenges represent exactly the type of cross-functional and technical problems I excel at solving. I would love the chance to discuss how we can partner together.\n\nWarm regards,\nCandidate`,
    screenerAnswers: [
      {
        id: "scr-1",
        question: "Why do you feel you are a strong candidate for this role?",
        answer: "I bring native competence in the core technical stack including React and modern CSS compilers, combined with high-velocity agile communication and a keen eye for architectural clarity."
      },
      {
        id: "scr-2",
        question: "What is your approach to resolving technical debt or structural refactoring in active projects?",
        answer: "I advocate for incremental refactoring. I isolate subsystems behind solid interfaces, write thorough tests before transforming, and ship visual enhancements in predictable, atomic chunks."
      },
      {
        id: "scr-3",
        question: "What are your salary and timeline expectations?",
        answer: "I am looking for competitive compensation aligned with current regional market rates, and I am available to start within a standard two-week notice window."
      }
    ]
  };
};

// API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.GEMINI_API_KEY ? "AI Active" : "Safe Demo Mode" });
});

// Endpoint: Search Jobs based on candidate profile and city
app.post("/api/search-jobs", async (req, res) => {
  try {
    const { name, currentTitle, city, skills, experience, rawResume } = req.body;
    const searchCity = city || "New York";
    const titleMatch = currentTitle || "Software Engineer";

    if (!process.env.GEMINI_API_KEY) {
      console.log("Using Mock Jobs API (No API Key set)");
      return res.json({ jobs: mockJobs(searchCity, titleMatch) });
    }

    const prompt = `
Candidate Profile:
- Name: ${name || "Applicant"}
- Current Title: ${titleMatch}
- Target City: ${searchCity}
- Listed Skills: ${(skills || []).join(", ") || "None specified"}
- Experience History: ${experience || "Not specified"}
- Raw Resume Text: ${rawResume || "None"}

Please find/generate exactly 5 highly realistic, custom job opportunities that fit the candidate in or near "${searchCity}" (or remote options). Compute precise alignment score, matching skills, and missing skills based on comparison. Write detail explanations for recruiter analysis notes.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert recruiter and Applicant Tracking System (ATS). You generate highly realistic, tailored job postings matches for a specific candidate's region and level, and calculate precise alignment statistics (matchScore from 0 to 100, matchingSkills list, missingSkills list, analysisNotes). Always respond STRICTLY with a valid JSON in a root object containing an array named "jobs".`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["jobs"],
          properties: {
            jobs: {
              type: Type.ARRAY,
              description: "List of highly targeted matching job proposals",
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "company", "location", "salary", "description", "type", "skillsRequired", "matchScore", "matchingSkills", "missingSkills", "analysisNotes"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  salary: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { 
                    type: Type.STRING, 
                    description: "Must be: Full-time, Part-time, Contract, or Remote" 
                  },
                  skillsRequired: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  matchScore: { type: Type.INTEGER },
                  matchingSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  missingSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  analysisNotes: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error in search-jobs route:", error);
    res.status(500).json({ error: error.message || "Failed to parse matching jobs" });
  }
});

// Endpoint: Optimize Resume and Cover Letter for selection
app.post("/api/optimize-resume", async (req, res) => {
  try {
    const { profile, job } = req.body;
    if (!profile || !job) {
      return res.status(400).json({ error: "Profile and Job are both required for optimization" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("Using Mock Resume Optimization API (No API Key set)");
      return res.json(mockOptimizePackage(job.title));
    }

    const prompt = `
Candidate Profile:
- Name: ${profile.name}
- Current Title: ${profile.currentTitle}
- Skills: ${(profile.skills || []).join(", ")}
- Experience Paste: ${profile.experience}
- Raw Resume Context: ${profile.rawResume}

Target Position:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description}
- Skills Required: ${(job.skillsRequired || []).join(", ")}

Generate an expert ATS-optimized application package:
1. optimizedSummary: A 3-4 sentence professional profile focused heavily on the key highlights required.
2. enhancedBullets: Array of 3 key resume experience bullet points re-written to include terms and impact metrics from the job requirements.
3. coverLetter: A completely tailored, beautiful cover letter (3-4 paragraphs) to ${job.company}.
4. screenerAnswers: Create 3 tailored expert answers to potential application screener files. Choose questions relevant to the target job (e.g. why do you want to join, how many years of code, salary). Write them as standard objects with "id", "question", and "answer" properties.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an state-of-the-art career consultant and personal brand copywriter. Write impactful, fully realized texts without generic placeholders. Always respond strictly in valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["optimizedSummary", "enhancedBullets", "coverLetter", "screenerAnswers"],
          properties: {
            optimizedSummary: { type: Type.STRING },
            enhancedBullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            coverLetter: { type: Type.STRING },
            screenerAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "answer"],
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error in optimize-resume route:", error);
    res.status(500).json({ error: error.message || "Failed to generate optimized package" });
  }
});

// Endpoint: AI-Interviewer Coaching Session
app.post("/api/interview-mentor", async (req, res) => {
  try {
    const { history, currentMessage, jobDetails, candidateName } = req.body;

    if (!currentMessage) {
      return res.status(400).json({ error: "currentMessage is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        feedback: "Awesome answers! I can see your dedication. Keep practicing your key framework timelines and metrics.",
        nextQuestion: "Can you elaborate on a challenging technical hurdle you solved on your own recently?"
      });
    }

    const chatHistory = history || [];
    const chatPrompt = `
Context:
- Candidate Name: ${candidateName || "User"}
- Job Title: ${jobDetails?.title || "Staff Engineer"}
- Company: ${jobDetails?.company || "Apex Systems"}
- Description: ${jobDetails?.description || "Build outstanding systems"}

You are an advanced technical interviewer and mock-recruiter conducting a simulated role-playing interview for this specific job opening.
Your response MUST analyze the candidate's last message, provide brief constructive feedback or advice, and then ask a highly relevant, realistic behavioral or technical follow-up interview question.

Chat History:
${chatHistory.map((h: any) => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join("\n")}
Candidate's New Answer: "${currentMessage}"

Please output a JSON object containing:
- feedback: Constructive assessment of the response (style, conciseness, technical depth)
- nextQuestion: Your next interviewer question for this candidate.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
      config: {
        systemInstruction: "You are a professional, highly encouraging yet technically demanding recruiter. You give constructive feedback and then challenge the user with authentic interview questions. Respond strictly in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["feedback", "nextQuestion"],
          properties: {
            feedback: { type: Type.STRING, description: "Feedback on the candidate's answer" },
            nextQuestion: { type: Type.STRING, description: "The next interviewer question" }
          }
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error in interview-mentor route:", error);
    res.status(500).json({ error: error.message || "Failed to get interviewer advice" });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
