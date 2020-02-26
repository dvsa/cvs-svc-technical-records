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
