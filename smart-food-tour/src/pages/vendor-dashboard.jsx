import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import {
  LayoutDashboard, Store, Mic, BarChart2, MessageSquare,
  Settings, LogOut, Volume2, Users, TrendingUp, Bell, Menu,
  Plus, Trash2, Edit2, CheckCircle, Clock, XCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  useVendorStats, useVendorVenues, useCreatePoi, useDeletePoi,
} from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

const NAV_ITEMS = [
  { id: "overview",  label: "Tổng quan",     icon: LayoutDashboard },
  { id: "venues",    label: "Quản lý quán",  icon: Store },
  { id: "register",  label: "Đăng ký quán",  icon: Plus },
  { id: "stats",     label: "Thống kê",      icon: BarChart2 },
  { id: "settings",  label: "Cài đặt",       icon: Settings },
];

const CATEGORIES = [
  { value: "vietnamese", label: "🍜 Đồ Việt" },
  { value: "banh-mi",    label: "🥖 Bánh Mì" },
  { value: "coffee",     label: "☕ Cà Phê" },
  { value: "hotpot",     label: "🔥 Lẩu" },
  { value: "seafood",    label: "🦐 Hải Sản" },
  { value: "vegetarian", label: "🥗 Chay" },
  { value: "other",      label: "🍽️ Khác" },
];

const LANGUAGE_PIE = [
  { name: "🇻🇳 VI", value: 42, fill: "#f97316" },
  { name: "🇬🇧 EN", value: 28, fill: "#3b82f6" },
  { name: "🇨🇳 ZH", value: 15, fill: "#ef4444" },
  { name: "🇯🇵 JA", value: 9,  fill: "#8b5cf6" },
  { name: "🇰🇷 KO", value: 6,  fill: "#10b981" },
];

const STATUS_CONFIG = {
  approved: { label: "Đã duyệt",   color: "bg-green-100 text-green-700",  icon: CheckCircle },
  pending:  { label: "Chờ duyệt",  color: "bg-yellow-100 text-yellow-700", icon: Clock },
  rejected: { label: "Từ chối",    color: "bg-red-100 text-red-700",       icon: XCircle },
};

const DEFAULT_POSITION = [10.7769, 106.7009];

