const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
router.post('/ask-gemini', aiController.ask_gemini);        
module.exports = router;