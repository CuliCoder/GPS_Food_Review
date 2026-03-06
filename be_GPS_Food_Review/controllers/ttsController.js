const gTTS = require("gtts");
const path = require("path");
const fs = require("fs");

const generate_speech = (text, lang) => {
  return new Promise((resolve, reject) => {
    const gtts = new gTTS(text, lang);
    const fileName = `speech_${Date.now()}.mp3`;

    // Đảm bảo thư mục lưu trữ tồn tại
    const publicDir = path.join(__dirname, "../public/audio");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, fileName);

    gtts.save(filePath, (err) => {
      if (err) {
        console.error("Lỗi tạo TTS:", err);
        reject(err);
      } else {
        resolve(`/audio/${fileName}`);
      }
    });
  });
};

const return_speech = (req, res) => {
  const text = req.query.text || "Hello, this is a text to speech test.";
  const lang = req.query.lang || "en";

  generate_speech(text, lang)
    .then((audioUrl) => res.json({ audioUrl }))
    .catch((err) =>
      res.status(500).json({ error: "Không thể tạo file âm thanh" }),
    );
};

module.exports = { generate_speech, return_speech };
