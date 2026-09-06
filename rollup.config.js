import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import fs from "fs";
import path from "path";

const dev = process.env.ROLLUP_WATCH;
const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
// 版本号单一来源:优先 RELEASE_VERSION(CI 用 git tag 注入),否则 package.json
const version = process.env.RELEASE_VERSION || pkg.version;

// 把源码中的 __VERSION__ 占位符替换成真实版本号(需在 typescript 转换之后执行)
function injectVersion() {
  return {
    name: "inject-version",
    transform(code) {
      if (!code.includes("__VERSION__")) return null;
      return { code: code.split("__VERSION__").join(version), map: null };
    },
  };
}

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
    injectVersion(),
    nodeResolve({ browser: true }),
    json(),
    commonjs(),
    !dev && terser({ format: { comments: false } }),
  ].filter(Boolean),
};
