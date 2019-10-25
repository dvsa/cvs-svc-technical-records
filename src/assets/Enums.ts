export enum ERRORS {
    NotifyConfigNotDefined = "The Notify config is not defined in the config file.",
    DynamoDBConfigNotDefined = "DynamoDB config is not defined in the config file.",
    LambdaInvokeConfigNotDefined = "Lambda Invoke config is not defined in the config file.",
    EventIsEmpty = "Event is empty",
    NoBranch = "Please define BRANCH environment variable"
}

export enum HTTPRESPONSE {
    RESOURCE_NOT_FOUND = "No resources match the search criteria.",
    INTERNAL_SERVER_ERROR = "Internal Server Error",
    MORE_THAN_ONE_MATCH = "The provided partial VIN returned more than one match."
}

export enum STATUS {
    ARCHIVED = "archived",
    CURRENT = "current",
    PROVISIONAL = "provisional",
    PROVISIONAL_OVER_CURRENT = "provisional_over_current",
    ALL = "all"
}

export enum PERMITTED_DANGEROUS_GOODS {
    "FP <61 (FL)",
    "AT",
    "Class 5.1 Hydrogen Peroxide (OX)",
    "MEMU",
    "Carbon Disulphide",
    "Hydrogen",
    "Explosives: Type 2",
    "Explosives: Type 3",
}

export enum SUBSTANCES_PERMITTED {
    "Substances permitted under the tank code and any special provisions specified in 9 may be carried",
    "Substances (Class UN number and if necessary packing group and proper shipping name) may be carried",
}

export enum MEMOS_APPLY {
    "07/09 3mth leak ext",
    "03/10 vehicle ABS/EBS",
    "03/10 trailer ABS",
}

export enum GUIDANCE_NOTES {
    "M145 Statement",
    "M129 Statement",
    "New certificate requested",
}
