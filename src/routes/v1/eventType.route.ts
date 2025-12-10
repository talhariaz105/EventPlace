import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import {
  eventTypeController,
  eventTypeValidation,
} from "../../modules/eventType";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("EventType"),
    validate(eventTypeValidation.createEventType),
    eventTypeController.createEventType
  )
  .get(
    validate(eventTypeValidation.getEventTypes),
    eventTypeController.getAllEventTypes
  );

router.route("/dropdown").get(eventTypeController.getNamesForDropdown);

router
  .route("/:eventTypeId")
  .get(
    validate(eventTypeValidation.getEventType),
    eventTypeController.getEventType
  )
  .patch(
    auth("EventType"),
    validate(eventTypeValidation.updateEventType),
    eventTypeController.updateEventType
  )
  .delete(
    auth("EventType"),
    validate(eventTypeValidation.deleteEventType),
    eventTypeController.deleteEventType
  );

export default router;
