import { Router } from "express";
import healthRouter from "./health.js";
import venuesRouter from "./venues.js";
import languagesRouter from "./languages.js";
import chatRouter from "./chat.js";
import authRouter from "./auth.js";
import audioRouter from "./audio.js";
import poisRouter from "./pois.js";
import paymentRouter from "./payment.js";

const router = Router();

router.use(healthRouter);
router.use(venuesRouter);
router.use(languagesRouter);
router.use(chatRouter);
router.use(authRouter);
router.use("/audio", audioRouter);
router.use(poisRouter);
router.use(paymentRouter);

export default router;