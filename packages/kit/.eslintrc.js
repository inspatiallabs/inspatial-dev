/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
    