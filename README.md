<div align="center">
  <img src="public/favicon.svg" alt="AcadlyX Logo" width="120" height="120" />
  <h1>AcadlyX</h1>
  <p><strong>Your Ultimate AI-Powered Study Companion</strong></p>
</div>

AcadlyX is a beautifully designed, modern study companion designed to seamlessly sync your academic life to the cloud, powered by Firebase and OpenRouter (Gemini 2.5 Pro). Built with sleek GSAP animations, glassmorphic UI, and powerful AI logic, AcadlyX helps you keep track of your courses, break down assignments into milestones, and chat with an intelligent study assistant.

## ✨ Features

- **Google Authentication**: Secure and fast login powered by Firebase Auth.
- **Real-Time Cloud Sync**: Your courses, assignments, study sessions, and stats are saved securely on Firestore.
- **AI Study Assistant**: Chat with an advanced tutor powered by Gemini 2.5 Pro (via OpenRouter API).
- **AI Syllabus Parser**: Paste your raw syllabus and watch as AcadlyX automatically extracts your courses and assignments with due dates.
- **AI Assignment Breakdown**: Break massive assignments into practical, progressive milestones so you never procrastinate again.
- **Pomodoro Timer**: A built-in study timer that logs your focused hours directly to your stats.
- **Sleek Aesthetics**: Fluid GSAP entrance animations and a stunning dark/light mode toggle.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, GSAP, Lucide React
- **Backend/API**: Express (Node.js), OpenAI SDK (for OpenRouter)
- **Database & Auth**: Firebase (Firestore & Authentication)

## 🛠️ Setup & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/aarizmehdi/AcadlyX.git
   cd AcadlyX
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory (this file is git-ignored) and add your OpenRouter API Key:
   ```env
   OPENROUTER_API_KEY="your_openrouter_api_key_here"
   ```

4. **Run the App**
   ```bash
   npm run dev
   ```
   *The app will start the Vite frontend and the Express backend concurrently on `http://localhost:3000`.*

## 🚀 Deployment (Vercel)

AcadlyX is ready for Vercel deployment:
1. Import your GitHub repository into Vercel.
2. In the Environment Variables settings, add your `OPENROUTER_API_KEY`.
3. Vercel will automatically build and deploy both the frontend and the Express API server flawlessly.

---
*Designed with ❤️ for exceptional students.*
