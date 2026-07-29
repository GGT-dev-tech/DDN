module.exports = {
  extends: ["next/core-web-vitals", "prettier"],
  plugins: ["boundaries"],
  settings: {
    "boundaries/elements": [
      { type: "app", pattern: "app/*" },
      { type: "pages", pattern: "pages/*" },
      { type: "widgets", pattern: "widgets/*" },
      { type: "features", pattern: "features/*" },
      { type: "entities", pattern: "entities/*" },
      { type: "shared", pattern: "shared/*" }
    ]
  },
  rules: {
    "boundaries/element-types": [
      2,
      {
        default: "disallow",
        rules: [
          { from: "app", allow: ["pages", "widgets", "features", "entities", "shared"] },
          { from: "pages", allow: ["widgets", "features", "entities", "shared"] },
          { from: "widgets", allow: ["features", "entities", "shared"] },
          { from: "features", allow: ["entities", "shared"] },
          { from: "entities", allow: ["shared"] },
          { from: "shared", allow: [] }
        ]
      }
    ]
  }
};
