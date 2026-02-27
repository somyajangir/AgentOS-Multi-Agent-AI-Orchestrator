# 🚀 AgentOS – Multi-Agent AI Orchestration System

## 🎥 Project Demo
▶️ **Watch the full working demo here:**  
https://drive.google.com/file/d/1V3O-adij0cYxgvkg8xyhAPK5U-EySugm/view?usp=drive_link

---


A sophisticated Multi-Agent System built with **Hono**, **React**, and **Google GenAI**, featuring a centralized Router Agent that intelligently delegates tasks to specialized sub-agents (Support, Order, Billing).

## 🚀 Overview

This project implements a scalable **Controller-Service architecture** where a "Parent" Router Agent analyzes user intent and routes queries to the appropriate "Child" Agent. It features a Neo-Brutalist frontend, real-time reasoning visualization, and robust error handling.

## 🎯 Why This Project Matters

Modern AI systems require orchestration across multiple specialized agents rather than relying on a single monolithic model. 

This project demonstrates:
- Intelligent intent classification
- Agent-based task delegation
- Context preservation across turns
- Rate-limited production-style architecture
- Transparent AI reasoning visualization

It simulates how enterprise-grade AI systems are structured.

### ✨ Key Features

-   **🧠 Intelligent Routing:** The **Router Agent** uses hybrid heuristic/AI analysis to classify intent (Order vs. Billing vs. Support) with fallback handling.
-   **🤖 Specialized Sub-Agents:**
    -   **Support Agent:** Handles general inquiries and FAQs using context-aware responses.
    -   **Order Agent:** Manages order status, tracking, and modifications.
    -   **Billing Agent:** Resolves payment issues, refunds, and invoice queries.
-   **⚡ High Performance:** Built on **Hono** for ultra-fast edge-ready routing.
-   **⏳ Rate Limiting:** Global `TokenBucket` implementation to prevent abuse (Token refilling algorithm).
-   **🔄 Context Awareness:** Agents receive full conversation history to maintain context across turns.
-   **👁️ Reasoning Transparency:** Frontend visualizes the agent's "thought process" (steps) before showing the final reply.
-   **🎨 Neo-Brutalist UI:** A distinct, high-contrast design system using TailwindCSS.

---
## 🏗️ How Queries Are Processed

```
USER SENDS MESSAGE
"Check my order status"
        ↓
      ↓ ↓ ↓
  
┌─────────────────────┐
│  1. ROUTER API      │
│  (Hono Server)      │
│  Receive message    │
│  Rate limit check   │
└──────────┬──────────┘
           ↓
           
┌─────────────────────┐
│  2. INTENT CHECK    │
│  (Router Agent)     │
│  Analyze: "order"   │
│  Classify intent    │
└──────────┬──────────┘
           ↓
      ┌────┴─────┐
      ↓          ↓
      
 ORDER AGENT   BILLING AGENT   SUPPORT AGENT
      ↓              ↓              ↓
      
┌─────────────────────┐
│  3. SPECIALIZED     │
│  AGENT SELECTED     │
│  Use agent tools    │
│  Query database     │
└──────────┬──────────┘
           ↓
           
┌─────────────────────┐
│  4. CALL GEMINI AI  │
│  (Google GenAI)     │
│  Generate response  │
│  With reasoning     │
└──────────┬──────────┘
           ↓
           
┌─────────────────────┐
│  5. GET RESPONSE    │
│  Thinking steps:    │
│  ✓ Fetching order   │
│  ✓ Checking status  │
│  ✓ Formatting       │
└──────────┬──────────┘
           ↓
           
┌─────────────────────┐
│  6. SAVE TO DB      │
│  Store conversation │
│  (PostgreSQL)       │
└──────────┬──────────┘
           ↓
           
┌─────────────────────┐
│  7. SEND TO FRONTEND│
│  JSON response      │
│  reasoning + answer │
└──────────┬──────────┘
           ↓
           
┌─────────────────────┐
│  8. SHOW USER       │
│  React animates     │
│  "Your order is     │
│   in transit"       │
└─────────────────────┘
```

---

### ⚡ Quick Process Summary

