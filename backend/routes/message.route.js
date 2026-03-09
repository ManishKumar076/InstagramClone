import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { sendMessage, getConversation } from "../controllers/message.controller.js";

const router = express.Router();

// Send a message to a receiver
router.post("/send", isAuthenticated, sendMessage);

// Get the full conversation between the logged in user and another user
router.get("/conversation/:id", isAuthenticated, getConversation);

export default router;
