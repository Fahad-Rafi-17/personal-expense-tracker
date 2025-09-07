import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

// Import vite types conditionally to avoid loading vite in production
let createViteServer: any;
let createLogger: any;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: any) {
  // Skip vite setup completely in production or Vercel environments
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    console.log("Skipping Vite setup in production/Vercel environment");
    return;
  }

  try {
    // Only import vite modules when actually needed in development
    if (!createViteServer || !createLogger) {
      const vite = await import("vite");
      createViteServer = vite.createServer;
      createLogger = vite.createLogger;
    }

    // Dynamically import vite config only when needed in development
    const viteConfigModule = await import("../vite.config.js");
    const viteConfig = viteConfigModule.default;

    const viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: any, options: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
  } catch (error) {
    console.error("Failed to setup Vite:", error);
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.warn(`Build directory not found: ${distPath}, this is expected in Vercel environment`);
    // In Vercel, static files are served differently, so we just return
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
