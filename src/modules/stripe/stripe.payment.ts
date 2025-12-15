import Stripe from "stripe";
import config from "../../config/config";
import {
  IRetrievePaymentMethodParams,
  ICapturePaymentIntentParams,
  ICancelPaymentIntentParams,
  IRefundPaymentIntentParams,
  IRefundFromConnectedAccountParams,
  ICreatePaymentIntentParams,
  IPaymentIntentWithCardDetails,
} from "./stripe.interfaces";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Retrieve and confirm payment intent
 */
export const retrievePaymentMethod = async (
  params: IRetrievePaymentMethodParams
): Promise<Stripe.PaymentIntent> => {
  const { paymentMethodId } = params;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentMethodId);

    if (paymentIntent.status === "requires_confirmation") {
      await stripe.paymentIntents.confirm(paymentMethodId);
    }

    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment method:", error);
    throw new Error(`Failed to retrieve payment method: ${error}`);
  }
};

/**
 * Capture a payment intent
 */
export const capturePaymentIntent = async (
  params: ICapturePaymentIntentParams
): Promise<Stripe.PaymentIntent> => {
  const { paymentIntentId } = params;
  try {
    const capturedPayment = await stripe.paymentIntents.capture(
      paymentIntentId,
      {
        expand: ["payment_method"],
      }
    );
    return capturedPayment;
  } catch (error) {
    console.error("Error capturing payment intent:", error);
    throw new Error(`Failed to capture payment intent: ${error}`);
  }
};

/**
 * Cancel a payment intent
 */
export const cancelPaymentIntent = async (
  params: ICancelPaymentIntentParams
): Promise<Stripe.PaymentIntent> => {
  const { paymentIntentId } = params;
  try {
    const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId);
    return canceledPayment;
  } catch (error) {
    console.error("Error canceling payment intent:", error);
    throw new Error(`Failed to cancel payment intent: ${error}`);
  }
};

/**
 * Refund a payment intent
 */
export const refundPaymentIntent = async (
  params: IRefundPaymentIntentParams
): Promise<Stripe.Refund> => {
  const { paymentIntentId, amount } = params;
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    if (amount !== undefined) {
      refundParams.amount = amount;
    }
    const refundedPayment = await stripe.refunds.create(refundParams);
    return refundedPayment;
  } catch (error) {
    console.error("Error refunding payment intent:", error);
    throw new Error(`Failed to refund payment intent: ${error}`);
  }
};

/**
 * Refund payment intent from connected account
 */
export const refundPaymentIntentFromConnectedAccount = async (
  params: IRefundFromConnectedAccountParams
): Promise<Stripe.Refund> => {
  try {
    const { paymentIntentId, amount, connectedAccountId } = params;
    console.log("Refunding from connected account:", {
      paymentIntentId,
      amount,
      connectedAccountId,
    });

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    if (amount !== undefined) {
      refundParams.amount = amount;
    }

    const refundedPayment = await stripe.refunds.create(refundParams, {
      stripeAccount: connectedAccountId,
    });

    return refundedPayment;
  } catch (error) {
    console.error(
      "Error refunding payment intent from connected account:",
      error
    );
    throw new Error(`Failed to refund payment intent: ${error}`);
  }
};

/**
 * Create a payment intent with card details
 */
export const createPaymentIntent = async (
  params: ICreatePaymentIntentParams
): Promise<IPaymentIntentWithCardDetails> => {
  try {
    const {
      amount,
      currency,
      paymentMethodId,
      customerId,
      instantBookingCheck,
    } = params;

    // Ensure amount is a valid integer (no decimals)
    const validAmount = Math.round(amount);
    console.log("Validated amount (in cents):", validAmount);

    if (!Number.isInteger(validAmount) || validAmount <= 0) {
      throw new Error(
        `Invalid amount: ${amount}. Amount must be a positive integer representing cents.`
      );
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
      confirm: true, // confirm immediately
      capture_method: instantBookingCheck === true ? "automatic" : "manual",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    // Fetch card details from the latest charge if available
    let cardDetails = null;
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      if (charge?.payment_method_details?.card) {
        cardDetails = charge.payment_method_details.card;
      }
    }

    // Return paymentIntent along with card details
    return { ...paymentIntent, cardDetails };
  } catch (err: any) {
    throw new Error(err.message || err);
  }
};
