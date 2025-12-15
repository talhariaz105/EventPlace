import Stripe from "stripe";
import config from "../../config/config";
import { ICreateCouponParams, IVerifyCouponParams } from "./stripe.interfaces";

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Create a new coupon
 */
export const createCoupon = async (
  params: ICreateCouponParams
): Promise<Stripe.Coupon> => {
  const { discountData } = params;
  try {
    const couponData: Stripe.CouponCreateParams = {
      id: discountData?.discountCode,
      name: discountData?.discountCode,
      duration: "forever",
      max_redemptions: discountData.maxTotalUsage,
      currency: "usd",
      redeem_by: Math.floor(new Date(discountData.endDate).getTime() / 1000),
    };

    if (
      discountData.discountType === "Percentage" &&
      discountData.percentage !== undefined
    ) {
      couponData.percent_off = discountData.percentage;
    } else if (discountData.maxDiscount !== undefined) {
      couponData.amount_off = discountData.maxDiscount;
    }

    const coupon = await stripe.coupons.create(couponData);
    return coupon;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw new Error(`Failed to create coupon: ${error}`);
  }
};

/**
 * Verify coupon validity
 */
export const verifyCoupon = async (
  params: IVerifyCouponParams
): Promise<Stripe.Coupon> => {
  const { couponCode } = params;
  try {
    const coupon = await stripe.coupons.retrieve(couponCode);
    console.log(coupon, "coupons list from stripe");

    const now = Math.floor(Date.now() / 1000);
    if (coupon.redeem_by && now > coupon.redeem_by) {
      throw new Error("Coupon has expired.");
    }

    if (
      coupon.max_redemptions &&
      coupon.times_redeemed >= coupon.max_redemptions
    ) {
      throw new Error("Coupon usage limit reached.");
    }

    // Coupon is valid
    console.log("Coupon verified:", coupon);
    return coupon;
  } catch (err: any) {
    console.log(err, "these are errors");
    throw new Error(err?.message || "Failed to verify coupon");
  }
};
