const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const ttsController = require('../controllers/ttsController');
router.post('/ask-gemini', aiController.ask_gemini);   
router.get('/tts', ttsController.generate_speech);     
module.exports = router;