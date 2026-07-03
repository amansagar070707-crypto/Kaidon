"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  DEFAULT_HARNESS_PROMPT,
  type HarnessViewModel,
} from "../lib/state/harness";
import type { ProviderStatus } from "../lib/state/provider";

type StudioBuilderProps = {
  initialModel: HarnessViewModel;
  provider: ProviderStatus;
};

export function StudioBuilder({ initialModel, provider }: StudioBuilderProps) {
  const [prompt, setPrompt] = useState(DEFAULT_HARNESS_PROMPT);
  const [model, setModel] = useState(initialModel);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const agent = model.assignment.generatedAgent;
  const task = model.assignment.task;
  const workItem = model.assignment.workItem;

  return (
    <>
      <div className="page-header">
        <div className="page-header__eyebrow">Studio</div>
        <h1 className="page-header__title">Agent Builder</h1>
        <p className="page-header__subtitle">
          Describe the agent you want. Kaidon generates the contract, assigns a runtime task, and validates the output.
        </p>
      </div>

      <div className="grid grid--2" style={{ alignItems: "start", marginBottom: "32px" }}>
        <div className="block">
          <div className="block__eyebrow">Prompt</div>
          <div className="block__title">Describe the agent</div>
          <div className="block__description">
            What should this agent do? Be specific about tools, memory, and behavior.
          </div>
          <div className="block__content">
            <textarea
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what the agent should do..."
              rows={5}
              style={{ minHeight: "140px" }}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-muted">Press Ctrl+Enter to generate</span>
              <button
                className="btn btn--primary"
                onClick={() =>
                  startTransition(async () => {
                    setGenerationError(null);

                    const response = await fetch("/api/harness", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt }),
                    });

                    if (!response.ok) {
                      const failure = (await response.json()) as { error?: string };
                      setGenerationError(failure.error ?? "Failed to assign agent builder.");
                      return;
                    }

                    const data = (await response.json()) as {
                      item: HarnessViewModel;
                      generation?: { error?: string };
                    };

                    setGenerationError(data.generation?.error ?? null);
                    setModel(data.item);
                  })
                }
                disabled={isPending || !prompt.trim()}
              >
                {isPending ? "Generating..." : "Generate Agent"}
              </button>
            </div>
            {generationError && (
              <div style={{ marginTop: "12px", padding: "12px", background: "rgba(238, 0, 0, 0.1)", border: "1px solid rgba(238, 0, 0, 0.2)", borderRadius: "var(--radius-md)", color: "var(--color-danger)", fontSize: "14px" }}>
                {generationError}
              </div>
            )}
          </div>
        </div>

        <div className="block">
          <div className="block__eyebrow">Generated Contract</div>
          <div className="block__title">Agent shape</div>
          <div className="block__description">
            The contract defines tools, memory, model, and run policy.
          </div>
          <div className="block__content">
            <div className="code-block">{`createAgent({
  name: "${agent.name}",
  model: "${agent.model.model}",
  tools: ${JSON.stringify(agent.tools.map((t) => t.name))},
  memory: { scope: "${agent.memory?.scope ?? "workspace"}" },
  runtime: { checkpoint: true, retry: true }
})`}</div>
          </div>
        </div>
      </div>

      <div className="block" style={{ marginBottom: "32px" }}>
        <div className="block__eyebrow">Provider</div>
        <div className="block__title">OpenRouter runtime readiness</div>
        <div className="grid grid--3 mt-4">
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Provider</div>
            <div className="font-mono mt-2">{provider.provider}</div>
          </div>
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Model</div>
            <div className="font-mono mt-2">{provider.model}</div>
          </div>
          <div style={{ padding: "12px", background: "var(--color-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
            <div className="text-xs text-muted">Status</div>
            <div className="mt-2">
              <span className={`badge ${provider.configured ? "badge--success" : "badge--warning"}`}>
                {provider.configured ? "configured" : "no api key"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid--4" style={{ marginBottom: "32px" }}>
        {[
          { kind: "Prompt", title: "Request", detail: model.assignment.request.prompt },
          { kind: "Harness", title: "Assignment", detail: `Assigned to ${workItem.assignedAgent}` },
          { kind: "Task", title: "Runtime", detail: `Task ${task.id}` },
          { kind: "Agent", title: "Output", detail: `Generated ${agent.name}` },
        ].map((block) => (
          <div key={block.title} className="block">
            <div className="block__eyebrow">{block.kind}</div>
            <div className="block__title">{block.title}</div>
            <div className="block__description">{block.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid grid--3" style={{ marginBottom: "32px" }}>
        <div className="block">
          <div className="block__eyebrow">Work Item</div>
          <div className="block__title">Created</div>
          <div className="block__description">
            {workItem.id} maps {model.assignment.request.id} into a generation task.
          </div>
          <div className="flex gap-2 mt-4">
            <Link href={`/agents/${agent.id}`} className="btn btn--primary btn--sm">
              Open cockpit
            </Link>
            <Link href={`/runtime/${agent.id}/${task.id}`} className="btn btn--secondary btn--sm">
              View trace
            </Link>
          </div>
        </div>

        <div className="block">
          <div className="block__eyebrow">State Sync</div>
          <div className="block__title">Aligned</div>
          <div className="block__description">
            Runtime task, agent, and Studio state stay synchronized.
          </div>
          <div className="flex gap-2 mt-4">
            <span className="badge badge--success">synced</span>
          </div>
        </div>

        <div className="block">
          <div className="block__eyebrow">LLM</div>
          <div className="block__title">OpenRouter first</div>
          <div className="block__description">
            Provider {agent.model.provider} with open-source model {agent.model.model}.
          </div>
          <div className="flex gap-2 mt-4">
            <span className="badge badge--default">{model.generation.source}</span>
          </div>
        </div>
      </div>

      <div className="block">
        <div className="block__eyebrow">Events</div>
        <div className="block__title">Task events</div>
        <div className="block__content">
          <div className="timeline">
            {task.events.map((event, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-title">{event.message}</div>
                  <div className="timeline-meta">{event.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
