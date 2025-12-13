import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import { reviewController, reviewValidation } from "../../modules/review";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("createReview"),
    validate(reviewValidation.createReview),
    reviewController.addReview
  )
  .get(auth("getReviews"), reviewController.getAllReviews);

router.route("/service/:id").get(reviewController.getReviewsForService);

router
  .route("/:id")
  .get(auth("getReviews"), reviewController.getReviewById)
  .patch(
    auth("updateReview"),
    validate(reviewValidation.updateReview),
    reviewController.editReview
  )
  .delete(auth("deleteReview"), reviewController.deleteReview);

router
  .route("/:id/hide")
  .patch(
    auth("updateReview"),
    validate(reviewValidation.hideReview),
    reviewController.hideReview
  );

export default router;
