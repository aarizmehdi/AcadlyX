import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup request body parsers
  app.use(express.json());

  let openaiClient: OpenAI | null = null;
  function getAiClient() {
    if (!openaiClient) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not defined. Please configure it in your .env.local file.");
      }
      openaiClient = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });
    }
    return openaiClient;
  }

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: AI Syllabus/Assignment Parser
  app.post("/api/ai/parse-syllabus", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "No text provided for parsing" });
      }

      const openai = getAiClient();
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are a precise academic parser. Extract structured courses and assignments. Group assignments by course. For course colors, choose high-contrast pleasant modern hex codes (e.g. #6366f1 (Indigo), #10b981 (Emerald), #ec4899 (Pink), #f59e0b (Amber), #06b6d4 (Cyan), #8b5cf6 (Purple)). Return valid JSON matching this schema: {\"courses\": [{\"name\":\"string\", \"code\":\"string\", \"color\":\"string\"}], \"assignments\": [{\"title\":\"string\", \"description\":\"string\", \"dueDate\":\"YYYY-MM-DD\", \"courseCode\":\"string\", \"difficulty\":\"easy|medium|hard\"}]}"
          },
          {
            role: "user",
            content: `Parse the following syllabus or assignment text. Extract any academic courses and assignments with their due dates. Return a list of courses and a list of assignments with descriptions and calculated due dates in YYYY-MM-DD format (if the year is not specified, assume 2026 as the current year).\nText:\n${text}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const parsedData = JSON.parse(response.choices[0].message.content || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("AI Parser Error:", error);
      res.status(500).json({ error: error.message || "Failed to parse syllabus" });
    }
  });

  // API Route: AI Task Breakdown / Assignment Milestone Planner
  app.post("/api/ai/plan-assignment", async (req, res) => {
    try {
      const { assignmentTitle, description, dueDate, courseName } = req.body;
      if (!assignmentTitle) {
        return res.status(400).json({ error: "Assignment title is required" });
      }

      const openai = getAiClient();
      const today = new Date().toISOString().split('T')[0];

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are an expert academic tutor and study coordinator. Create milestone plans that help students prevent last-minute stress. Be extremely practical and action-oriented. Generate milestones sequentially, with realistic timelines. Return valid JSON matching this schema: {\"steps\": [{\"title\":\"string\", \"dueDate\":\"YYYY-MM-DD\", \"isCompleted\":false}]}"
          },
          {
            role: "user",
            content: `Break down the assignment "${assignmentTitle}" (${courseName || "General Course"}), due on ${dueDate || "unspecified date"}, into 3 to 5 smaller progressive milestones with clear actionable titles and incremental due dates. \nToday's date is ${today}. The milestones must start after today and finish on or before ${dueDate || "the due date"}.\nAssignment details: ${description || "No description provided"}.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const parsedData = JSON.parse(response.choices[0].message.content || "{}");
      res.json(parsedData);
    } catch (error: any) {
      console.error("AI Planner Error:", error);
      res.status(500).json({ error: error.message || "Failed to plan assignment milestones" });
    }
  });

  // API Route: Study Assistant AI Chat Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, courses, assignments } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Chat messages are required" });
      }

      const openai = getAiClient();

      const coursesContext = courses && courses.length > 0 
        ? courses.map((c: any) => `- ${c.name} (${c.code})`).join("\n")
        : "None added yet.";
         
      const assignmentsContext = assignments && assignments.length > 0
        ? assignments.map((a: any) => {
            const course = courses ? courses.find((c: any) => c.id === a.courseId) : null;
            return `- [${a.isCompleted ? "Completed" : "Pending"}] ${a.title} due on ${a.dueDate} (${course ? course.code : "General"}) - Difficulty: ${a.difficulty}`;
          }).join("\n")
        : "None added yet.";

      const systemPrompt = `You are "Study Assistant", a brilliant, supportive, and mindful AI study companion.
Your goal is to help university students manage their stress, structure their study sessions, explain complex academic concepts, and guide them to succeed with their assignments.

You have access to the student's CURRENT academic planner state:
COURSES CURRENTLY ACTIVE:
${coursesContext}

UPCOMING DEADLINES & ASSIGNMENTS:
${assignmentsContext}

Use this context to be incredibly helpful, proactive, and encouraging. For example, if they have an upcoming assignment, you might mention it and ask if they need help outlining, studying, or pacing themselves.
Keep your answers highly structured, easy to digest (use bullet points or neat sections), and keep a serene, motivating, "Vercel-sleek" professional tone.`;

      const formattedMessages = messages.map((m: any) => {
        return {
          role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: String(m.text)
        };
      });

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedMessages
        ],
        temperature: 0.7,
      });

      res.json({ text: response.choices[0].message.content });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate chat response" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server middleware starting...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Acadly Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Acadly server:", err);
});
