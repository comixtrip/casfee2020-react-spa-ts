/** Configuration for graphql-codegen */
const dotenv = require('dotenv');
const fs = require('fs');

// Use .env for configuration and .env.dist as fallback
const DOTENV_CONFIG = { path: './.env.dist' };
if (fs.existsSync('./.env')) DOTENV_CONFIG.path = './.env';
dotenv.config(DOTENV_CONFIG);

module.exports = {
  "schema": [
    {
      [process.env.REACT_APP_HTTP_BACKEND_LINK]: {
        "headers": {
          "X-Hasura-Admin-Secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET
        }
      }
    }
  ],
  "documents": [
    "./src/data/**/*.graphql"
  ],
  "overwrite": true,
  "generates": {
    "./src/api/generated/graphql.tsx": {
      "plugins": [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo"
      ],
      "config": {
        "skipTypename": false,
        "withHooks": true,
        "withHOC": false,
        "withComponent": false
      }
    },
    "./graphql.schema.json": {
      "plugins": [
        "introspection"
      ]
    }
  }
};
