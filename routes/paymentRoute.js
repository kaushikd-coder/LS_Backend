import  express from "express";
import  { processPayment, sendStripeApiKey } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middleware/auth.js";

const  router = express.Router();

router.route("/payment/process").post(isAuthenticated, processPayment);

router.route("/stripeapikey").get(isAuthenticated, sendStripeApiKey);

export default router;