module.exports = {
  apps: [
    {
      name: "depthrem",
      script: "./index.js",
      exec_mode: "cluster",
      instances: "max",
      watch: ["src"],
      ignore_watch: ["node_modules", "logs"],
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
