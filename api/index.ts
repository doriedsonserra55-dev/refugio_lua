import { app } from "../server/_core/index";

export default function handler(req: any, res: any) {
  // Ensure req.url starts with /api so Express routes match /api/trpc and /api/health
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
  }
  return app(req, res);
}
