import Stripe from "stripe";
import config from "../../config/config";
import {
  ICreatePaymentMethodParams,
  IAttachPaymentMethodParams,
  IDetachPaymentMethodParams,
} from "./stripe.interfaces";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Create a new payment method with card details
 */
export const createPaymentMethod = async (
  params: ICreatePaymentMethodParams
): Promise<Stripe.PaymentMethod> => {
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
  } catch (error) {
    console.error("Error creating payment method:", error);
    throw error;
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
    throw error;
  }
};

/**
 * Detach a payment method from a customer
 */
export const detachPaymentMethod = async (
  params: IDetachPaymentMethodParams
): Promise<Stripe.PaymentMethod> => {
  const { paymentMethodId } = params;
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error("Error detaching payment method:", error);
    throw error;
  }
};
