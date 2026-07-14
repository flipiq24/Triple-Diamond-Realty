import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { tenantGuard } from "./middleware/tenant.js";
import mlsRouter from "./routes/mls.js";
import propertyRouter from "./routes/property.js";
import compsRouter from "./routes/comps.js";
import preferencesRouter from "./routes/preferences.js";
import agentContactRouter from "./routes/agent-contact.js";
import sellPropertyNotifyRouter from "./routes/sell-property-notify.js";
import doNotSellRouter from "./routes/do-not-sell.js";
import streetviewRouter from "./routes/streetview.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(corsMiddleware);
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) =>
    res.json({ status: "ok" }),
  );

  // All buyer-facing endpoints are tenant-scoped. tenantGuard validates the
  // slug (shape + allowlist) once before dispatching to any route.
  app.use("/:tenant/mls", tenantGuard, mlsRouter);
  app.use("/:tenant/property-details", tenantGuard, propertyRouter);
  app.use("/:tenant/comps", tenantGuard, compsRouter);
  app.use("/:tenant/buyers/preferences", tenantGuard, preferencesRouter);
  app.use("/:tenant/agent-contact", tenantGuard, agentContactRouter);
  app.use("/:tenant/sell-property-notify", tenantGuard, sellPropertyNotifyRouter);
  app.use("/:tenant/do-not-sell", tenantGuard, doNotSellRouter);
  app.use("/:tenant/streetview", tenantGuard, streetviewRouter);

  // 404 fallback
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  // Error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[api] error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  });

  return app;
}
