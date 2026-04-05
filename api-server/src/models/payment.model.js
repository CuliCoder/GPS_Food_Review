import { Schema, model } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    vnpayOrderId: String,
    description: String,
    paymentMethod: {
      type: String,
      enum: ["qr", "atm", "card"],
      default: "qr",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed", "cancelled"],
      default: "pending",
    },
    paymentUrl: String,
    transactionNo: String,
    bankCode: String,
    cardType: String,
    // VNPay IPN callback details
    responseCode: String,
    message: String,
    paymentCode: String,
    poiId: String,
    usedForPoiAt: Date,
    // Timestamps
    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

export const Payment = model("Payment", PaymentSchema);
