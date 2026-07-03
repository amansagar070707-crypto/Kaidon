/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@kaidon/apl",
    "@kaidon/design-system",
    "@kaidon/harness",
    "@kaidon/llm",
    "@kaidon/memory",
    "@kaidon/runtime",
    "@kaidon/tools",
  ],
};

export default nextConfig;
