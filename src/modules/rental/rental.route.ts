import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.TENANT), rentalController.createRentalRequest);

router.get("/my", auth(Role.TENANT), rentalController.getMyRentalRequests);

router.get("/landlord", auth(Role.LANDLORD, Role.ADMIN), rentalController.getLandlordRequests);

router.patch("/:id", auth(Role.LANDLORD, Role.ADMIN), rentalController.updateRentalStatus);

export const rentalRoutes = router;