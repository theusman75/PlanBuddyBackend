# PlanBuddy Backend

## Overview

This is the **backend server** for the PlanBuddy app. It acts as a proxy to the **Google Gemini API** to generate structured task plans from user goals. The server ensures that API keys are **never exposed to the client**, following best practices.

---

## How to Run the Server

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Set environment variables

Create a `.env` file in the `server/` folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8787
```

> **Note:** Never commit your API key to source control.

### 3. Start the server

```bash
npm run dev
```

The server will run on:

```
http://localhost:8787
```

### 4. Test the health endpoint

Open your browser or use curl:

```bash
curl http://localhost:8787/
```

You should see:

```json
{ "message": "Backend running" }
```

### 5. Generate a plan

Send a `POST` request to `/plan`:

```json
POST http://localhost:8787/plan
Content-Type: application/json

{
  "goal": "Learn React Native",
  "horizon": "week"
}
```

Response will be a structured JSON:

```json
{
  "tasks": [
    {
      "id": "1",
      "title": "Read React Native docs",
      "dueDate": "2025-11-08",
      "priority": "high",
      "notes": "Focus on components and navigation",
      "emoji": "📚"
    }
  ]
}
```

---

## Choices / Tradeoffs

1. **Google Gemini API**

   - Structured output enforced via `responseSchema` ensures tasks are returned consistently.

2. **JSON Schema Validation**

   - Used Gemini `responseSchema` to ensure strict JSON format.
   - Minimal manual validation on server (just `JSON.parse`) to catch rare schema errors.

3. **Error Handling**

   - Returns HTTP 400 for missing inputs.
   - Returns HTTP 502 if model output is missing or malformed.
   - Returns HTTP 500 for server-side errors.

4. **HTTP & CORS**

   - `cors()` is enabled to allow Expo app (running on a different port) to access the server.

5. **Simplicity**

   - No database used.
   - Keeps server stateless, simple, and easy to deploy.

---

## Time Spent

- Server setup, API integration, and schema enforcement: ~40 minutes
- Testing, error handling, and documenting: ~10 minutes
  **Total:** ~50 minutes
