import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

// Send a simple text message from the logged-in user to another user
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res
        .status(400)
        .json({ message: "receiverId and text required", success: false });
    }

    const msg = await Message.create({ senderId, receiverId, text });
    await msg.populate("senderId", "username profilePicture");


    return res
      .status(201)
      .json({ message: "Message sent", msg, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", success: false });
  }
};

// Get the full text conversation between the logged-in user and another user
export const getConversation = async (req, res) => {
  try {
    const userId = req.id;
    const otherId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username profilePicture");

    return res.status(200).json({ messages, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", success: false });
  }
};