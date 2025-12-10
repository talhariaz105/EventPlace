import mongoose from "mongoose";
import toJSON from "../toJSON/toJSON";
import paginate from "../paginate/paginate";
import { IEventTypeDoc, IEventTypeModel } from "./eventType.interfaces";

const eventTypeSchema = new mongoose.Schema<IEventTypeDoc, IEventTypeModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
eventTypeSchema.plugin(toJSON);
eventTypeSchema.plugin(paginate);

const EventType = mongoose.model<IEventTypeDoc, IEventTypeModel>(
  "EventType",
  eventTypeSchema
);

export default EventType;
