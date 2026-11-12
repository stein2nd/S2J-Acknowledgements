import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    target: "node22",
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    ssr: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/bin/cli.ts"),
      external: [
        /^node:/,
        "node:fs",
        "node:fs/promises",
        "node:path",
        "node:url",
        "node:child_process",
        "node:process",
        "node:module",
        "node:os",
      ],
      output: {
        dir: path.resolve(__dirname, "dist/bin"),
        entryFileNames: "cli.js",
        format: "esm",
      },
    },
  },
  plugins: [
    {
      name: "shebang-cli",
      generateBundle(_options, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === "chunk" && file.isEntry) {
            file.code = `#!/usr/bin/env node\n${file.code}`;
          }
        }
      },
    },
  ],
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    environment: "node",
  },
});
