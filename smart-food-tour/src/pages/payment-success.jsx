import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, Download } from "lucide-react";

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const { user, setAuth } = useAppStore();
  const [copied, setCopied] = useState(false);
  const searchParams = new URL(window.location.href).searchParams;
  const transactionNo = searchParams.get("transactionNo");
  const amount = searchParams.get("amount");

  const handleCopyTransaction = () => {
    if (transactionNo) {
      navigator.clipboard.writeText(transactionNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    // Refresh user data and redirect to vendor dashboard
    navigate("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <CardTitle className="text-center">Thanh toán thành công!</CardTitle>
          <CardDescription className="text-center text-green-100">
            Tài khoản của bạn đã được kích hoạt
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Success Message */}
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Bạn có thể bắt đầu đăng ký quán lên hệ thống ngay bây giờ.
            </AlertDescription>
          </Alert>

          {/* Transaction Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <div>
              <p className="text-sm text-gray-600">Mã giao dịch:</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-sm font-semibold text-gray-900 flex-1">
                  {transactionNo || "N/A"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTransaction}
                  className="h-8"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Đã sao chép" : "Sao chép"}
                </Button>
              </div>
            </div>

            {amount && (
              <div>
                <p className="text-sm text-gray-600">Số tiền thanh toán:</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {(parseInt(amount) / 100).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Thời gian:</p>
              <p className="font-semibold text-gray-900 mt-1">
                {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-gray-900 text-sm">Bước tiếp theo:</p>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Truy cập trang quản lý cửa hàng</li>
              <li>Đăng ký quán của bạn với thông tin chi tiết</li>
              <li>Chờ quản trị viên duyệt thông tin</li>
              <li>Bắt đầu sử dụng hệ thống Smart Food Tour</li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Tiếp tục vào Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const element = document.createElement("a");
                element.href = "data:text/plain;charset=utf-8," + 
                  encodeURIComponent(`Mã giao dịch: ${transactionNo}\nSố tiền: ${parseInt(amount) / 100} VND\nThời gian: ${new Date().toLocaleString("vi-VN")}`);
                element.setAttribute("download", "receipt.txt");
                element.click();
              }}
            >
              <Download className="w-3 h-3 mr-2" />
              Tải hóa đơn
            </Button>
          </div>

          {/* Contact Support */}
          <p className="text-xs text-gray-500 text-center border-t pt-4">
            Nếu có vấn đề, vui lòng liên hệ hỗ trợ với mã giao dịch: <br/>
            <span className="font-mono font-semibold">{transactionNo}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
