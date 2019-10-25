import { PERMITTED_DANGEROUS_GOODS, MEMOS_APPLY, SUBSTANCES_PERMITTED } from './../src/assets/Enums';

export default interface ITechRecord {
    createdAt: string;
    lastUpdatedAt: string;
    chassisMake: string;
    chassisModel: string;
    bodyMake: string;
    bodyModel: string;
    bodyType: {
        code: string,
        description: string
    };
    manufactureYear: number;
    regnDate: string;
    coifDate: string;
    ntaNumber: string;
    conversionRefNo: string;
    seatsLowerDeck: number;
    seatsUpperDeck: number;
    standingCapacity: number;
    speedLimiterMrk: boolean;
    tachoExemptMrk: boolean;
    dispensations: string;
    remarks: string;
    reasonForCreation: string;
    statusCode: string;
    unladenWeight: number;
    grossKerbWeight: number;
    grossLadenWeight: number;
    grossGbWeight: number;
    grossDesignWeight: number;
    noOfAxles: number;
    brakeCode: string;
    vehicleClass: {
    code: string,
        description: string
    };
    vehicleType: string;
    vehicleSize: string;
    vehicleConfiguration: string;
    brakes: {
    brakeCode: string,
    brakeCodeOriginal: string,
    dataTrBrakeOne: string,
    dataTrBrakeTwo: string,
    dataTrBrakeThree: string,
    retarderBrakeOne: string,
    retarderBrakeTwo: string,
    brakeForceWheelsNotLocked: {
        serviceBrakeForceA: number,
        secondaryBrakeForceA: number,
        parkingBrakeForceA: number
    },
    brakeForceWheelsUpToHalfLocked: {
        serviceBrakeForceB: number,
        secondaryBrakeForceB: number,
        parkingBrakeForceB: number
    }
};
    axles: Axle[];
    euroStandard?: string;
    adrDetails?: AdrDetails;
}

interface Axle {
    parkingBrakeMrk: boolean;
    axleNumber: number;
    weights: {
        kerbWeight: number,
        ladenWeight: number,
        gbWeight: number,
        designWeight: number
    };
    tyres: {
        tyreSize: string,
        plyRating: string,
        fitmentCode: string,
        dataTrAxles: number,
        speedCategorySymbol: string,
        tyreCode: number
    };
}

export interface AdrDetails {
    vehicleDetails: VehicleDetails;
    permittedDangerousGoods: PERMITTED_DANGEROUS_GOODS[];
    additionalExaminerNotes: string;
    applicantDetails: ApplicantDetails;
    memosApply: MEMOS_APPLY[];
    additionalNotes: AdditionalNotes;
    tank: Tank;
}

export interface AdditionalNotes {
    number: number;
    guidanceNotes: string[];
}

export interface ApplicantDetails {
    name: string;
    street: string;
    town: string;
    city: string;
    postcode: string;
}

export interface Tank {
    tankDetails: TankDetails;
    tankStatement: TankStatement;
}

export interface TankDetails {
    tankManufacturer: string;
    tc2IntermediateApprovalNo: string;
    tc2IntermediateExpiryDate: Date;
    tc3PeriodicNumber: string;
    tc3PeriodicExpiryDate: Date;
    yearOfManufacture: string;
    tankCode: string;
    specialProvisions: string;
    tankManufacturerSerialNo: string;
    tankTypeAppNo: string;
}

export interface TankStatement {
    substancesPermitted: SUBSTANCES_PERMITTED;
    statement: string | null; // statement and productList are mutually exclusive
    productList: string | null;
}

export interface VehicleDetails {
    type: string;
    approvalDate: Date;
}