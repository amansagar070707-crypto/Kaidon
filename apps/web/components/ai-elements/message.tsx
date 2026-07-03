"use client";

import React from "react";

// ─── Message ─────────────────────────────────────────────

export function Message({
  from,
  children,
  ...props
}: {
  from: "user" | "assistant" | "system";
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`ai-message ai-message--${from}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function MessageContent({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="ai-message__content" {...props}>
      {children}
    </div>
  );
}

export function MessageResponse({
  children,
  ...props
}: {
  children: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="ai-message__response" {...props}>
      {renderMarkdown(children)}
    </div>
  );
}

export function MessageActions({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="ai-message__actions" {...props}>
      {children}
    </div>
  );
}

export function MessageAction({
  onClick,
  label,
  children,
  ...props
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="ai-message__action"
      onClick={onClick}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
      <span className="ai-message__action-label">{label}</span>
    </button>
  );
}

// ─── Simple Markdown Renderer ────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let codeLanguage = "";
  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="ai-md-list">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="ai-md-table-wrapper">
          <table className="ai-md-table">
            <thead>
              <tr>
                {tableHeaders.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (const line of lines) {
    // Code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${elements.length}`} className="ai-md-code">
            <code>{codeContent.trim()}</code>
          </pre>,
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLanguage = line.slice(3);
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    // Tables
    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue; // separator row
      }
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Lists
    if (line.match(/^[-*]\s/)) {
      flushList();
      inList = true;
      listItems.push(line.slice(2));
      continue;
    } else if (inList) {
      flushList();
    }

    // Empty lines
    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={`h4-${elements.length}`} className="ai-md-h4">
          {line.slice(4)}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={`h3-${elements.length}`} className="ai-md-h3">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={`h2-${elements.length}`} className="ai-md-h2">
          {line.slice(2)}
        </h2>,
      );
    } else {
      // Regular paragraph
      elements.push(
        <p key={`p-${elements.length}`} className="ai-md-p">
          {renderInlineMarkdown(line)}
        </p>,
      );
    }
  }

  flushList();
  flushTable();

  return <div className="ai-markdown">{elements}</div>;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Code
  text = text.replace(/`(.+?)`/g, '<code class="ai-md-inline-code">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}
