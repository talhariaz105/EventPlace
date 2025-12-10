"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategoryById = exports.updateSubCategoryById = exports.getSubCategoryById = exports.getSubCategoriesByServiceCategoryId = exports.querySubCategories = exports.createSubCategory = void 0;
const http_status_1 = __importDefault(require("http-status"));
const subCategory_model_1 = __importDefault(require("./subCategory.model"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
/**
 * Create a sub category
 * @param {NewSubCategory} subCategoryBody
 * @returns {Promise<ISubCategoryDoc>}
 */
const createSubCategory = async (subCategoryBody) => {
    const subCategory = await subCategory_model_1.default.create(subCategoryBody);
    return subCategory;
};
exports.createSubCategory = createSubCategory;
/**
 * Query for sub categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const querySubCategories = async (filter, options) => {
    const subCategories = await subCategory_model_1.default.paginate(filter, options);
    return subCategories;
};
exports.querySubCategories = querySubCategories;
/**
 * Get all sub categories by service category ID
 * @param {mongoose.Types.ObjectId} serviceCategoryId
 * @param {boolean} isDeleted
 * @returns {Promise<ISubCategoryDoc[]>}
 */
const getSubCategoriesByServiceCategoryId = async (serviceCategoryId, isDeleted = false) => {
    const subCategories = await subCategory_model_1.default.find({
        serviceCategory: serviceCategoryId,
        isDeleted,
    });
    return subCategories;
};
exports.getSubCategoriesByServiceCategoryId = getSubCategoriesByServiceCategoryId;
/**
 * Get sub category by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ISubCategoryDoc | null>}
 */
const getSubCategoryById = async (id) => {
    return subCategory_model_1.default.findById(id);
};
exports.getSubCategoryById = getSubCategoryById;
/**
 * Update sub category by id
 * @param {mongoose.Types.ObjectId} subCategoryId
 * @param {UpdateSubCategoryBody} updateBody
 * @returns {Promise<ISubCategoryDoc | null>}
 */
const updateSubCategoryById = async (subCategoryId, updateBody) => {
    const subCategory = await (0, exports.getSubCategoryById)(subCategoryId);
    if (!subCategory) {
        throw new ApiError_1.default("Sub category not found", http_status_1.default.NOT_FOUND);
    }
    // Update fields
    if (updateBody.name !== undefined) {
        subCategory.name = updateBody.name;
    }
    if (updateBody.serviceCategory !== undefined) {
        subCategory.serviceCategory = updateBody.serviceCategory;
    }
    if (updateBody.isDeleted !== undefined) {
        subCategory.isDeleted = updateBody.isDeleted;
    }
    await subCategory.save();
    return subCategory;
};
exports.updateSubCategoryById = updateSubCategoryById;
/**
 * Delete sub category by id
 * @param {mongoose.Types.ObjectId} subCategoryId
 * @returns {Promise<ISubCategoryDoc | null>}
 */
const deleteSubCategoryById = async (subCategoryId) => {
    const subCategory = await (0, exports.getSubCategoryById)(subCategoryId);
    if (!subCategory) {
        throw new ApiError_1.default("Sub category not found", http_status_1.default.NOT_FOUND);
    }
    await subCategory.deleteOne();
    return subCategory;
};
exports.deleteSubCategoryById = deleteSubCategoryById;
