import { Router } from "express";
import { VNPay, HashAlgorithm, ignoreLogger } from "vnpay";
import { Payment } from "../models/payment.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const vnpTmnCode = (process.env.VNPAY_TMN_CODE || "").trim();
const vnpSecureSecret = (process.env.VNPAY_HASH_SECRET || process.env.VNPAY_SECRET_KEY || "").trim();
const vnpHashAlgorithm = (process.env.VNPAY_HASH_ALGORITHM || "SHA512").trim().toUpperCase() === "SHA256"
  ? HashAlgorithm.SHA256
  : HashAlgorithm.SHA512;
const vnpayHost = (process.env.VNPAY_URL || process.env.VNPAY_API_URL || "https://sandbox.vnpayment.vn")
  .replace(/\/paymentv2\/vpcpay\.html$/i, "")
  .replace(/\/$/, "")
  .trim();

// Initialize VNPay
const vnpay = new VNPay({
  tmnCode: vnpTmnCode,
  secureSecret: vnpSecureSecret,
  hashAlgorithm: vnpHashAlgorithm,
  vnpayHost,
  testMode: process.env.NODE_ENV !== "production",
  enableLog: process.env.NODE_ENV !== "production",
  loggerFn: ignoreLogger,
  endpoints: {
    paymentEndpoint: "paymentv2/vpcpay.html",
    queryDrRefundEndpoint: "merchant_webapi/api/transaction",
    getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
  },
});

