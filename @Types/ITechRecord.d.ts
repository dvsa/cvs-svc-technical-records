export default interface ITechRecord {
  createdAt: string;
  createdByName: string,
  createdById: string,
  lastUpdatedAt: string;
  lastUpdatedByName?: string,
  lastUpdatedById?: string,
  updateType?: string,
  chassisMake: string;
  chassisModel: string;
  bodyMake: string;
  bodyModel: string;
  bodyType: {
    code: string,
    description: string
  };
  manufactureYear: number;
  regnDate: string;
  coifDate: string;
  ntaNumber: string;
  conversionRefNo: string;
  seatsLowerDeck: number;
  seatsUpperDeck: number;
  standingCapacity: number;
  speedLimiterMrk: boolean;
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
  euroStandard?: string,
  adrDetails?: AdrDetails,
  brakes: {
    brakeCode: string,
    brakeCodeOriginal: string,
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
  dtpNumber: string;
  fuelPropulsionSystem: string;
  roadFriendly: boolean;
  drawbarCouplingFitted: boolean;
  offRoad: boolean;
  numberOfWheelsDriven: number;
  euVehicleCategory: string;
  emissionsLimit: number;
  departmentalVehicleMarker: boolean;
  alterationMarker: boolean;
  approvalType: string;
  approvalTypeNumber: string;
  variantNumber: string;
  variantVersionNumber: string;
  make: string;
  model: string;
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
  recordCompleteness: string;
}

interface Dimensions {
  length: number;
  width: number;
  axleSpacing: [{
    axles: string;
    value: number;
  }]
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

interface Axle {
  parkingBrakeMrk: boolean;
  axleNumber: number;
  weights: {
    kerbWeight: number;
    ladenWeight: number;
    gbWeight: number;
    designWeight: number;
    eecWeight: number;
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

interface AdrDetails {
  vehicleDetails: {
    type: string,
    approvalDate: string
  },
  listStatementApplicable?: boolean,
  batteryListNumber?: string,
  declarationsSeen?: boolean,
  brakeDeclarationsSeen?: boolean,
  brakeDeclarationIssuer?: string,
  brakeEndurance?: boolean,
  weight?: string,
  compatibilityGroupJ?: boolean,
  documents?: string[],
  permittedDangerousGoods: string[],
  additionalExaminerNotes?: string,
  applicantDetails: {
    name: string,
    street: string,
    town: string,
    city: string,
    postcode: string
  },
  memosApply?: string[],
  additionalNotes?: {
    number?: string[],
    guidanceNotes?: string[]
  },
  adrTypeApprovalNo?: string,
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
  }
}
