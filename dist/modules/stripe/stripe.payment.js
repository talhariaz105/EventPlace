"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = exports.refundPaymentIntentFromConnectedAccount = exports.refundPaymentIntent = exports.cancelPaymentIntent = exports.capturePaymentIntent = exports.retrievePaymentMethod = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config/config"));
const stripe = new stripe_1.default(config_1.default.stripe.secretKey, {
    apiVersion: "2025-06-30.basil",
});
/**
 * Retrieve and confirm payment intent
 */
const retrievePaymentMethod = async (params) => {
    const { paymentMethodId } = params;
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentMethodId);
        if (paymentIntent.status === "requires_confirmation") {
            await stripe.paymentIntents.confirm(paymentMethodId);
        }
        return paymentIntent;
    }
    catch (error) {
        console.error("Error retrieving payment method:", error);
        throw new Error(`Failed to retrieve payment method: ${error}`);
    }
};
exports.retrievePaymentMethod = retrievePaymentMethod;
/**
 * Capture a payment intent
 */
const capturePaymentIntent = async (params) => {
    const { paymentIntentId } = params;
    try {
        const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId, {
            expand: ["payment_method"],
        });
        return capturedPayment;
    }
    catch (error) {
        console.error("Error capturing payment intent:", error);
        throw new Error(`Failed to capture payment intent: ${error}`);
    }
};
exports.capturePaymentIntent = capturePaymentIntent;
/**
 * Cancel a payment intent
 */
const cancelPaymentIntent = async (params) => {
    const { paymentIntentId } = params;
    try {
        const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId);
        return canceledPayment;
    }
    catch (error) {
        console.error("Error canceling payment intent:", error);
        throw new Error(`Failed to cancel payment intent: ${error}`);
    }
};
exports.cancelPaymentIntent = cancelPaymentIntent;
/**
 * Refund a payment intent
 */
const refundPaymentIntent = async (params) => {
    const { paymentIntentId, amount } = params;
    try {
        const refundParams = {
            payment_intent: paymentIntentId,
        };
        if (amount !== undefined) {
            refundParams.amount = amount;
        }
        const refundedPayment = await stripe.refunds.create(refundParams);
        return refundedPayment;
    }
    catch (error) {
        console.error("Error refunding payment intent:", error);
        throw new Error(`Failed to refund payment intent: ${error}`);
    }
};
exports.refundPaymentIntent = refundPaymentIntent;
/**
 * Refund payment intent from connected account
 */
const refundPaymentIntentFromConnectedAccount = async (params) => {
    try {
        const { paymentIntentId, amount, connectedAccountId } = params;
        console.log("Refunding from connected account:", {
            paymentIntentId,
            amount,
            connectedAccountId,
        });
        const refundParams = {
            payment_intent: paymentIntentId,
        };
        if (amount !== undefined) {
            refundParams.amount = amount;
        }
        const refundedPayment = await stripe.refunds.create(refundParams, {
            stripeAccount: connectedAccountId,
        });
        return refundedPayment;
    }
    catch (error) {
        console.error("Error refunding payment intent from connected account:", error);
        throw new Error(`Failed to refund payment intent: ${error}`);
    }
};
exports.refundPaymentIntentFromConnectedAccount = refundPaymentIntentFromConnectedAccount;
/**
 * Create a payment intent with card details
 */
const createPaymentIntent = async (params) => {
    try {
        const { amount, currency, paymentMethodId, customerId, instantBookingCheck, } = params;
        // Ensure amount is a valid integer (no decimals)
        const validAmount = Math.round(amount);
        console.log("Validated amount (in cents):", validAmount);
        if (!Number.isInteger(validAmount) || validAmount <= 0) {
            throw new Error(`Invalid amount: ${amount}. Amount must be a positive integer representing cents.`);
        }
        console.log("Creating payment intent with params:", {
            amount: validAmount,
            currency,
            paymentMethodId,
            customerId,
            instantBookingCheck,
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: validAmount,
            currency,
            payment_method: paymentMethodId,
            customer: customerId,
            confirm: true,
            capture_method: instantBookingCheck === true ? "automatic" : "manual",
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });
        // Fetch card details from the latest charge if available
        let cardDetails = null;
        if (paymentIntent.latest_charge) {
            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
            if (charge?.payment_method_details?.card) {
                cardDetails = charge.payment_method_details.card;
            }
        }
        // Return paymentIntent along with card details
        return { ...paymentIntent, cardDetails };
    }
    catch (err) {
        throw new Error(err.message || err);
    }
};
exports.createPaymentIntent = createPaymentIntent;
