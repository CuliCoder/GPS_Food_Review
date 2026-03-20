import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db/connection.js";

const rawPort = process.env.PORT;
if (!rawPort) throw new Error("PORT environment variable is required");

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

await connectDB();

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});