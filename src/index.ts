import { createApp } from "./app";
import { validateEnvironment } from "./shared/utils/validateEnv";

validateEnvironment();
const { app, blacklistService } = createApp("postgresql");

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  blacklistService.stop();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
}

export default app;
