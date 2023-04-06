const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // base_url: 'https://64294d63caa5da6985e9cb00--beamish-mooncake-10ca2b.netlify.app'
      base_url: 'http://localhost:3000'
    }
  },
});
