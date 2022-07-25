export interface LegacyKeyStructure {
    [index: string]: string | boolean | number | Array<string> | Array<LegacyKeyStructure> | LegacyKeyStructure;
  }

export interface LegacyTechRecord extends LegacyKeyStructure {
  techRecord: LegacyKeyStructure[]
}