import { Router } from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.LANDLORD, Role.ADMIN), propertyController.createProperty);

router.get("/", propertyController.getAllProperties);

router.get("/:id", propertyController.getSingleProperty);

router.patch("/:id", auth(Role.LANDLORD, Role.ADMIN), propertyController.updateProperty);

router.delete("/:id", auth(Role.LANDLORD, Role.ADMIN), propertyController.deleteProperty);

export const propertyRoutes = router;