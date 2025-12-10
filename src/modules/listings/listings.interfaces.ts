import { Document, ObjectId } from "mongoose";

export interface IListingsModal extends Document {
    name: string;
    descrption: string;
    hostingCompany: string;
    location:{
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        coordinates: [number, number];
        radius?: number;
        latitude?: number;
        longitude?: number;   
    }
    serviceDays:[{
        day: string;
        startTime: string;
        endTime: string;
        price: number;
    }],
    status?: string;
    VerificationStatus?: string;
    isDeleted?: boolean;
    media: [{
        url: string;
        type: string;
        key?: string;
    }];
    logo?: string;
    logoKey?: string;
    venueStyle?: string;
    layouts?: string[];
    area:{
        value: number;
        unit: string;
    },
    maxSeatingCapacity?: number;
    maxStandingCapacity?: number;
    rooms?: number;
    amenties?: string[]| ObjectId[];
    cleaning: "include" | "exclude";
    catering: "include" | "exclude";
    outsideFoodAllowed: boolean;
    alcoholAllowed: boolean;
    inhouseBar: boolean;
    vendorId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    rolesandterms:{
        noise:boolean;
        curfew:boolean;
        cancelationPolicy:boolean;
        cancelationFiles:[{
            url: string;
            type: string;
            key?: string;
        }];
        refundPolicy:boolean;
        refundFiles:[{
            url: string;
            type: string;
            key?: string;
        }];
        
    };
    basePriceRange:string;
    timeZone:string;
    packeges?: [{
        name: string;
        description: string;
        price: number;
        thumbnail?: string;
        thumbnailKey?: string;
    }];
    

}
        