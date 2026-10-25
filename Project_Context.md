# Project Synthetica: Emergent Multi-Agent Dialectic via Dynamic Episodic Reflection & Vector Memory

## 1. Project Overview & Objective

Project Synthetica is an experimental multi-agent AI research platform designed to observe emergent reasoning, perspective shifts, and organic learning curves between autonomous LLM instances without live parameter backpropagation.

Rather than relying on static system prompts or running into degenerative conversational loops, each agent maintains an evolving episodic and semantic memory store in MongoDB Atlas. Agents continuously evaluate incoming counter-arguments, extract delta reflections, calculate embedding shifts, and adapt their internal belief states dynamically over multi-turn discourse.

The platform provides a dedicated, highly visual observation dashboard where users can monitor live debates, inspect internal agent thoughts and vector recall streams in real time, replay archived sessions, and analyze convergence trajectories through interactive data visualizations.

---

## 2. Technical Stack & Roles

| Layer | Technology | Role & Purpose |
| :--- | :--- | :--- |
| **Observation Client (UI)** | React 18+, Vite, Tailwind CSS, Lucide Icons, Recharts | Dual-agent live feed, expandable metacognitive mind logs, vector memory inspector, interactive convergence graphs, and session player controls. |
| **Gateway Orchestrator** | Node.js (Express), Socket.IO / SSE | State machine orchestrating turn progression, session lifecycle, MongoDB queries, and client events. |
| **Inference Microservice** | Python 3.11+, FastAPI, Uvicorn | Dedicated worker for Gemini API integration: `gemini-1.5-pro` (deliberation), `gemini-1.5-flash` (reflection), `text-embedding-004` (vectorization). |
| **Database & Vector Store** | MongoDB Atlas (Vector Search) | Unified storage for session configurations, raw conversation turns, and high-dimensional semantic reflections. |
| **Development Environment** | Antigravity IDE (Gemini Pro agentic mode) | Primary workspace for agent scaffolding, testing, and debugging. |

---

## 3. High-Level System Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │            Observation & Exploration UI                │
 │  • Arena Stream (Dual-Column) • Mind Inspector         │
 │  • Convergence Chart          • Memory Vector Explorer │
 └───────────────────────────▲────────────────────────────┘
                             │ Bidirectional WebSocket (Socket.IO)
 ┌───────────────────────────▼────────────────────────────┐
 │                 Node.js / Express Gateway              │
 │      • Session State Machine    • Loop Guards          │
 └──────────────┬────────────────────────────┬────────────┘
                │ Internal HTTP (FastAPI)    │ Mongoose Driver
  ┌─────────────▼──────────┐      ┌──────────▼────────────┐
  │  Python FastAPI Worker │      │ MongoDB Atlas Cluster │
  │  • Gemini 1.5 Pro      │      │ • dialectic_sessions  │
  │  • Gemini 1.5 Flash    │      │ • raw_turns           │
  │  • text-embedding-004  │      │ • agent_reflections   │
  └────────────────────────┘      │   ($vectorSearch)     │
                                  └───────────────────────┘
