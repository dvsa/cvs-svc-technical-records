export type IFlatTechRecordWrapper = {
    primaryVrm?: string;
    secondaryVrms?: string[];
    vin: string;
    createdTimestamp: string;
    systemNumber: string;
    partialVin?: string;
    trailerId?: string;
} & {
    [key: string]: string | number | boolean
}
