import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import config from "../../config";

const stripe = new Stripe(config.stripe_secret_key as string);

const createCheckoutSessionIntoDB = async (
  rentalRequestId: string,
  userEmail: string
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalRequestId,
    },
    include: {
      property: true,
      payment: true,
    },
  });

  if (!rental) {
    throw new Error("Rental request not found.");
  }

  if (rental.status !== "APPROVED") {
    throw new Error("This rental request is not approved yet.");
  }

  if (rental.payment) {
    throw new Error("Payment already exists.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    customer_email: userEmail,

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: "usd",

          unit_amount: Math.round(rental.property.price * 100),

          product_data: {
            name: rental.property.title,
            description: rental.property.location,
          },
        },
      },
    ],

    success_url: `${config.app_url}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${config.app_url}/api/payments/cancel`,

    metadata: {
      rentalRequestId,
    },
  });

  await prisma.payment.create({
    data: {
      rentalRequestId,

      amount: rental.property.price,

      transactionId: session.id,

      provider: "STRIPE",

      status: "PENDING",
    },
  });

  return {
    checkoutUrl: session.url,
  };
};

const paymentSuccessIntoDB = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed.");
  }

  const payment = await prisma.payment.update({
    where: {
      transactionId: sessionId,
    },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });

  await prisma.rentalRequest.update({
    where: {
      id: payment.rentalRequestId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  return payment;
};

const getMyPaymentsIntoDB = async (userId: string) => {
  return await prisma.payment.findMany({
    where: {
      rentalRequest: {
        tenantId: userId,
      },
    },

    include: {
      rentalRequest: {
        include: {
          property: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const paymentService = {
  createCheckoutSessionIntoDB,
  paymentSuccessIntoDB,
  getMyPaymentsIntoDB,
};