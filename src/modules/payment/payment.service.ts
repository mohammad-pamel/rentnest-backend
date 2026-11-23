import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import config from "../../config";

if (!config.stripe_secret_key) {
  console.warn("STRIPE_SECRET_KEY is not configured. Stripe checkout will be unavailable.");
}
const stripe = new Stripe(config.stripe_secret_key || "sk_test_missing_config");

const createCheckoutSessionIntoDB = async (
  rentalRequestId: string,
  userId: string,
  userEmail: string,
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true, payment: true },
  });
  if (!rental) throw new Error("Rental request not found.");
  if (rental.tenantId !== userId) throw new Error("You are not authorized to pay for this rental request.");
  if (rental.status !== "APPROVED") throw new Error("This rental request is not approved yet.");
  if (!rental.property.isAvailable || rental.property.isDeleted) throw new Error("This property is no longer available.");
  if (rental.payment?.status === "COMPLETED") throw new Error("Payment has already been completed.");
  if (!config.frontend_url) throw new Error("FRONTEND_URL must be configured with your frontend base URL.");
  if (!config.backend_url) throw new Error("BACKEND_URL must be configured with your backend base URL.");
  if (!config.stripe_secret_key) throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");

  // The property price is the monthly rent; the checkout amount covers the requested duration.
  const totalAmount = Number((rental.property.price * rental.months).toFixed(2));
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) throw new Error("Invalid rental amount.");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "bdt",
        unit_amount: Math.round(totalAmount * 100),
        product_data: {
          name: `${rental.property.title} (${rental.months} months)`,
          description: rental.property.location,
        },
      },
    }],
    success_url: `${config.backend_url?.replace(/\/$/, "")}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.backend_url?.replace(/\/$/, "")}/api/payments/cancel?rentalRequestId=${encodeURIComponent(rentalRequestId)}`,
    metadata: { rentalRequestId, tenantId: userId },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");

  if (rental.payment) {
    await prisma.payment.update({
      where: { id: rental.payment.id },
      data: { amount: totalAmount, transactionId: session.id, status: "PENDING", paidAt: null },
    });
  } else {
    await prisma.payment.create({
      data: {
        rentalRequestId,
        amount: totalAmount,
        transactionId: session.id,
        provider: "STRIPE",
        status: "PENDING",
      },
    });
  }
  return { checkoutUrl: session.url };
};

const paymentSuccessIntoDB = async (sessionId: string) => {
  if (!sessionId) throw new Error("Stripe checkout session ID is required.");
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") throw new Error("Payment has not been completed.");
  const rentalRequestId = session.metadata?.rentalRequestId;
  if (!rentalRequestId) throw new Error("Rental request metadata is missing from the Stripe session.");

  const payment = await prisma.payment.findUnique({ where: { transactionId: sessionId } });
  if (!payment || payment.rentalRequestId !== rentalRequestId) {
    throw new Error("Payment record does not match the Stripe checkout session.");
  }
  if (payment.status === "COMPLETED") return payment;

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED", paidAt: new Date() },
    });
    const rentalRequest = await tx.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });
    await tx.property.update({
      where: { id: rentalRequest.propertyId },
      data: { isAvailable: false },
    });
    return updatedPayment;
  });
};

const markPaymentCancelled = async (rentalRequestId?: string) => {
  if (!rentalRequestId) return null;
  const payment = await prisma.payment.findUnique({ where: { rentalRequestId } });
  if (!payment || payment.status === "COMPLETED") return payment;
  return prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
};

const getMyPaymentsIntoDB = async (userId: string) => prisma.payment.findMany({
  where: { rentalRequest: { tenantId: userId } },
  include: { rentalRequest: { include: { property: true } } },
  orderBy: { createdAt: "desc" },
});

export const paymentService = {
  createCheckoutSessionIntoDB,
  paymentSuccessIntoDB,
  markPaymentCancelled,
  getMyPaymentsIntoDB,
};
