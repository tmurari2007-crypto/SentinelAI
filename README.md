# SentinelAI 🛡️

## AI Agent Evaluation and Reliability Engine

SentinelAI is an AI agent evaluation platform designed to monitor, evaluate, and identify reliability issues in AI agents.

### 🚀 Live Demo

* **Frontend Application:** [Open SentinelAI](https://sentinelai-1-hvzx.onrender.com)
* **Backend API:** [Open SentinelAI Backend](https://sentinelai-backend-o3o7.onrender.com)

Anyone with these public URLs can access the deployed services, subject to their availability and any access restrictions. To use SentinelAI, start with the frontend application.

### 🔗 Deployment

* **Frontend:** React + TypeScript hosted on Render
* **Backend:** FastAPI hosted on Render
* **Database:** MongoDB Atlas

SentinelAI evaluates agents for:

* Unsafe or destructive actions
* Hallucination risks
* Goal drift
* Repeated or infinite execution loops

## 🚀 Features

* AI Agent evaluation
* Reliability score generation
* Automatic issue detection
* Agent monitoring dashboard
* Evaluation history
* Failure detection
* MongoDB-based data storage
* FastAPI backend
* React + TypeScript frontend

## 🏗️ Architecture

**Frontend**

* React
* TypeScript
* Vite
* CSS

**Backend**

* Python
* FastAPI
* Pydantic
* MongoDB
* PyMongo

### System Flow

```text
User
  ↓
React + TypeScript Frontend
  ↓
FastAPI Backend
  ↓
Evaluation Engine
  ↓
Reliability Analysis
  ↓
MongoDB Atlas
  ↓
Evaluation Results
```

## 📂 Project Structure

```text
SentinelAI/
├── backend/
│   ├── main.py
│   └── database.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   └── package.json
├── .gitignore
└── README.md
```

## 🔍 Evaluation Criteria

SentinelAI evaluates agents using multiple reliability checks:

### 1. Unsafe Actions

Detects instructions involving potentially destructive operations such as deleting, destroying, or shutting down systems.

### 2. Hallucination Risk

Detects instructions that encourage the agent to invent, guess, or fabricate information.

### 3. Goal Drift

Compares the agent's objective with its test prompt to identify whether the agent may be moving away from its intended goal.

### 4. Execution Loops

Detects instructions that could cause an agent to repeat actions indefinitely.

## 📊 Evaluation Result

Each evaluation produces:

* Reliability Score
* Pass / Warning / Failed status
* Detected Issues
* Evaluation Message

## 🗄️ Database

MongoDB is used to store:

* Agents
* Scenarios
* Evaluations

The deployed application uses MongoDB Atlas.

## ▶️ Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs locally at:

`http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs locally at:

`http://localhost:5173`

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=sentinelai
```

**Security:** Never commit your `.env` file, database credentials, or secret API keys to GitHub.

## 🌐 Production Links

* **Live Application:** https://sentinelai-1-hvxz.onrender.com
* **Backend API:** https://sentinelai-backend-o3o7.onrender.com
