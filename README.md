Markdown  
\# Synthetica 

\> \*\*Autonomous multi-agent dialectic platform exploring organic perspective shifts through episodic reflection and vector memory.\*\*

\[\!\[Stack: MERN\](https\://img.shields.io/badge/Stack-MERN-blue?style=flat-square)\](https\://github.com/)  
\[\!\[Runtime: FastAPI\](https\://img.shields.io/badge/Worker-FastAPI%20%2F%20Python-3776AB?style=flat-square\&logo=python)\](https\://fastapi.tiangolo.com/)  
\[\!\[LLM: Gemini Pro & Flash\](https\://img.shields.io/badge/AI-Gemini%201.5%20Pro%20%7C%20Flash-4285F4?style=flat-square\&logo=google)\](https\://ai.google.dev/)  
\[\!\[Database: MongoDB Atlas Vector Search\](https\://img.shields.io/badge/Vector%20Store-MongoDB%20Atlas-47A248?style=flat-square\&logo=mongodb)\](https\://www\.mongodb.com/products/platform/atlas-vector-search)

\---

\#\#  Overview

Most conversational agent setups freeze model context or degenerate into repetitive loops and echo chambers. \*\*Synthetica\*\* models organic belief evolution between two autonomous AI agents without live weight backpropagation.

Each agent maintains a personal, dynamic episodic memory store. After every turn, the speaking agent:  
1\. \*\*Recalls\*\* relevant prior reflections via MongoDB Atlas Vector Search.  
2\. \*\*Deliberates\*\* and responds using \`gemini-1.5-pro\`.  
3\. \*\*Reflects\*\* on counter-arguments using \`gemini-1.5-flash\` to extract stance shifts and convergence scores.  
4\. \*\*Embeds\*\* and writes new cognitive insights back to long-term memory via \`text-embedding-004\`.

All of this streams live to an interactive cockpit UI featuring real-time thought logs, vector similarity inspectors, and convergence trajectory analytics.

\---

\#\#  System Architecture

\`\`\`text  
 ┌────────────────────────────────────────────────────────┐  
 │            Synthetica Observer UI (React \+ Vite)        │  
 │   • Dual-Column Arena     • Real-time Mind Inspector   │  
 │   • Convergence Chart     • Memory Vector Explorer     │  
 └───────────────────────────▲────────────────────────────┘  
                             │ WebSocket (Socket.IO)  
 ┌───────────────────────────▼────────────────────────────┐  
 │              Express.js Gateway Orchestrator           │  
 │   • State Machine Loop    • Turn Guards & Convergence  │  
 └──────────────┬────────────────────────────┬────────────┘  
                │ Internal REST              │ Mongoose Driver  
 ┌──────────────▼─────────┐       ┌──────────▼────────────┐  
 │  FastAPI Python Worker │       │  MongoDB Atlas Cluster │  
 │  • gemini-1.5-pro      │       │  • dialectic\_sessions │  
 │  • gemini-1.5-flash    │       │  • raw\_turns          │  
 │  • text-embedding-004  │       │  • agent\_reflections  │  
 └────────────────────────┘       │    (\$vectorSearch)    │  
                                  └───────────────────────┘

##  **Repository Structure**

Plaintext  
Synthetica/  
├── client/                     \# Vite \+ React 18 (Tailwind, Lucide, Recharts)  
│   ├── src/  
│   │   ├── components/         \# ArenaView, MindInspector, MetricsDock, SessionControls  
│   │   ├── hooks/              \# useDialecticSocket.ts  
│   │   └── App.tsx  
│   └── package.json  
│  
├── server/                     \# Node.js \+ Express (Gateway & State Machine)  
│   ├── src/  
│   │   ├── models/             \# Mongoose Schemas (Session, Turn, Reflection)  
│   │   ├── services/           \# Orchestrator loop & MongoDB Vector Search  
│   │   ├── sockets/            \# Socket.IO real-time event pipeline  
│   │   └── index.ts  
│   └── package.json  
│  
├── ai\_worker/                  \# Python 3.11+ FastAPI Inference Service  
│   ├── app/  
│   │   ├── schemas/            \# Pydantic schemas (Deliberation, Reflection)  
│   │   ├── services/           \# Gemini Pro/Flash & text-embedding-004  
│   │   └── main.py             \# FastAPI entrypoint (/deliberate, /reflect, /embed)  
│   └── requirements.txt  
│  
├── project\_context.md          \# Complete Architecture & SRS for Agentic IDEs  
└── README.md

##  **Prerequisites**

> * **Node.js** \>= 18.x  
> * **Python** \>= 3.11  
> * **MongoDB Atlas** account with Vector Search enabled  
> * **Google Gemini API Key**

##  **Quickstart Guide**

### **1\. MongoDB Atlas Vector Search Index Setup**

Create a collection named agent\_reflections inside your database and add an Atlas Vector Search index named vector\_memory\_index:

JSON  
{  
  "fields": \[  
    {  
      "type": "vector",  
      "path": "embedding",  
      "numDimensions": 768,  
      "similarity": "cosine"  
    },  
    {  
      "type": "filter",  
      "path": "sessionId"  
    },  
    {  
      "type": "filter",  
      "path": "agentId"  
    }  
  \]  
}

### **2\. Python Inference Microservice**

Bash  
cd ai\_worker  
python \-m venv venv

\# Activate virtualenv:  
\# On Windows:  
venv\\Scripts\\activate  
\# On Linux / macOS:  
source venv/bin/activate

pip install \-r requirements.txt

Create ai\_worker/.env:

Code snippet  
GEMINI\_API\_KEY=your\_gemini\_api\_key\_here  
PORT=8000

Run the service:

Bash  
uvicorn app.main:app \--reload \--port 8000

### **3\. Node.js Gateway & Orchestrator**

Bash  
cd ../server  
npm install

Create server/.env:

Code snippet  
PORT=5000  
MONGODB\_URI=mongodb+srv://\<username\>:\<password\>@cluster.mongodb.net/Synthetica\_db?retryWrites=true\&w=majority  
AI\_WORKER\_URL=http\://localhost:8000  
CLIENT\_ORIGIN=http\://localhost:5173

Run the gateway:

Bash  
npm run dev

### **4\. React Observability Cockpit**

Bash  
cd ../client  
npm install  
npm run dev

Open http\://localhost:5173 to configure debates, track live turns, and inspect emergent memory evolution.

##  **Core Dialectic Loop**

Each conversational cycle executes through a 4-step metacognitive pipeline:

| Phase | Engine | Operation |
| :---- | :---- | :---- |
| **1\. Recall** | MongoDB Atlas | Retrieves top $K$ relevant prior reflections filtered by agentId and query similarity. |
| **2\. Deliberate** | gemini-1.5-pro | Synthesizes incoming rebuttal, retrieved belief history, and base premise into a response. |
| **3\. Reflect** | gemini-1.5-flash | Extracts structured JSON: logical insight, delta-stance shift, and convergence score (0.0–1.0). |
| **4\. Memorize** | text-embedding-004 | Encodes the reflection into a 768-dim vector and persists it to long-term memory. |

##  **Live Observability Features**

> * **Split-Screen Arena:** Color-coded speech feeds for Agent A vs. Agent B with turn metrics and token latency.  
> * **Mind Inspector:** Real-time stream of background self-reflection notes, concessions, and internal belief shifts.  
> * **Vector Inspector:** Click on any turn to inspect the exact past memories that influenced that specific rebuttal.  
> * **Convergence Trajectory:** Live line charts monitoring mathematical consensus and stance drift over turn progression.  
> * **Dialectic Controls:** Full manual override: Start, Pause, Resume, and Step-by-Step execution.

##  **License**

MIT License. Built for multi-agent dialectic and dynamic memory research.

\<FollowUp label="Want the initial boilerplate files generated for the Express orchestrator or Python worker?" query="Provide the starter code for server/src/index.ts and ai\_worker/app/main.py."/\>  
