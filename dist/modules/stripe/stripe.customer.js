"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCustomers = exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.attachPaymentMethod = exports.createCustomer = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config/config"));
const stripe = new stripe_1.default(config_1.default.stripe.secretKey, {
    apiVersion: "2025-06-30.basil",
});
/**
 * Create a new Stripe customer
 */
const createCustomer = async (params) => {
    const { email, name } = params;
    try {
        const customer = await stripe.customers.create({
            email,
            name,
        });
        return customer;
    }
    catch (error) {
        console.error("Error creating customer:", error);
        throw new Error(`Failed to create customer: ${error}`);
    }
};
exports.createCustomer = createCustomer;
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
        throw new Error(`Failed to attach payment method: ${error}`);
    }
};
exports.attachPaymentMethod = attachPaymentMethod;
/**
 * Get customer details by ID
 */
const getCustomer = async (params) => {
    const { customerId } = params;
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer;
    }
    catch (error) {
        console.error("Error retrieving customer:", error);
        throw new Error(`Failed to retrieve customer: ${error}`);
    }
};
exports.getCustomer = getCustomer;
/**
 * Update customer with default payment method
 */
const updateCustomer = async (params) => {
    const { stripeCustomerId, paymentMethodid } = params;
    try {
        const customer = await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodid,
            },
        });
        return customer;
    }
    catch (error) {
        console.error("Error updating customer:", error);
        throw new Error(`Failed to update customer: ${error}`);
    }
};
exports.updateCustomer = updateCustomer;
/**
 * Delete a Stripe customer
 */
const deleteCustomer = async (params) => {
    const { customerId } = params;
    try {
        const customer = await stripe.customers.del(customerId);
        return customer;
    }
    catch (error) {
        console.error("Error deleting customer:", error);
        throw new Error(`Failed to delete customer: ${error}`);
    }
};
exports.deleteCustomer = deleteCustomer;
/**
 * List customers with pagination
 */
const listCustomers = async (params) => {
    const { limit } = params;
    try {
        const customers = await stripe.customers.list({
            limit,
        });
        return customers;
    }
    catch (error) {
        console.error("Error listing customers:", error);
        throw new Error(`Failed to list customers: ${error}`);
    }
};
exports.listCustomers = listCustomers;
