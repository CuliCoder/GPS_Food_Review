import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function PaymentFailedPage() {
  const [, navigate] = useLocation();
  const searchParams = new URL(window.location.href).searchParams;
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  const getErrorDetails = (code) => {
    const errors = {
      "00": "Giao dịch thành công",
      "01": "Giao dịch bị từ chối bởi Ngân hàng",
      "02": "Giao dịch bị từ chối - Hết hạn thẻ/tài khoản",
      "03": "Giao dịch bị từ chối - Tài khoản bị khóa",
      "04": "Giao dịch bị từ chối - Số dư không đủ",
      "05": "Giao dịch được xử lý, chưa rõ kết quả",
      "07": "Người dùng hủy giao dịch",
      "09": "Giao dịch bị từ chối",
      "99": "Lỗi không xác định",
    };
    return errors[code] || "Lỗi không xác định";
  };

  const errorMessage = message || getErrorDetails(code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg border-red-200">
        <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12" />
          </div>
          <CardTitle className="text-center">Thanh toán thất bại</CardTitle>
          <CardDescription className="text-center text-red-100">
            Giao dịch không thể hoàn thành
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Error Alert */}
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>

          {/* Error Code */}
          {code && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Mã lỗi:</p>
              <p className="font-mono font-semibold text-gray-900 text-lg mt-1">
                Error {code}
              </p>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <p className="font-semibold text-gray-900 text-sm">Có thể do:</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Số dư tài khoản não đủ</li>
              <li>• Thẻ/tài khoản đã hết hạn</li>
              <li>• Tài khoản bị khóa hoặc hạn chế</li>
              <li>• Nhập sai thông tin thanh toán</li>
              <li>• Lỗi kết nối mạng</li>
            </ul>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-900">
              💡 Hãy thử lại hoặc sử dụng phương thức thanh toán khác
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/payment")}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Thử lại
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate("/vendor/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Dashboard
            </Button>
          </div>

          {/* Support */}
          <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600">
              Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ <br/>
              <span className="font-semibold text-gray-900">hỗ trợ khách hàng</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Email: support@smartfoodtour.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
