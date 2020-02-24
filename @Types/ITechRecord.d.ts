export default interface ITechRecord {
  createdAt: string;
  createdByName: string;
  createdById: string;
  lastUpdatedAt: string;
  lastUpdatedByName?: string;
  lastUpdatedById?: string;
  updateType?: string;
  chassisMake: string;
  chassisModel: string;
  bodyMake: string;
  bodyModel: string;
  bodyType: {
    code: string,
    description: string
  };
  manufactureYear: number;
  regnDate?: string;
  coifDate: string;
  ntaNumber: string;
  coifSerialNumber: string;
  coifCertifierName: string;
  conversionRefNo: string;
  seatsLowerDeck: number;
  seatsUpperDeck: number;
  standingCapacity: number;
  speedLimiterMrk: boolean;
  speedRestriction: number;
  tachoExemptMrk: boolean;
  dispensations: string;
  remarks: string;
  reasonForCreation: string;
  statusCode: string;
  unladenWeight: number;
  grossKerbWeight: number;
  grossLadenWeight: number;
  grossGbWeight: number;
  grossDesignWeight: number;
  noOfAxles: number;
  brakeCode: string;
  vehicleClass: {
    code: string,
    description: string
  };
  vehicleType: string;
  vehicleSize: string;
  vehicleConfiguration: string;
  euroStandard?: string;
  adrDetails?: AdrDetails;
  brakes: {
    brakeCode: string,
    brakeCodeOriginal: string,
    dtpNumber: string;
    dataTrBrakeOne: string,
    dataTrBrakeTwo: string,
    dataTrBrakeThree: string,
    retarderBrakeOne: string,
    retarderBrakeTwo: string,
    brakeForceWheelsNotLocked: {
      serviceBrakeForceA: number,
      secondaryBrakeForceA: number,
      parkingBrakeForceA: number
    },
    brakeForceWheelsUpToHalfLocked: {
      serviceBrakeForceB: number,
      secondaryBrakeForceB: number,
      parkingBrakeForceB: number
    }
  };
  fuelPropulsionSystem: string;
  roadFriendly: boolean;
  drawbarCouplingFitted: boolean;
  offRoad: boolean;
  numberOfWheelsDriven: number;
  numberOfSeatbelts: string;
  seatbeltInstallationApprovalDate?: string;
  euVehicleCategory: string;
  emissionsLimit?: number;
  departmentalVehicleMarker: boolean;
  alterationMarker: boolean;
  approvalType: string;
  approvalTypeNumber: string;
  variantNumber: string;
  variantVersionNumber: string;
  make: string;
  model: string;
  modelLiteral: string;
  functionCode: string;
  grossEecWeight: number;
  trainGbWeight: number;
  trainEecWeight: number;
  trainDesignWeight: number;
  maxTrainGbWeight: number;
  maxTrainEecWeight: number;
  maxTrainDesignWeight: number;
  tyreUseCode: string;
  dimensions: Dimensions;
  frontAxleToRearAxle: number;
  frontAxleTo5thWheelCouplingMin: number;
  frontAxleTo5thWheelCouplingMax: number;
  frontAxleTo5thWheelMin: number;
  frontAxleTo5thWheelMax: number;
  applicantDetails: ApplicantDetails;
  microfilm: Microfilm;
  plates: Plates[];
  notes: string;
  axles: Axle[];
  dda: Dda;
  recordCompleteness: string;
  firstUseDate: string;
  suspensionType: string;
  couplingType: string;
  maxLoadOnCoupling: number;
  frameDescription: string;
  loadSensingValve: boolean;
  antilockBrakingSystem: boolean;
  rearAxleToRearTrl: number;
  couplingCenterToRearAxleMin: number;
  couplingCenterToRearAxleMax: number;
  couplingCenterToRearTrlMin: number;
  couplingCenterToRearTrlMax: number;
  centreOfRearmostAxleToRearOfTrl: number;
  purchaserDetails: PurchaserDetails;
  manufacturerDetails: ManufacturerDetails;
  authIntoService: AuthIntoService;
  lettersOfAuth: LettersOfAuth;
}

interface Dimensions {
  length: number;
  width: number;
  height?: number;
  axleSpacing: [{
    axles: string;
    value: number;
  }];
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
  address3: string;
  postCode: string;
  telephoneNumber: string;
  emailAddress: string;
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

interface Axle {
  parkingBrakeMrk: boolean;
  axleNumber: number;
  weights: {
    kerbWeight: number;
    ladenWeight: number;
    gbWeight: number;
    designWeight: number;
    eecWeight: number;
    brakeActuator: number;
    leverLength: number;
    springBrakeParking: boolean;
  };
  tyres: {
    tyreSize: string;
    plyRating: string;
    fitmentCode: string;
    dataTrAxles: number;
    tyreCode: number;
    speedCategorySymbol: string;
  };
}

interface Dda {
  certificateIssued: boolean;
  wheelchairCapacity: number;
  wheelchairFittings: string;
  wheelchairLiftPresent: boolean;
  wheelchairLiftInformation: string;
  wheelchairRampPresent: boolean;
  wheelchairRampInformation: string;
  minEmergencyExits: number;
  outswing: string;
  ddaSchedules: string;
  seatbeltsFitted: string;
  ddaNotes: string;
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
