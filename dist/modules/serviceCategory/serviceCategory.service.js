"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceCategoryById = exports.updateServiceCategoryById = exports.getServiceCategoryById = exports.getAllCategories = exports.queryServiceCategories = exports.createServiceCategory = void 0;
const http_status_1 = __importDefault(require("http-status"));
const serviceCategory_model_1 = __importDefault(require("./serviceCategory.model"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
/**
 * Create a service category
 * @param {NewServiceCategory} serviceCategoryBody
 * @returns {Promise<IServiceCategoryDoc>}
 */
const createServiceCategory = async (serviceCategoryBody) => {
    const serviceCategory = await serviceCategory_model_1.default.create(serviceCategoryBody);
    return serviceCategory;
};
exports.createServiceCategory = createServiceCategory;
/**
 * Query for service categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryServiceCategories = async (filter, options) => {
    const serviceCategories = await serviceCategory_model_1.default.paginate(filter, options);
    return serviceCategories;
};
exports.queryServiceCategories = queryServiceCategories;
/**
 * Get all service categories (non-deleted only)
 * @returns {Promise<IServiceCategoryDoc[]>}
 */
const getAllCategories = async () => {
    const categories = await serviceCategory_model_1.default.find({
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });
    return categories;
};
exports.getAllCategories = getAllCategories;
/**
 * Get service category by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IServiceCategoryDoc | null>}
 */
const getServiceCategoryById = async (id) => {
    const category = await serviceCategory_model_1.default.findOne({
        _id: id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    });
    return category;
};
exports.getServiceCategoryById = getServiceCategoryById;
/**
 * Update service category by id
 * @param {mongoose.Types.ObjectId} serviceCategoryId
 * @param {UpdateServiceCategoryBody} updateBody
 * @param {Function} deleteMediaFn - Optional function to delete old media from storage
 * @returns {Promise<IServiceCategoryDoc | null>}
 */
const updateServiceCategoryById = async (serviceCategoryId, updateBody, deleteMediaFn) => {
    const serviceCategory = await (0, exports.getServiceCategoryById)(serviceCategoryId);
    if (!serviceCategory) {
        throw new ApiError_1.default("Service category not found", http_status_1.default.NOT_FOUND);
    }
    // Handle icon update - delete old icon if new one is provided
    if (updateBody.Icon !== undefined &&
        serviceCategory.Icon !== updateBody.Icon) {
        if (serviceCategory.Key && deleteMediaFn) {
            await deleteMediaFn(serviceCategory.Key);
        }
        serviceCategory.Icon = updateBody.Icon;
        serviceCategory.Key = updateBody.Key || "";
    }
    // Update name
    if (updateBody.name !== undefined) {
        serviceCategory.name = updateBody.name;
    }
    await serviceCategory.save();
    return serviceCategory;
};
exports.updateServiceCategoryById = updateServiceCategoryById;
/**
 * Soft delete service category by id
 * @param {mongoose.Types.ObjectId} serviceCategoryId
 * @returns {Promise<IServiceCategoryDoc | null>}
 */
const deleteServiceCategoryById = async (serviceCategoryId) => {
    const serviceCategory = await serviceCategory_model_1.default.findOneAndUpdate({
        _id: serviceCategoryId,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    }, { isDeleted: true }, { new: true });
    if (!serviceCategory) {
        throw new ApiError_1.default("Service category not found", http_status_1.default.NOT_FOUND);
    }
    return serviceCategory;
};
exports.deleteServiceCategoryById = deleteServiceCategoryById;
