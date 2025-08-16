diff --git a/server/index.ts b/server/index.ts
index 8bf19122167f89a0ff094c8e2950c838537c2eba..29ba42c7a7c9a707fcdfc54016ca31256dea9cc7 100644
--- a/server/index.ts
+++ b/server/index.ts
@@ -20,52 +20,51 @@ app.use((req, res, next) => {
   res.on("finish", () => {
     const duration = Date.now() - start;
     if (path.startsWith("/api")) {
       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
       if (capturedJsonResponse) {
         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
       }
 
       if (logLine.length > 80) {
         logLine = logLine.slice(0, 79) + "…";
       }
 
       log(logLine);
     }
   });
 
   next();
 });
 
 (async () => {
   const server = await registerRoutes(app);
 
   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
     const status = err.status || err.statusCode || 500;
     const message = err.message || "Internal Server Error";
-
+    console.error(err);
     res.status(status).json({ message });
-    throw err;
   });
 
   // importantly only setup vite in development and after
   // setting up all the other routes so the catch-all route
   // doesn't interfere with the other routes
   if (app.get("env") === "development") {
     await setupVite(app, server);
   } else {
     serveStatic(app);
   }
 
   // ALWAYS serve the app on the port specified in the environment variable PORT
   // Other ports are firewalled. Default to 5000 if not specified.
   // this serves both the API and the client.
   // It is the only port that is not firewalled.
   const port = parseInt(process.env.PORT || '5000', 10);
   server.listen({
     port,
     host: "0.0.0.0",
     reusePort: true,
   }, () => {
     log(`serving on port ${port}`);
   });
 })();