| Step | What Happens | Time |
|------|--------------|------|
| 1️⃣ | Message received at API | ~1ms |
| 2️⃣ | Intent classification | ~200ms |
| 3️⃣ | Route to correct agent | ~50ms |
| 4️⃣ | Query database | ~100ms |
| 5️⃣ | GenAI generates response | ~1-2s |
| 6️⃣ | Save to database | ~50ms |
| 7️⃣ | Send to frontend | ~10ms |
| 8️⃣ | User sees answer | ~2.5s total |

---

### 🎯 What Each Agent Does

**ORDER AGENT** 📦  
→ Tracks packages, checks status, modifies orders

**BILLING AGENT** 💳  
→ Processes refunds, shows invoices, payment history

**SUPPORT AGENT** 🤝  
→ Answers FAQs, general questions, helps users

---

### 🔑 Key Points

✅ **Router decides** which agent gets the message  
✅ **Agent uses tools** to fetch real data  
✅ **AI generates** natural human response  
✅ **Reasoning shown** so users see how AI thinks  
✅ **Everything saved** for conversation history

## 🛠️ Tech Stack

### **Backend**
-   **Framework:** [Hono](https://hono.dev/) (Node.js Adapter)
-   **Language:** JavaScript (ES Modules)
-   **Database:** PostgreSQL (via **Prisma ORM**)
-   **AI Engine:** Google GenAI SDK (Gemini Models) / OpenRouter
-   **Architecture:** Controller-Service Pattern

### **Frontend**
-   **Library:** React 19 + Vite
-   **Styling:** TailwindCSS 4 (Neo-Brutalist Theme)
-   **State Management:** React Hooks
-   **Icons:** Lucide React

---

## 📂 Project Structure

The project is organized into modular services:

```
.
├── router/             # 🧠 Central Request Router & Orchestrator
│   ├── src/routes/     # API Endpoints (Chat, Agents)
│   ├── src/services/   # Router Agent Logic (Intent Classification)
│   └── prisma/         # Database Schema & Seeds
├── support/            # 🤝 Support Agent Service
│   └── src/tools.js    # Agent Tools (History Query)
├── order/              # 📦 Order Agent Service
├── billing/            # 💳 Billing Agent Service
└── frontend/           # 💻 React User Interface
```

---

## 🚀 Implemented Milestones

### ✅ Core Requirements
-   [x] **Multi-Agent System:** Implemented Router, Support, Order, and Billing agents.
-   [x] **Controller-Service Pattern:** Clean separation of route handling (`chat.js`) and business logic (`routerAgent.js`).
-   [x] **Error Handling:** Robust middleware and try/catch blocks with user-friendly error messages.
-   [x] **Agent Tools:** Sub-agents have access to tools (e.g., `queryConversationHistory`).
-   [x] **Context Management:** Full conversation history passed to agents for stateful interactions.

### 🌟 Bonus Achievements
-   [x] **Rate Limiting:** Custom `TokenBucket` algorithm implemented in the Router to manage load.
-   [x] **Reasoning Visualization:** "Thinking" steps (e.g., "Analyzing intent...") are streamed and animated in the UI.
-   [x] **Context Management:** Agents utilize previous conversation messages to inform responses.
-   [x] **Services Setup:** Modular structure allowing independent development of agents.

---

## 🔌 API Endpoints

### Chat Router (`/api/chat`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/messages` | Send a new message. Routes to appropriate agent. |
| `GET` | `/conversations` | List all user conversations. |
| `GET` | `/conversations/:id` | Get full history of a specific conversation. |
| `DELETE` | `/conversations/:id` | Delete a conversation. |

---

## 🏃‍♂️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL
-   Google Gemini API Key / OpenRouter Key

### Installation

1.  **Clone the repository**
2.  **Install dependencies** for each service:
    ```bash
    cd router && npm install
    cd ../frontend && npm install
    # Repeat for billing, order, support
    ```
3.  **Database Setup:**
    ```bash
    cd router
    npx prisma generate
    npx prisma db push
    npx prisma db seed # Seeds initial data
    ```
4.  **Environment Variables:**
    Create `.env` files in `router`, `support`, etc., based on requirements (PORT, DATABASE_URL, API_KEYS).

### Running the System

1.  **Start the Router:**
    ```bash
    cd router && npm run dev
    ```
2.  **Start Sub-Agents:**
    Run `npm run dev` in `support`, `order`, and `billing` directories.
3.  **Start Frontend:**
    ```bash
    cd frontend && npm run dev
    ```

Open `http://localhost:5173` to interact with the Agent OS!

---



**Developed by Somya Jangir**
