"use client";

import React, { useState, useRef, useEffect } from "react";
import { AppScaffold } from "../../../components/app-scaffold";
import {
  ArrowLeft,
  Send,
  Star,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Table,
  BarChart3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "../../../components/ai-elements/message";
import {
  Reasoning,
} from "../../../components/ai-elements/index";
import {
  Sources,
  Source,
} from "../../../components/ai-elements/index";
import {
  ChainOfThought,
  ChainOfThoughtStep,
} from "../../../components/ai-elements/index";
import {
  Task,
  TaskItem,
} from "../../../components/ai-elements/index";
import {
  Context,
} from "../../../components/ai-elements/index";

type AgentStatus = "approved" | "pending" | "community" | "deprecated";

type Agent = {
  name: string;
  slug: string;
  description: string;
  status: AgentStatus;
  owner: string;
  version: string;
  pricing: string;
  tools: string[];
  downloads: number;
  rating: number;
  tags: string[];
  systemPrompt: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  reasoning?: string;
  sources?: { title: string; url: string }[];
  steps?: { label: string; description?: string; status: "complete" | "active" | "pending" }[];
  tasks?: { title: string; items: { text: string; completed: boolean }[] }[];
  tokens?: { used: number; max: number };
};

const agents: Record<string, Agent> = {
  "job-search-agent": {
    name: "Job Search Agent",
    slug: "job-search-agent",
    description: "Finds 2026 AI engineer roles, ranks matches, and drafts outreach messages.",
    status: "approved",
    owner: "Community",
    version: "v1.0.0",
    pricing: "Free",
    tools: ["LinkedIn", "Wellfound", "Greenhouse"],
    downloads: 3420,
    rating: 4.9,
    tags: ["jobs", "recruiting", "ai-engineer"],
    systemPrompt: "You are a job search agent specializing in AI engineering roles.",
  },
  "billing-reconcile-agent": {
    name: "Billing Reconcile Agent",
    slug: "billing-reconcile-agent",
    description: "Reconciles billing records against the ledger and flags mismatches automatically.",
    status: "approved",
    owner: "Finance Ops",
    version: "v3.2.0",
    pricing: "$0.01/task",
    tools: ["Stripe", "Ledger", "Email"],
    downloads: 1240,
    rating: 4.8,
    tags: ["finance", "billing", "reconciliation"],
    systemPrompt: "You are a billing reconciliation agent.",
  },
  "support-router-agent": {
    name: "Support Router Agent",
    slug: "support-router-agent",
    description: "Routes inbound support tickets to the right team based on context and urgency.",
    status: "approved",
    owner: "Support Platform",
    version: "v2.4.1",
    pricing: "Internal",
    tools: ["Zendesk", "Slack", "PagerDuty"],
    downloads: 890,
    rating: 4.6,
    tags: ["support", "routing", "tickets"],
    systemPrompt: "You are a support routing agent.",
  },
  "code-review-agent": {
    name: "Code Review Agent",
    slug: "code-review-agent",
    description: "Automated code review with security scanning and best practices enforcement.",
    status: "approved",
    owner: "DevTools",
    version: "v0.9.0",
    pricing: "Free",
    tools: ["GitHub", "Snyk", "ESLint"],
    downloads: 560,
    rating: 4.3,
    tags: ["code-review", "security", "github"],
    systemPrompt: "You are a code review agent.",
  },
};

const sampleResponses: Record<string, (query: string) => Message> = {
  "job-search-agent": (query) => ({
    id: `msg_${Date.now()}`,
    role: "assistant",
    content: `I've searched across LinkedIn, Wellfound, and Greenhouse for AI engineer roles matching your criteria. Found 5 strong matches with remote-friendly positions and competitive compensation.\n\n## Top Matches\n\n| Company | Role | Location | Salary | Match |\n|---------|------|----------|--------|-------|\n| Anthropic | AI Engineer | Remote | $180-250k | 94% |\n| OpenAI | Research Engineer | San Francisco | $200-300k | 91% |\n| Google DeepMind | ML Engineer | Mountain View | $190-280k | 88% |\n| Meta AI | AI Platform Engineer | Remote | $170-240k | 85% |\n| Cohere | Applied Scientist | Toronto/Remote | $150-220k | 82% |\n\n## Recommended Actions\n\n- Apply to Anthropic and OpenAI first - highest match scores\n- Update your LinkedIn profile with "AI Engineer" keywords\n- Prepare a portfolio showcasing LLM/agent work\n- Set up job alerts on Wellfound for startup opportunities`,
    reasoning: `Analyzing the user's query: "${query}"\n\n1. Understanding intent: Looking for AI engineering roles in 2026\n2. Search strategy: Query LinkedIn Jobs, Wellfound, and Greenhouse APIs\n3. Filtering criteria: Remote-friendly, competitive salary, AI/ML focus\n4. Ranking factors: Company reputation, role fit, compensation, location\n5. Output format: Table with key metrics and actionable recommendations`,
    sources: [
      { title: "LinkedIn Jobs - AI Engineer", url: "https://linkedin.com/jobs/search?keywords=ai+engineer" },
      { title: "Wellfound - AI/ML Roles", url: "https://wellfound.com/role?q=ai+engineer" },
      { title: "Greenhouse - Tech Jobs", url: "https://greenhouse.io/job-board" },
    ],
    steps: [
      { label: "Understanding request", description: "Parsed query for AI engineer roles", status: "complete" },
      { label: "Searching sources", description: "Queried LinkedIn, Wellfound, Greenhouse", status: "complete" },
      { label: "Ranking matches", description: "Scored 12 candidates against criteria", status: "complete" },
      { label: "Preparing output", description: "Generated table and recommendations", status: "complete" },
    ],
    tasks: [
      {
        title: "Job Search Workflow",
        items: [
          { text: "Query approved job sources", completed: true },
          { text: "Normalize job metadata", completed: true },
          { text: "Rank matches by relevance", completed: true },
          { text: "Draft outreach messages", completed: false },
          { text: "Track applications", completed: false },
        ],
      },
    ],
    tokens: { used: 2847, max: 8192 },
    timestamp: new Date().toISOString(),
  }),
  "billing-reconcile-agent": (query) => ({
    id: `msg_${Date.now()}`,
    role: "assistant",
    content: `I've analyzed your billing records for Q1 2026. Found 3 discrepancies totaling $2,450.00.\n\n## Reconciliation Summary\n\n| Invoice | Stripe | Ledger | Difference | Status |\n|---------|--------|--------|------------|--------|\n| INV-2026-001 | $1,200 | $1,200 | $0 | Matched |\n| INV-2026-002 | $3,500 | $1,050 | $2,450 | Mismatch |\n| INV-2026-003 | $890 | $890 | $0 | Matched |\n| INV-2026-004 | $2,100 | $2,100 | $0 | Matched |\n\n## Issues Found\n\n- **INV-2026-002**: Stripe shows $3,500 but ledger only recorded $1,050 - possible partial payment not synced\n- Missing webhook event for payment on 2026-01-15\n- Tax calculation discrepancy on international invoice INV-2026-005`,
    reasoning: `Processing billing reconciliation query: "${query}"\n\n1. Loading Stripe transaction history for Q1 2026\n2. Loading ledger entries from accounting system\n3. Matching transactions by invoice ID and amount\n4. Flagging mismatches for manual review\n5. Calculating total discrepancy amount`,
    sources: [
      { title: "Stripe Dashboard", url: "https://dashboard.stripe.com" },
      { title: "QuickBooks Ledger", url: "https://quickbooks.intuit.com" },
    ],
    steps: [
      { label: "Loading Stripe data", description: "Fetched 47 transactions", status: "complete" },
      { label: "Loading ledger entries", description: "Fetched 52 entries", status: "complete" },
      { label: "Matching records", description: "Compared by invoice ID", status: "complete" },
      { label: "Flagging issues", description: "Found 3 discrepancies", status: "complete" },
    ],
    tasks: [
      {
        title: "Reconciliation Tasks",
        items: [
          { text: "Import Stripe transactions", completed: true },
          { text: "Import ledger entries", completed: true },
          { text: "Match by invoice ID", completed: true },
          { text: "Flag mismatches", completed: true },
          { text: "Generate report", completed: false },
        ],
      },
    ],
    tokens: { used: 1923, max: 8192 },
    timestamp: new Date().toISOString(),
  }),
};

export default function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const agent = agents[resolvedParams.slug];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!agent) {
    return (
      <AppScaffold active="Marketplace">
        <div className="page-header">
          <Link href="/marketplace" className="flex items-center gap-2 text-muted mb-4" style={{ textDecoration: "none" }}>
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
          <h1 className="page-header__title">Agent Not Found</h1>
          <p className="page-header__subtitle">
            The agent you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </AppScaffold>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsRunning(true);

    // Simulate agent processing
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    const sampleData = sampleResponses[resolvedParams.slug];
    const assistantMessage = sampleData
      ? sampleData(input.trim())
      : {
          id: `msg_${Date.now()}`,
          role: "assistant" as const,
          content: `I've processed your request: "${userMessage.content}". Here are the results based on my analysis.`,
          timestamp: new Date().toISOString(),
          reasoning: `Analyzing: "${userMessage.content}"\n\n1. Understanding intent\n2. Searching relevant sources\n3. Compiling results`,
          steps: [
            { label: "Understanding request", status: "complete" as const },
            { label: "Processing data", status: "complete" as const },
            { label: "Generating response", status: "complete" as const },
          ],
          tokens: { used: 1200, max: 8192 },
        };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsRunning(false);
  };

  const handleExport = (format: "markdown" | "json" | "csv") => {
    const exportData = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      reasoning: msg.reasoning,
      sources: msg.sources,
    }));

    let content = "";
    let filename = "";
    let mimeType = "";

    if (format === "markdown") {
      content = `# ${agent.name} - Research Export\n\n`;
      content += `Generated: ${new Date().toISOString()}\n\n---\n\n`;
      for (const msg of exportData) {
        content += `## ${msg.role === "user" ? "User Query" : "Agent Response"}\n\n`;
        content += `${msg.content}\n\n`;
        if (msg.reasoning) {
          content += `### Reasoning\n\n${msg.reasoning}\n\n`;
        }
        if (msg.sources && msg.sources.length > 0) {
          content += `### Sources\n\n`;
          for (const src of msg.sources) {
            content += `- [${src.title}](${src.url})\n`;
          }
          content += "\n";
        }
      }
      filename = `${agent.slug}-export.md`;
      mimeType = "text/markdown";
    } else if (format === "json") {
      content = JSON.stringify(exportData, null, 2);
      filename = `${agent.slug}-export.json`;
      mimeType = "application/json";
    } else {
      content = "Role,Content,Timestamp\n";
      for (const msg of exportData) {
        content += `"${msg.role}","${msg.content.replace(/"/g, '""')}","${msg.timestamp}"\n`;
      }
      filename = `${agent.slug}-export.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppScaffold active="Marketplace">
      <div className="page-header">
        <Link href="/marketplace" className="flex items-center gap-2 text-muted mb-4" style={{ textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-header__title">{agent.name}</h1>
            <p className="page-header__subtitle">
              by {agent.owner} &middot; {agent.version} &middot; {agent.pricing}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="badge badge--success">Approved</span>
            <span className="badge badge--ion">{agent.pricing}</span>
          </div>
        </div>
      </div>

      {/* Agent Info */}
      <div className="block" style={{ marginBottom: "24px" }}>
        <p style={{ margin: 0, color: "var(--foreground)" }}>{agent.description}</p>
        <div className="flex gap-2 mt-3">
          {agent.tools.map((tool) => (
            <span key={tool} className="badge badge--default">{tool}</span>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Star size={14} fill="currentColor" /> {agent.rating}
          </span>
          <span className="flex items-center gap-1">
            <Download size={14} /> {agent.downloads.toLocaleString()} downloads
          </span>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="agent-chat">
        {/* Messages */}
        <div className="agent-chat__messages">
          {messages.length === 0 && (
            <div className="agent-chat__empty">
              <div className="agent-chat__empty-icon">
                <FileText size={32} />
              </div>
              <h3>Start a conversation</h3>
              <p>Ask the {agent.name} to perform a task. It will research, analyze, and provide results.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="ai-message-wrapper">
              <Message from={message.role}>
                <MessageContent>
                  {/* Reasoning Block */}
                  {message.reasoning && (
                    <Reasoning defaultOpen={false}>
                      <div className="ai-reasoning__text">
                        {message.reasoning.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </Reasoning>
                  )}

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <Sources>
                      {message.sources.map((src, i) => (
                        <Source key={i} href={src.url} title={src.title} />
                      ))}
                    </Sources>
                  )}

                  {/* Main Response */}
                  <MessageResponse>{message.content}</MessageResponse>

                  {/* Chain of Thought */}
                  {message.steps && message.steps.length > 0 && (
                    <ChainOfThought defaultOpen={false}>
                      {message.steps.map((step, i) => (
                        <ChainOfThoughtStep
                          key={i}
                          label={step.label}
                          description={step.description}
                          status={step.status}
                        />
                      ))}
                    </ChainOfThought>
                  )}

                  {/* Tasks */}
                  {message.tasks && message.tasks.length > 0 && (
                    <div className="ai-tasks-section">
                      {message.tasks.map((task, i) => (
                        <Task key={i} defaultOpen={false}>
                          <span className="ai-task__title">{task.title}</span>
                          <div className="ai-task__items">
                            {task.items.map((item, j) => (
                              <TaskItem key={j} completed={item.completed}>
                                {item.text}
                              </TaskItem>
                            ))}
                          </div>
                        </Task>
                      ))}
                    </div>
                  )}

                  {/* Token Usage */}
                  {message.tokens && (
                    <Context maxTokens={message.tokens.max} usedTokens={message.tokens.used} />
                  )}
                </MessageContent>
              </Message>

              {/* Actions */}
              {message.role === "assistant" && (
                <MessageActions>
                  <MessageAction
                    onClick={() => copyToClipboard(message.content, message.id)}
                    label={copiedId === message.id ? "Copied" : "Copy"}
                  >
                    {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                  </MessageAction>
                </MessageActions>
              )}
            </div>
          ))}

          {isRunning && (
            <div className="ai-message-wrapper">
              <Message from="assistant">
                <MessageContent>
                  <div className="ai-thinking">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Researching and analyzing...</span>
                  </div>
                </MessageContent>
              </Message>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="agent-chat__input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agent.name} to do something...`}
            className="input"
            disabled={isRunning}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!input.trim() || isRunning}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Export */}
      {messages.length > 0 && (
        <div className="block mt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="block__title" style={{ margin: 0 }}>Export Research</div>
              <div className="text-sm text-muted">Download the conversation and results</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport("markdown")} className="btn btn--secondary btn--sm">
                <FileText size={14} /> Markdown
              </button>
              <button onClick={() => handleExport("json")} className="btn btn--secondary btn--sm">
                <BarChart3 size={14} /> JSON
              </button>
              <button onClick={() => handleExport("csv")} className="btn btn--secondary btn--sm">
                <Table size={14} /> CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </AppScaffold>
  );
}
