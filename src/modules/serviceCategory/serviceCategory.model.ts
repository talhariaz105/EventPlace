import mongoose from "mongoose";
import toJSON from "../toJSON/toJSON";
import paginate from "../paginate/paginate";
import {
  IServiceCategoryDoc,
  IServiceCategoryModel,
} from "./serviceCategory.interfaces";

const serviceCategorySchema = new mongoose.Schema<
  IServiceCategoryDoc,
  IServiceCategoryModel
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    Icon: {
      type: String,
      trim: true,
    },
    Key: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
serviceCategorySchema.plugin(toJSON);
serviceCategorySchema.plugin(paginate);

const ServiceCategory = mongoose.model<
  IServiceCategoryDoc,
  IServiceCategoryModel
>("ServiceCategory", serviceCategorySchema);

export default ServiceCategory;
