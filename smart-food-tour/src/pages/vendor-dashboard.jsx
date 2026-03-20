import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Store, Mic, BarChart2, MessageSquare,
  Settings, LogOut, Volume2, Users, TrendingUp, Bell, Menu,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useVendorStats, useVendorVenues } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

const NAV_ITEMS = [
  { id: "overview", label: "Tổng quan",    icon: LayoutDashboard },
  { id: "venues",   label: "Quản lý quán", icon: Store },
  { id: "audio",    label: "Audio Manager", icon: Mic },
  { id: "stats",    label: "Thống kê",     icon: BarChart2 },
  { id: "messages", label: "Tin nhắn",     icon: MessageSquare },
  { id: "settings", label: "Cài đặt",      icon: Settings },
];

const LANGUAGE_PIE = [
  { name: "🇻🇳 Tiếng Việt", value: 42, fill: "#f97316" },
  { name: "🇬🇧 English",   value: 28, fill: "#3b82f6" },
  { name: "🇨🇳 中文",       value: 15, fill: "#ef4444" },
  { name: "🇯🇵 日本語",     value: 9,  fill: "#8b5cf6" },
  { name: "🇰🇷 한국어",     value: 6,  fill: "#10b981" },
];

const HOURLY_DATA = [
  { hour: "6h", visits: 12 }, { hour: "8h", visits: 35 }, { hour: "10h", visits: 58 },
  { hour: "12h", visits: 94 }, { hour: "14h", visits: 72 }, { hour: "16h", visits: 48 },
  { hour: "18h", visits: 110 }, { hour: "20h", visits: 88 }, { hour: "22h", visits: 30 },
];

export default function VendorDashboard() {
  const [, navigate] = useLocation();
  const { user, clearAuth } = useAppStore();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bảo vệ route
  useEffect(() => {
    const stored = user || JSON.parse(localStorage.getItem("sft_user") || "null");
    if (!stored || stored.role !== "vendor") navigate("/login");
  }, []);

  // React Query — JWT được gắn tự động qua apiFetch
  const { data: stats }  = useVendorStats();
  const { data: venues } = useVendorVenues();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const currentUser = user || JSON.parse(localStorage.getItem("sft_user") || "null");

  // Tạo dailyTraffic từ API hoặc fallback mock
  const dailyTraffic = stats?.dailyTraffic || [
    { day: "T2", visits: 120, audio: 55 }, { day: "T3", visits: 95, audio: 40 },
    { day: "T4", visits: 140, audio: 72 }, { day: "T5", visits: 110, audio: 48 },
    { day: "T6", visits: 185, audio: 90 }, { day: "T7", visits: 220, audio: 110 },
    { day: "CN", visits: 160, audio: 78 },
  ];

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </motion.div>
  );

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white border-r border-gray-100 w-60">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🍜</span>
          <span className="font-bold text-orange-600">Smart Food Tour</span>
        </div>
        <p className="text-xs text-gray-400">Vendor Portal</p>
      </div>
      <div className="p-3 flex-1">
        <div className="bg-orange-50 rounded-xl p-3 mb-4">
          <p className="font-semibold text-sm text-gray-800">{currentUser?.name}</p>
          <p className="text-xs text-orange-500">{currentUser?.shopName || "Chủ quán"}</p>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors text-sm font-medium ${
              tab === id ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50"
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <div className="hidden md:flex shrink-0"><SidebarContent /></div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 h-full z-50 shadow-xl">
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-gray-800">{NAV_ITEMS.find((n) => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link href="/map">
              <span className="text-xs text-orange-500 hover:underline cursor-pointer">Xem bản đồ</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Lượt tiếp cận tuần" value={stats?.weeklyAudioPlays ?? "—"} icon={TrendingUp} color="bg-orange-500" />
                <StatCard label="Lượt nghe audio"    value={stats?.weeklyAudioPlays ?? "—"} icon={Volume2}    color="bg-blue-500" />
                <StatCard label="Tổng QR taps"        value={stats?.totalQrTaps ?? "—"}      icon={Users}     color="bg-green-500" />
                <StatCard label="Quán của tôi"        value={venues?.length ?? "—"}          icon={Store}     color="bg-purple-500" />
              </div>

              {/* Traffic Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-1">Traffic & Audio 7 ngày</h2>
                <p className="text-xs text-gray-400 mb-4">Lượt xem và lượt nghe audio của quán bạn</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={dailyTraffic} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vendorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="vendorAudio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="visits" name="Lượt xem"   stroke="#f97316" strokeWidth={2} fill="url(#vendorVisits)" dot={false} />
                    <Area type="monotone" dataKey="audio"  name="Nghe audio" stroke="#3b82f6" strokeWidth={2} fill="url(#vendorAudio)"  dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Hourly + Language charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-700 mb-4">Giờ cao điểm hôm nay</h2>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={HOURLY_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="visits" name="Lượt xem" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-700 mb-4">Ngôn ngữ khách</h2>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={LANGUAGE_PIE} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                        {LANGUAGE_PIE.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── VENUES ── */}
          {tab === "venues" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{venues?.length ?? 0} quán</p>
              </div>
              {(venues ?? []).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  <Store size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Chưa có quán nào được gán cho tài khoản này</p>
                </div>
              ) : (
                venues.map((v) => (
                  <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                    {v.imageUrl && (
                      <img src={v.imageUrl} alt={v.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.category} · ⭐ {v.rating}</p>
                      <p className="text-xs text-gray-400 truncate">{v.address}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500 shrink-0">
                      <p>❤️ {v.respectCount}</p>
                      <p>📻 {v.qrTapCount} taps</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      v.status === "approved" ? "bg-green-100 text-green-700" :
                      v.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{v.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── AUDIO / STATS / MESSAGES / SETTINGS ── */}
          {["audio", "stats", "messages", "settings"].includes(tab) && (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              <p className="font-medium">Tính năng đang phát triển</p>
              <p className="text-sm mt-1">Sẽ có trong phiên bản tiếp theo theo PRD</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}