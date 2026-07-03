#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createAgentDefinition,
  validateAgentDefinition,
  type AgentDefinition,
} from "@kaidon/apl";

type CliResult =
  | { ok: true; command: string; result: unknown }
  | { ok: false; command: string; error: string };

function main(argv: string[]): void {
  const command = argv[2];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  if (command === "validate") {
    runValidate(argv.slice(3));
    return;
  }

  output({
    ok: false,
    command,
    error: `Unknown command: ${command}`,
  });
  process.exit(1);
}

function runValidate(args: string[]): void {
  const filePath = args[0];

  if (!filePath) {
    output({
      ok: false,
      command: "validate",
      error: "Usage: kaidon validate <agent.json>",
    });
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), filePath);
  const raw = readFileSync(absolutePath, "utf8");
  const input = JSON.parse(raw) as Partial<AgentDefinition>;
  const agent = createAgentDefinition({
    id: String(input.id ?? ""),
    name: String(input.name ?? ""),
    version: String(input.version ?? ""),
    description: String(input.description ?? ""),
    tools: Array.isArray(input.tools) ? input.tools : [],
    memory: input.memory,
    status: input.status,
  });
  const validation = validateAgentDefinition(agent);

  output({
    ok: validation.valid,
    command: "validate",
    result: {
      agent,
      validation,
    },
  });

  process.exit(validation.valid ? 0 : 1);
}

function printHelp(): void {
  console.log("Kaidon CLI");
  console.log("");
  console.log("Usage:");
  console.log("  kaidon validate <agent.json>");
}

function output(value: CliResult | { ok: boolean; command: string; result?: unknown; error?: string }): void {
  console.log(JSON.stringify(value, null, 2));
}

main(process.argv);
