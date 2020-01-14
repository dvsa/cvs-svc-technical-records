export enum ERRORS {
    NotifyConfigNotDefined = "The Notify config is not defined in the config file.",
    DynamoDBConfigNotDefined = "DynamoDB config is not defined in the config file.",
    LambdaInvokeConfigNotDefined = "Lambda Invoke config is not defined in the config file.",
    EventIsEmpty = "Event is empty",
    NoBranch = "Please define BRANCH environment variable",
    NO_UNIQUE_RECORD = "Failed to uniquely identify record"
}

export enum HTTPRESPONSE {
    RESOURCE_NOT_FOUND = "No resources match the search criteria.",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    MORE_THAN_ONE_MATCH = "The provided partial VIN returned more than one match.",
    S3_ERROR = "Upload on S3 failed",
    S3_DOWNLOAD_ERROR = "Cannot download document from S3",
    NO_STATUS_UPDATE_REQUIRED = "No status update required"
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
    ADR = "adrUpdate"
}