const vendorLocationIcon = L.divIcon({
  className: "custom-vendor-location-marker",
  html: `<div style="width:14px;height:14px;background:#f97316;border:2px solid #fff;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.25);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const userLocationIcon = L.divIcon({
  className: "custom-vendor-user-marker",
  html: `<div style="width:14px;height:14px;background:#2563eb;border:2px solid #fff;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.25);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function RegisterLocationPicker({ selectedPosition, userPosition, centerPosition, onPick }) {
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        onPick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  function MapCenterSync({ center }) {
    const map = useMap();

    useEffect(() => {
      if (center) {
        map.setView(center);
      }
    }, [center, map]);

    return null;
  }

  return (
    <MapContainer
      center={centerPosition || DEFAULT_POSITION}
      zoom={16}
      scrollWheelZoom={true}
      className="w-full h-64 rounded-xl border border-gray-200 overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapClickHandler />
      <MapCenterSync center={centerPosition} />

      {userPosition && (
        <Marker position={userPosition} icon={userLocationIcon} />
      )}

      {selectedPosition && (
        <Marker position={selectedPosition} icon={vendorLocationIcon} />
      )}
    </MapContainer>
  );
}

export default function VendorDashboard() {
  const [, navigate] = useLocation();
  const { user, clearAuth } = useAppStore();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "vietnamese", address: "",
    lat: "", lng: "", priceRange: "$", phone: "", description: "",
    sourceLang: "vi",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [userPosition, setUserPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_POSITION);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  useEffect(() => {
    const stored = user || JSON.parse(localStorage.getItem("sft_user") || "null");
    if (!stored || stored.role !== "vendor") navigate("/login");
  }, []);

  const { data: stats }  = useVendorStats();
  const { data: venues, refetch: refetchVenues } = useVendorVenues();
  const createPoi  = useCreatePoi();
  const deletePoi  = useDeletePoi();

  const handleLogout = () => { clearAuth(); navigate("/login"); };

  const currentUser = user || JSON.parse(localStorage.getItem("sft_user") || "null");

  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resolveAddressFromCoordinates = async (lat, lng) => {
    setIsResolvingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data?.display_name) {
        handleField("address", data.display_name);
      }
    } catch {
      // Không chặn luồng nếu reverse geocode thất bại.
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handlePickOnMap = async (lat, lng) => {
    const nextLat = Number(lat).toFixed(6);
    const nextLng = Number(lng).toFixed(6);

    handleField("lat", nextLat);
    handleField("lng", nextLng);
    setMapCenter([Number(nextLat), Number(nextLng)]);

    await resolveAddressFromCoordinates(nextLat, nextLng);
  };

  const useMyCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormError("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }

    setFormError("");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLat = Number(position.coords.latitude).toFixed(6);
        const nextLng = Number(position.coords.longitude).toFixed(6);
        const coords = [Number(nextLat), Number(nextLng)];

        setUserPosition(coords);
        setMapCenter(coords);
        handleField("lat", nextLat);
        handleField("lng", nextLng);

        await resolveAddressFromCoordinates(nextLat, nextLng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setFormError("Không lấy được vị trí hiện tại. Bạn có thể click chọn trực tiếp trên bản đồ.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (tab !== "register") return;
    if (form.lat && form.lng) return;
    useMyCurrentLocation();
  }, [tab]);

  const handleRegister = async () => {
    setFormError(""); setFormSuccess("");
    if (!form.name || !form.address || !form.lat || !form.lng) {
      setFormError("Vui lòng điền đầy đủ tên, địa chỉ, lat, lng");
      return;
    }
    createPoi.mutate(form, {
      onSuccess: () => {
        setFormSuccess("Đăng ký thành công! Quán đang chờ Admin phê duyệt.");
        setForm({ name: "", category: "vietnamese", address: "", lat: "", lng: "", priceRange: "$", phone: "", description: "", sourceLang: "vi" });
        setUserPosition(null);
        setMapCenter(DEFAULT_POSITION);
        setTab("venues");
        refetchVenues();
      },
      onError: (e) => setFormError(e.message),
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Xóa quán này?")) return;
    deletePoi.mutate({ id, isAdmin: false }, { onSuccess: () => refetchVenues() });
  };

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
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-gray-800">{NAV_ITEMS.find(n => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
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
                <StatCard label="Lượt nghe audio"  value={stats?.weeklyAudioPlays} icon={Volume2}    color="bg-blue-500" />
                <StatCard label="Tổng QR taps"      value={stats?.totalQrTaps}      icon={Users}      color="bg-green-500" />
                <StatCard label="Tổng yêu thích"    value={stats?.totalRespects}    icon={TrendingUp} color="bg-orange-500" />
                <StatCard label="Số quán"            value={venues?.length}          icon={Store}      color="bg-purple-500" />
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4">Traffic 7 ngày qua</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={dailyTraffic} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="visits" name="Lượt xem" stroke="#f97316" strokeWidth={2} fill="url(#vv)" dot={false} />
                    <Area type="monotone" dataKey="audio"  name="Nghe audio" stroke="#3b82f6" strokeWidth={2} fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── VENUES ── */}
          {tab === "venues" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{venues?.length ?? 0} quán</p>
                <button onClick={() => setTab("register")}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors">
                  <Plus size={15} /> Đăng ký quán mới
                </button>
              </div>
              {(venues ?? []).length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
                  <Store size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Chưa có quán nào</p>
                  <button onClick={() => setTab("register")} className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm rounded-xl">
                    Đăng ký ngay
                  </button>
                </div>
              ) : (
                venues.map(v => {
                  const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                      {v.imageUrl && <img src={v.imageUrl} alt={v.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.category} · ⭐ {v.rating || 0}</p>
                        <p className="text-xs text-gray-400 truncate">{v.address}</p>
                        {v.status === "rejected" && v.rejectedReason && (
                          <p className="text-xs text-red-500 mt-1">Lý do: {v.rejectedReason}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${sc.color}`}>
                          <StatusIcon size={11} /> {sc.label}
                        </span>
                        {v.status !== "approved" && (
                          <button onClick={() => handleDelete(v.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <div className="max-w-lg space-y-4">
              <p className="text-sm text-gray-500">Quán sẽ ở trạng thái chờ duyệt sau khi đăng ký.</p>

              {formError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{formError}</div>}
              {formSuccess && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">{formSuccess}</div>}

              {/* Thông báo AI dịch tự động */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                <span className="text-lg">🤖</span>
                <p className="text-xs text-blue-700">
                  AI sẽ tự động dịch tên và mô tả quán sang <strong>15 ngôn ngữ</strong> sau khi bạn đăng ký.
                </p>
              </div>

              {/* Ngôn ngữ nhập */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Bạn đang nhập bằng ngôn ngữ nào?</label>
                <select value={form.sourceLang} onChange={e => handleField("sourceLang", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm">
                  <option value="vi">🇻🇳 Tiếng Việt</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="zh">🇨🇳 中文</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="ko">🇰🇷 한국어</option>
                  <option value="fr">🇫🇷 Français</option>
                </select>
              </div>

              {[
                { label: "Tên quán *", key: "name", placeholder: "Phở Ngon Số 1" },
                { label: "Địa chỉ *",  key: "address", placeholder: "26 Lê Lợi, Quận 1, TP.HCM" },
                { label: "Số điện thoại", key: "phone", placeholder: "028 3821 1234" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input type={type || "text"} placeholder={placeholder} value={form[key]}
                    onChange={e => handleField(key, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm" />
                </div>
              ))}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Chọn vị trí quán trên bản đồ *</label>
                  <button
                    type="button"
                    onClick={useMyCurrentLocation}
                    disabled={isLocating}
                    className="text-xs px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                  >
                    {isLocating ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
                  </button>
                </div>

                <RegisterLocationPicker
                  selectedPosition={form.lat && form.lng ? [Number(form.lat), Number(form.lng)] : null}
                  userPosition={userPosition}
                  centerPosition={mapCenter}
                  onPick={handlePickOnMap}
                />

                <p className="text-xs text-gray-500">
                  Click vào bản đồ để chọn chính xác địa điểm quán.
                  {isResolvingAddress ? " Đang cập nhật địa chỉ..." : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Vĩ độ (lat) *</label>
                  <input
                    type="text"
                    value={form.lat}
                    readOnly
                    placeholder="Sẽ tự động điền"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Kinh độ (lng) *</label>
                  <input
                    type="text"
                    value={form.lng}
                    readOnly
                    placeholder="Sẽ tự động điền"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mô tả quán (AI sẽ dịch tự động)</label>
                <textarea
                  placeholder="Mô tả hấp dẫn về quán của bạn..."
                  value={form.description}
                  onChange={e => handleField("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm resize-none"
                /></div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Danh mục</label>
                <select value={form.category} onChange={e => handleField("category", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mức giá</label>
                <div className="flex gap-3">
                  {["$", "$$", "$$$"].map(p => (
                    <button key={p} onClick={() => handleField("priceRange", p)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                        form.priceRange === p ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}>{p}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleRegister} disabled={createPoi.isPending}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {createPoi.isPending ? (
                  <>
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                    🌐 Đang dịch sang 15 ngôn ngữ...
                  </>
                ) : (
                  <><Plus size={16} /> Đăng ký quán</>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                💡 Mẹo: nếu trình duyệt chặn định vị, bạn vẫn có thể click bản đồ để chọn vị trí quán.
              </p>
            </div>
          )}

          {/* ── STATS ── */}
          {tab === "stats" && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-4">Phân bố ngôn ngữ khách</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={LANGUAGE_PIE} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                    {LANGUAGE_PIE.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === "settings" && (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              <Settings size={40} className="mx-auto mb-3 opacity-30" />
              <p>Cài đặt sẽ có trong phiên bản tiếp theo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}