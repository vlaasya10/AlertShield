import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import eventRoutes from "./routes/event.routes";
import alertRoutes from "./routes/alert.routes";
import adminRoutes from "./routes/admin.routes";
import metricsRoutes from "./routes/metrics.routes";
import simulateRoutes from "./routes/simulate.routes";
import healthRoutes from "./routes/health.routes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.use("/api/health", healthRoutes);

// API routes
app.use("/api/events", eventRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/simulate", simulateRoutes);
app.use("/api/metrics", metricsRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 AlertShield server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
