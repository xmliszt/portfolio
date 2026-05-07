const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const prettierConfig = require("eslint-config-prettier");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const noRelativeImportPaths = require("eslint-plugin-no-relative-import-paths");

module.exports = [
  ...nextCoreWebVitals,
  prettierConfig,
  {
    ignores: [
      "node_modules/*",
      ".next/*",
      ".out/*",
      "!.prettierrc.js",
      "./components/ui/*",
      "./content/*",
      "./.velite/*",
    ],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["server-only"],
            ["^react", "^@?\\w"],
            ["^(@|components)(/.*|$)"],
            ["^\\u0000"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.?(css)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "no-relative-import-paths/no-relative-import-paths": [
        "warn",
        { allowSameFolder: true, prefix: "@" },
      ],
    },
  },
];
