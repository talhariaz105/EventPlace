import Stripe from "stripe";
import config from "../../config/config";
import {
  ICreateStripeExpressAccountParams,
  IReceiveAccountParams,
  ICreateOnboardingLinkParams,
} from "./stripe.interfaces";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Create a Stripe Express account for vendors
 */
export const createStripeExpressAccount = async (
  params: ICreateStripeExpressAccountParams
): Promise<string> => {
  try {
    const { email, country, userId } = params;
    const payload: Stripe.AccountCreateParams = {
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
  } catch (err: any) {
    console.error(
      `Error creating Stripe Express account: ${JSON.stringify(err)}`
    );
    throw new Error(
      `Failed to create Stripe Express account: ${err.message || err}`
    );
  }
};

/**
 * Retrieve account details by account ID
 */
export const receiveAccount = async (
  params: IReceiveAccountParams
): Promise<Stripe.Account | null> => {
  try {
    const { stripeAccountId } = params;
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account;
  } catch (error) {
    console.error("Error retrieving account:", error);
    return null;
  }
};

/**
 * Create an onboarding link for Stripe Express account
 */
export const createStripeOnboardingLink = async (
  params: ICreateOnboardingLinkParams
): Promise<string> => {
  try {
    const { accountId } = params;
    const accountLinks = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: config.stripe.refreshUrl,
      return_url: config.stripe.returnUrl,
      type: "account_onboarding",
    });
    return accountLinks.url;
  } catch (err: any) {
    console.error(`Error creating onboarding link: ${JSON.stringify(err)}`);
    throw new Error(`Failed to create onboarding link: ${err.message || err}`);
  }
};
