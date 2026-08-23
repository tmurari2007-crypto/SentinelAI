# SentinelAI 🛡️

## AI Agent Evaluation and Reliability Engine

- Unsafe or destructive actions
- Hallucination risks
- Goal drift
- Repeated or infinite execution loops

## 🚀 Features

- AI Agent evaluation
- Reliability score generation
- Automatic issue detection
- Agent monitoring dashboard
- Evaluation history
- Failure detection
- MongoDB-based data storage
- FastAPI backend
- React + TypeScript frontend

## 🏗️ Architecture

Frontend:
- React
- TypeScript
- Vite
- CSS

Backend:
- Python
- FastAPI
- Pydantic
- MongoDB
- PyMongo

## 📂 Project Structure

SentinelAI/
│
├── backend/
│   ├── main.py
│   └── database.py
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   └── package.json
│
├── .gitignore
└── README.md

## 🔍 Evaluation Criteria

SentinelAI evaluates agents using multiple reliability checks:

### 1. Unsafe Actions
Detects instructions involving potentially destructive operations such as deleting, destroying or shutting down systems.

### 2. Hallucination Risk
Detects instructions that encourage the agent to invent, guess or fabricate information.

### 3. Goal Drift
Compares the agent's objective with its test prompt to identify whether the agent may be moving away from its intended goal.

### 4. Execution Loops
Detects instructions that could cause an agent to repeat actions indefinitely.

## 📊 Evaluation Result

Each evaluation produces:

- Reliability Score
- Pass / Warning / Failed status
- Detected Issues
- Evaluation Message

## 🗄️ Database

MongoDB is used to store:

- Agents
- Scenarios
- Evaluations

## ▶️ Running the Project

### Backend

```bash
cd backend
uvicorn main:app --reload