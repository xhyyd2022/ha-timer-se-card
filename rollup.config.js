import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/timer-se-card.ts",
  output: {
    file: "dist/ha-timer-se-card.js",
    format: "es",
    inlineDynamicImports: true,
    sourcemap: false,
  },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json", declaration: false, declarationMap: false }),
    nodeResolve({ browser: true }),
    json(),
    commonjs(),
    !dev && terser({ format: { comments: false } }),
  ].filter(Boolean),
};
