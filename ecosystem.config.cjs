module.exports = {
  apps: [{
    name: 'hailo-analytics',
    script: 'npx',
    args: 'http-server dist -p 3860 -c-1 --cors',
    cwd: '/Users/noc/operations/hailo-analytics',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
