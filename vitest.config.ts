import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/*/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@kaidon/apl": path.resolve(__dirname, "packages/apl/src"),
      "@kaidon/runtime": path.resolve(__dirname, "packages/runtime/src"),
      "@kaidon/runtime-protocol": path.resolve(
        __dirname,
        "packages/runtime-protocol/src"
      ),
      "@kaidon/harness": path.resolve(__dirname, "packages/harness/src"),
      "@kaidon/llm": path.resolve(__dirname, "packages/llm/src"),
      "@kaidon/tools": path.resolve(__dirname, "packages/tools/src"),
      "@kaidon/memory": path.resolve(__dirname, "packages/memory/src"),
      "@kaidon/cli": path.resolve(__dirname, "packages/cli/src"),
    },
  },
});
