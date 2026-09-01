'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pluginNodeResolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('@rollup/plugin-typescript');
var terser = require('@rollup/plugin-terser');
var json = require('@rollup/plugin-json');

const dev = process.env.ROLLUP_WATCH;

var rollup_config = {
  input: "src/timer-se-card.ts",
  output: {
    file: "dist/ha-timer-se-card.js",
    format: "es",
    inlineDynamicImports: true,
    sourcemap: false,
  },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json", declaration: false, declarationMap: false }),
    pluginNodeResolve.nodeResolve({ browser: true }),
    json(),
    commonjs(),
    !dev && terser({ format: { comments: false } }),
  ].filter(Boolean),
};

exports.default = rollup_config;
