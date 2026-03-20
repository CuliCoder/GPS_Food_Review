import { Router } from "express";
import healthRouter from "./health.js";
import venuesRouter from "./venues.js";
import languagesRouter from "./languages.js";
import chatRouter from "./chat.js";
import authRouter from "./auth.js";
import audioRouter from "./audio.js";

const router = Router();

router.use(healthRouter);
router.use(venuesRouter);
router.use(languagesRouter);
router.use(chatRouter);
router.use(authRouter);
router.use("/audio", audioRouter);

export default router;