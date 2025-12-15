"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detachPaymentMethod = exports.attachPaymentMethod = exports.createPaymentMethod = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config/config"));
const stripe = new stripe_1.default(config_1.default.stripe.secretKey, {
    apiVersion: "2025-06-30.basil",
});
/**
 * Create a new payment method with card details
 */
const createPaymentMethod = async (params) => {
    const { customerId, card } = params;
    try {
        const paymentMethod = await stripe.paymentMethods.create({
            type: "card",
            card: {
                number: card.number,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
                cvc: card.cvc,
            },
        });
        await stripe.paymentMethods.attach(paymentMethod.id, {
            customer: customerId,
        });
        return paymentMethod;
    }
    catch (error) {
        console.error("Error creating payment method:", error);
        throw error;
    }
};
exports.createPaymentMethod = createPaymentMethod;
/**
 * Attach a payment method to a customer
 */
const attachPaymentMethod = async (params) => {
    const { paymentMethodId, customerId } = params;
    try {
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        return paymentMethod;
    }
    catch (error) {
        console.error("Error attaching payment method:", error);
        throw error;
    }
};
exports.attachPaymentMethod = attachPaymentMethod;
/**
 * Detach a payment method from a customer
 */
const detachPaymentMethod = async (params) => {
    const { paymentMethodId } = params;
    try {
        const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
        return paymentMethod;
    }
    catch (error) {
        console.error("Error detaching payment method:", error);
        throw error;
    }
};
exports.detachPaymentMethod = detachPaymentMethod;
