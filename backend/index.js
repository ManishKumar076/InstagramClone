import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

dotenv.config({});

const app = express();
const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS;
const allowAllOriginsInProduction =
  process.env.NODE_ENV === "production" && !process.env.FRONTEND_ORIGIN;

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients, configured origins, and production same-app deploys.
    if (!origin || allowAllOriginsInProduction || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// Socket.io setup
const io = new IOServer(server, {
  cors: {
    ...corsOptions,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("join", (room) => socket.join(room));
  socket.on("send_message", (data) => {
    // data: { to, message }
    io.to(data.to).emit("receive_message", data);
  });
  socket.on("disconnect", () => console.log("socket disconnected", socket.id));
});

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors(corsOptions)
);

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));
}

app.get("/", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  }
  return res.status(200).json({ message: "I'm coming from backend", success: true });
});

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

if (process.env.NODE_ENV === "production") {
  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API route not found", success: false });
    }
    return res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}

// connect DB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server listen at port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed because MongoDB is unavailable.");
    process.exit(1);
  }
};

startServer();

export { io };
