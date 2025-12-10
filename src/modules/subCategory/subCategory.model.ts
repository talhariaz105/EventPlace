import mongoose from "mongoose";
import toJSON from "../toJSON/toJSON";
import paginate from "../paginate/paginate";
import { ISubCategoryDoc, ISubCategoryModel } from "./subCategory.interfaces";

const subCategorySchema = new mongoose.Schema<
  ISubCategoryDoc,
  ISubCategoryModel
>(
  {
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

// add plugin that converts mongoose to json
subCategorySchema.plugin(toJSON);
subCategorySchema.plugin(paginate);

const SubCategory = mongoose.model<ISubCategoryDoc, ISubCategoryModel>(
  "SubCategory",
  subCategorySchema
);

export default SubCategory;
