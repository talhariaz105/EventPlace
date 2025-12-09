import Stripe from 'stripe';
import config from '../../config/config';

if (!config.stripe.secretKey) {
  throw new Error('STRIPE_SECRET_ACCESS_KEY is required');
}

const stripe = new Stripe(config.stripe.secretKey);

// Interface definitions for better type safety
export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
}

export interface GetSubscriptionParams {
  subscriptionId: string;
}

export interface GetSubscriptionsParams {
  customerId: string;
}

export interface GetSubscriptionStatusParams {
  subscriptionId: string;
}

export interface UpgradeSubscriptionParams {
  subscriptionId: string;
  newPriceId: string;
}

export interface CardDetails {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

export interface CreatePaymentMethodParams {
  customerId: string;
  card: CardDetails;
}

export interface AttachPaymentMethodParams {
  paymentMethodId: string;
  customerId: string;
}

export interface DetachPaymentMethodParams {
  paymentMethodId: string;
}

// Subscription utility functions
export const subscriptionUtils = {
  /**
   * Create a new subscription for a customer
   */
  createSubscription: async (params: CreateSubscriptionParams): Promise<Stripe.Subscription> => {
    const { customerId, priceId } = params;
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        expand: ['latest_invoice'],
        payment_behavior: 'error_if_incomplete',
      });



      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  /**
   * Cancel an existing subscription
   */
  cancelSubscription: async (params: CancelSubscriptionParams): Promise<Stripe.Subscription> => {
    const { subscriptionId } = params;
    try {
      const cancelSubscription = await stripe.subscriptions.cancel(subscriptionId);
      console.log('cancelSubscription', cancelSubscription);
      return cancelSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  /**
   * Retrieve a specific subscription
   */
  getSubscription: async (params: GetSubscriptionParams): Promise<Stripe.Subscription> => {
    const { subscriptionId } = params;
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  },

  /**
   * Get all subscriptions for a customer
   */
  getSubscriptions: async (params: GetSubscriptionsParams): Promise<Stripe.ApiList<Stripe.Subscription>> => {
    const { customerId } = params;
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error retrieving subscriptions:', error);
      throw error;
    }
  },

  /**
   * Get the status of a specific subscription
   */
  getSubscriptionStatus: async (params: GetSubscriptionStatusParams): Promise<Stripe.Subscription.Status> => {
    const { subscriptionId } = params;
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription.status;
    } catch (error) {
      console.error('Error retrieving subscription status:', error);
      throw error;
    }
  },

  /**
   * Upgrade/downgrade a subscription to a new price
   */
  upgradeSubscription: async (params: UpgradeSubscriptionParams): Promise<Stripe.Subscription> => {
    const { subscriptionId, newPriceId } = params;
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Check if subscription has items
      if (!subscription.items?.data || subscription.items.data.length === 0) {
        throw new Error('Subscription has no items to update');
      }

      const firstItem = subscription.items.data[0];
      if (!firstItem?.id) {
        throw new Error('Invalid subscription item');
      }

      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: firstItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
      return updatedSubscription;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  },

  /**
   * Create a new payment method for a customer
   */
  createPaymentMethod: async (params: CreatePaymentMethodParams): Promise<Stripe.PaymentMethod> => {
    const { customerId, card } = params;
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
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
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  /**
   * Attach an existing payment method to a customer
   */
  attachPaymentMethod: async (params: AttachPaymentMethodParams): Promise<Stripe.PaymentMethod> => {
    const { paymentMethodId, customerId } = params;
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  },

  /**
   * Detach a payment method from a customer
   */
  detachPaymentMethod: async (params: DetachPaymentMethodParams): Promise<Stripe.PaymentMethod> => {
    const { paymentMethodId } = params;
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Error detaching payment method:', error);
      throw error;
    }
  },

  /**
   * Create a setup intent for future payments
   */
  createSetupIntent: async (customerId: string): Promise<Stripe.SetupIntent> => {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });
      return setupIntent;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  },

  /**
   * Get customer's payment methods
   */
  getPaymentMethods: async (customerId: string): Promise<Stripe.ApiList<Stripe.PaymentMethod>> => {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw error;
    }
  },

  /**
   * Update subscription payment method
   */
  updateSubscriptionPaymentMethod: async (
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<Stripe.Subscription> => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
      });
      return subscription;
    } catch (error) {
      console.error('Error updating subscription payment method:', error);
      throw error;
    }
  },

  /**
   * Create a customer portal session
   */
  createCustomerPortalSession: async (customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> => {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw error;
    }
  },

  /**
   * Pause a subscription
   */
  pauseSubscription: async (subscriptionId: string): Promise<Stripe.Subscription> => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        pause_collection: {
          behavior: 'void',
        },
      });
      return subscription;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  },

  /**
   * Resume a paused subscription
   */
  resumeSubscription: async (subscriptionId: string): Promise<Stripe.Subscription> => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        pause_collection: null,
      });
      return subscription;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  },

  /**
   * Get all products
   */
  getProducts: async (): Promise<Stripe.ApiList<Stripe.Product>> => {
    try {
      const products = await stripe.products.list({
        limit: 100,
        active: true,
      });
      return products;
    } catch (error) {
      console.error('Error retrieving products:', error);
      throw error;
    }
  },

  /**
   * Get all prices
   */
  getPrices: async (): Promise<Stripe.ApiList<Stripe.Price>> => {
    try {
      const prices = await stripe.prices.list({
        limit: 100,
        active: true,
      });
      return prices;
    } catch (error) {
      console.error('Error retrieving prices:', error);
      throw error;
    }
  },

  /**
   * Get prices for a specific product
   */
  getPricesForProduct: async (productId: string): Promise<Stripe.ApiList<Stripe.Price>> => {
    try {
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });
      return prices;
    } catch (error) {
      console.error('Error retrieving prices for product:', error);
      throw error;
    }
  },

  /**
   * Create a new Stripe customer
   */
  createCustomer: async (customerData: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> => {
    try {
      const params: Stripe.CustomerCreateParams = {
        email: customerData.email,
      };

      if (customerData.name) params.name = customerData.name;
      if (customerData.phone) params.phone = customerData.phone;
      if (customerData.metadata) params.metadata = customerData.metadata;

      const customer = await stripe.customers.create(params);
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  /**
   * Update a Stripe customer
   */
  updateCustomer: async (customerId: string, updateData: {
    email?: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> => {
    try {
      const params: Stripe.CustomerUpdateParams = {};

      if (updateData.email) params.email = updateData.email;
      if (updateData.name) params.name = updateData.name;
      if (updateData.phone) params.phone = updateData.phone;
      if (updateData.metadata) params.metadata = updateData.metadata;

      const customer = await stripe.customers.update(customerId, params);
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  /**
   * Get a Stripe customer
   */
  getCustomer: async (customerId: string): Promise<Stripe.Customer> => {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw error;
    }
  },
};

export default subscriptionUtils;
