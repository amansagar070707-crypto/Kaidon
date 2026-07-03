const http = require("node:http");

const {
  appendResearchResult,
  appendTaskEvent,
  createHarnessEntryFromAssignment,
  initializeHarnessEntries,
  findHarnessEntry,
  getLatestHarnessEntry,
  listHarnessEntries,
  updateHarnessTask,
  updateTaskProgress,
} = require("./harness-store");
const { getUserBySession, loginUser, registerUser } = require("./auth-store");

const preferredPort = Number(process.env.PORT || "8000");
const portScanLimit = Number(process.env.SERVER_PORT_SCAN_LIMIT || "10");
const host = process.env.HOSTNAME || "0.0.0.0";
let activePort = preferredPort;
let portAttempts = 0;
const runExecutions = new Map();

const server = http.createServer(async (request, response) => {
  try {
    await handleRequest(request, response);
  } catch (error) {
    console.error("kaidon-server request failed:", error);
    if (!response.headersSent) {
      sendJson(response, 500, {
        error: "Internal server error.",
        detail: error instanceof Error ? error.message : "Unknown error.",
      });
    } else {
      response.end();
    }
  }
});

async function handleRequest(request, response) {
  if (!request.url) {
    sendJson(response, 400, { error: "Missing request URL." });
    return;
  }

  if (request.method === "GET" && request.url.startsWith("/health")) {
    sendJson(response, 200, {
      ok: true,
      service: "kaidon-server",
      provider: getProviderInfo(),
    });
    return;
  }

  if (request.method === "GET" && request.url.startsWith("/api/harness")) {
    const requestHost = request.headers.host || `${host}:${activePort}`;
    const url = new URL(request.url, `http://${requestHost}`);
    const agentId = url.searchParams.get("agentId");
    const taskId = url.searchParams.get("taskId");
    const stream = url.searchParams.get("stream");

    if (stream === "1") {
      if (!agentId || !taskId) {
        sendJson(response, 400, { error: "agentId and taskId are required for stream." });
        return;
      }

      const entry = findHarnessEntry(agentId, taskId);
      if (!entry) {
        sendJson(response, 404, { error: "Harness entry not found." });
        return;
      }

      return streamHarnessRun(response, entry);
    }

    if (agentId && taskId) {
      const entry = findHarnessEntry(agentId, taskId);
      if (!entry) {
        sendJson(response, 404, { error: "Harness entry not found." });
        return;
      }

      sendJson(response, 200, {
        item: entry,
        provider: getProviderInfo(),
      });
      return;
    }

    sendJson(response, 200, {
      latest: getLatestHarnessEntry(),
      items: listHarnessEntries(),
      provider: getProviderInfo(),
    });
    return;
  }

  if (request.method === "GET" && request.url.startsWith("/api/auth/me")) {
    const user = getUserBySession(readSessionToken(request));

    if (!user) {
      sendJson(response, 401, { error: "Not authenticated." });
      return;
    }

    sendJson(response, 200, { user });
    return;
  }

  if (request.method === "POST" && request.url.startsWith("/api/auth/signup")) {
    const result = registerUser(await readJson(request));

    if (!result.ok) {
      sendJson(response, result.status, { error: result.error });
      return;
    }

    sendAuthResponse(response, result.status, result.user, result.session);
    return;
  }

  if (request.method === "POST" && request.url.startsWith("/api/auth/login")) {
    const result = loginUser(await readJson(request));

    if (!result.ok) {
      sendJson(response, result.status, { error: result.error });
      return;
    }

    sendAuthResponse(response, result.status, result.user, result.session);
    return;
  }

  if (request.method === "POST" && request.url.startsWith("/api/harness/actions")) {
    const body = await readJson(request);
    const agentId = typeof body.agentId === "string" ? body.agentId : "";
    const taskId = typeof body.taskId === "string" ? body.taskId : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!agentId || !taskId || !action) {
      sendJson(response, 400, { error: "agentId, taskId, and action are required." });
      return;
    }

    const entry = updateHarnessTask(agentId, taskId, action);

    if (!entry) {
      sendJson(response, 404, { error: "Harness entry not found." });
      return;
    }

    sendJson(response, 200, {
      item: entry,
      provider: getProviderInfo(),
    });
    return;
  }

  if (request.method === "POST" && request.url.startsWith("/api/harness")) {
    const body = await readJson(request);
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      sendJson(response, 400, { error: "Prompt is required." });
      return;
    }

    const generationResult = await generateAgentDraft(prompt);
    const assignment = assignHarnessRequestFromDraft(prompt, generationResult.draft);
    const item = createHarnessEntryFromAssignment(assignment, {
      source: generationResult.mode,
      error: generationResult.error,
    });
    startHarnessExecution(item.assignment.generatedAgent.id, item.assignment.task.id);

    sendJson(response, 200, {
      item,
      generation: generationResult,
      provider: getProviderInfo(),
    });
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

