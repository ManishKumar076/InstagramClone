import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const register = async (req, res) => {
  try {
      const username = req.body?.username?.trim();
      const email = req.body?.email?.trim().toLowerCase();
      const password = req.body?.password;
      if(!username || !email || !password) {
        return res.status(400).json({
          message:"Something is missing, please check!", success:false
        });
      }
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use", success: false });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashedPassword });
      const userToReturn = { _id: newUser._id, username: newUser.username, email: newUser.email };
      return res.status(201).json({ message: "Account created successfully", success: true, user: userToReturn });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error", success: false });
  }
};
export const login = async (req, res) => {
  try {
      const email = req.body?.email?.trim().toLowerCase();
      const password = req.body?.password;
      if(!email || !password) {
        return res.status(400).json({
          message:"Something is missing, please check!", success:false,
        });
      }
      const user = await User.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(email)}$`, "i") },
      });
      if (!user) {
        return res.status(401).json({ message: "Incorrect email or password", success: false });
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Incorrect email or password", success: false });
      }
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
      const userToReturn = {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        bookmarks: user.bookmarks,
      };
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ message: `Welcome back ${user.username}`, success: true, user: userToReturn });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error", success: false });
  }
};
export const logout = async (_,res) => {
  try {
    return res.cookie("token", "", {maxAge:0}).json({
      message:"Logged out successfully",
      success:true
    });

  } catch (error) {
      console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "author", select: "username profilePicture" },
          { path: "comments", populate: { path: "author", select: "username profilePicture" } },
        ],
      })
      .populate({
        path: "bookmarks",
        options: { sort: { createdAt: -1 } },
        populate: [
          { path: "author", select: "username profilePicture" },
          { path: "comments", populate: { path: "author", select: "username profilePicture" } },
        ],
      });

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      user,
      success:true
    });
  } catch (error) {
      console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const {bio, gender} = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if(profilePicture){
         const fileUri = getDataUri(profilePicture);
         cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    if(bio) user.bio = bio;
    if(gender) user.gender = gender;
    if(profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    return res.status(200).json({
      message:'Profile updated.',
      success:true,
      user
    });
  } catch (error) {
      console.log(error);
  }
};
export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password");
    if(!suggestedUsers){
      return res.status(400).json({
        message:'Currently do not have any users',
      })
    };
     return res.status(200).json({
        success:true,
        users:suggestedUsers
      })
  } catch (error) {
    console.log(error);
  }
};
export const followOrUnfollow = async (req, res) => {
  try {
      const followKrneWala = req.id;
      const jiskoFollowKrunga = req.params.id;
      if(followKrneWala == jiskoFollowKrunga){
        return res.status(400).json({
          message:'You cannot follow/unfollow yourself',
          success:false
        });
      }
      const user = await User.findById(followKrneWala);
      const targetUser = await User.findById(jiskoFollowKrunga);

      if(!user || !targetUser){
          return res.status(400).json({
          message:'User not found',
          success:false
        });
      }

      const isFollowing = user.following.includes(jiskoFollowKrunga);
      if(isFollowing){
         await Promise.all([
          user.updateOne({_id:followKrneWala},{$pull:{following:jiskoFollowKrunga}}),
          user.updateOne({_id:jiskoFollowKrunga},{$pull: {followers:followKrneWala}})
         ])
         return res.status(200).json({message:'Unfollowed successfully', success:true});
         
      } else {
        await Promise.all([
          user.updateOne({_id:followKrneWala},{$push:{following:jiskoFollowKrunga}}),
          user.updateOne({_id:jiskoFollowKrunga},{$push: {followers:followKrneWala}})
        ])
        return res.status(200).json({message:'followed successfully', success:true});
      }
  } catch (error) {
      console.log(error);
  }
}
