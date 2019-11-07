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
    axles: Axle[];
}

interface Axle {
    parkingBrakeMrk: boolean;
    axleNumber: number;
    weights: {
        kerbWeight: number,
        ladenWeight: number,
        gbWeight: number,
        designWeight: number
    };
    tyres: {
        tyreSize: string,
        plyRating: string,
        fitmentCode: string,
        dataTrAxles: number,
        speedCategorySymbol: string,
        tyreCode: number
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
    additionalNotes?:{
        number?: string[],
        guidanceNotes?: string[]
    },
    adrTypeApprovalNo?: string,
    tank?:{
        tankDetails?:{
            tankManufacturer?: string
            yearOfManufacture?: number
            tankCode?: string
            specialProvisions?: string
            tankManufacturerSerialNo?: string
            tankTypeAppNo?: string
            tc2Details?:{
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
        tankStatement?:{
            substancesPermitted?: string,
            statement?: string,
            productListRefNo?: string,
            productListUnNo?: string[],
            productList?: string
        }
    }
}