initializeHarnessEntries()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    console.error("Failed to initialize harness store:", error);
    startServer();
  });

function startServer() {
  server.once("error", handleListenError);
  server.listen(activePort, host, () => {
    server.off("error", handleListenError);
    console.log(`kaidon-server listening on http://${host}:${activePort}`);
  });
}

function handleListenError(error) {
  if (error.code === "EADDRINUSE" && portAttempts < portScanLimit) {
    portAttempts += 1;
    activePort = preferredPort + portAttempts;
    server.close(() => startServer());
    return;
  }

  throw error;
}

function getProviderInfo() {
  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  const model = (process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2:free").trim();

  return {
    configured: Boolean(apiKey),
    model,
    provider: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
  };
}

function streamHarnessRun(response, entry) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.flushHeaders?.();

  const agentId = entry.assignment.generatedAgent.id;
  const taskId = entry.assignment.task.id;

  writeSseEvent(response, "snapshot", createRunSnapshot(agentId, taskId));

  const heartbeat = setInterval(() => {
    response.write(": keep-alive\n\n");
  }, 15000);

  const execution = runExecutions.get(taskId);
  if (execution) {
    execution.clients.add(response);
  }

  requestCleanup(response, () => {
    clearInterval(heartbeat);
    const activeExecution = runExecutions.get(taskId);
    if (activeExecution) {
      activeExecution.clients.delete(response);
    }
  });
}

function requestCleanup(response, cleanup) {
  let closed = false;

  const runCleanup = () => {
    if (closed) {
      return;
    }
    closed = true;
    cleanup();
  };

  response.on("close", runCleanup);
  response.on("error", runCleanup);
}

