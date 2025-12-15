"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeOnboardingLink = exports.receiveAccount = exports.createStripeExpressAccount = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config/config"));
const stripe = new stripe_1.default(config_1.default.stripe.secretKey, {
    apiVersion: "2025-06-30.basil",
});
/**
 * Create a Stripe Express account for vendors
 */
const createStripeExpressAccount = async (params) => {
    try {
        const { email, country, userId } = params;
        const payload = {
            type: "express",
            email,
            country,
            capabilities: {
                card_payments: {
                    requested: true,
                },
                transfers: {
                    requested: true,
                },
            },
            metadata: {
                userId: userId?.toString(),
            },
        };
        const account = await stripe.accounts.create(payload);
        return account.id;
    }
    catch (err) {
        console.error(`Error creating Stripe Express account: ${JSON.stringify(err)}`);
        throw new Error(`Failed to create Stripe Express account: ${err.message || err}`);
    }
};
exports.createStripeExpressAccount = createStripeExpressAccount;
/**
 * Retrieve account details by account ID
 */
const receiveAccount = async (params) => {
    try {
        const { stripeAccountId } = params;
        const account = await stripe.accounts.retrieve(stripeAccountId);
        return account;
    }
    catch (error) {
        console.error("Error retrieving account:", error);
        return null;
    }
};
exports.receiveAccount = receiveAccount;
/**
 * Create an onboarding link for Stripe Express account
 */
const createStripeOnboardingLink = async (params) => {
    try {
        const { accountId } = params;
        const accountLinks = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: config_1.default.stripe.refreshUrl,
            return_url: config_1.default.stripe.returnUrl,
            type: "account_onboarding",
        });
        return accountLinks.url;
    }
    catch (err) {
        console.error(`Error creating onboarding link: ${JSON.stringify(err)}`);
        throw new Error(`Failed to create onboarding link: ${err.message || err}`);
    }
};
exports.createStripeOnboardingLink = createStripeOnboardingLink;
