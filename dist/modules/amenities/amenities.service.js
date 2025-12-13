"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNamesForDropdown = exports.deleteAmenitiesById = exports.updateAmenitiesById = exports.getAmenitiesById = exports.queryAmenities = exports.createAmenities = void 0;
const http_status_1 = __importDefault(require("http-status"));
const amenities_model_1 = __importDefault(require("./amenities.model"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
/**
 * Create an amenities
 * @param {NewCreatedAmenities} amenitiesBody
 * @returns {Promise<IAmenitiesDoc>}
 */
const createAmenities = async (amenitiesBody) => {
    return amenities_model_1.default.create(amenitiesBody);
};
exports.createAmenities = createAmenities;
/**
 * Query for amenities
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryAmenities = async (filter, options) => {
    const amenities = await amenities_model_1.default.paginate(filter, options);
    return amenities;
};
exports.queryAmenities = queryAmenities;
/**
 * Get amenities by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IAmenitiesDoc | null>}
 */
const getAmenitiesById = async (id) => amenities_model_1.default.findById(id);
exports.getAmenitiesById = getAmenitiesById;
/**
 * Update amenities by id
 * @param {mongoose.Types.ObjectId} amenitiesId
 * @param {UpdateAmenitiesBody} updateBody
 * @returns {Promise<IAmenitiesDoc | null>}
 */
const updateAmenitiesById = async (amenitiesId, updateBody) => {
    const amenities = await (0, exports.getAmenitiesById)(amenitiesId);
    if (!amenities) {
        throw new ApiError_1.default("Amenities not found", http_status_1.default.NOT_FOUND);
    }
    Object.assign(amenities, updateBody);
    await amenities.save();
    return amenities;
};
exports.updateAmenitiesById = updateAmenitiesById;
/**
 * Delete amenities by id (soft delete)
 * @param {mongoose.Types.ObjectId} amenitiesId
 * @returns {Promise<IAmenitiesDoc | null>}
 */
const deleteAmenitiesById = async (amenitiesId) => {
    const amenities = await (0, exports.getAmenitiesById)(amenitiesId);
    if (!amenities) {
        throw new ApiError_1.default("Amenities not found", http_status_1.default.NOT_FOUND);
    }
    amenities.isDeleted = true;
    amenities.deletedAt = new Date();
    await amenities.save();
    return amenities;
};
exports.deleteAmenitiesById = deleteAmenitiesById;
/**
 * Get all amenities names for dropdown
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
const getNamesForDropdown = async () => {
    const amenities = await amenities_model_1.default.find({ isDeleted: false }, { name: 1, icon: 1 }).lean();
    return amenities.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        icon: item.icon,
    }));
};
exports.getNamesForDropdown = getNamesForDropdown;
