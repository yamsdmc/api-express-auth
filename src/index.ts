import { createApp } from "./app";

const { app, blacklistService } = createApp("postgresql");

const PORT = process.env.PORT || 3000;
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
