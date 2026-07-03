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
  blocks?: ResponseBlock[];
};

type ResponseBlock =
  | { type: "text"; content: string }
  | { type: "heading"; content: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; language: string; content: string }
  | { type: "callout"; variant: "info" | "warning" | "success"; content: string };

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

const sampleResponses: Record<string, { text: string; blocks: ResponseBlock[] }> = {
  "job-search-agent": {
    text: "I found 5 highly relevant AI engineer roles for you in 2026. Here's a summary of the top matches based on your profile and preferences.",
    blocks: [
      {
        type: "callout",
        variant: "success",
        content: "Found 5 strong matches across 3 job platforms. All roles are remote-friendly with competitive compensation.",
      },
      {
        type: "heading",
        content: "Top Matches",
      },
      {
        type: "table",
        headers: ["Company", "Role", "Location", "Salary", "Match"],
        rows: [
          ["Anthropic", "AI Engineer", "Remote", "$180-250k", "94%"],
          ["OpenAI", "Research Engineer", "San Francisco", "$200-300k", "91%"],
          ["Google DeepMind", "ML Engineer", "Mountain View", "$190-280k", "88%"],
          ["Meta AI", "AI Platform Engineer", "Remote", "$170-240k", "85%"],
          ["Cohere", "Applied Scientist", "Toronto/Remote", "$150-220k", "82%"],
        ],
      },
      {
        type: "heading",
        content: "Recommended Actions",
      },
      {
        type: "list",
        items: [
          "Apply to Anthropic and OpenAI first - highest match scores",
          "Update your LinkedIn profile with 'AI Engineer' keywords",
          "Prepare a portfolio showcasing LLM/agent work",
          "Set up job alerts on Wellfound for startup opportunities",
        ],
      },
      {
        type: "callout",
        variant: "info",
        content: "I've saved these leads to your workspace memory. You can access them anytime from the Runtime dashboard.",
      },
    ],
  },
  "billing-reconcile-agent": {
    text: "I've analyzed your billing records for Q1 2026. Here's the reconciliation report with identified discrepancies.",
    blocks: [
      {
        type: "callout",
        variant: "warning",
        content: "Found 3 billing discrepancies totaling $2,450.00 that require immediate attention.",
      },
      {
        type: "heading",
        content: "Reconciliation Summary",
      },
      {
        type: "table",
        headers: ["Invoice", "Stripe Amount", "Ledger Amount", "Difference", "Status"],
        rows: [
          ["INV-2026-001", "$1,200.00", "$1,200.00", "$0.00", "Matched"],
          ["INV-2026-002", "$3,500.00", "$1,050.00", "$2,450.00", "Mismatch"],
          ["INV-2026-003", "$890.00", "$890.00", "$0.00", "Matched"],
          ["INV-2026-004", "$2,100.00", "$2,100.00", "$0.00", "Matched"],
        ],
      },
      {
        type: "heading",
        content: "Issues Found",
      },
      {
        type: "list",
        items: [
          "INV-2026-002: Stripe shows $3,500 but ledger only recorded $1,050 - possible partial payment not synced",
          "Missing webhook event for payment on 2026-01-15",
          "Tax calculation discrepancy on international invoice INV-2026-005",
        ],
      },
      {
        type: "code",
        language: "json",
        content: '{\n  "discrepancy": {\n    "invoice": "INV-2026-002",\n    "stripe_amount": 350000,\n    "ledger_amount": 105000,\n    "difference_cents": 245000,\n    "recommended_action": "manual_review"\n  }\n}',
      },
    ],
  },
};

function parseResponseBlocks(text: string): ResponseBlock[] {
  return [
    { type: "text", content: text },
  ];
}

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
    const assistantMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: sampleData?.text || `I've processed your request: "${userMessage.content}". Here are the results.`,
      timestamp: new Date().toISOString(),
      blocks: sampleData?.blocks || parseResponseBlocks(`Based on my analysis of "${userMessage.content}", here are my findings. The agent has completed the task and generated a comprehensive response.`),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsRunning(false);
  };

  const handleExport = (format: "markdown" | "json" | "csv") => {
    const exportData = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      blocks: msg.blocks,
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
        if (msg.blocks) {
          for (const block of msg.blocks) {
            if (block.type === "table") {
              content += `| ${block.headers.join(" | ")} |\n`;
              content += `| ${block.headers.map(() => "---").join(" | ")} |\n`;
              for (const row of block.rows) {
                content += `| ${row.join(" | ")} |\n`;
              }
              content += "\n";
            } else if (block.type === "list") {
              for (const item of block.items) {
                content += `- ${item}\n`;
              }
              content += "\n";
            } else if (block.type === "code") {
              content += `\`\`\`${block.language}\n${block.content}\n\`\`\`\n\n`;
            }
          }
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

  const renderBlock = (block: ResponseBlock, index: number) => {
    switch (block.type) {
      case "text":
        return (
          <div key={index} className="response-block response-block--text">
            {block.content}
          </div>
        );
      case "heading":
        return (
          <h3 key={index} className="response-block response-block--heading">
            {block.content}
          </h3>
        );
      case "list":
        return (
          <ul key={index} className="response-block response-block--list">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case "table":
        return (
          <div key={index} className="response-block response-block--table">
            <table>
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "code":
        return (
          <div key={index} className="response-block response-block--code">
            <div className="code-header">
              <span>{block.language}</span>
              <button
                onClick={() => copyToClipboard(block.content, `code-${index}`)}
                className="btn btn--ghost btn--xs"
              >
                {copiedId === `code-${index}` ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <pre><code>{block.content}</code></pre>
          </div>
        );
      case "callout":
        return (
          <div key={index} className={`response-block response-block--callout response-block--callout-${block.variant}`}>
            {block.content}
          </div>
        );
      default:
        return null;
    }
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
            <div key={message.id} className={`agent-chat__message agent-chat__message--${message.role}`}>
              <div className="agent-chat__message-header">
                <span className="agent-chat__message-role">
                  {message.role === "user" ? "You" : agent.name}
                </span>
                <span className="agent-chat__message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="agent-chat__message-content">
                {message.role === "assistant" && message.blocks ? (
                  <div className="response-blocks">
                    {message.blocks.map((block, i) => renderBlock(block, i))}
                  </div>
                ) : (
                  <div className="response-block response-block--text">
                    {message.content}
                  </div>
                )}
              </div>
              {message.role === "assistant" && (
                <div className="agent-chat__message-actions">
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="btn btn--ghost btn--xs"
                  >
                    {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                    Copy
                  </button>
                </div>
              )}
            </div>
          ))}

          {isRunning && (
            <div className="agent-chat__message agent-chat__message--assistant">
              <div className="agent-chat__message-header">
                <span className="agent-chat__message-role">{agent.name}</span>
              </div>
              <div className="agent-chat__message-content">
                <div className="agent-chat__thinking">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Researching and analyzing...</span>
                </div>
              </div>
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
