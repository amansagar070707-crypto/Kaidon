import { NextResponse } from "next/server";

type ResearchResult = {
  title: string;
  url: string;
  snippet: string;
  source: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Missing query." }, { status: 400 });
  }

  try {
    const results = await fetchDuckDuckGoResults(query);
    return NextResponse.json({
      query,
      results,
      steps: buildSteps(query, results.length),
    });
  } catch {
    return NextResponse.json({
      query,
      results: buildFallbackResults(query),
      steps: buildSteps(query, 3),
      fallback: true,
    });
  }
}

async function fetchDuckDuckGoResults(query: string): Promise<ResearchResult[]> {
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 Kaidon/0.1",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }

  const html = await response.text();
  const blocks = html.split('<div class="result results_links');
  const results: ResearchResult[] = [];

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
    const snippet = cleanHtml(snippetMatch?.[1] ?? snippetMatch?.[2] ?? "Search result");

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

function buildSteps(query: string, resultCount: number) {
  return [
    `Understanding the request: ${query}`,
    "Choosing public web sources for AI engineer roles",
    `Collected ${resultCount} matching search results`,
    "Preparing shortlist and outreach notes",
  ];
}

function buildFallbackResults(query: string): ResearchResult[] {
  return [
    {
      title: `Search ${query} on LinkedIn Jobs`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`,
      snippet: "LinkedIn job search results for the requested role.",
      source: "linkedin.com",
    },
    {
      title: `Search ${query} on Wellfound`,
      url: `https://wellfound.com/jobs`,
      snippet: "Startup and remote-first role discovery.",
      source: "wellfound.com",
    },
    {
      title: `Search ${query} on Greenhouse`,
      url: `https://www.greenhouse.io/job-board`,
      snippet: "Direct company-hosted job board pages.",
      source: "greenhouse.io",
    },
  ];
}

function unwrapDuckDuckGoUrl(input: string) {
  if (input.startsWith("//duckduckgo.com/l/?")) {
    try {
      const wrapped = new URL(`https:${input}`);
      return wrapped.searchParams.get("uddg") ?? "";
    } catch {
      return "";
    }
  }

  return input;
}

function cleanHtml(input: string) {
  return decodeHtml(input.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function decodeHtml(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractHostname(input: string) {
  try {
    return new URL(input).hostname.replace(/^www\./, "");
  } catch {
    return input;
  }
}
