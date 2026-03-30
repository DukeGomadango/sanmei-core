import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    "@tailwindcss/postcss": {
      // Monorepo で cwd がずれても class 候補をこのパッケージ配下から拾う
      base: __dirname,
    },
    autoprefixer: {},
  },
};

