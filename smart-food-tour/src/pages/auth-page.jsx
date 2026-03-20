import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Lock, Mail, Phone, Store, Eye, EyeOff } from "lucide-react";
import { apiLogin, apiRegisterVendor } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { setAuth } = useAppStore();
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "", password: "", name: "", phone: "", shopName: "",
  });

  const handleField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      // BE trả { user, accessToken }
      const { user, accessToken } = await apiLogin(form.email, form.password);
      setAuth(user, accessToken);

      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/map");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!form.email || !form.password || !form.name) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setLoading(true);
    try {
      // Đăng ký vendor — trả về pending, không có token
      const { user } = await apiRegisterVendor(form);
      setError("");
      // Hiển thị thông báo thành công thay vì navigate
      alert(`Đăng ký thành công! Tài khoản "${user.name}" đang chờ Admin phê duyệt.`);
      setTab("login");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-md mb-3">
            <span className="text-2xl">🍜</span>
            <span className="font-bold text-xl text-orange-600">Smart Food Tour</span>
          </div>
          <p className="text-gray-500 text-sm">Vendor & Admin Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                tab === "login"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <User size={15} /> Đăng nhập
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-4 font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                tab === "register"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Store size={15} /> Đăng ký quán
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Demo Hints */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Tài khoản demo:</p>
              <p>🛡️ Admin: <span className="font-mono">admin@smartfoodtour.vn</span> / <span className="font-mono">Admin@123</span></p>
              <p>🏪 Vendor: <span className="font-mono">phohanoi@gmail.com</span> / <span className="font-mono">Vendor@123</span></p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {tab === "register" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Họ tên *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={(e) => handleField("name", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Tên quán *</label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Phở Ngon Số 1"
                      value={form.shopName}
                      onChange={(e) => handleField("shopName", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="0901234567"
                      value={form.phone}
                      onChange={(e) => handleField("phone", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => handleField("email", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mật khẩu *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleField("password", e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())
                  }
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={tab === "login" ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : tab === "login" ? (
                <><User size={16} /> Đăng nhập</>
              ) : (
                <><Store size={16} /> Đăng ký ngay</>
              )}
            </button>

            <button
              onClick={() => navigate("/map")}
              className="w-full py-2 text-gray-500 hover:text-orange-500 text-sm transition-colors"
            >
              ← Về trang bản đồ
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}