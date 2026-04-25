# LexiClue — ThemeShift: Vocabulary Quest

Theme-based word guessing game powered by **Groq AI** (llama-3.3-70b), Rust/Axum backend, React/Vite frontend.

## Run Locally

**Prerequisites:** Node.js, Rust (stable)

1. Add your Groq key (get free at https://console.groq.com/keys) to `.env.local`:
   ```
   GROQ_API_KEY="gsk_..."
   ```
2. Start both servers:
   ```bash
   make dev
   # Frontend → http://localhost:3000
   # Backend  → http://localhost:8080
   ```

## Deploy to Render (free)

1. Push this repo to GitHub
2. Go to https://render.com → **New → Web Service → connect your GitHub repo**
3. Render detects `render.yaml` and `Dockerfile` automatically
4. Set the environment variable in the Render dashboard:
   ```
   GROQ_API_KEY=gsk_...
   ```
5. Click **Deploy** — Render builds the Docker image and publishes the app

The single Docker container serves both the API and the React frontend.
