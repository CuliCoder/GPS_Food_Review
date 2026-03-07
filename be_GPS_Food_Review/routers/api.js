const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const ttsController = require("../controllers/ttsController");

router.post("/ask-assistant", aiController.handleAskFoodAssistant);
router.post("/ask-gemini", aiController.handleAskFoodAssistant);

router.get("/tts", ttsController.handleTtsRequest);
router.post("/tts-stream", ttsController.handleTtsStreamRequest);

module.exports = router;