const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routers/api");
const connectDB = require("./config/database");
require("dotenv").config();

// Connect to MongoDB
connectDB();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

app.use(express.json());

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST"],
        credentials: true
    })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiRoutes);

app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "be_GPS_Food_Review" });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
