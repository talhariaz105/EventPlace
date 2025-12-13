"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../modules/validate");
const auth_1 = require("../../modules/auth");
const review_1 = require("../../modules/review");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("createReview"), (0, validate_1.validate)(review_1.reviewValidation.createReview), review_1.reviewController.addReview)
    .get((0, auth_1.auth)("getReviews"), review_1.reviewController.getAllReviews);
router.route("/service/:id").get(review_1.reviewController.getReviewsForService);
router
    .route("/:id")
    .get((0, auth_1.auth)("getReviews"), review_1.reviewController.getReviewById)
    .patch((0, auth_1.auth)("updateReview"), (0, validate_1.validate)(review_1.reviewValidation.updateReview), review_1.reviewController.editReview)
    .delete((0, auth_1.auth)("deleteReview"), review_1.reviewController.deleteReview);
router
    .route("/:id/hide")
    .patch((0, auth_1.auth)("updateReview"), (0, validate_1.validate)(review_1.reviewValidation.hideReview), review_1.reviewController.hideReview);
exports.default = router;
