"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../modules/validate");
const auth_1 = require("../../modules/auth");
const amenities_1 = require("../../modules/amenities");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("Amenities"), (0, validate_1.validate)(amenities_1.amenitiesValidation.createAmenities), amenities_1.amenitiesController.createAmenities)
    .get((0, validate_1.validate)(amenities_1.amenitiesValidation.getAmenities), amenities_1.amenitiesController.getAmenities);
router.route("/dropdown").get(amenities_1.amenitiesController.getNamesForDropdown);
router
    .route("/:amenitiesId")
    .get((0, validate_1.validate)(amenities_1.amenitiesValidation.getAmenitiesById), amenities_1.amenitiesController.getAmenitiesById)
    .patch((0, auth_1.auth)("Amenities"), (0, validate_1.validate)(amenities_1.amenitiesValidation.updateAmenities), amenities_1.amenitiesController.updateAmenities)
    .delete((0, auth_1.auth)("Amenities"), (0, validate_1.validate)(amenities_1.amenitiesValidation.deleteAmenities), amenities_1.amenitiesController.deleteAmenities);
exports.default = router;
