"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../modules/validate");
const auth_1 = require("../../modules/auth");
const eventType_1 = require("../../modules/eventType");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("EventType"), (0, validate_1.validate)(eventType_1.eventTypeValidation.createEventType), eventType_1.eventTypeController.createEventType)
    .get((0, validate_1.validate)(eventType_1.eventTypeValidation.getEventTypes), eventType_1.eventTypeController.getAllEventTypes);
router.route("/dropdown").get(eventType_1.eventTypeController.getNamesForDropdown);
router
    .route("/:eventTypeId")
    .get((0, validate_1.validate)(eventType_1.eventTypeValidation.getEventType), eventType_1.eventTypeController.getEventType)
    .patch((0, auth_1.auth)("EventType"), (0, validate_1.validate)(eventType_1.eventTypeValidation.updateEventType), eventType_1.eventTypeController.updateEventType)
    .delete((0, auth_1.auth)("EventType"), (0, validate_1.validate)(eventType_1.eventTypeValidation.deleteEventType), eventType_1.eventTypeController.deleteEventType);
exports.default = router;
