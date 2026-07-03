"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

// ─── Reasoning ───────────────────────────────────────────

export function Reasoning({
  isStreaming = false,
  defaultOpen = false,
  children,
  ...props
}: {
  isStreaming?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(defaultOpen || isStreaming);

  useEffect(() => {
    if (isStreaming) setIsOpen(true);
  }, [isStreaming]);

  return (
    <div className={`ai-reasoning ${isOpen ? "ai-reasoning--open" : ""}`} {...props}>
      <button
        className="ai-reasoning__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {isStreaming ? (
          <Loader2 size={14} className="ai-reasoning__spinner" />
        ) : (
          <ChevronDown size={14} className={`ai-reasoning__chevron ${isOpen ? "ai-reasoning__chevron--open" : ""}`} />
        )}
        <span>{isStreaming ? "Thinking..." : "Reasoning"}</span>
      </button>
      {isOpen && (
        <div className="ai-reasoning__content">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Sources ─────────────────────────────────────────────

export function Sources({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ai-sources" {...props}>
      <button
        className="ai-sources__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <ChevronDown size={14} className={`ai-sources__chevron ${isOpen ? "ai-sources__chevron--open" : ""}`} />
        <span>Sources</span>
      </button>
      {isOpen && (
        <div className="ai-sources__content">
          {children}
        </div>
      )}
    </div>
  );
}

export function Source({
  href,
  title,
  ...props
}: {
  href: string;
  title: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className="ai-source"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {title}
    </a>
  );
}

// ─── Chain of Thought ────────────────────────────────────

export function ChainOfThought({
  defaultOpen = false,
  children,
  ...props
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`ai-cot ${isOpen ? "ai-cot--open" : ""}`} {...props}>
      <button
        className="ai-cot__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <ChevronDown size={14} className={`ai-cot__chevron ${isOpen ? "ai-cot__chevron--open" : ""}`} />
        <span>Chain of Thought</span>
      </button>
      {isOpen && (
        <div className="ai-cot__content">
          {children}
        </div>
      )}
    </div>
  );
}

export function ChainOfThoughtStep({
  label,
  description,
  status = "complete",
  icon: Icon,
  ...props
}: {
  label: string;
  description?: string;
  status?: "complete" | "active" | "pending";
  icon?: React.ComponentType<{ size?: number }>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const statusIcon = status === "complete" ? "✓" : status === "active" ? "●" : "○";

  return (
    <div className={`ai-cot__step ai-cot__step--${status}`} {...props}>
      <div className="ai-cot__step-indicator">
        {Icon ? <Icon size={14} /> : <span>{statusIcon}</span>}
      </div>
      <div className="ai-cot__step-content">
        <div className="ai-cot__step-label">{label}</div>
        {description && (
          <div className="ai-cot__step-description">{description}</div>
        )}
      </div>
    </div>
  );
}

// ─── Task ────────────────────────────────────────────────

export function Task({
  defaultOpen = true,
  children,
  ...props
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`ai-task ${isOpen ? "ai-task--open" : ""}`} {...props}>
      <button
        className="ai-task__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <ChevronDown size={14} className={`ai-task__chevron ${isOpen ? "ai-task__chevron--open" : ""}`} />
        {children}
      </button>
    </div>
  );
}

export function TaskItem({
  completed = false,
  children,
  ...props
}: {
  completed?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ai-task__item ${completed ? "ai-task__item--completed" : ""}`} {...props}>
      <span className="ai-task__item-indicator">
        {completed ? "✓" : "○"}
      </span>
      <span className="ai-task__item-content">{children}</span>
    </div>
  );
}

// ─── Context ─────────────────────────────────────────────

export function Context({
  maxTokens = 8192,
  usedTokens = 0,
  children,
  ...props
}: {
  maxTokens?: number;
  usedTokens?: number;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const percentage = Math.round((usedTokens / maxTokens) * 100);

  return (
    <div className="ai-context" {...props}>
      <div className="ai-context__header">
        <div className="ai-context__percentage">{percentage}%</div>
        <div className="ai-context__tokens">
          {usedTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens
        </div>
      </div>
      <div className="ai-context__bar">
        <div
          className="ai-context__bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {children}
    </div>
  );
}

// ─── Checkpoint ──────────────────────────────────────────

export function Checkpoint({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="ai-checkpoint" {...props}>
      <div className="ai-checkpoint__line" />
      <div className="ai-checkpoint__content">
        {children}
      </div>
      <div className="ai-checkpoint__line" />
    </div>
  );
}

export function CheckpointTrigger({
  onClick,
  children,
  ...props
}: {
  onClick?: () => void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="ai-checkpoint__trigger" onClick={onClick} {...props}>
      {children}
    </button>
  );
}
