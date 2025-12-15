import Stripe from "stripe";

export interface ICreatePaymentMethodParams {
  customerId: string;
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
}

export interface IAttachPaymentMethodParams {
  paymentMethodId: string;
  customerId: string;
}

export interface IDetachPaymentMethodParams {
  paymentMethodId: string;
}

export interface ICreateCustomerParams {
  email: string;
  name: string;
}

export interface IGetCustomerParams {
  customerId: string;
}

export interface IUpdateCustomerParams {
  stripeCustomerId: string;
  paymentMethodid: string;
}

export interface IDeleteCustomerParams {
  customerId: string;
}

export interface IListCustomersParams {
  limit: number;
}

export interface IRetrievePaymentMethodParams {
  paymentMethodId: string;
}

export interface ICapturePaymentIntentParams {
  paymentIntentId: string;
}

export interface ICancelPaymentIntentParams {
  paymentIntentId: string;
}

export interface IRefundPaymentIntentParams {
  paymentIntentId: string;
  amount?: number;
}

export interface IRefundFromConnectedAccountParams {
  paymentIntentId: string;
  amount?: number;
  connectedAccountId: string;
}

export interface ICreateCouponParams {
  discountData: {
    discountCode: string;
    discountType: "Percentage" | "Fixed";
    percentage?: number;
    maxDiscount?: number;
    maxTotalUsage: number;
    endDate: Date | string;
  };
}

export interface IVerifyCouponParams {
  couponCode: string;
}

export interface ICreateStripeExpressAccountParams {
  email: string;
  country: string;
  userId: string;
}

export interface IReceiveAccountParams {
  stripeAccountId: string;
}

export interface ICreateOnboardingLinkParams {
  accountId: string;
}

export interface ICreatePaymentIntentParams {
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerId: string;
  instantBookingCheck?: boolean;
}

export interface IPaymentIntentWithCardDetails extends Stripe.PaymentIntent {
  cardDetails?: Stripe.Charge.PaymentMethodDetails.Card | null;
}
