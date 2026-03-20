import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: String,
    role: {
      type: String,
      enum: ["member", "vendor", "admin"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "active",
    },
    // Vendor fields
    shopName: String,
    // Preference
    preferredLang: { type: String, default: "en" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password trước khi lưu
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = model("User", UserSchema);