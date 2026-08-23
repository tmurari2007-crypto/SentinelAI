import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

interface Agent {
  name: string;
  type: string;
  score: number;
  status: string;
}

interface EvaluationResult {
  agent_name: string;
  score: number;
  status: string;
  issues: string[];
  message: string;
}

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [showTestForm, setShowTestForm] = useState(false);

  const [agentName, setAgentName] = useState("");
  const [objective, setObjective] = useState("");
  const [testPrompt, setTestPrompt] = useState("");

  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);

  const [agents, setAgents] = useState<Agent[]>([
    {
      name: "Customer Support Agent",
      type: "Conversational",
      score: 94,
      status: "Passed",
    },
    {
      name: "Research Agent",
      type: "Research",
      score: 72,
      status: "Warning",
    },
    {
      name: "Booking Agent",
      type: "Task Automation",
      score: 41,
      status: "Failed",
    },
  ]);

  const failures = [
    {
      title: "Goal Drift",
      description: "Agent moved away from the requested objective",
      severity: "High",
    },
    {
      title: "Unsafe Tool Call",
      description: "Agent attempted a potentially destructive action",
      severity: "Critical",
    },
    {
      title: "Hallucination",
      description: "Agent generated unsupported information",
      severity: "Medium",
    },
  ];

  // =========================================================
  // LOAD AGENTS FROM MONGODB THROUGH FASTAPI
  // =========================================================

  const loadAgents = async () => {
  try {
    const response = await fetch(`${API_URL}/agents`);

    if (!response.ok) {
      throw new Error("Could not load agents");
    }

    const data = await response.json();

    // Backend returns:
    // { status: "success", agents: [...] }

    const agentList = data.agents || [];

    const apiAgents: Agent[] = agentList.map(
      (agent: any) => ({
        name:
          agent.agent_name ||
          agent.name ||
          "Unnamed Agent",

        type:
          agent.type ||
          "Evaluated Agent",

        score: Number(agent.score ?? 0),

        status:
          agent.status ||
          "Unknown",
      })
    );

    setAgents(apiAgents);

  } catch (error) {
    console.error(
      "Could not load agents:",
      error
    );
  }
};

  // Load agents whenever the application starts
  useEffect(() => {
    loadAgents();
  }, []);

  // =========================================================
  // RUN EVALUATION
  // =========================================================

  const runEvaluation = async () => {
    if (
      !agentName.trim() ||
      !objective.trim() ||
      !testPrompt.trim()
    ) {
      setEvaluationResult({
        agent_name: agentName,
        score: 0,
        status: "Error",
        issues: ["Please fill in all fields."],
        message: "Evaluation could not be started.",
      });

      return;
    }

    setEvaluationResult({
      agent_name: agentName,
      score: 0,
      status: "Running",
      issues: [],
      message: "Running evaluation...",
    });

    try {
      const response = await fetch(`${API_URL}/evaluate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          agent_name: agentName,
          objective: objective,
          prompt: testPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEvaluationResult({
          agent_name: agentName,
          score: 0,
          status: "Error",
          issues: [data.detail || "Evaluation failed."],
          message: "Evaluation failed.",
        });

        return;
      }

      setEvaluationResult(data);

      // Update Agents tab immediately
      const newAgent: Agent = {
        name: data.agent_name,
        type: "Evaluated Agent",
        score: Number(data.score),
        status: data.status,
      };

      setAgents((currentAgents) => {
        const existingIndex = currentAgents.findIndex(
          (agent) =>
            agent.name.toLowerCase() ===
            newAgent.name.toLowerCase()
        );

        if (existingIndex === -1) {
          return [newAgent, ...currentAgents];
        }

        const updatedAgents = [...currentAgents];

        updatedAgents[existingIndex] = newAgent;

        return updatedAgents;
      });

      // Get the actual stored data from MongoDB
      await loadAgents();

    } catch (error) {
      setEvaluationResult({
        agent_name: agentName,
        score: 0,
        status: "Error",
        issues: [
          "Could not connect to the SentinelAI backend.",
        ],
        message: "Backend connection failed.",
      });
    }
  };

  // =========================================================
  // CLOSE TEST FORM
  // =========================================================

  const closeTestForm = () => {
    setShowTestForm(false);

    setEvaluationResult(null);

    setAgentName("");
    setObjective("");
    setTestPrompt("");
  };

  // =========================================================
  // CSS HELPER FUNCTIONS
  // =========================================================

  const statusClass = (status: string) => {
    if (status === "Passed") {
      return "badge success";
    }

    if (status === "Warning") {
      return "badge warning";
    }

    return "badge failed";
  };

  const severityClass = (severity: string) => {
    if (severity === "Critical") {
      return "severity critical";
    }

    if (severity === "High") {
      return "severity high";
    }

    return "severity medium";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="logo">
          🛡️ <span>SentinelAI</span>
        </div>

        <p className="subtitle">
          AI Reliability Engine
        </p>

        <nav>
          {[
            "Dashboard",
            "Agents",
            "Evaluations",
            "Failures",
          ].map((item) => (
            <button
              key={item}
              className={
                activeTab === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActiveTab(item);

                if (item !== "Evaluations") {
                  setShowTestForm(false);
                }

                if (item === "Agents") {
                  loadAgents();
                }
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            System Online
          </div>
        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* ================= HEADER ================= */}

        <header className="header">

          <div>
            <h1>{activeTab}</h1>

            <p>
              Monitor, evaluate and improve the
              reliability of AI agents.
            </p>
          </div>

          {/* Test button ONLY on Evaluations */}

          {activeTab === "Evaluations" &&
            !showTestForm && (
              <button
                className="test-button"
                onClick={() =>
                  setShowTestForm(true)
                }
              >
                + Test New Agent
              </button>
            )}

        </header>

        {/* ================================================= */}
        {/* DASHBOARD */}
        {/* ================================================= */}

        {activeTab === "Dashboard" && (
          <>

            <section className="stats">

              <div className="stat-card">
                <span>Overall Reliability</span>
                <strong>87%</strong>
                <small>↑ 8% this week</small>
              </div>

              <div className="stat-card">
                <span>Agents Monitored</span>
                <strong>{agents.length}</strong>
                <small>Active agents</small>
              </div>

              <div className="stat-card">
                <span>Total Evaluations</span>
                <strong>48</strong>
                <small>+12 this week</small>
              </div>

              <div className="stat-card danger-card">
                <span>Failures Detected</span>
                <strong>6</strong>
                <small>2 critical issues</small>
              </div>

            </section>

            {/* Agent Evaluation */}

            <section className="panel">

              <div className="panel-header">

                <div>
                  <h2>Agent Evaluation</h2>
                  <p>Recent reliability scores</p>
                </div>

                <button
                  className="view-button"
                  onClick={() =>
                    setActiveTab("Agents")
                  }
                >
                  View All
                </button>

              </div>

              <div className="agent-table">

                <div className="table-header">
                  <span>Agent</span>
                  <span>Type</span>
                  <span>Reliability</span>
                  <span>Status</span>
                </div>

                {agents.map((agent) => (
                  <div
                    className="table-row"
                    key={agent.name}
                  >

                    <span className="agent-name">
                      <div className="agent-icon">
                        AI
                      </div>

                      {agent.name}
                    </span>

                    <span>{agent.type}</span>

                    <span>
                      <div className="score-container">

                        <div className="score-bar">

                          <div
                            className="score-fill"
                            style={{
                              width: `${agent.score}%`,
                            }}
                          ></div>

                        </div>

                        <b>{agent.score}%</b>

                      </div>
                    </span>

                    <span>
                      <span
                        className={statusClass(
                          agent.status
                        )}
                      >
                        {agent.status}
                      </span>
                    </span>

                  </div>
                ))}

              </div>

            </section>

            {/* Failure Intelligence */}

            <section className="panel">

              <div className="panel-header">

                <div>
                  <h2>Failure Intelligence</h2>

                  <p>
                    Potential reliability risks
                    detected by SentinelAI
                  </p>
                </div>

              </div>

              <div className="failure-grid">

                {failures.map((failure) => (
                  <div
                    className="failure-card"
                    key={failure.title}
                  >

                    <div className="failure-top">

                      <span className="warning-icon">
                        ⚠
                      </span>

                      <span
                        className={severityClass(
                          failure.severity
                        )}
                      >
                        {failure.severity}
                      </span>

                    </div>

                    <h3>{failure.title}</h3>

                    <p>{failure.description}</p>

                    <button className="details-button">
                      View Details →
                    </button>

                  </div>
                ))}

              </div>

            </section>

            {/* How It Works */}

            <section className="how-section">

              <h2>How SentinelAI Works</h2>

              <div className="workflow">

                <div className="workflow-step">

                  <div className="step-number">
                    1
                  </div>

                  <h3>Define Agent</h3>

                  <p>
                    Add an AI agent and its task
                    objective.
                  </p>

                </div>

                <div className="workflow-line"></div>

                <div className="workflow-step">

                  <div className="step-number">
                    2
                  </div>

                  <h3>Run Tests</h3>

                  <p>
                    Test the agent against
                    reliability scenarios.
                  </p>

                </div>

                <div className="workflow-line"></div>

                <div className="workflow-step">

                  <div className="step-number">
                    3
                  </div>

                  <h3>Analyze</h3>

                  <p>
                    Detect hallucination, goal
                    drift and unsafe behavior.
                  </p>

                </div>

                <div className="workflow-line"></div>

                <div className="workflow-step">

                  <div className="step-number">
                    4
                  </div>

                  <h3>Improve</h3>

                  <p>
                    Use evaluation insights to
                    improve reliability.
                  </p>

                </div>

              </div>

            </section>

          </>
        )}

        {/* ================================================= */}
        {/* AGENTS */}
        {/* ================================================= */}

        {activeTab === "Agents" && (
          <section className="panel">

            <div className="panel-header">

              <div>
                <h2>Registered AI Agents</h2>

                <p>
                  Agents retrieved from the
                  SentinelAI database.
                </p>
              </div>

              <span className="badge success">
                {agents.length} Agents Monitored
              </span>

            </div>

            <div className="agent-table">

              <div className="table-header">
                <span>Agent</span>
                <span>Type</span>
                <span>Reliability</span>
                <span>Status</span>
              </div>

              {agents.length === 0 ? (

                <div className="evaluation-empty">
                  <h3>No agents found</h3>

                  <p>
                    Run an evaluation from the
                    Evaluations tab.
                  </p>
                </div>

              ) : (

                agents.map((agent) => (
                  <div
                    className="table-row"
                    key={agent.name}
                  >

                    <span className="agent-name">

                      <div className="agent-icon">
                        AI
                      </div>

                      {agent.name}

                    </span>

                    <span>{agent.type}</span>

                    <span>

                      <div className="score-container">

                        <div className="score-bar">

                          <div
                            className="score-fill"
                            style={{
                              width: `${agent.score}%`,
                            }}
                          ></div>

                        </div>

                        <b>{agent.score}%</b>

                      </div>

                    </span>

                    <span>

                      <span
                        className={statusClass(
                          agent.status
                        )}
                      >
                        {agent.status}
                      </span>

                    </span>

                  </div>
                ))

              )}

            </div>

            {/* Overview */}

            <div
              className="panel"
              style={{ marginTop: "20px" }}
            >

              <div className="panel-header">

                <div>
                  <h2>Agent Reliability Overview</h2>

                  <p>
                    Current health of monitored
                    AI agents.
                  </p>
                </div>

              </div>

              <div className="stats">

                <div className="stat-card">

                  <span>Healthy Agents</span>

                  <strong>
                    {
                      agents.filter(
                        (a) => a.score >= 80
                      ).length
                    }
                  </strong>

                  <small>
                    Reliability ≥ 80%
                  </small>

                </div>

                <div className="stat-card">

                  <span>Warning Agents</span>

                  <strong>
                    {
                      agents.filter(
                        (a) =>
                          a.score >= 60 &&
                          a.score < 80
                      ).length
                    }
                  </strong>

                  <small>
                    Needs monitoring
                  </small>

                </div>

                <div className="stat-card danger-card">

                  <span>Failed Agents</span>

                  <strong>
                    {
                      agents.filter(
                        (a) => a.score < 60
                      ).length
                    }
                  </strong>

                  <small>
                    Requires attention
                  </small>

                </div>

              </div>

            </div>

          </section>
        )}

        {/* ================================================= */}
        {/* EVALUATIONS */}
        {/* ================================================= */}

        {activeTab === "Evaluations" && (
          <>

            {!showTestForm && (

              <section className="panel">

                <div className="panel-header">

                  <div>
                    <h2>Agent Evaluations</h2>

                    <p>
                      Run reliability tests
                      against AI agents.
                    </p>
                  </div>

                </div>

                <div className="evaluation-empty">

                  <h3>
                    Ready to evaluate an AI agent
                  </h3>

                  <p>
                    Click{" "}
                    <strong>
                      + Test New Agent
                    </strong>{" "}
                    above to start a
                    reliability evaluation.
                  </p>

                </div>

              </section>

            )}

            {showTestForm && (

              <section className="panel">

                <div className="panel-header">

                  <div>

                    <h2>Test New AI Agent</h2>

                    <p>
                      Provide the agent details
                      and run a reliability
                      evaluation.
                    </p>

                  </div>

                  <button
                    className="view-button"
                    onClick={closeTestForm}
                  >
                    Close
                  </button>

                </div>

                <div className="test-form">

                  <input
                    type="text"
                    placeholder="Agent Name"
                    value={agentName}
                    onChange={(e) =>
                      setAgentName(
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="text"
                    placeholder="Agent Objective"
                    value={objective}
                    onChange={(e) =>
                      setObjective(
                        e.target.value
                      )
                    }
                  />

                  <textarea
                    placeholder="Enter test prompt"
                    value={testPrompt}
                    onChange={(e) =>
                      setTestPrompt(
                        e.target.value
                      )
                    }
                  ></textarea>

                  <button
                    className="test-button"
                    onClick={runEvaluation}
                  >
                    Run Evaluation
                  </button>

                  {evaluationResult && (

                    <div className="evaluation-result">

                      <h3>
                        {evaluationResult.status ===
                        "Running"
                          ? "Evaluation Running"
                          : "Evaluation Complete"}
                      </h3>

                      <p>
                        <strong>
                          Agent:
                        </strong>{" "}
                        {
                          evaluationResult.agent_name
                        }
                      </p>

                      <p>
                        <strong>
                          Reliability Score:
                        </strong>{" "}
                        {
                          evaluationResult.score
                        }%
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        {
                          evaluationResult.status
                        }
                      </p>

                      <p>
                        {
                          evaluationResult.message
                        }
                      </p>

                      <h4>
                        Detected Issues
                      </h4>

                      {!evaluationResult.issues ||
                      evaluationResult.issues
                        .length === 0 ? (

                        <p>
                          No reliability
                          issues detected.
                        </p>

                      ) : (

                        <ul>

                          {evaluationResult.issues.map(
                            (
                              issue,
                              index
                            ) => (
                              <li
                                key={index}
                              >
                                ⚠️ {issue}
                              </li>
                            )
                          )}

                        </ul>

                      )}

                    </div>

                  )}

                </div>

              </section>

            )}

          </>
        )}

        {/* ================================================= */}
        {/* FAILURES */}
        {/* ================================================= */}

        {activeTab === "Failures" && (

          <section className="panel">

            <div className="panel-header">

              <div>

                <h2>
                  Failure Intelligence
                </h2>

                <p>
                  Reliability risks detected
                  by SentinelAI.
                </p>

              </div>

            </div>

            <div className="failure-grid">

              {failures.map((failure) => (

                <div
                  className="failure-card"
                  key={failure.title}
                >

                  <div className="failure-top">

                    <span className="warning-icon">
                      ⚠
                    </span>

                    <span
                      className={severityClass(
                        failure.severity
                      )}
                    >
                      {failure.severity}
                    </span>

                  </div>

                  <h3>
                    {failure.title}
                  </h3>

                  <p>
                    {failure.description}
                  </p>

                  <button className="details-button">
                    View Details →
                  </button>

                </div>

              ))}

            </div>

            <div
              className="panel"
              style={{ marginTop: "20px" }}
            >

              <div className="panel-header">

                <div>

                  <h2>
                    Failure Summary
                  </h2>

                  <p>
                    Current reliability
                    problems identified by
                    the engine.
                  </p>

                </div>

              </div>

              <div className="stats">

                <div className="stat-card">

                  <span>
                    Goal Drift
                  </span>

                  <strong>2</strong>

                  <small>
                    High priority
                  </small>

                </div>

                <div className="stat-card danger-card">

                  <span>
                    Unsafe Actions
                  </span>

                  <strong>2</strong>

                  <small>
                    Critical priority
                  </small>

                </div>

                <div className="stat-card">

                  <span>
                    Hallucinations
                  </span>

                  <strong>2</strong>

                  <small>
                    Medium priority
                  </small>

                </div>

              </div>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;