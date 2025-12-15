import Stripe from "stripe";
import config from "../../config/config";
import {
  ICreateCustomerParams,
  IGetCustomerParams,
  IUpdateCustomerParams,
  IDeleteCustomerParams,
  IListCustomersParams,
  IAttachPaymentMethodParams,
} from "./stripe.interfaces";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Create a new Stripe customer
 */
export const createCustomer = async (
  params: ICreateCustomerParams
): Promise<Stripe.Customer> => {
  const { email, name } = params;
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error(`Failed to create customer: ${error}`);
  }
};

/**
 * Attach a payment method to a customer
 */
export const attachPaymentMethod = async (
  params: IAttachPaymentMethodParams
): Promise<Stripe.PaymentMethod> => {
  const { paymentMethodId, customerId } = params;
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return paymentMethod;
  } catch (error) {
    console.error("Error attaching payment method:", error);
    throw new Error(`Failed to attach payment method: ${error}`);
  }
};

/**
 * Get customer details by ID
 */
export const getCustomer = async (
  params: IGetCustomerParams
): Promise<Stripe.Customer | Stripe.DeletedCustomer> => {
  const { customerId } = params;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error("Error retrieving customer:", error);
    throw new Error(`Failed to retrieve customer: ${error}`);
  }
};

/**
 * Update customer with default payment method
 */
export const updateCustomer = async (
  params: IUpdateCustomerParams
): Promise<Stripe.Customer> => {
  const { stripeCustomerId, paymentMethodid } = params;
  try {
    const customer = await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodid,
      },
    });
    return customer;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error(`Failed to update customer: ${error}`);
  }
};

/**
 * Delete a Stripe customer
 */
export const deleteCustomer = async (
  params: IDeleteCustomerParams
): Promise<Stripe.DeletedCustomer> => {
  const { customerId } = params;
  try {
    const customer = await stripe.customers.del(customerId);
    return customer;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error(`Failed to delete customer: ${error}`);
  }
};

/**
 * List customers with pagination
 */
export const listCustomers = async (
  params: IListCustomersParams
): Promise<Stripe.ApiList<Stripe.Customer>> => {
  const { limit } = params;
  try {
    const customers = await stripe.customers.list({
      limit,
    });
    return customers;
  } catch (error) {
    console.error("Error listing customers:", error);
    throw new Error(`Failed to list customers: ${error}`);
  }
};