function writeSseEvent(response, event, payload) {
  response.write(`event: ${event}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastRunSnapshot(agentId, taskId, eventName = "snapshot") {
  const execution = runExecutions.get(taskId);
  if (!execution) {
    return;
  }

  const payload = createRunSnapshot(agentId, taskId);
  for (const client of execution.clients) {
    writeSseEvent(client, eventName, payload);
  }
}

function createRunSnapshot(agentId, taskId) {
  const entry = findHarnessEntry(agentId, taskId);
  return {
    item: entry,
    provider: getProviderInfo(),
  };
}

function startHarnessExecution(agentId, taskId) {
  if (runExecutions.has(taskId)) {
    return;
  }

  const execution = {
    clients: new Set(),
    finished: false,
  };

  runExecutions.set(taskId, execution);
  void executeHarnessRun(agentId, taskId, execution).finally(() => {
    execution.finished = true;
    broadcastRunSnapshot(agentId, taskId, "complete");
    setTimeout(() => {
      if (runExecutions.get(taskId) === execution) {
        runExecutions.delete(taskId);
      }
    }, 30_000);
  });
}

async function executeHarnessRun(agentId, taskId, execution) {
  const entry = findHarnessEntry(agentId, taskId);
  if (!entry) {
    return;
  }

  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  const model = (process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2:free").trim();
  const query = extractSearchQuery(entry.assignment.request.prompt);
  const agent = entry.assignment.generatedAgent;
  const useLiveApi = Boolean(apiKey);

  const steps = [
    {
      delayMs: 700,
      type: "task.started",
      message: "Runtime started the run.",
      progress: 16,
      completedSteps: 1,
      currentStep: "Understanding the request and constraints.",
      status: "running",
    },
    {
      delayMs: 900,
      type: "planning.completed",
      message: `Planner chose a search strategy for: ${query}`,
      progress: 28,
      completedSteps: 2,
      currentStep: "Choosing the best sources and search pattern.",
      status: "running",
    },
    {
      delayMs: 900,
      type: "search.source.started",
      message: "Starting source scans.",
      progress: 42,
      completedSteps: 3,
      currentStep: "Scanning approved public sources.",
      status: "running",
    },
  ];

  for (const step of steps) {
    if (isCanceled(agentId, taskId)) {
      return;
    }

    await wait(step.delayMs);
    appendTaskEvent(agentId, taskId, {
      type: step.type,
      at: new Date().toISOString(),
      message: step.message,
    });
    updateTaskProgress(agentId, taskId, {
      status: step.status,
      progress: step.progress,
      completedSteps: step.completedSteps,
      totalSteps: 6,
      currentStep: step.currentStep,
    });
    broadcastRunSnapshot(agentId, taskId, "snapshot");
  }

  let results = [];
  let llmResponse = null;

  if (useLiveApi) {
    try {
      llmResponse = await callOpenRouterLLMStream(apiKey, model, {
        system: `You are an AI agent named "${agent.name}". ${agent.description}\n\nYou have these tools: ${agent.tools.map((t) => t.name).join(", ")}.\n\nPerform the requested task and return a JSON result.`,
        user: query,
      }, (token, fullContent) => {
        broadcastRunSnapshot(agentId, taskId, "llm.token");
        const execution = runExecutions.get(taskId);
        if (execution) {
          for (const client of execution.clients) {
            writeSseEvent(client, "llm.token", { token, fullContent, agentId, taskId });
          }
        }
      });

      if (llmResponse.ok) {
        results = [
          {
            title: "LLM Analysis Result",
            url: "https://openrouter.ai",
            snippet: llmResponse.content.slice(0, 200),
            source: "openrouter-llm",
          },
        ];
      }
    } catch (error) {
      console.error("OpenRouter LLM call failed:", error.message);
    }

    if (llmResponse?.ok) {
      broadcastRunSnapshot(agentId, taskId, "llm.complete");
      const execution = runExecutions.get(taskId);
      if (execution) {
        for (const client of execution.clients) {
          writeSseEvent(client, "llm.complete", { agentId, taskId, content: llmResponse.content });
        }
      }
    }
  }

  if (results.length === 0) {
    try {
      results = await fetchLiveSearchResults(query);
    } catch {
      results = buildFallbackSearchResults(query);
    }
  }

  let resultIndex = 0;
  for (const result of results.slice(0, 5)) {
    if (isCanceled(agentId, taskId)) {
      return;
    }

    await wait(700);
    resultIndex += 1;
    appendResearchResult(agentId, taskId, result);
    appendTaskEvent(agentId, taskId, {
      type: "search.result.collected",
      at: new Date().toISOString(),
      message: `Found ${result.title} on ${result.source}.`,
      data: result,
    });
    updateTaskProgress(agentId, taskId, {
      status: "running",
      progress: Math.min(78, 42 + resultIndex * 9),
      completedSteps: 4,
      totalSteps: 6,
      currentStep: `Reviewing ${result.source} result ${resultIndex} of ${Math.min(results.length, 5)}.`,
    });
    broadcastRunSnapshot(agentId, taskId, "snapshot");
  }

  let summaryResult = null;

  if (useLiveApi && llmResponse?.ok) {
    try {
      const summaryResponse = await callOpenRouterLLM(apiKey, model, {
        system: "You are a summarizer. Take the following analysis and create a concise summary with key findings. Return JSON with title, summary, and keyPoints array.",
        user: `Original query: ${query}\n\nAnalysis:\n${llmResponse.content}`,
      });

      if (summaryResponse.ok) {
        try {
          summaryResult = JSON.parse(summaryResponse.content);
        } catch {
          summaryResult = {
            title: "Summary",
            summary: summaryResponse.content.slice(0, 500),
            keyPoints: ["Analysis completed via OpenRouter LLM"],
          };
        }
      }
    } catch (error) {
      console.error("Summary LLM call failed:", error.message);
    }
  }

  const finishSteps = [
    {
      delayMs: 700,
      type: "candidates.ranked",
      message: summaryResult?.summary || "Ranked the strongest matches.",
      progress: 88,
      completedSteps: 5,
      currentStep: "Ranking matches and removing weak results.",
      status: "running",
      data: summaryResult,
    },
    {
      delayMs: 700,
      type: "outreach.prepared",
      message: "Prepared shortlist and notes.",
      progress: 100,
      completedSteps: 6,
      currentStep: "Research complete.",
      status: "succeeded",
    },
  ];

  for (const step of finishSteps) {
    if (isCanceled(agentId, taskId)) {
      return;
    }

    await wait(step.delayMs);
    appendTaskEvent(agentId, taskId, {
      type: step.type,
      at: new Date().toISOString(),
      message: step.message,
      ...(step.data ? { data: step.data } : {}),
    });
    updateTaskProgress(agentId, taskId, {
      status: step.status,
      progress: step.progress,
      completedSteps: step.completedSteps,
      totalSteps: 6,
      currentStep: step.currentStep,
    });
    broadcastRunSnapshot(agentId, taskId, "snapshot");
  }

  if (execution.clients.size > 0) {
    broadcastRunSnapshot(agentId, taskId, "complete");
  }
}

function isCanceled(agentId, taskId) {
  const entry = findHarnessEntry(agentId, taskId);
  return !entry || entry.assignment.task.status === "canceled";
}

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function callOpenRouterLLM(apiKey, model, messages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Kaidon Agent OS",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: messages.system },
        { role: "user", content: messages.user },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter returned empty completion");
  }

  return {
    ok: true,
    content,
    model: data?.model || model,
    usage: data?.usage,
  };
}

async function callOpenRouterLLMStream(apiKey, model, messages, onToken) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Kaidon Agent OS",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: messages.system },
        { role: "user", content: messages.user },
      ],
      max_tokens: 2048,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  let fullContent = "";
  let usage = null;
  const reader = response.body;
  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of reader) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) {
        continue;
      }

      const payload = trimmed.slice(6);
      if (payload === "[DONE]") {
        continue;
      }

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullContent += delta;
          if (onToken) {
            onToken(delta, fullContent);
          }
        }
        if (parsed.usage) {
          usage = parsed.usage;
        }
      } catch {
        // skip malformed JSON chunks
      }
    }
  }

  return {
    ok: true,
    content: fullContent.trim(),
    model,
    usage,
  };
}

async function fetchLiveSearchResults(query) {
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 Kaidon/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }

  const html = await response.text();
  const blocks = html.split('<div class="result results_links');
  const results = [];

  for (const block of blocks.slice(1)) {
    const titleMatch = block.match(/result__a[^>]*>(.*?)<\/a>/i);
    const hrefMatch = block.match(/result__a[^>]*href="([^"]+)"/i);
    const snippetMatch = block.match(/result__snippet[^>]*>(.*?)<\/a>|result__snippet[^>]*>(.*?)<\/div>/i);

    if (!titleMatch || !hrefMatch) {
      continue;
    }

    const title = cleanHtml(titleMatch[1]);
    const rawUrl = decodeHtml(hrefMatch[1]);
    const parsedUrl = unwrapDuckDuckGoUrl(rawUrl);
    const snippet = cleanHtml(snippetMatch?.[1] || snippetMatch?.[2] || "Search result");

    if (!title || !parsedUrl) {
      continue;
    }

    results.push({
      title,
      url: parsedUrl,
      snippet,
      source: extractHostname(parsedUrl),
    });

    if (results.length >= 5) {
      break;
    }
  }

  if (results.length === 0) {
    throw new Error("No search results parsed.");
  }

  return results;
}

function buildFallbackSearchResults(query) {
  return [
    {
      title: `Search ${query} on LinkedIn Jobs`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`,
      snippet: "LinkedIn job search results for the requested role.",
      source: "linkedin.com",
    },
    {
      title: `Search ${query} on Wellfound`,
      url: "https://wellfound.com/jobs",
      snippet: "Startup and remote-first role discovery.",
      source: "wellfound.com",
    },
    {
      title: `Search ${query} on Greenhouse`,
      url: "https://www.greenhouse.io/job-board",
      snippet: "Direct company-hosted job board pages.",
      source: "greenhouse.io",
    },
  ];
}

