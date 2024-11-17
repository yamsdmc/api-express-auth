import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  test: {
    // ...
  },
  resolve: {
    alias: {
      "@application": path.resolve(__dirname, "src/application"),
      "@domain": path.resolve(__dirname, "src/domain"),
      "@infrastructure": path.resolve(__dirname, "src/infrastructure"),
      "@types": path.resolve(__dirname, "src/types"),
    },
  },
});
