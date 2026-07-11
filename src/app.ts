import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { propertyRoutes } from "./modules/property/property.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { categoryRoutes } from "./modules/category/category.route";
import { globalErrorHandler } from "./middlewares/gloalErrorHandler";
import { notFound } from "./middlewares/notFound";


const app : Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true
}))


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', async(req: Request, res: Response) => {
    res.send("Hello Rentnest Backend")
})

app.use('/api/auth', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use(notFound);
app.use(globalErrorHandler);


export default app;