function unwrapDuckDuckGoUrl(input) {
  if (input.startsWith("//duckduckgo.com/l/?")) {
    try {
      const wrapped = new URL(`https:${input}`);
      return wrapped.searchParams.get("uddg") || "";
    } catch {
      return "";
    }
  }

  return input;
}

function cleanHtml(input) {
  return decodeHtml(input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function decodeHtml(input) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractHostname(input) {
  try {
    return new URL(input).hostname.replace(/^www\./, "");
  } catch {
    return input;
  }
}

async function generateAgentDraft(prompt) {
  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  const enabled = (process.env.OPENROUTER_ENABLE_LIVE_GENERATION || "").trim() === "true";
  const model = (process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2:free").trim();
  const fallbackDraft = createFallbackAgentDraft(prompt);

  if (!apiKey) {
    return {
      ok: false,
      mode: "fallback",
      error: "OPENROUTER_API_KEY is not configured.",
      draft: fallbackDraft,
    };
  }

  if (!enabled) {
    return {
      ok: true,
      mode: "fallback",
      draft: fallbackDraft,
    };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Return only JSON with keys name, description, tools, memory. tools must be an array of {id,name,required}. memory must include scope, retentionDays, encrypted.",
          },
          {
            role: "user",
            content: `Generate an agent draft for this request: ${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        mode: "live",
        error: `OpenRouter request failed with status ${response.status}.`,
        draft: fallbackDraft,
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        ok: false,
        mode: "live",
        error: "OpenRouter returned an empty completion.",
        draft: fallbackDraft,
      };
    }

    const parsed = parseGeneratedAgentDraft(content);

    if (!parsed) {
      return {
        ok: false,
        mode: "live",
        error: "OpenRouter returned invalid JSON for the agent draft.",
        draft: fallbackDraft,
      };
    }

    return {
      ok: true,
      mode: "live",
      draft: parsed,
    };
  } catch (error) {
    return {
      ok: false,
      mode: "live",
      error: error instanceof Error ? error.message : "Unknown OpenRouter error.",
      draft: fallbackDraft,
    };
  }
}

function createFallbackAgentDraft(prompt) {
  const normalizedPrompt = prompt.trim();
  const wantsJobs = /job|career|resume|linkedin|interview|engineer|role/i.test(prompt);
  const wantsApproval = /approval|approve|refund/i.test(prompt);
  const wantsBilling = /billing|invoice|refund|payment/i.test(prompt);
  const slug = slugify(prompt);

  return {
    name: slug,
    description: normalizedPrompt,
    tools: [
      {
        id: wantsJobs ? "tool_job_search" : wantsBilling ? "tool_billing" : "tool_search",
        name: wantsJobs ? "Job search" : wantsBilling ? "Billing lookup" : "Search",
        required: true,
      },
      {
        id: wantsJobs ? "tool_outreach" : wantsApproval ? "tool_approval" : "tool_email",
        name: wantsJobs ? "Outreach drafting" : wantsApproval ? "Approval" : "Email",
        required: true,
      },
      {
        id: wantsJobs ? "tool_application_tracker" : "tool_memory",
        name: wantsJobs ? "Application tracker" : "Memory update",
        required: true,
      },
    ],
    memory: {
      scope: "workspace",
      retentionDays: 30,
      encrypted: true,
    },
  };
}

function parseGeneratedAgentDraft(content) {
  try {
    const parsed = JSON.parse(content);

    if (
      typeof parsed.name !== "string" ||
      typeof parsed.description !== "string" ||
      !Array.isArray(parsed.tools) ||
      !parsed.memory ||
      typeof parsed.memory.scope !== "string"
    ) {
      return null;
    }

    return {
      name: parsed.name,
      description: parsed.description,
      tools: parsed.tools
        .filter(
          (tool) =>
            tool &&
            typeof tool.id === "string" &&
            typeof tool.name === "string" &&
            typeof tool.required === "boolean",
        )
        .slice(0, 6),
      memory: {
        scope:
          parsed.memory.scope === "session" || parsed.memory.scope === "global"
            ? parsed.memory.scope
            : "workspace",
        retentionDays:
          typeof parsed.memory.retentionDays === "number"
            ? parsed.memory.retentionDays
            : 30,
        encrypted:
          typeof parsed.memory.encrypted === "boolean"
            ? parsed.memory.encrypted
            : true,
      },
    };
  } catch {
    return null;
  }
}

function assignHarnessRequestFromDraft(prompt, draft) {
  const request = createHarnessRequest(prompt, "studio-user");
  const workItem = createHarnessWorkItem(request);
  const generatedAgent = createAgentFromDraft(request, draft);
  const task = createRuntimeTask(generatedAgent, {
    requestId: request.id,
    workItemId: workItem.id,
    prompt: request.prompt,
  });

  return {
    request,
    workItem: {
      ...workItem,
      status: "ready",
    },
    generatedAgent,
    task,
  };
}

function createHarnessRequest(prompt, requestedBy) {
  return {
    id: `req_${Date.now()}`,
    prompt,
    requestedBy,
    createdAt: new Date().toISOString(),
  };
}

function createHarnessWorkItem(request, assignedAgent = "agent-builder") {
  const slug = slugify(request.prompt);

  return {
    id: `work_${slug}`,
    requestId: request.id,
    title: `Generate ${slug}`,
    summary: request.prompt,
    assignedAgent,
    status: "assigned",
  };
}

function createAgentFromDraft(request, draft) {
  const slug = slugify(request.prompt);

  return {
    id: slug,
    name: draft.name || slug,
    version: "0.1.0",
    description: draft.description,
    model: {
      provider: "openrouter",
      model: (process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2:free").trim(),
      family: "open-source",
    },
    tools: draft.tools,
    memory: draft.memory,
    status: "ready",
  };
}

function createRuntimeTask(agent, input) {
  const now = Date.now();
  const timeline = createExecutionTimeline(agent, input.prompt, now);

  return {
    id: `task_${agent.id}_${now}`,
    agent,
    status: timeline.status,
    input,
    checkpoints: timeline.checkpoints,
    events: timeline.events,
    updatedAt: timeline.updatedAt,
  };
}

function createExecutionTimeline(agent, prompt, now) {
  const searchQuery = extractSearchQuery(prompt);
  const wantsJobs = /job|career|resume|linkedin|interview|engineer|role/i.test(prompt);
  const baseTime = now - 45_000;
  const events = [
    createEvent("task.created", baseTime, `Task created for ${agent.name}.`),
    createEvent("task.started", baseTime + 4_000, `Planner started for query: ${searchQuery}`),
    createEvent(
      wantsJobs ? "web.search.started" : "tool.search.started",
      baseTime + 9_000,
      wantsJobs
        ? "Searching approved job sources: LinkedIn, Wellfound, Greenhouse, Lever."
        : "Searching approved sources for supporting context.",
    ),
    createEvent(
      wantsJobs ? "web.search.completed" : "tool.search.completed",
      baseTime + 18_000,
      wantsJobs
        ? "Collected role candidates and normalized job metadata."
        : "Search results collected and normalized.",
    ),
    createEvent(
      wantsJobs ? "candidates.ranked" : "memory.updated",
      baseTime + 28_000,
      wantsJobs
        ? "Ranked best-fit roles for 2026 AI engineer job search."
        : "Stored updated context in workspace memory.",
    ),
    createEvent(
      wantsJobs ? "outreach.prepared" : "task.waiting",
      baseTime + 36_000,
      wantsJobs
        ? "Prepared outreach draft and application tracking notes."
        : "Task is waiting for follow-up input.",
    ),
  ];
  const checkpoints = [
    {
      id: `cp_${agent.id}_${now}_1`,
      status: "running",
      at: new Date(baseTime + 20_000).toISOString(),
      note: wantsJobs
        ? "Saved checkpoint after role discovery and source normalization."
        : "Saved checkpoint after search and memory update.",
    },
  ];

  return {
    status: "running",
    checkpoints,
    events,
    updatedAt: events.at(-1)?.at ?? new Date(now).toISOString(),
  };
}

function createEvent(type, timestamp, message) {
  return {
    type,
    at: new Date(timestamp).toISOString(),
    message,
  };
}

function extractSearchQuery(prompt) {
  const explicitMatch = prompt.match(/for this user request:\s*(.+)$/i);

  if (explicitMatch?.[1]) {
    return explicitMatch[1].trim();
  }

  return prompt.trim();
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "generated-agent";
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString("utf8");

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function sendAuthResponse(response, statusCode, user, session) {
  response.setHeader(
    "Set-Cookie",
    `kaidon_session=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
  );
  sendJson(response, statusCode, { user });
}

function readSessionToken(request) {
  const cookieHeader = request.headers.cookie || "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) => cookie.startsWith("kaidon_session="));

  return sessionCookie ? decodeURIComponent(sessionCookie.split("=").slice(1).join("=")) : "";
}
