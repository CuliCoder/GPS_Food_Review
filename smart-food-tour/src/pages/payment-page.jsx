import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/use-app-store";
import { useCreatePayment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, QrCode, AlertCircle } from "lucide-react";

export default function VendorPaymentPage() {
  const [, navigate] = useLocation();
  const { user } = useAppStore();
  const [amount, setAmount] = useState(99000); // Default registration fee 99k VND
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const createPayment = useCreatePayment();

  useEffect(() => {
    if (!user || user.role !== "vendor") {
      navigate("/login");
    }
  }, [navigate, user]);

  if (!user || user.role !== "vendor") {
    return null;
  }

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!amount || amount <= 0) {
        setError("Vui lòng nhập số tiền hợp lệ");
        return;
      }

      const orderId = `VENDOR-${user._id}-${Date.now()}`;
      const result = await createPayment.mutateAsync({
        amount,
        orderId,
        description: `Phí đăng ký quán của ${user.shopName}`,
      });

      if (result.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = result.paymentUrl;
      }
    } catch (err) {
      setError(err.message || "Lỗi tạo đơn thanh toán");
      console.error("Payment creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle>Thanh toán đăng ký quán</CardTitle>
          <CardDescription className="text-blue-100">
            Hoàn thành thanh toán để kích hoạt tài khoản
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Shop Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Tên quán:</p>
            <p className="font-semibold text-gray-900">{user.shopName}</p>
            <p className="text-sm text-gray-600 mt-2">Email:</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Số tiền thanh toán (VND)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={10000}
              step={1000}
              disabled={loading}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">Mức tối thiểu: 10,000 VND</p>
          </div>

          {/* Amount Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Tổng thanh toán:</p>
            <p className="text-3xl font-bold text-blue-600">
              {amount.toLocaleString("vi-VN")} ₫
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ✓ Phí đăng ký quán lên hệ thống Smart Food Tour
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Methods Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <QrCode className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Thanh toán QR Code</p>
                <p className="text-xs text-gray-600">Quét mã QR từ ứng dụng ngân hàng hoặc ví điện tử</p>
              </div>
            </div>
            <div className="bg-white border-t pt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Hỗ trợ:</p>
              <p className="text-xs text-gray-600">
                • Thẻ tín dụng / Thẻ ghi nợ<br/>
                • Chuyển khoản ngân hàng<br/>
                • Ví điện tử (Momo, ZaloPay, v.v.)
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleCreatePayment}
            disabled={loading || !amount}
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Thanh toán với VNPay QR
              </>
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center">
            Bạn sẽ được chuyển hướng đến trang thanh toán VNPay an toàn
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