// ── Tạo đơn hàng thanh toán VNPay ──────────────────────────────
router.post("/payment/create-order", requireAuth, async (req, res) => {
  try {
    if (!vnpTmnCode || !vnpSecureSecret) {
      return res.status(500).json({
        success: false,
        message: "VNPay is not configured",
        error: "Missing VNPAY_TMN_CODE or VNPAY_HASH_SECRET/VNPAY_SECRET_KEY",
      });
    }

    const { amount, orderId, description, purpose = "poi_registration" } = req.body;
    const userId = req.user.id;
    const normalizedAmount = Number.parseInt(String(amount), 10);

    if (!normalizedAmount || normalizedAmount <= 0 || !orderId) {
      return res.status(400).json({
        success: false,
        message: "amount (integer > 0) and orderId are required",
      });
    }

    // Check if order already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Order already exists",
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId,
      orderId,
      amount: normalizedAmount,
      description: description || "Phí đăng ký quán",
      paymentMethod: "qr",
      paymentCode: purpose,
      status: "pending",
    });

    // Generate VNPay payment URL
    const backendBaseUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
    const returnUrl = process.env.VNPAY_RETURN_URL || `${backendBaseUrl}/api/payment/vnpay-return`;
    const orderInfo = (description || "Venue Registration Payment")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .slice(0, 120) || "Venue Registration Payment";
    const clientIp = (req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "127.0.0.1")
      .replace("::ffff:", "")
      .replace("::1", "127.0.0.1");

    const paymentUrl = vnpay.buildPaymentUrl({
      // vnpayjs expects amount in VND (e.g. 100000 for 100,000 VND)
      vnp_Amount: normalizedAmount,
      vnp_IpAddr: clientIp,
      vnp_TxnRef: payment._id.toString(),
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "topup",
      vnp_ReturnUrl: returnUrl,
      vnp_CreateDate: new Date(),
      vnp_Locale: "vn",
    });

    // Update payment with URL
    payment.paymentUrl = paymentUrl;
    await payment.save();

    res.json({
      success: true,
      data: {
        paymentUrl,
        paymentId: payment._id,
        orderId: payment.orderId,
      },
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
});

// ── VNPay Return URL (User quay về từ VNPay) ────────────────
router.get("/payment/vnpay-return", async (req, res) => {
  try {
    const vnpayData = req.query;
    
    // Verify signature
    const verifyResult = vnpay.verifyReturnUrl(vnpayData);
    
    if (!verifyResult?.isVerified) {
      return res.json({
        success: false,
        message: verifyResult?.message || "Invalid signature",
        code: "99",
      });
    }

    const txnRef = verifyResult.vnp_TxnRef;
    const responseCode = String(verifyResult.vnp_ResponseCode || "");
    const transactionNo = verifyResult.vnp_TransactionNo;
    const bankCode = verifyResult.vnp_BankCode;
    const amount = verifyResult.vnp_Amount;

    // Find payment record
    const payment = await Payment.findById(txnRef);
    if (!payment) {
      return res.json({
        success: false,
        message: "Payment not found",
        code: "01",
      });
    }

    // Handle response codes
    if (responseCode === "00") {
      // Payment successful
      payment.status = "success";
      payment.transactionNo = transactionNo;
      payment.bankCode = bankCode;
      payment.responseCode = responseCode;
      payment.paidAt = new Date();
      await payment.save();

      // Redirect to vendor dashboard and continue venue registration flow
      const successUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/vendor/dashboard?payment=success&purpose=${encodeURIComponent(payment.paymentCode || "general")}&paymentId=${payment._id}&transactionNo=${encodeURIComponent(transactionNo || "")}&amount=${encodeURIComponent(amount || "")}`;
      return res.redirect(successUrl);
    } else {
      // Payment failed
      payment.status = "failed";
      payment.responseCode = responseCode;
      payment.message = getPaymentStatusMessage(responseCode);
      await payment.save();

      const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/vendor/dashboard?payment=failed&purpose=${encodeURIComponent(payment.paymentCode || "general")}&code=${encodeURIComponent(responseCode)}&message=${encodeURIComponent(payment.message || "")}`;
      return res.redirect(errorUrl);
    }
  } catch (error) {
    console.error("VNPay return error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
});

// ── VNPay IPN Callback (VNPay gọi về) ──────────────────────────
router.post("/payment/vnpay-ipn", async (req, res) => {
  try {
    const vnpayData = req.body;

    // Verify signature
    const verifyResult = vnpay.verifyIpnCall(vnpayData);

    if (!verifyResult?.isVerified) {
      return res.json({
        RspCode: "97",
        Message: verifyResult?.message || "Fail checksum",
      });
    }

    const txnRef = verifyResult.vnp_TxnRef;
    const responseCode = String(verifyResult.vnp_ResponseCode || "");
    const transactionNo = verifyResult.vnp_TransactionNo;
    const amount = Number.parseInt(String(verifyResult.vnp_Amount || 0), 10);

    // Find payment record
    const payment = await Payment.findById(txnRef);

    if (!payment) {
      return res.json({
        RspCode: "01",
        Message: "Order not found",
      });
    }

    // Check if amount matches
    if (payment.amount * 100 !== parseInt(amount)) {
      return res.json({
        RspCode: "04",
        Message: "Invalid amount",
      });
    }

    // Update payment based on response
    if (responseCode === "00") {
      if (payment.status === "success") {
        // Already processed
        return res.json({
          RspCode: "02",
          Message: "Order already confirmed",
        });
      }

      payment.status = "success";
      payment.transactionNo = transactionNo;
      payment.responseCode = responseCode;
      payment.paidAt = new Date();
      await payment.save();

      return res.json({
        RspCode: "00",
        Message: "Success",
      });
    } else {
      payment.status = "failed";
      payment.responseCode = responseCode;
      payment.message = getPaymentStatusMessage(responseCode);
      await payment.save();

      return res.json({
        RspCode: "00",
        Message: "Success",
      });
    }
  } catch (error) {
    console.error("VNPay IPN error:", error);
    return res.json({
      RspCode: "99",
      Message: "Unhandled exception",
    });
  }
});

// ── Query trạng thái thanh toán ────────────────────────────────
router.get("/payment/status/:paymentId", requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      _id: paymentId,
      userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        orderId: payment.orderId,
        transactionNo: payment.transactionNo,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment status query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to query payment status",
      error: error.message,
    });
  }
});

// Utility function to get payment status message
function getPaymentStatusMessage(code) {
  const messages = {
    "00": "Giao dịch thành công",
    "01": "Giao dịch bị từ chối bởi Ngân hàng",
    "02": "Giao dịch bị từ chối bởi Ngân hàng - Hết hạn thẻ/tài khoản",
    "03": "Giao dịch bị từ chối bởi Ngân hàng - Tài khoản bị khóa",
    "04": "Giao dịch bị từ chối bởi Ngân hàng - Số dư không đủ",
    "05": "Giao dịch được xử lý, chưa rõ kết quả",
    "06": "Giao dịch bị từ chối bởi Ngân hàng - Lỗi không xác định",
    "07": "Người dùng hủy giao dịch",
    "09": "Giao dịch bị từ chối",
    "10": "Giao dịch bị từ chối - URL không hợp lệ",
    "11": "Giao dịch bị từ chối - Mã xác thực không đúng",
    "12": "Giao dịch bị từ chối",
    "13": "Giao dịch bị từ chối - Thao tác bị từ chối",
    "99": "Lỗi không xác định",
  };
  return messages[code] || "Lỗi không xác định";
}

export default router;
