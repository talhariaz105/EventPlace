import mongoose from "mongoose";
import ServiceListing from "./listings.modal";

const venueSchema = new mongoose.Schema({
  capacity: {
    type: Number,
  },
  rooms: {
    type: Number,
  },
  amenties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenities",
    },
  ],
  cleaning: {
    type: String,
    enum: ["include", "exclude"],
   
  },
  catering: {
    type: String,
    enum: ["include", "exclude"],
  
  },
  outsideFoodAllowed: {
    type: Boolean,

  },
  alcoholAllowed: {
    type: Boolean,

  },
  inhouseBar: {
    type: Boolean,
  
  },
  venueStyle: {
    type: String,
    enumer: ["modern", "classic", "industrial", "rustic", "other"],
  },
  layouts: [
    {
      type: String,
      enum: ["banquet","theater","classroom","u-shape","cocktail"],
    },
  ],
  area: {
    value: {
      type: Number,
   
    },
    unit: {
      type: String,
  
    },
  },
  Venuerolesandterms: {
    noise: {
      type: Boolean,

    },
    curfew: {
      type: Boolean,

    },
    cancelationPolicy: {
      type: Boolean,
  
    },
    cancelationFiles: [
      {
        url: {
          type: String,
    
        },
        type: {
          type: String,
  
        },
        key: {
          type: String,
        },
      },
    ],
    refundPolicy: {
      type: Boolean,
     
    },
    refundFiles: [
      {
        url: {
          type: String,

        },
        type: {
          type: String,

        },
        key: {
          type: String,
        },
      },
    ],
  },
});

const VenueListing = ServiceListing.discriminator("venue", venueSchema);

export default VenueListing;
