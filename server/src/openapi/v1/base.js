import paths from './paths/paths.js';

const base = {
  openapi: "3.0.0",
  info: {
    title: "Audiobook API",
    description: "An API for handling audiobook streaming and syncing.",
    version: "1.0.0"
  },
  "servers": [
    {
      url: "http://localhost:3001",
      description: "Local server for development."
    }
  ],
  paths: paths
};

export default base;