```

---

## 4. Turn Lifecycle & Processing Pipeline

For each turn $N$ of an active session:

1. **Context Vectorization:** Node.js sends the counterpart's latest message to the Python worker to generate a 768-dimensional embedding via `text-embedding-004`.
2. **Episodic Retrieval (`$vectorSearch`):** Node.js runs an approximate nearest neighbor (ANN) vector search in MongoDB Atlas against the speaking agent's prior reflections (`agentId` filtered) to retrieve top $K$ relevant insights.
3. **Deliberation Prompting:** The retrieved memories, dialogue window (last $M$ turns), and foundational premise are passed to `gemini-1.5-pro` to synthesize the next conversational response.
4. **Metacognitive Reflection:** The resulting exchange (counterpart message + own response) is passed to `gemini-1.5-flash` to extract structured JSON containing:
   - Logical insights gained.
   - Qualitative belief/stance shifts.
   - Convergence score (0.0 to 1.0).
5. **Persistence & Broadcast:** The reflection is embedded, stored in `agent_reflections`, and immediately broadcast via WebSockets to update the user UI in real time.
6. **Convergence & Termination Check:** The orchestrator checks if turn limits or consensus thresholds are met before passing turn control to the opposite agent.

---

## 5. Database Schemas (MongoDB Atlas)

### 5.1 Collection: `dialectic_sessions`

```typescript
interface IDialecticSession {
  _id: string;
  topic: string;
  maxTurns: number;
  currentTurn: number;
  status: 'INITIALIZING' | 'RUNNING' | 'PAUSED' | 'CONVERGED' | 'EXHAUSTED' | 'FAILED';
  agentConfig: {
    agentA: { name: string; corePremise: string; colorTheme: string };
    agentB: { name: string; corePremise: string; colorTheme: string };
  };
  metrics: {
    avgConvergenceScore: number;
    consecutiveHighScores: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Collection: `raw_turns`

```typescript
interface IRawTurn {
  _id: string;
  sessionId: string;
  turnIndex: number;
  sender: 'agent_a' | 'agent_b';
  recipient: 'agent_a' | 'agent_b';
  message: string;
  retrievedMemories: Array<{
    reflectionId: string;
    insight: string;
    similarityScore: number;
  }>;
  timestamp: Date;
}
```

### 5.3 Collection: `agent_reflections`

```typescript
interface IAgentReflection {
  _id: string;
  sessionId: string;
  agentId: 'agent_a' | 'agent_b';
  turnIndex: number;
  insight: string;
  deltaStance: string;
  convergenceScore: number;
  embedding: number[]; // 768 dimensions
  createdAt: Date;
}
```

### 5.4 MongoDB Atlas Vector Search Index

- **Index Name:** `vector_memory_index`
- **Collection:** `agent_reflections`

```json
{
  "fields": [
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
  ]
}
```

---

## 6. Prompt Engineering Specifications

### 6.1 Deliberation Engine Prompt (`gemini-1.5-pro`)

```text
System Context:
You are an autonomous cognitive entity designated as {{agent_id}}.
Your baseline foundational perspective:
"{{core_premise}}"

Evolving Worldview & Past Consolidated Memories:
{{retrieved_memories}}

Dialogue Window:
{{recent_turns}}

Directives:
1. Directly engage with the counter-party's latest points.
2. Incorporate past reflections to build cumulative arguments rather than looping over prior statements.
3. If an argument raised by the counterpart invalidates a prior assumption, adjust your perspective constructively.
4. Do not include conversational filler, formal greetings, or sign-offs.

Output: Provide only your direct dialectical response.
```

### 6.2 Reflection Engine Prompt (`gemini-1.5-flash`)

```text
System Context:
You are the introspective metacognitive evaluator for {{agent_id}}.
Baseline Stance: "{{core_premise}}"

Current Exchange:
- Counterpart Statement: "{{incoming_message}}"
- Generated Response: "{{agent_response}}"

Task:
Evaluate whether {{agent_id}} evolved its worldview or adjusted its stance during this turn.
Respond ONLY with a valid JSON object matching this schema:
{
  "insight": "1-2 sentences stating the specific logical argument, concession, or premise adopted from the counterpart.",
  "deltaStance": "Description of how the current stance differs from the baseline premise.",
  "convergenceScore": 0.0 to 1.0 (float: 0.0 = irreconcilable contradiction, 1.0 = total consensus/resolution)
}
```

---

## 7. Python FastAPI Worker Contract

**Base URL:** `http://localhost:8000`

### Endpoint: `POST /api/embed`

- **Payload:**
  ```json
  {
    "text": "string"
  }
  ```
- **Response:**
  ```json
  {
    "embedding": [0.012, -0.045, 0.089]
  }
  ```

### Endpoint: `POST /api/deliberate`

- **Payload:**
  ```json
  {
    "agent_id": "agent_a",
    "core_premise": "Monoliths are superior for early startup velocity.",
    "retrieved_memories": [
      "Acknowledged that microservices improve fault isolation."
    ],
    "recent_turns": [
      {
        "sender": "agent_b",
        "message": "Without loose coupling, deployments become bottlenecked."
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "response": "While deployment bottlenecks exist, premature distributed complexity kills velocity faster."
  }
  ```

### Endpoint: `POST /api/reflect`

- **Payload:**
  ```json
  {
    "agent_id": "agent_a",
    "core_premise": "Monoliths are superior for early startup velocity.",
    "incoming_message": "Without loose coupling, deployments become bottlenecked.",
    "agent_response": "While deployment bottlenecks exist, premature distributed complexity kills velocity faster."
  }
  ```
- **Response:**
  ```json
  {
    "insight": "Deployment friction can be managed in monoliths with modular boundaries without distributed overhead.",
    "deltaStance": "Maintained pro-monolith position but conceded operational boundaries matter.",
    "convergenceScore": 0.45
  }
  ```

---

## 8. Frontend Observability & Exploration UI Specification

To evaluate and explore multi-agent emergence effectively, the frontend acts as a real-time dialectic cockpit rather than a basic text feed.

### 8.1 Core UI Layout & Views

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Top Bar: Session Title | Status Badge | Turn X/N | [Play] [Pause] [Step]│
├────────────────────────┬─────────────────────────┬─────────────────────┤
│   Agent A Arena        │      Agent B Arena      │ Dynamic Mind Feed   │
│   (Blue Accents)       │      (Amber Accents)    │ & Memory Graph      │
│                        │                         │                     │
│ [Msg 1]                │                         │ Turn 1 Insights:    │
│                        │ [Msg 2]                 │ • Conceded pt X     │
│ [Msg 3]                │                         │ • Score: 0.42       │
│                        │ [Msg 4]                 │                     │
│                        │                         │ Retrieved Vectors:  │
│                        │                         │ [Vector Card #1]    │
├────────────────────────┴─────────────────────────┴─────────────────────┤
│ Bottom Dock: Real-Time Convergence Chart (Recharts) & Stance Evolution │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Dialectic Arena (`ArenaView.tsx`):**
   - Two distinct visual columns (Agent A vs. Agent B) using contrasting palettes (e.g., Indigo/Cyan vs. Amber/Orange).
   - Speech bubbles display the natural language output.
   - Collapsible sub-cards on each message show:
     - *Retrieved Context:* Past memories that influenced this turn (click to view cosine similarity score).
     - *Generation Latency & Token Usage.*
2. **Metacognitive Mind Inspector (`MindInspector.tsx`):**
   - Real-time stream of the background self-reflection passes.
   - Displays the delta-stance evolution for each turn: *"Shifted from hardline stance to modular compromise."*
   - Displays the consensus / convergence metric for that turn.
3. **Convergence & Telemetry Dashboard (`MetricsDock.tsx`):**
   - Interactive line chart built with Recharts showing `convergenceScore` across turn numbers.
   - Visual indicator markers when the agents cross the agreement threshold ($\ge 0.85$).
4. **Session Controls & Explorer (`SessionControls.tsx`):**
   - **Live Controls:** Start, Pause, Resume, Step-by-Step (manual next turn trigger), and Abort.
   - **Topic Creator Modal:** Form to launch experiments with custom topics, agent premises, and max turn limits.
   - **Replay & Archive Mode:** Ability to load prior sessions from MongoDB and scrub back and forth through turns like a video player.

---

## 9. Real-Time WebSocket Event Contract (Socket.IO)

- `session:start` $\rightarrow$ Client triggers a new session run.
- `session:pause` / `session:resume` $\rightarrow$ Client controls pacing or halts turn progression.
- `session:step` $\rightarrow$ Executes exactly one turn and pauses for deep inspection.
- `turn:thinking` $\rightarrow$ Gateway emits `{ agentId, step: 'retrieving' | 'deliberating' | 'reflecting' }`.
- `turn:complete` $\rightarrow$ Gateway emits full turn payload (`message`, `retrievedMemories`, `turnIndex`).
- `reflection:new` $\rightarrow$ Gateway emits reflection payload (`insight`, `deltaStance`, `convergenceScore`).
- `session:ended` $\rightarrow$ Gateway emits termination reason (`CONVERGED` | `EXHAUSTED` | `ABORTED`).

---

## 10. Project Directory Scaffolding

```text
synthetica/
├── Project_Context.md          # Master architecture and specification
├── client/                     # Vite + React (Observability UI)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArenaView.tsx       # Dual-column live debate feed
│   │   │   ├── MindInspector.tsx   # Real-time reflection & vector inspector
│   │   │   ├── MetricsDock.tsx     # Recharts convergence trajectory
│   │   │   ├── SessionControls.tsx # Play/pause/step/replay dock
│   │   │   └── SessionModal.tsx    # Topic & premise configurator
│   │   ├── hooks/
│   │   │   └── useDialecticSocket.ts # Socket.IO state synchronization
│   │   ├── types/
│   │   │   └── index.ts            # Frontend TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Node.js + Express Gateway
│   ├── src/
│   │   ├── models/             # Mongoose schemas (Session, Turn, Reflection)
│   │   ├── services/
│   │   │   ├── orchestrator.ts # Dialectic turn state machine & controls
│   │   │   └── vectorStore.ts  # Atlas Vector Search pipelines
│   │   ├── routes/             # REST routes for past session exploration
│   │   ├── sockets/            # Socket.IO handlers
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
└── ai_worker/                  # Python FastAPI Inference Microservice
    ├── app/
    │   ├── schemas/            # Pydantic schemas (Deliberation, Reflection)
    │   ├── services/           # Gemini Pro/Flash & text-embedding-004 SDK
    │   └── main.py             # FastAPI REST endpoints
    ├── requirements.txt
    └── .env
```

---

## 11. Quickstart Guide

### 1. Python Inference Worker

```bash
cd ai_worker
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

### 2. Express Gateway Server

```bash
cd server
npm install
npm run dev
```

### 3. React Observability Client

```bash
cd client
npm install
npm run dev
```
