/**
 * Seed script: Import dữ liệu từ venues.js gốc vào MongoDB
 * Chạy: npm run seed
 *
 * LƯU Ý: Đặt file venues.js (gốc từ Replit) vào cùng thư mục src/data/
 * Cấu trúc: be/src/data/venues.js
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../db/connection.js";
import { Poi } from "../models/poi.model.js";
import { User } from "../models/user.model.js";
import { venues } from "./venues.js"; // ← import thẳng từ file gốc

// ── Users mẫu ─────────────────────────────────────────────────
const USERS = [
  {
    email: "admin@smartfoodtour.vn",
    password: "Admin@123",
    name: "Admin SFT",
    role: "admin",
    status: "active",
  },
  {
    email: "phohanoi@gmail.com",
    password: "Vendor@123",
    name: "Nguyễn Văn An",
    phone: "0901234567",
    shopName: "Phở Hà Nội Số 1",
    role: "vendor",
    status: "active",
  },
  {
    email: "banhmi@gmail.com",
    password: "Vendor@123",
    name: "Trần Thị Lan",
    phone: "0912345678",
    shopName: "Bánh Mì Hội An",
    role: "vendor",
    status: "active",
  },
  {
    email: "cafeviet@gmail.com",
    password: "Vendor@123",
    name: "Lê Văn Dũng",
    phone: "0923456789",
    shopName: "Cà Phê Trứng Việt",
    role: "vendor",
    status: "pending",
  },
  {
    email: "user@example.com",
    password: "User@123",
    name: "Nguyễn Thị Mai",
    role: "member",
    status: "active",
    preferredLang: "vi",
  },
];

async function seed() {
  await connectDB();
  console.log("🌱 Seeding database...");

  // ── Users ──────────────────────────────────────────────────
  await User.deleteMany({});
  const createdUsers = await User.create(USERS);
  console.log(`✅ Created ${createdUsers.length} users`);

  // Map shopName → userId để gán vendorId cho POI
  const vendorMap = {};
  createdUsers
    .filter((u) => u.role === "vendor")
    .forEach((u) => {
      vendorMap[u.shopName] = u._id.toString();
    });

  // ── POIs ───────────────────────────────────────────────────
  await Poi.deleteMany({});

  const poisToInsert = venues.map((v) => {
    // Tìm vendor phù hợp theo tên
    const vendorEntry = Object.entries(vendorMap).find(([shopName]) =>
      v.name.toLowerCase().includes(shopName.toLowerCase().split(" ")[0])
    );

    return {
      ...v,
      vendorId: vendorEntry?.[1] ?? null,
      status: "approved",
      respectCount: Math.floor(Math.random() * 300),
      qrTapCount: 0,
      // GeoJSON cho 2dsphere index (insertMany bỏ qua pre-save hook)
      location: {
        type: "Point",
        coordinates: [v.lng, v.lat],
      },
    };
  });

  const created = await Poi.insertMany(poisToInsert);
  console.log(`✅ Created ${created.length} POIs (với đầy đủ ${Object.keys(venues[0].descriptionLocal || {}).length} ngôn ngữ)`);

  console.log("\n📋 Tài khoản test:");
  console.log("  Admin  : admin@smartfoodtour.vn  / Admin@123");
  console.log("  Vendor : phohanoi@gmail.com      / Vendor@123");
  console.log("  Member : user@example.com        / User@123");

  await disconnectDB();
  console.log("\n✅ Seed hoàn tất!");
}

seed().catch((err) => {
  console.error("❌ Seed thất bại:", err);
  process.exit(1);
});