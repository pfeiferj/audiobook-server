import express from 'express';
import cors from 'cors';
import path from 'path';
import v1Base from './openapi/v1/base.js';
import swaggerUi from 'swagger-ui-express'
import * as OpenApiValidator from 'express-openapi-validator';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()

app.use(cors());
app.use(express.json())
app.use(express.urlencoded())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(v1Base))

app.use(
  OpenApiValidator.middleware({
    apiSpec: v1Base,
    validateRequests: true,
    validateResponses: true,
    operationHandlers: path.join(__dirname, 'operations')
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
