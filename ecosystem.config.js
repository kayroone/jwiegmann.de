module.exports = {
  apps: [
    {
      name: "jwiegmann",
      script: "server.js",
      cwd: "/home/kayro/apps/jwiegmann.de/current",
      interpreter: "/home/kayro/.nvm/versions/node/v22.19.0/bin/node",
      env: {
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
