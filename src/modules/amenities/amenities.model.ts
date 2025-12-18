import mongoose from "mongoose";
import toJSON from "../toJSON/toJSON";
import paginate from "../paginate/paginate";
import { IAmenitiesDoc, IAmenitiesModel } from "./amenities.interfaces";

const amenitiesSchema = new mongoose.Schema<IAmenitiesDoc, IAmenitiesModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deletedAt: {
      type: Date,
    },
    icon: {
      type: String,
    },
    iconKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
amenitiesSchema.plugin(toJSON);
amenitiesSchema.plugin(paginate);

const Amenities = mongoose.model<IAmenitiesDoc, IAmenitiesModel>(
  "Amenities",
  amenitiesSchema
);

export default Amenities;
