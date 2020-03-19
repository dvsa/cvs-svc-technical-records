export enum ERRORS {
    NotifyConfigNotDefined = "The Notify config is not defined in the config file.",
    DynamoDBConfigNotDefined = "DynamoDB config is not defined in the config file.",
    LambdaInvokeConfigNotDefined = "Lambda Invoke config is not defined in the config file.",
    EventIsEmpty = "Event is empty",
    NoBranch = "Please define BRANCH environment variable",
    NO_UNIQUE_RECORD = "Failed to uniquely identify record",
    TrailerIdGenerationFailed = "TrailerId generation failed!"
}

export enum HTTPRESPONSE {
    RESOURCE_NOT_FOUND = "No resources match the search criteria.",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    MORE_THAN_ONE_MATCH = "The provided partial VIN returned more than one match.",
    NO_STATUS_UPDATE_REQUIRED = "No status update required",
    NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED = "No EU vehicle category update required",
    INVALID_EU_VEHICLE_CATEGORY = "Invalid EU vehicle category",
    EU_VEHICLE_CATEGORY_MORE_THAN_ONE_TECH_RECORD = "The vehicle has more than one non archived Tech record."
}

export enum STATUS {
    ARCHIVED = "archived",
    CURRENT = "current",
    PROVISIONAL = "provisional",
    PROVISIONAL_OVER_CURRENT = "provisional_over_current",
    ALL = "all"
}

export enum SEARCHCRITERIA {
    ALL = "all",
    VIN = "vin",
    VRM = "vrm",
    PARTIALVIN = "partialVin",
    TRAILERID = "trailerId",
    SYSTEM_NUMBER = "systemNumber"
}

export enum UPDATE_TYPE {
    ADR = "adrUpdate",
    TECH_RECORD_UPDATE = "techRecordUpdate"
}

export enum VEHICLE_TYPE {
    HGV = "hgv",
    TRL = "trl",
    PSV = "psv"
}

export enum EU_VEHICLE_CATEGORY {
    M1 = "m1",
    M2 = "m2",
    M3 = "m3",
    N1 = "n1",
    N2 = "n2",
    N3 = "n3",
    O1 = "o1",
    O2 = "o2",
    O3 = "o3",
    O4 = "o4",
    L1EA = "l1e-a",
    L1E = "l1e",
    L2E = "l2e",
    L3E = "l3e",
    L4E = "l4e",
    L5E = "l5e",
    L6E = "l6e",
    L7E = "l7e"
}

export const vehicleType: string[] = [
    "psv",
    "trl",
    "hgv"
];

export const fuelPropulsionSystem: string[] = [
    "DieselPetrol",
    "Hybrid",
    "Electric",
    "CNG",
    "Fuel cell",
    "LNG",
    "Other"
];

export const vehicleClassDescription: string[] = [
    "motorbikes over 200cc or with a sidecar",
    "not applicable",
    "small psv (ie: less than or equal to 22 seats)",
    "motorbikes up to 200cc",
    "trailer",
    "large psv(ie: greater than 23 seats)",
    "3 wheelers",
    "heavy goods vehicle",
    "MOT class 4",
    "MOT class 7",
    "MOT class 5"
];

export const vehicleConfiguration: string[] = [
    "rigid",
    "articulated",
    "centre axle drawbar",
    "semi-car transporter",
    "semi-trailer",
    "low loader",
    "other",
    "drawbar",
    "four-in-line",
    "dolly",
    "full drawbar"
];

export const euVehicleCategory: string[] = [
    "m1",
    "m2",
    "m3",
    "n1",
    "n2",
    "n3",
    "o1",
    "o2",
    "o3",
    "o4",
    "l1e-a",
    "l1e",
    "l2e",
    "l3e",
    "l4e",
    "l5e",
    "l6e",
    "l7e"
];

export const approvalType: string[] = [
    "NTA",
    "ECTA",
    "IVA",
    "NSSTA",
    "ECSSTA"
];

export const bodyTypeDescription: string[] = [
    "articulated",
    "single decker",
    "double decker",
    "other",
    "petrol/oil tanker",
    "skeletal",
    "tipper",
    "box",
    "flat",
    "refuse",
    "skip loader",
    "refrigerated"
];

export const microfilmDocumentType: string[] = [
    "PSV Miscellaneous",
    "AAT - Trailer Annual Test",
    "AIV - HGV International App",
    "COIF Modification",
    "Trailer COC + Int Plate",
    "RCT - Trailer Test Cert paid",
    "HGV COC + Int Plate",
    "PSV Carry/Auth",
    "OMO Report",
    "AIT - Trailer International App",
    "IPV - HGV EEC Plate/Cert",
    "XCV - HGV Test Cert free",
    "AAV - HGV Annual Test",
    "COIF Master",
    "Tempo 100 Sp Ord",
    "Deleted",
    "PSV N/ALT",
    "XPT - Tr Plating Cert paid",
    "FFV - HGV First Test",
    "Repl Vitesse 100",
    "TCV - HGV Test Cert",
    "ZZZ -  Miscellaneous",
    "Test Certificate",
    "XCT - Trailer Test Cert free",
    "C52 - COC and VTG52A",
    "Tempo 100 Report",
    "Main File Amendment",
    "PSV Doc",
    "PSV COC",
    "PSV Repl COC",
    "TAV - COC",
    "NPT - Trailer Alteration",
    "OMO Certificate",
    "PSV Repl COIF",
    "PSV Repl COF",
    "COIF Application",
    "XPV - HGV Plating Cert Free",
    "TCT  - Trailer Test Cert",
    "Tempo 100 App",
    "PSV Decision on N/ALT",
    "Special Order PSV",
    "NPV - HGV Alteration",
    "No Description Found",
    "Vitesse 100 Sp Ord",
    "Brake Test Details",
    "COIF Productional",
    "RDT - Test Disc Paid",
    "RCV -  HGV Test Cert",
    "FFT -  Trailer First Test",
    "IPT - Trailer EEC Plate/Cert",
    "XDT - Test Disc Free",
    "PRV - HGV Plating Cert paid",
    "COF Cert",
    "PRT - Tr Plating Cert paid",
    "Tempo 100 Permit"
];

export const plateReasonForIssue: string[] = [
    "Free replacement",
    "Replacement",
    "Destroyed",
    "Provisional",
    "Original",
    "Manual"
];

export const fitmentCode: string[] = [
    "double",
    "single"
];

export const speedCategorySymbol: string[] = [
    "a7",
    "a8",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q"
];

export const vehicleSize: string[] = [
    "small",
    "large"
];

export const retarderBrake: string[] = [
    "electric",
    "exhaust",
    "friction",
    "hydraulic",
    "other",
    "none",
];

export const recordCompleteness: string[] = [
    "complete",
    "testable",
    "skeleton"
];

export const frameDescription: string[] = [
    "Channel section",
    "Space frame",
    "I section",
    "Tubular",
    "Frame section",
    "Other",
    "integral",
    "Box section",
    "U section"
];

export const letterType: string[] = [
    "Trailer authorization",
    "Trailer Rejection"
];
