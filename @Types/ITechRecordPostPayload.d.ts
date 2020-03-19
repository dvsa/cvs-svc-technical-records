import ITechRecord from "./ITechRecord";

export default interface ITechRecordPostPayload {
  primaryVrm?: string;
  secondaryVrms?: string[];
  vin: string;
  systemNumber?: string;
  partialVin?: string;
  trailerId?: string;
  techRecord: ITechRecord[];
}
