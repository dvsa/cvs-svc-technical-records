export interface VehicleIdentifiers {
  primaryVrm?: string;
  secondaryVrms?: string[];
  systemNumber: string;
  vin: string;
  partialVin?: string;
}
export interface Vehicle extends VehicleIdentifiers {
  techRecord: TechRecord[];
}
export interface TrailerIdentifer extends Vehicle {
  trailerId?: string;
}
export interface HeavyGoodsVehicle extends Vehicle {
  techRecord: HgvTechRecord[];
}

export interface LightGoodsVehicle extends Vehicle {
  techRecord: CarLgvTechRecord[];
}

export interface PublicServiceVehicle extends Vehicle {
  techRecord: PsvTechRecord[];
}

export interface Car extends Vehicle {
  techRecord: CarLgvTechRecord[];
}
export interface Motorcycle extends Vehicle {
  techRecord: MotorcycleTechRecord[];
}
export interface Trailer extends TrailerIdentifer {
  techRecord: TrlTechRecord[];
}

export interface TechRecord {
  hiddenInVta: boolean;
  historicVin?: string;
  recordCompleteness: string;
  euVehicleCategory: string;
  vehicleType: string;
  regnDate?: string;
  manufactureYear: number;
  noOfAxles: number;
  applicantDetails: ApplicantDetails;
  reasonForCreation: string;
  createdAt: string;
  createdByName: string;
  createdById: string;
  lastUpdatedAt: string;
  lastUpdatedByName: string;
  lastUpdatedById: string;
  updateType?: string;
  statusCode: string;
}

interface BaseTechRecord extends TechRecord {
  brakes: Brakes;
  axles: Axle[];
  vehicleClass: {
    code: string;
    description: string;
  };
  vehicleConfiguration: string;
  departmentalVehicleMarker?: boolean;
  alterationMarker?: boolean;
  approvalType: string;
  approvalTypeNumber?: string;
  ntaNumber?: string;
  variantNumber?: string;
  variantVersionNumber?: string;
  bodyType: {
    code: string;
    description: string;
  };
  functionCode?: string;
  conversionRefNo?: string;
  grossGbWeight: number;
  grossDesignWeight: number;
  microfilm: Microfilm;
  plates: Plates[];
}

interface SpecialistTechRecord extends TechRecord {
  remarks?: string;
}

export interface HgvTechRecord extends BaseTechRecord {
  adrDetails?: AdrDetails;
  axles: HgvAxle[];
  roadFriendly: boolean;
  drawbarCouplingFitted: boolean;
  offRoad: boolean;
  make: string;
  model: string;
  speedLimiterMrk: boolean;
  tachoExemptMrk: boolean;
  euroStandard: string;
  fuelPropulsionSystem: string;
  numberOfWheelsDriven: number;
  emissionsLimit?: number;
  trainDesignWeight?: number;
  grossEecWeight?: number;
  trainGbWeight: number;
  trainEecWeight?: number;
  maxTrainGbWeight: number;
  maxTrainEecWeight?: number;
  maxTrainDesignWeight?: number;
  tyreUseCode?: string;
  dimensions: Dimensions;
  frontAxleToRearAxle: number;
  frontAxleTo5thWheelCouplingMin?: number;
  frontAxleTo5thWheelCouplingMax?: number;
  frontAxleTo5thWheelMin?: number;
  frontAxleTo5thWheelMax?: number;
  notes?: string;
}

export interface PsvTechRecord extends BaseTechRecord {
  brakeCode?: string;
  brakes: PsvBrakes;
  dda: Dda;
  axles: PsvAxle[];
  seatsLowerDeck: number;
  seatsUpperDeck: number;
  standingCapacity: number;
  speedLimiterMrk: boolean;
  tachoExemptMrk: boolean;
  euroStandard: string;
  fuelPropulsionSystem: string;
  numberOfWheelsDriven: number;
  emissionsLimit?: number;
  trainDesignWeight?: number;
  vehicleSize: string;
  numberOfSeatbelts: string;
  seatbeltInstallationApprovalDate?: string;
  coifSerialNumber?: string;
  coifCertifierName?: string;
  coifDate?: string;
  bodyMake: string;
  bodyModel: string;
  chassisMake: string;
  chassisModel: string;
  modelLiteral?: string;
  speedRestriction?: number;
  grossKerbWeight: number;
  grossLadenWeight: number;
  unladenWeight?: number;
  maxTrainGbWeight?: number;
  frontAxleToRearAxle?: number;
  remarks?: string;
  dispensations?: string;
  applicantDetails: ApplicantDetails;
  dimensions: PsvDimensions;
}

export interface TrlTechRecord extends BaseTechRecord {
  adrDetails?: AdrDetails;
  firstUseDate?: string;
  suspensionType?: string;
  couplingType?: string;
  maxLoadOnCoupling?: number;
  frameDescription?: string;
  authIntoService?: AuthIntoService;
  lettersOfAuth?: LettersOfAuth;
  make: string;
  model: string;
  grossEecWeight?: number;
  axles: TrlAxle[];
  roadFriendly: boolean;
  tyreUseCode?: string;
  brakes: TrlBrakes;
  dimensions: Dimensions;
  frontAxleToRearAxle: number;
  rearAxleToRearTrl: number;
  couplingCenterToRearAxleMin: number;
  couplingCenterToRearAxleMax: number;
  couplingCenterToRearTrlMin: number;
  couplingCenterToRearTrlMax: number;
  centreOfRearmostAxleToRearOfTrl: number;
  purchaserDetails: PurchaserDetails;
  manufacturerDetails: ManufacturerDetails;
  notes?: string;
}
interface Brakes {
  dtpNumber: string;
}
interface PsvBrakes extends Brakes {
  brakeCode: string;
  brakeCodeOriginal: string;
  dataTrBrakeOne: string;
  dataTrBrakeTwo: string;
  dataTrBrakeThree: string;
  retarderBrakeOne?: string;
  retarderBrakeTwo?: string;
  brakeForceWheelsNotLocked: {
    serviceBrakeForceA: number;
    secondaryBrakeForceA: number;
    parkingBrakeForceA: number;
  };
  brakeForceWheelsUpToHalfLocked: {
    serviceBrakeForceB: number;
    secondaryBrakeForceB: number;
    parkingBrakeForceB: number;
  };
}

