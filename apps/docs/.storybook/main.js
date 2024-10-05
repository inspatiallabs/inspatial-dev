import { dirname, join, resolve } from "path";

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

const config = {
  stories: ["../stories/*.stories.tsx", "../stories/**/*.stories.tsx"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  core: {},
  async viteFinal(config, { configType }) {
    return {
      ...config,
      define: { "process.env": {} },
      resolve: {
        alias: [
          {
            find: "@inspatial/kit",
            replacement: resolve(__dirname, "../../../packages/core/kit/"),
          },
          {
            find: "@inspatial/kit-button",
            replacement: resolve(
              __dirname,
              "../../../packages/core/kit/button"
            ),
          },
        ],
      },
    };
  },
  docs: {
    autodocs: true,
  },
};

export default config;
