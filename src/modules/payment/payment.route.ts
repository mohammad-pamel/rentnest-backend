import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create", auth(Role.TENANT), paymentController.createPayment);

router.get("/success", paymentController.confirmPayment);

router.get("/my", auth(Role.TENANT), paymentController.getMyPayments);

export const paymentRoutes = router;