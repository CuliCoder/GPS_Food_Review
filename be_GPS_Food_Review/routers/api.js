const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const ttsController = require("../controllers/ttsController");
const foodsController = require("../controllers/foodsController");

router.get("/meta/languages", foodsController.getLanguages);
router.get("/foods", foodsController.getFoods);
router.get("/foods/nearby", foodsController.getNearbyFoods);

router.get("/tts/food/:foodId", ttsController.getFoodAudio);
router.post("/tts/text", ttsController.streamCustomTextTts);

router.post("/chat", aiController.askAssistant);

module.exports = router;