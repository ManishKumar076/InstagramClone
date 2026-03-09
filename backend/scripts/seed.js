import dotenv from 'dotenv';
import connectDB from '../utils/db.js';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
  await connectDB();
  // clear
  await User.deleteMany({});
  await Post.deleteMany({});

  const password = await bcrypt.hash('password123', 10);
  const users = await User.create([
    { username: 'alice', email: 'alice@example.com', password },
    { username: 'bob', email: 'bob@example.com', password },
  ]);

  const posts = await Post.create([
    { caption: 'Hello world', image: 'https://placekitten.com/800/800', author: users[0]._id },
    { caption: 'Another post', image: 'https://placekitten.com/700/700', author: users[1]._id },
  ]);

  // attach posts to users
  users[0].posts.push(posts[0]._id);
  users[1].posts.push(posts[1]._id);
  await users[0].save();
  await users[1].save();

  console.log('Seed complete');
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
