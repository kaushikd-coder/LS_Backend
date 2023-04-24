import asyncErrorHandler from "../middleware/catchAsyncErrors.js";
import stripe from "stripe"
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY)

export const processPayment = asyncErrorHandler(async (req, res, next) => {
    const myPayment = await stripeClient.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            company: "LocalStore",
        },
    });

    res.status(200)
        .json({
            success: true,
            client_secret: myPayment.client_secret
        });
})

export const sendStripeApiKey = asyncErrorHandler(async (req, res, next) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})