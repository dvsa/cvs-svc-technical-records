export enum ERRORS {
    NOTIFY_CONFIG_NOT_DEFINED = "The Notify config is not defined in the config file.",
    DYNAMO_DB_CONFIG_NOT_DEFINED = "DynamoDB config is not defined in the config file.",
    LAMBDA_INVOKE_CONFIG_NOT_DEFINED = "Lambda Invoke config is not defined in the config file.",
    EVENT_IS_EMPTY = "Event is empty",
    NO_BRANCH = "Please define BRANCH environment variable",
    NO_UNIQUE_RECORD = "Failed to uniquely identify record",
    TRAILER_ID_GENERATION_FAILED = "TrailerId generation failed!",
    SYSTEM_NUMBER_GENERATION_FAILED = "System Number generation failed!",
    Z_NUMBER_GENERATION_FAILED = "Z Number generation failed!",
    T_NUMBER_GENERATION_FAILED = "T Number generation failed!",
    CANNOT_UPDATE_ARCHIVED_RECORD = "You are not allowed to update an archived tech-record",
    CANNOT_USE_UPDATE_TO_ARCHIVE = "Cannot use update API to archive tech record",
    CANNOT_ARCHIVE_CHANGED_RECORD = "Cannot archive tech record with attribute changes",
    CURRENT_OR_PROVISIONAL_RECORD_FOUND = "Has existing Current or Provisional record",
    CANNOT_CHANGE_CURRENT_TO_PROVISIONAL = "Cannot change current status to provisional",
    STATUS_CODE_SHOULD_BE_PROVISIONAL = "Status code should be provisional",
    MISSING_PAYLOAD = "Missing payload!",
    MISSING_USER = "Microsoft user details not provided",
    MISSING_REASON_FOR_ARCHIVING = "Reason for archiving not provided",
    VEHICLE_TYPE_ERROR = "\"vehicleType\" must be one of [hgv, psv, trl, lgv, car, motorcycle]",
    INVALID_PRIMARY_SECONDARY_VRM = "Primary or secondaryVrms are not valid",
    INVALID_PRIMARY_VRM = "Invalid primary VRM",
    INVALID_SECONDARY_VRM = "Secondary VRMs are invalid",
    INVALID_TRAILER_ID= "TrailerId is invalid",
    INVALID_BODY_TYPE = "Invalid body type code",
    INVALID_VEHICLE_CLASS = "Invalid vehicle class code",
    INVALID_VEHICLE_TYPE = '"vehicleType" must be one of [hgv, psv, trl, lgv, car, motorcycle]'
}

export enum HTTPRESPONSE {
    RESOURCE_NOT_FOUND = "No resources match the search criteria.",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    MORE_THAN_ONE_MATCH = "The provided partial VIN returned more than one match.",
    NO_STATUS_UPDATE_REQUIRED = "No status update required",
    NO_EU_VEHICLE_CATEGORY_UPDATE_REQUIRED = "No EU vehicle category update required",
    INVALID_EU_VEHICLE_CATEGORY = "Invalid EU vehicle category",
    EU_VEHICLE_CATEGORY_MORE_THAN_TWO_TECH_RECORDS = "The vehicle has more than two non archived Tech records.",
    TECHINICAL_RECORD_CREATED = "Technical Record created",
    MISSING_PARAMETERS = "Missing parameter value.",
    VIN_UPDATED = "VIN updated"
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
    PSV = "psv",
    CAR = "car",
    LGV = "lgv",
    MOTORCYCLE = "motorcycle"
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

export const VEHICLE_TYPE_VALIDATION: string[] = [
    "psv",
    "trl",
    "hgv",
    "car",
    "lgv",
    "motorcycle"
];

export const FUEL_PROPULSION_SYSTEM: string[] = [
    "DieselPetrol",
    "Diesel",
    "Petrol",
    "Hybrid",
    "Electric",
    "CNG",
    "Fuel cell",
    "LNG",
    "Other"
];

export const VEHICLE_CLASS_CODE: string[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "7",
    "l",
    "n",
    "s",
    "t",
    "v",
];

export const VEHICLE_CLASS_DESCRIPTION: string[] = [
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

export const VEHICLE_CONFIGURATION: string[] = [
    "rigid",
    "articulated",
    "centre axle drawbar",
    "semi-car transporter",
    "semi-trailer",
    "long semi-trailer",
    "low loader",
    "other",
    "drawbar",
    "four-in-line",
    "dolly",
    "full drawbar"
];

export const EU_VEHICLE_CATEGORY_VALIDATION: string[] = [
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

export const APPROVAL_TYPE: string[] = [
    "NTA",
    "ECTA",
    "IVA",
    "NSSTA",
    "ECSSTA",
    "GB WVTA",
    "UKNI WVTA",
    "EU WVTA Pre 23",
    "EU WVTA 23 on",
    "QNIG",
    "Prov.GB WVTA",
    "Small series",
    "IVA - VCA",
    "IVA - DVSA/NI"
];

export const BODY_TYPE_DESCRIPTION: string[] = [
    "artic",
    "articulated",
    "box",
    "car transporter",
    "concrete mixer",
    "curtainsider",
    "double decker",
    "flat",
    "livestock carrier",
    "low loader",
    "mini bus",
    "other",
    "petrol/oil tanker",
    "refrigerated",
    "refuse",
    "single decker",
    "skeletal",
    "skip loader",
    "tipper",
    "tractor"
];

export const MICROFILM_DOCUMENT_TYPE: string[] = [
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

export const PLATE_REASON_FOR_ISSUE: string[] = [
    "Free replacement",
    "Replacement",
    "Destroyed",
    "Provisional",
    "Original",
    "Manual"
];

export const FITMENT_CODE: string[] = [
    "double",
    "single"
];

export const SPEED_CATEGORY_SYMBOL: string[] = [
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

export const VEHICLE_SIZE: string[] = [
    "small",
    "large"
];

export const RETARDER_BRAKE: string[] = [
    "electric",
    "exhaust",
    "friction",
    "hydraulic",
    "other",
    "none",
];

export const RECORD_COMPLETENESS: string[] = [
    "complete",
    "testable",
    "skeleton"
];

export const FRAME_DESCRIPTION: string[] = [
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

export const LETTER_TYPE: string[] = [
    "trailer acceptance",
    "trailer rejection"
];

export const PARAGRAPH_IDS: number[] = [
    3,
    4,
    5,
    6,
    7
];

export const STATUS_CODES: string[] = [
    "current",
    "provisional",
    "archived"
];

export const VEHICLE_SUBCLASS: string[] = [
    "n",
    "p",
    "a",
    "s",
    "c",
    "l",
    "t",
    "e",
    "m",
    "r",
    "w"
];

export enum RECORD_COMPLETENESS_ENUM {
    COMPLETE ="complete",
    TESTABLE = "testable",
    SKELETON = "skeleton"
}

export enum REASON_FOR_CREATION {
    EU_VEHICLE_CATEGORY_UPDATED = "EU vehicle category updated"
}
