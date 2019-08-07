import ITechRecord from "./ITechRecord";

export default interface ITechRecordWrapper {
    primaryVrm: string;
    secondaryVrms: string[];
    vin: string;
    partialVin: string;
    trailerId: string;
    techRecord: ITechRecord[];
}
