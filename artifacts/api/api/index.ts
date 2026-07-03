// Vercel serverless entry — wraps the Express app with serverless-http.
// A single function catches all routes via vercel.json rewrites.
import serverless from "serverless-http";
import { createApp } from "../src/app.js";

const app = createApp();
const handler = serverless(app);

export default async function (req: unknown, res: unknown) {
  return (handler as (req: unknown, res: unknown) => Promise<unknown>)(req, res);
}
