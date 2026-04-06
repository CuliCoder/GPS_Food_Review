import mongoose from "mongoose";

const { MongoClient, ServerApiVersion } = mongoose.mongo;

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI must be set in .env");

const mongoClient = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let cachedDb = null;

export async function connectDB() {
  try {
    if (cachedDb) return cachedDb;

    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });

    // Reuse MongoClient for existing Mongoose models.
    mongoose.connection.setClient(mongoClient);

    cachedDb = mongoClient.db();
    console.log("✅ MongoDB connected:", cachedDb.databaseName);
    return cachedDb;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

export function getMongoClient() {
  return mongoClient;
}

export function getDb() {
  return cachedDb;
}

export function getDbReadyState() {
  return mongoose.connection.readyState;
}

export async function disconnectDB() {
  if (cachedDb) cachedDb = null;
  await mongoClient.close();
}

export { mongoose };