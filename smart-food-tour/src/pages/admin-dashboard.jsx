import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, Store, Users, Map,
  BarChart2, Settings, LogOut, ShieldCheck, TrendingUp,
  Volume2, Globe, Check, X, AlertTriangle, Menu, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  useAdminStats, useAdminUsers, useAdminPending, useAdminVenues,
  useAdminApprovePending, useAdminUpdateUserStatus, useApprovePoi, useRejectPoi, useDeletePoi,
} from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard tổng hợp", icon: LayoutDashboard },
  { id: "pending",   label: "Phê duyệt quán",     icon: CheckSquare },
  { id: "venues",    label: "Tất cả điểm bán",     icon: Store },
  { id: "users",     label: "Quản lý tài khoản",   icon: Users },
  { id: "reports",   label: "Báo cáo",             icon: BarChart2 },
];

const CAT_LABEL = {
  vietnamese: "🍜 Đồ Việt", "banh-mi": "🥖 Bánh Mì", coffee: "☕ Cà Phê",
  hotpot: "🔥 Lẩu", seafood: "🦐 Hải Sản", vegetarian: "🥗 Chay",
};

// Static chart data (thay bằng real-time khi có Socket.io)
const WEEKLY_DATA = [
  { day: "T2", visits: 520, audio: 210 }, { day: "T3", visits: 435, audio: 180 },
  { day: "T4", visits: 640, audio: 290 }, { day: "T5", visits: 510, audio: 220 },
  { day: "T6", visits: 785, audio: 340 }, { day: "T7", visits: 920, audio: 410 },
  { day: "CN", visits: 710, audio: 305 },
];
const CATEGORY_DATA = [
  { name: "🍜 Đồ Việt", value: 32, fill: "#f97316" },
  { name: "🥖 Bánh Mì", value: 18, fill: "#fb923c" },
  { name: "☕ Cà Phê",  value: 24, fill: "#6b7280" },
  { name: "🔥 Lẩu",    value: 10, fill: "#ef4444" },
  { name: "🦐 Hải Sản", value: 9, fill: "#3b82f6" },
  { name: "🥗 Chay",   value: 7,  fill: "#10b981" },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, clearAuth } = useAppStore();
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const currentUser = user || JSON.parse(localStorage.getItem("sft_user") || "null");

  // Bảo vệ route
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // React Query hooks — tự động gắn JWT qua apiFetch
  const { data: stats }       = useAdminStats();
  const { data: pendingList } = useAdminPending();
  const { data: users }       = useAdminUsers();
  const { data: venues }      = useAdminVenues();

  const approveMutation    = useAdminApprovePending();
  const approvePoiMutation = useApprovePoi();
  const rejectPoiMutation  = useRejectPoi();
  const deletePoiMutation  = useDeletePoi();
  const userStatusMutation = useAdminUpdateUserStatus();

  const handleApprove = (id) => approvePoiMutation.mutate(id);

  const handleReject = () => {
    if (!rejectModal) return;
    rejectPoiMutation.mutate(
      { id: rejectModal.id, reason: rejectModal.reason },
      { onSuccess: () => setRejectModal(null) }
    );
  };

  const handleDeleteVenue = (id) => {
    if (!confirm("Xóa quán này vĩnh viễn?")) return;
    deletePoiMutation.mutate({ id, isAdmin: true });
  };

  const handleUserStatus = (id, status) =>
    userStatusMutation.mutate({ id, status });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-orange-500 mt-1">{sub}</p>}
    </motion.div>
  );

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gray-900 text-white w-64">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-orange-400" />
          <span className="font-bold text-orange-400">Admin Portal</span>
        </div>
        <p className="text-xs text-gray-400">Smart Food Tour</p>
      </div>
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl p-3 mb-4">
          <p className="font-semibold text-sm">{currentUser?.name}</p>
          <p className="text-xs text-orange-400">Quản trị viên</p>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
              tab === id ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}>
            <Icon size={16} />
            <span className="flex-1 text-left">{label}</span>
            {id === "pending" && (pendingList?.filter(p => p.status === "pending").length ?? 0) > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingList.filter(p => p.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-gray-700">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/30 text-sm font-medium transition-colors">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0"><SidebarContent /></div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
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
            <h1 className="font-semibold text-gray-800">
              {NAV_ITEMS.find((n) => n.id === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck size={11} /> Admin
            </span>
            <Link href="/map"><span className="text-xs text-orange-500 hover:underline cursor-pointer">Xem bản đồ</span></Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng điểm bán"   value={stats?.totalVenues}                                    icon={Store}     color="bg-orange-500" />
                <StatCard label="Chủ quán"         value={stats?.totalVendors}                                   icon={Users}     color="bg-blue-500" />
                <StatCard label="Chờ phê duyệt"   value={stats?.pendingApprovals} sub="Cần xem xét"            icon={CheckSquare} color="bg-yellow-500" />
                <StatCard label="Tổng lượt nghe"  value={stats?.totalAudioPlays?.toLocaleString()}              icon={Volume2}   color="bg-green-500" />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-1">Traffic & Audio 7 ngày qua</h2>
                <p className="text-xs text-gray-400 mb-4">Lượt truy cập và lượt nghe audio toàn hệ thống</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gAudio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="visits" name="Lượt xem" stroke="#f97316" strokeWidth={2} fill="url(#gVisits)" dot={false} />
                    <Area type="monotone" dataKey="audio"  name="Nghe audio" stroke="#3b82f6" strokeWidth={2} fill="url(#gAudio)"  dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top languages */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-700 mb-4">Top ngôn ngữ</h2>
                  {stats?.topLanguages?.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-gray-600 w-8 uppercase">{l.lang}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${(l.count / (stats.topLanguages[0]?.count || 1)) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-14 text-right">{l.count?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Category pie */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-700 mb-4">Phân bố danh mục</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={CATEGORY_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                        {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── PENDING ── */}
          {tab === "pending" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{pendingList?.filter(p => p.status === "pending").length ?? 0} quán đang chờ duyệt</p>
              {(pendingList ?? []).map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{CAT_LABEL[p.category] || p.category} · {p.address}</p>
                    {p.vendorId && <p className="text-xs text-gray-400 mt-1">Vendor ID: {p.vendorId}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.status === "approved" ? "bg-green-100 text-green-700" :
                    p.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{p.status}</span>
                  {p.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(p.id)}
                        className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setRejectModal({ id: p.id, reason: "" })}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  {p.status === "rejected" && p.rejectedReason && (
                    <p className="text-xs text-red-500 max-w-[120px] truncate">{p.rejectedReason}</p>
                  )}
                </div>
              ))}
              {(pendingList?.length ?? 0) === 0 && (
                <div className="text-center py-12 text-gray-400">Không có quán nào chờ duyệt</div>
              )}
            </div>
          )}

          {/* ── VENUES ── */}
          {tab === "venues" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{venues?.length ?? 0} điểm bán</p>
              {(venues ?? []).map((v) => (
                <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  {v.imageUrl && (
                    <img src={v.imageUrl} alt={v.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{v.name}</p>
                    <p className="text-xs text-gray-500">{CAT_LABEL[v.category] || v.category} · ⭐ {v.rating}</p>
                    <p className="text-xs text-gray-400 truncate">{v.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    v.status === "approved" ? "bg-green-100 text-green-700" :
                    v.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{v.status}</span>
                  <button onClick={() => handleDeleteVenue(v.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{users?.length ?? 0} tài khoản</p>
              {(users ?? []).map((u) => (
                <div key={u._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email} · {u.role}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                    u.status === "active" ? "bg-green-100 text-green-700" :
                    u.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{u.status}</span>
                  <select value={u.status}
                    onChange={(e) => handleUserStatus(u._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-300">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Báo cáo sẽ sẵn sàng trong phiên bản tiếp theo</p>
              <p className="text-sm mt-1">Export CSV / PDF theo PRD FR9</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <AlertTriangle size={20} />
              <h3 className="font-bold">Từ chối quán</h3>
            </div>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="Lý do từ chối..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleReject}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}