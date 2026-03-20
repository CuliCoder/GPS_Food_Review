import { Schema, model } from "mongoose";

// Mỗi document = 1 lượt nghe audio
const AudioStatSchema = new Schema(
  {
    poiId: { type: String, required: true, index: true },
    lang: { type: String, required: true },
    // Để tổng hợp theo ngày/tuần/tháng
    date: { type: String, required: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

AudioStatSchema.index({ poiId: 1, date: 1 });

export const AudioStat = model("AudioStat", AudioStatSchema);