import { Document, ObjectId } from "mongoose";

export interface IListingsModal extends Document {
  type: "venue" | "vendor";
  name: string;
  hostingCompany: string;
  shortSummary: string;
  descrption: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: [number, number];
    radius?: number;
    latitude?: number;
    longitude?: number;
    type?: "Point";
  };
  serviceDays: [
    {
      day: string;
      startTime: string;
      endTime: string;
      price: number;
    }
  ];
  status?: string;
  VerificationStatus?: string;
  isDeleted?: boolean;
  media: [
    {
      url: string;
      type: string;
      key?: string;
    }
  ];
  logo?: string;
  logoKey?: string;
  venueStyle?: string;
  layouts?: string[];
  area: {
    value: number;
    unit: string;
  };
  maxSeatingCapacity?: number;
  maxStandingCapacity?: number;
  rooms?: number;

  cleaning: "include" | "exclude";
  catering: "include" | "exclude";
  outsideFoodAllowed: boolean;
  alcoholAllowed: boolean;
  inhouseBar: boolean;
  vendorId: ObjectId;
  Venuerolesandterms: {
    noise: boolean;
    curfew: boolean;
    cancelationPolicy: boolean;
    cancelationFiles: [
      {
        url: string;
        type: string;
        key?: string;
      }
    ];
    refundPolicy: boolean;
    refundFiles: [
      {
        url: string;
        type: string;
        key?: string;
      }
    ];
  };
  basePriceRange: string;
  timeZone: string;
  packeges?: [
    {
      name: string;
      description: string;
      price: number;
      thumbnail?: string;
      thumbnailKey?: string;
      amenties?: string[] | ObjectId[];
        priceUnit?: "fixed" | "hourly" | "daily";
    }
  ];
  serviceTypeId?: ObjectId | string;
  subcategories?: ObjectId[] | string[];
  foundedYear?: number;
  teamSize?: number;
  website?: string;
  instagram?: string;
  minimumTimeForBooking?: number;
  minimumTimeForBookingUnit?: string;
  ispublished?: boolean;
  businessHourDisabled?: boolean;
  Vendorrolesandterms?: {
    travelfee: boolean;
    accommodation: boolean;
    cancelationPolicy: boolean;
    cancelationFiles: [
      {
        url: string;
        type: string;
        key?: string;
      }
    ];
    refundPolicy: boolean;
    refundFiles: [
      {
        url: string;
        type: string;
        key?: string;
      }
    ];
  };
  amenties?: ObjectId[] | string[];
  eventTypes?: ObjectId[] | string[];
}
