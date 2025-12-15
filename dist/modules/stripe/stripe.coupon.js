"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCoupon = exports.createCoupon = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config/config"));
const stripe = new stripe_1.default(config_1.default.stripe.secretKey, {
    apiVersion: "2025-06-30.basil",
});
/**
 * Create a new coupon
 */
const createCoupon = async (params) => {
    const { discountData } = params;
    try {
        const couponData = {
            id: discountData?.discountCode,
            name: discountData?.discountCode,
            duration: "forever",
            max_redemptions: discountData.maxTotalUsage,
            currency: "usd",
            redeem_by: Math.floor(new Date(discountData.endDate).getTime() / 1000),
        };
        if (discountData.discountType === "Percentage" &&
            discountData.percentage !== undefined) {
            couponData.percent_off = discountData.percentage;
        }
        else if (discountData.maxDiscount !== undefined) {
            couponData.amount_off = discountData.maxDiscount;
        }
        const coupon = await stripe.coupons.create(couponData);
        return coupon;
    }
    catch (error) {
        console.error("Error creating coupon:", error);
        throw new Error(`Failed to create coupon: ${error}`);
    }
};
exports.createCoupon = createCoupon;
/**
 * Verify coupon validity
 */
const verifyCoupon = async (params) => {
    const { couponCode } = params;
    try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        console.log(coupon, "coupons list from stripe");
        const now = Math.floor(Date.now() / 1000);
        if (coupon.redeem_by && now > coupon.redeem_by) {
            throw new Error("Coupon has expired.");
        }
        if (coupon.max_redemptions &&
            coupon.times_redeemed >= coupon.max_redemptions) {
            throw new Error("Coupon usage limit reached.");
        }
        // Coupon is valid
        console.log("Coupon verified:", coupon);
        return coupon;
    }
    catch (err) {
        console.log(err, "these are errors");
        throw new Error(err?.message || "Failed to verify coupon");
    }
};
exports.verifyCoupon = verifyCoupon;
