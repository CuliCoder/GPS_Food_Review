import { Schema, model } from "mongoose";

const MenuItemSchema = new Schema(
  {
    id: String,
    name: String,
    nameLocal: { type: Map, of: String },
    description: String,
    price: Number,
    imageUrl: String,
    isFeatured: { type: Boolean, default: false },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    id: String,
    author: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: String,
    lang: String,
  },
  { _id: false }
);

const PoiSchema = new Schema(
  {
    // slug id dùng để lookup (e.g. "v001", "pho-ha-noi")
    id: { type: String, required: true, unique: true, index: true },

    // Tên đa ngôn ngữ
    name: { type: String, required: true },
    nameLocal: { type: Map, of: String, default: {} },

    // Danh mục
    category: {
      type: String,
      required: true,
      enum: ["vietnamese", "seafood", "vegetarian", "hotpot", "banh-mi", "coffee", "other"],
    },

    // Mô tả đa ngôn ngữ
    description: String,
    descriptionLocal: { type: Map, of: String, default: {} },

    // Vị trí GPS
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    // GeoJSON để dùng $near query (PRD yêu cầu 2dsphere index)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    address: { type: String, required: true },

    // Đánh giá
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    imageUrl: String,
    gallery: [String],
    isOpen: { type: Boolean, default: true },

    // Bán kính kich hoạt audio (mét)
    audioRadius: { type: Number, default: 50 },

    priceRange: { type: String, enum: ["$", "$$", "$$$"] },
    tags: [String],
    phone: String,
    website: String,
    hours: { type: Map, of: String, default: {} },

    menu: [MenuItemSchema],
    reviews: [ReviewSchema],

    // Audio
    hasAudio: { type: Boolean, default: false },
    audioLanguages: [String],
    audioTranscripts: { type: Map, of: String, default: {} },

    // Respect (yêu thích)
    respectCount: { type: Number, default: 0 },

    // Quản lý nội dung (Admin moderation)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    rejectedReason: String,

    // Liên kết với Merchant
    vendorId: { type: String, default: null },

    // QR thanh toán
    qrImageUrl: String,
    qrTapCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform: (_doc, ret) => {
        // Giữ nguyên id (slug field), chỉ xóa _id và __v
        delete ret._id;
        delete ret.__v;
        // Flatten Map fields
        ["nameLocal", "descriptionLocal", "hours", "audioTranscripts"].forEach((k) => {
          if (ret[k] instanceof Map) ret[k] = Object.fromEntries(ret[k]);
        });
        if (ret.menu) {
          ret.menu = ret.menu.map((m) => ({
            ...m,
            nameLocal: m.nameLocal instanceof Map ? Object.fromEntries(m.nameLocal) : m.nameLocal,
          }));
        }
        return ret;
      },
    },
  }
);

// 2dsphere index cho $near / $geoWithin (PRD 6.1.2)
PoiSchema.index({ location: "2dsphere" });

// Tự động đồng bộ location từ lat/lng trước khi save
PoiSchema.pre("save", function () {
  this.location = { type: "Point", coordinates: [this.lng, this.lat] };
});

export const Poi = model("Poi", PoiSchema);