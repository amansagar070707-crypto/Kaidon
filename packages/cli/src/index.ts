#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createAgentDefinition,
  validateAgentDefinition,
  type AgentDefinition,
} from "@kaidon/apl";
import { runDoctor, type DoctorReport } from "./doctor";

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

  if (command === "doctor") {
    runDoctorCommand(argv.slice(3));
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

function runDoctorCommand(args: string[]): void {
  const filePath = args[0];

  if (!filePath) {
    output({
      ok: false,
      command: "doctor",
      error: "Usage: kaidon doctor <agent.json>",
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
    model: input.model as AgentDefinition["model"] | undefined,
    memory: input.memory,
    run: input.run,
    approval: input.approval,
    output: input.output,
    status: input.status,
  });

  const report = runDoctor(agent);

  printDoctorReport(report);

  process.exit(report.failures > 0 ? 1 : 0);
}

function printDoctorReport(report: DoctorReport): void {
  console.log("");
  console.log(`\x1b[1mKaidon Doctor\x1b[0m`);
  console.log(`Agent: ${report.agent}`);
  console.log(`Score: ${report.score}% (${report.passed}/${report.passed + report.warnings + report.failures} checks passed)`);
  console.log("");

  for (const check of report.checks) {
    const icon = check.status === "pass" ? "\x1b[32m✓\x1b[0m" : check.status === "warn" ? "\x1b[33m⚠\x1b[0m" : "\x1b[31m✗\x1b[0m";
    const label = check.status === "pass" ? "\x1b[32mPASS\x1b[0m" : check.status === "warn" ? "\x1b[33mWARN\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    console.log(`  ${icon} ${label} ${check.name}`);
    console.log(`    ${check.message}`);
  }

  console.log("");

  if (report.failures > 0) {
    console.log(`\x1b[31m${report.failures} check(s) failed. Fix the issues above before deploying.\x1b[0m`);
  } else if (report.warnings > 0) {
    console.log(`\x1b[33m${report.warnings} warning(s). Consider fixing for production readiness.\x1b[0m`);
  } else {
    console.log(`\x1b[32mAll checks passed. Agent is production ready.\x1b[0m`);
  }
}

function printHelp(): void {
  console.log("Kaidon CLI");
  console.log("");
  console.log("Usage:");
  console.log("  kaidon validate <agent.json>    Validate agent contract");
  console.log("  kaidon doctor <agent.json>      Run health checks on agent");
  console.log("");
  console.log("Examples:");
  console.log("  kaidon validate ./agent.json");
  console.log("  kaidon doctor ./agent.json");
}

function output(value: CliResult | { ok: boolean; command: string; result?: unknown; error?: string }): void {
  console.log(JSON.stringify(value, null, 2));
}

main(process.argv);
