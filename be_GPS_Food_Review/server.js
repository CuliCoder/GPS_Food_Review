// server.js
const express = require("express");
const cors = require("cors");
const apiRoutes = require('./routers/api');
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: "*", // Địa chỉ của Vite React
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.static('public')); // Cho phép truy cập file tĩnh trong thư mục public
app.use('/api', apiRoutes);
app.listen(3000, () => console.log("Server chạy tại port 3000"));