interface TrlBrakes extends Brakes {
  loadSensingValve?: boolean;
  antilockBrakingSystem: boolean;
}

interface Dimensions {
  length: number;
  width: number;
  axleSpacing?: [{
    axles?: string;
    value?: number;
  }];
}

interface PsvDimensions {
  length?: number;
  width?: number;
  height?: number;
}

interface Plates {
  plateSerialNumber: string;
  plateIssueDate: string;
  plateReasonForIssue: string;
  plateIssuer: string;
}

interface Microfilm {
  microfilmDocumentType: string;
  microfilmRollNumber: string;
  microfilmSerialNumber: string;
}

interface ApplicantDetails {
  name: string;
  address1: string;
  address2: string;
  postTown: string;
  address3?: string;
  postCode?: string;
  telephoneNumber?: string;
  emailAddress?: string;
}

interface PurchaserDetails extends ApplicantDetails {
  faxNumber: string;
  purchaserNotes: string;
}

interface ManufacturerDetails extends ApplicantDetails {
  faxNumber: string;
  manufacturerNotes: string;
}

interface LettersOfAuth {
  letterType: string;
  letterDateRequested: string;
  letterContents: string;
}

interface AuthIntoService {
  cocIssueDate: string;
  dateReceived: string;
  datePending: string;
  dateAuthorised: string;
  dateRejected: string;
}

interface Weights {
  gbWeight: number;
  designWeight: number;
}

interface HgvTrlWeights extends Weights {
  eecWeight?: number;
}

interface PsvWeights extends Weights {
  ladenWeight: number;
  kerbWeight: number;
}

interface Tyres {
  tyreSize: string;
  plyRating: string;
  fitmentCode: string;
  dataTrAxles: number;
  tyreCode: number;
}

interface PsvTyres extends Tyres {
  speedCategorySymbol: string;
}

interface Axle {
  parkingBrakeMrk: boolean;
  axleNumber: number;
  weights: Weights;
  tyres: Tyres;
}

interface HgvAxle extends Axle {
  weights: HgvTrlWeights;
}

interface PsvAxle extends Axle {
  weights: PsvWeights;
  tyres: PsvTyres;
}

interface TrlAxle extends Axle {
  weights: HgvTrlWeights;
  brakes?: {
    brakeActuator?: number;
    leverLength?: number;
    springBrakeParking?: boolean;
  };
}

interface Dda {
  certificateIssued: boolean;
  wheelchairCapacity?: number;
  wheelchairFittings?: string;
  wheelchairLiftPresent?: boolean;
  wheelchairLiftInformation?: string;
  wheelchairRampPresent?: boolean;
  wheelchairRampInformation?: string;
  minEmergencyExits?: number;
  outswing?: string;
  ddaSchedules?: string;
  seatbeltsFitted?: string;
  ddaNotes?: string;
}

interface AdrDetails {
  vehicleDetails: {
    type: string,
    approvalDate: string
  };
  listStatementApplicable?: boolean;
  batteryListNumber?: string;
  declarationsSeen?: boolean;
  brakeDeclarationsSeen?: boolean;
  brakeDeclarationIssuer?: string;
  brakeEndurance?: boolean;
  weight?: string;
  compatibilityGroupJ?: boolean;
  documents?: string[];
  permittedDangerousGoods: string[];
  additionalExaminerNotes?: string;
  applicantDetails: {
    name: string;
    street: string;
    town: string;
    city: string;
    postcode: string;
  };
  memosApply?: string[];
  additionalNotes?: {
    number?: string[],
    guidanceNotes?: string[]
  };
  adrTypeApprovalNo?: string;
  adrCertificateNotes?: string;
  tank?: {
    tankDetails?: {
      tankManufacturer?: string
      yearOfManufacture?: number
      tankCode?: string
      specialProvisions?: string
      tankManufacturerSerialNo?: string
      tankTypeAppNo?: string
      tc2Details?: {
        tc2Type?: string,
        tc2IntermediateApprovalNo?: string,
        tc2IntermediateExpiryDate?: string
      },
      tc3Details?: [{
        tc3Type?: string,
        tc3PeriodicNumber?: string,
        tc3PeriodicExpiryDate?: string
      }]
    },
    tankStatement?: {
      substancesPermitted?: string,
      statement?: string,
      productListRefNo?: string,
      productListUnNo?: string[],
      productList?: string
    }
  };
}

export interface CarLgvTechRecord extends SpecialistTechRecord {
  vehicleSubclass: string[];
  vehicleClass?: {
    code: string;
    description: string;
  };
}

export interface MotorcycleTechRecord extends SpecialistTechRecord {
  numberOfWheelsDriven: number;
  vehicleClass: {
    code: string;
    description: string;
  };
}
