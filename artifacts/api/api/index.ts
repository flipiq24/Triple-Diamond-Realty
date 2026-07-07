// Vercel serverless entry.
//
// Vercel's Node runtime hands the function real Node
// IncomingMessage / ServerResponse objects that Express can consume
// directly — no adapter needed. `serverless-http` (used earlier) is meant
// for AWS Lambda's event/context signature, and with Express 5 it was
// hanging the function until Vercel's 30s timeout tripped
// (FUNCTION_INVOCATION_TIMEOUT). Exporting the app itself is the standard
// Vercel + Express pattern.
import { createApp } from "../src/app.js";

const app = createApp();

export default app;
