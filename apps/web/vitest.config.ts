import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      include: [
        "src/modules/financial-data/**/*.ts",
        "src/modules/atlas-intelligence/**/*.ts",
        "src/modules/smart-goals/**/*.ts",
        "src/modules/pluggy/**/*.ts",
        "src/lib/observability/**/*.ts",
        "src/lib/logging/**/*.ts",
      ],
      exclude: ["src/**/*.test.ts", "src/**/index.ts"],
    },
  },
});
