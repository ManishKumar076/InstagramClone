import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.set("bufferCommands", false);

  const atlasUri = process.env.MONGO_URI;
  const localUri = process.env.LOCAL_MONGO_URI || "mongodb://localhost:27017/instagram_clone";

  const normalizeUri = (uri) => {
    if (uri.includes("mongodb+srv://") && !uri.match(/mongodb\+srv:\/\/[^/]+\/[^?]/)) {
      const dbName = "instagram_clone";
      const normalized = uri.includes("?") ? uri.replace("?", `/${dbName}?`) : `${uri}/${dbName}`;
      console.log("Added database name to connection string");
      return normalized;
    }
    return uri;
  };

  const connectWithUri = async (uri, label) => {
    console.log(`Attempting to connect to MongoDB (${label})...`);
    await mongoose.connect(normalizeUri(uri), {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  };

  try {
    if (atlasUri) {
      try {
        await connectWithUri(atlasUri, "Atlas");
      } catch (atlasError) {
        const fallbackAllowed = Boolean(localUri);
        if (!fallbackAllowed) {
          throw atlasError;
        }
        console.error("Atlas connection failed, falling back to local MongoDB.");
        console.error(`   Atlas error: ${atlasError.message}`);
        await connectWithUri(localUri, "Local");
      }
    } else {
      console.warn("MONGO_URI not set - using local MongoDB");
      await connectWithUri(localUri, "Local");
    }

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err.message);
    });

    console.log("MongoDB connected successfully!");
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:");
    console.error(`   Error: ${error.message}`);

    if (error.message.includes("authentication")) {
      console.error("   -> Check your username and password in MONGO_URI");
      console.error("   -> Ensure password special characters are URL-encoded (@ = %40, # = %23)");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("   -> Check your internet connection");
      console.error("   -> Verify the cluster hostname in MONGO_URI");
    } else if (error.message.includes("timeout") || error.message.includes("whitelist")) {
      console.error("   -> Add your current IP in Atlas: Network Access -> Add IP Address");
    }

    throw error;
  }
};

export default connectDB;
