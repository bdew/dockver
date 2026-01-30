import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "cjs",
    sourcemap: false,
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescript({
      module: "ESNext",
      moduleResolution: "bundler",
      noEmitOnError: true,
    }),
  ],
};
